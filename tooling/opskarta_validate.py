#!/usr/bin/env python3
"""Strict GraphTruth adapter for the vendored OpsKarta v3 validator."""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
import sys
from typing import Any

from jsonschema import Draft202012Validator
from referencing import Registry, Resource
import yaml
from yaml.constructor import ConstructorError
from yaml.events import AliasEvent

from specs.v3.tools.loader import LoadError, MergeConflictError, merge_fragments
from specs.v3.tools.validator import format_error, validate


REPOSITORY_ROOT = Path(__file__).resolve().parent.parent
FRAGMENT_SCHEMA = (
    REPOSITORY_ROOT
    / "tooling/vendor/opskarta/specs/v3/schemas/fragment.schema.json"
)
MERGED_PLAN_SCHEMA = (
    REPOSITORY_ROOT
    / "tooling/vendor/opskarta/specs/v3/schemas/merged-plan.schema.json"
)


class UniqueKeyLoader(yaml.SafeLoader):
    """Safe YAML loader that rejects aliases and duplicate mapping keys."""

    def compose_node(self, parent: Any, index: Any) -> yaml.Node:
        if self.check_event(AliasEvent):
            event = self.peek_event()
            raise ConstructorError(
                "while composing a node",
                None,
                "YAML aliases are not allowed",
                event.start_mark,
            )
        return super().compose_node(parent, index)


def construct_unique_mapping(
    loader: UniqueKeyLoader,
    node: yaml.MappingNode,
    deep: bool = False,
) -> dict[Any, Any]:
    mapping: dict[Any, Any] = {}
    for key_node, value_node in node.value:
        key = loader.construct_object(key_node, deep=deep)
        if not isinstance(key, str):
            raise ConstructorError(
                "while constructing a mapping",
                node.start_mark,
                f"mapping keys must be strings, got {type(key).__name__}",
                key_node.start_mark,
            )
        if key in mapping:
            raise ConstructorError(
                "while constructing a mapping",
                node.start_mark,
                f"found duplicate key {key!r}",
                key_node.start_mark,
            )
        mapping[key] = loader.construct_object(value_node, deep=deep)
    return mapping


UniqueKeyLoader.add_constructor(
    yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG,
    construct_unique_mapping,
)


def schema_path(error: Any) -> str:
    path = ".".join(str(part) for part in error.absolute_path)
    return path or "<root>"


def sorted_schema_errors(validator: Draft202012Validator, document: Any) -> list[Any]:
    return sorted(
        validator.iter_errors(document),
        key=lambda item: tuple(str(part) for part in item.absolute_path),
    )


def non_finite_paths(value: Any, path: tuple[str, ...] = ()) -> list[tuple[str, ...]]:
    if isinstance(value, float) and not math.isfinite(value):
        return [path]
    if isinstance(value, dict):
        return [
            invalid_path
            for key, child in value.items()
            for invalid_path in non_finite_paths(child, (*path, key))
        ]
    if isinstance(value, list):
        return [
            invalid_path
            for index, child in enumerate(value)
            for invalid_path in non_finite_paths(child, (*path, str(index)))
        ]
    return []


def validate_document(path: Path) -> tuple[dict[str, Any] | None, list[str]]:
    try:
        document = yaml.load(path.read_text(encoding="utf-8"), Loader=UniqueKeyLoader)
    except (OSError, UnicodeError, yaml.YAMLError) as error:
        return None, [f"[error] [loading] [{path}] {error}"]

    invalid_numbers = non_finite_paths(document)
    if invalid_numbers:
        return None, [
            f"[error] [yaml-number] [{path}] non-finite number "
            f"(path: {'.'.join(number_path) or '<root>'})"
            for number_path in invalid_numbers
        ]

    fragment_schema = json.loads(FRAGMENT_SCHEMA.read_text(encoding="utf-8"))
    fragment_validator = Draft202012Validator(fragment_schema)
    fragment_errors = sorted_schema_errors(fragment_validator, document)
    if fragment_errors:
        return None, [
            f"[error] [fragment-schema] [{path}] {error.message} "
            f"(path: {schema_path(error)})"
            for error in fragment_errors
        ]

    merged_schema = json.loads(MERGED_PLAN_SCHEMA.read_text(encoding="utf-8"))
    registry = Registry().with_resource(
        fragment_schema["$id"],
        Resource.from_contents(fragment_schema),
    )
    merged_validator = Draft202012Validator(merged_schema, registry=registry)
    merged_errors = sorted_schema_errors(merged_validator, document)
    if merged_errors:
        return None, [
            f"[error] [merged-schema] [{path}] {error.message} "
            f"(path: {schema_path(error)})"
            for error in merged_errors
        ]

    return document, []


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="opskarta",
        description="Validate GraphTruth operational plans as OpsKarta v3",
    )
    parser.add_argument("file", metavar="FILE")
    parser.add_argument("--strict", action="store_true", default=False)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    path = Path(args.file).resolve()
    document, document_errors = validate_document(path)
    if document_errors:
        for error in document_errors:
            print(error, file=sys.stderr)
        return 1
    if document is None:
        return 1

    try:
        fragment = dict(document)
        fragment["_source"] = str(path)
        plan = merge_fragments([fragment])
    except (LoadError, MergeConflictError) as error:
        print(f"[error] [loading] {error}", file=sys.stderr)
        return 1

    profile_errors = []
    if not plan.meta.id:
        profile_errors.append("merged plan must define meta.id")
    if not plan.meta.title:
        profile_errors.append("merged plan must define meta.title")
    if profile_errors:
        for error in profile_errors:
            print(f"[error] [graphtruth-profile] {error}", file=sys.stderr)
        return 1

    result = validate(plan, strict=args.strict)
    for error in result.errors:
        print(format_error(error), file=sys.stderr)
    for warning in result.warnings:
        print(format_error(warning), file=sys.stderr)
    if not result.is_valid:
        return 1

    print("OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
