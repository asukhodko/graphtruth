#!/usr/bin/env python3

"""Structurally independent reader for one experimental GraphTruth bundle."""

import argparse
import hashlib
import json
import os
import re
import stat
import sys
from pathlib import PurePosixPath


BUNDLE_FORMAT = "graphtruth.experimental.record-bundle.v1"
PROFILE_FORMAT = "graphtruth.experimental.record-bundle-profile.v1"
RECORD_FORMAT = "graphtruth.experimental.record.v1"
SEMANTIC_FORMAT = "graphtruth.experimental.semantic-view-set.v1"
SHA256_PATTERN = re.compile(r"^[a-f0-9]{64}$")
OPAQUE_ID_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9.-]{0,127}$")
MEDIA_TYPE_PATTERN = re.compile(
    r"^[a-z0-9.+-]+/[a-z0-9.+-]+(?:; charset=utf-8)?$"
)
TIMESTAMP_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$")
RECORD_KINDS = {
    "SourceSnapshot",
    "EvidenceSpan",
    "AssertionRevision",
    "Assessment",
    "AcceptanceDecision",
}


class BundleError(Exception):
    def __init__(self, code):
        super().__init__(code)
        self.code = code


def reject(code):
    raise BundleError(code)


def sha256(value):
    return hashlib.sha256(value).hexdigest()


def canonical_json(value):
    return (
        json.dumps(
            value,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
            allow_nan=False,
        ).encode("utf-8")
        + b"\n"
    )


def no_duplicate_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            reject("JSON_DUPLICATE_KEY")
        result[key] = value
    return result


def decode_utf8(value):
    if value.startswith(b"\xef\xbb\xbf"):
        reject("UTF8_INVALID")
    try:
        return value.decode("utf-8", errors="strict")
    except UnicodeDecodeError:
        reject("UTF8_INVALID")


def parse_strict_json(value, canonical=False):
    text = decode_utf8(value)
    try:
        parsed = json.loads(
            text,
            object_pairs_hook=no_duplicate_object,
            parse_constant=lambda unused: reject("JSON_INVALID"),
        )
    except BundleError:
        raise
    except (json.JSONDecodeError, UnicodeDecodeError, ValueError):
        reject("JSON_INVALID")
    if canonical and value != canonical_json(parsed):
        reject("JSON_NOT_CANONICAL")
    return parsed


def assert_exact_keys(value, keys, code="RECORD_SHAPE_INVALID"):
    if not isinstance(value, dict) or sorted(value.keys()) != sorted(keys):
        reject(code)


def assert_opaque_id(value, code="RECORD_SHAPE_INVALID"):
    if not isinstance(value, str) or OPAQUE_ID_PATTERN.fullmatch(value) is None:
        reject(code)


def assert_sha256(value, code="RECORD_SHAPE_INVALID"):
    if not isinstance(value, str) or SHA256_PATTERN.fullmatch(value) is None:
        reject(code)


def assert_timestamp(value, code="RECORD_SHAPE_INVALID"):
    if not isinstance(value, str) or TIMESTAMP_PATTERN.fullmatch(value) is None:
        reject(code)


def assert_safe_relative_path(value):
    if not isinstance(value, str) or not value or "\\" in value:
        reject("BUNDLE_ENTRY_UNSAFE")
    if any(ord(character) < 32 or ord(character) == 127 for character in value):
        reject("BUNDLE_ENTRY_UNSAFE")
    parsed = PurePosixPath(value)
    if parsed.is_absolute() or parsed.as_posix() != value:
        reject("BUNDLE_ENTRY_UNSAFE")
    if any(part in ("", ".", "..") for part in parsed.parts):
        reject("BUNDLE_ENTRY_UNSAFE")


def read_regular_no_follow(filename, maximum_bytes=1024 * 1024):
    flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
    try:
        descriptor = os.open(filename, flags)
    except OSError as error:
        if error.errno in (getattr(os, "ELOOP", 62),):
            reject("BUNDLE_ENTRY_UNSAFE")
        raise
    try:
        before = os.fstat(descriptor)
        if not stat.S_ISREG(before.st_mode) or before.st_size > maximum_bytes:
            reject("BUNDLE_ENTRY_UNSAFE")
        chunks = []
        remaining = before.st_size
        while remaining:
            chunk = os.read(descriptor, min(remaining, 65536))
            if not chunk:
                break
            chunks.append(chunk)
            remaining -= len(chunk)
        value = b"".join(chunks)
        after = os.fstat(descriptor)
    finally:
        os.close(descriptor)
    path_stat = os.stat(filename, follow_symlinks=False)
    if (
        not stat.S_ISREG(path_stat.st_mode)
        or stat.S_ISLNK(path_stat.st_mode)
        or len(value) != before.st_size
        or before.st_dev != after.st_dev
        or before.st_ino != after.st_ino
        or before.st_size != after.st_size
        or before.st_mtime_ns != after.st_mtime_ns
        or before.st_dev != path_stat.st_dev
        or before.st_ino != path_stat.st_ino
    ):
        reject("BUNDLE_ENTRY_UNSAFE")
    return value


def list_bundle_files(root):
    root_stat = os.stat(root, follow_symlinks=False)
    if not stat.S_ISDIR(root_stat.st_mode) or stat.S_ISLNK(root_stat.st_mode):
        reject("BUNDLE_ROOT_INVALID")
    files = []

    def visit(directory, prefix):
        with os.scandir(directory) as iterator:
            entries = sorted(iterator, key=lambda entry: entry.name)
        for entry in entries:
            relative = entry.name if not prefix else prefix + "/" + entry.name
            assert_safe_relative_path(relative)
            entry_stat = entry.stat(follow_symlinks=False)
            if entry.is_symlink():
                reject("BUNDLE_ENTRY_UNSAFE")
            if stat.S_ISDIR(entry_stat.st_mode):
                visit(entry.path, relative)
            elif stat.S_ISREG(entry_stat.st_mode):
                files.append(relative)
            else:
                reject("BUNDLE_ENTRY_UNSAFE")

    visit(root, "")
    return files


def validate_profile(profile):
    assert_exact_keys(profile, ["format", "identity", "fact", "horizons", "policies"])
    if profile["format"] != PROFILE_FORMAT or not isinstance(profile["identity"], str):
        reject("UNKNOWN_FORMAT")
    assert_exact_keys(profile["fact"], ["factKey", "unit", "valueType"])
    assert_opaque_id(profile["fact"]["factKey"])
    if (
        profile["fact"]["valueType"] != "integer"
        or profile["fact"]["unit"] != "attempts"
    ):
        reject("RECORD_SHAPE_INVALID")
    if not isinstance(profile["horizons"], list) or not profile["horizons"]:
        reject("RECORD_SHAPE_INVALID")
    horizon_ids = set()
    prior_recorded_as_of = ""
    for horizon in profile["horizons"]:
        assert_exact_keys(horizon, ["horizonId", "recordedAsOf", "validAt"])
        assert_opaque_id(horizon["horizonId"])
        assert_timestamp(horizon["recordedAsOf"])
        assert_timestamp(horizon["validAt"])
        if (
            horizon["horizonId"] in horizon_ids
            or horizon["recordedAsOf"] <= prior_recorded_as_of
        ):
            reject("RECORDED_ORDER_INVALID")
        horizon_ids.add(horizon["horizonId"])
        prior_recorded_as_of = horizon["recordedAsOf"]
    if not isinstance(profile["policies"], list) or not profile["policies"]:
        reject("RECORD_SHAPE_INVALID")
    policy_ids = set()
    for policy in profile["policies"]:
        assert_exact_keys(
            policy, ["policyId", "purpose", "eligibleAssertionId"]
        )
        assert_opaque_id(policy["policyId"])
        assert_opaque_id(policy["purpose"])
        assert_opaque_id(policy["eligibleAssertionId"])
        if policy["policyId"] in policy_ids:
            reject("RECORD_SHAPE_INVALID")
        policy_ids.add(policy["policyId"])


def line_at_byte(value, offset):
    return 1 + value[:offset].count(b"\n")


def validate_record_body(record, context):
    body = record["body"]
    kind = record["kind"]
    if kind == "SourceSnapshot":
        assert_exact_keys(
            body,
            [
                "sourceId",
                "path",
                "mediaType",
                "size",
                "sha256",
                "authoredByActorId",
                "eventTime",
            ],
        )
        assert_opaque_id(body["sourceId"])
        assert_safe_relative_path(body["path"])
        if (
            not isinstance(body["size"], int)
            or isinstance(body["size"], bool)
            or body["size"] < 0
            or not isinstance(body["mediaType"], str)
            or MEDIA_TYPE_PATTERN.fullmatch(body["mediaType"]) is None
        ):
            reject("RECORD_SHAPE_INVALID")
        assert_sha256(body["sha256"])
        assert_opaque_id(body["authoredByActorId"])
        assert_timestamp(body["eventTime"])
        if (
            body["sourceId"] in context["sources_by_id"]
            or body["path"] in context["source_record_by_path"]
        ):
            reject("RECORD_ID_CONFLICT")
        source = context["source_files"].get(body["path"])
        if (
            source is None
            or len(source["bytes"]) != body["size"]
            or sha256(source["bytes"]) != body["sha256"]
            or source["mediaType"] != body["mediaType"]
        ):
            reject("SOURCE_HASH_MISMATCH")
        context["sources_by_id"][body["sourceId"]] = dict(
            body, recordId=record["recordId"]
        )
        context["source_record_by_path"][body["path"]] = record["recordId"]
        context["source_record_by_id"][record["recordId"]] = body
        return

    if kind == "EvidenceSpan":
        assert_exact_keys(
            body,
            [
                "evidenceId",
                "sourceRecordId",
                "byteStart",
                "byteEnd",
                "lineStart",
                "lineEnd",
                "sha256",
                "text",
            ],
        )
        assert_opaque_id(body["evidenceId"])
        assert_opaque_id(body["sourceRecordId"])
        assert_sha256(body["sha256"])
        if body["evidenceId"] in context["evidence_by_id"]:
            reject("RECORD_ID_CONFLICT")
        source_record = context["source_record_by_id"].get(body["sourceRecordId"])
        if source_record is None:
            reject("REFERENCE_DANGLING")
        source = context["source_files"][source_record["path"]]
        integer_fields = [
            body["byteStart"],
            body["byteEnd"],
            body["lineStart"],
            body["lineEnd"],
        ]
        if (
            any(not isinstance(item, int) or isinstance(item, bool) for item in integer_fields)
            or body["byteStart"] < 0
            or body["byteEnd"] <= body["byteStart"]
            or body["byteEnd"] > len(source["bytes"])
            or body["lineStart"] < 1
            or body["lineEnd"] < body["lineStart"]
        ):
            reject("EVIDENCE_BOUNDS_INVALID")
        span = source["bytes"][body["byteStart"] : body["byteEnd"]]
        if (
            sha256(span) != body["sha256"]
            or decode_utf8(span) != body["text"]
            or line_at_byte(source["bytes"], body["byteStart"]) != body["lineStart"]
            or line_at_byte(source["bytes"], body["byteEnd"]) != body["lineEnd"]
        ):
            reject("EVIDENCE_HASH_MISMATCH")
        context["evidence_by_id"][body["evidenceId"]] = body
        return

    if kind == "AssertionRevision":
        assert_exact_keys(
            body,
            [
                "assertionId",
                "revisionId",
                "predecessorRevisionId",
                "factKey",
                "value",
                "unit",
                "validFrom",
                "evidenceIds",
            ],
        )
        assert_opaque_id(body["assertionId"])
        assert_opaque_id(body["revisionId"])
        assert_opaque_id(body["factKey"])
        if body["revisionId"] in context["revisions_by_id"]:
            reject("RECORD_ID_CONFLICT")
        if (
            not isinstance(body["value"], int)
            or isinstance(body["value"], bool)
            or body["unit"] != context["profile"]["fact"]["unit"]
            or body["factKey"] != context["profile"]["fact"]["factKey"]
            or not isinstance(body["evidenceIds"], list)
            or not body["evidenceIds"]
        ):
            reject("RECORD_SHAPE_INVALID")
        assert_timestamp(body["validFrom"])
        for evidence_id in body["evidenceIds"]:
            assert_opaque_id(evidence_id)
            if evidence_id not in context["evidence_by_id"]:
                reject("REFERENCE_DANGLING")
        prior = context["latest_revision_by_assertion"].get(body["assertionId"])
        if (
            prior is None
            and body["predecessorRevisionId"] is not None
        ) or (
            prior is not None
            and body["predecessorRevisionId"] != prior["body"]["revisionId"]
        ):
            reject("REVISION_CHAIN_INVALID")
        entry = {"body": body, "record": record}
        context["revisions_by_id"][body["revisionId"]] = entry
        context["latest_revision_by_assertion"][body["assertionId"]] = entry
        return

    if kind == "Assessment":
        assert_exact_keys(
            body,
            [
                "assessmentId",
                "actorId",
                "targetRevisionId",
                "stance",
                "basisRevisionIds",
                "evidenceIds",
                "reasonCode",
            ],
        )
        assert_opaque_id(body["assessmentId"])
        assert_opaque_id(body["actorId"])
        assert_opaque_id(body["targetRevisionId"])
        assert_opaque_id(body["reasonCode"])
        if (
            body["assessmentId"] in context["assessments_by_id"]
            or body["stance"] != "challenge"
            or not isinstance(body["basisRevisionIds"], list)
            or not body["basisRevisionIds"]
            or not isinstance(body["evidenceIds"], list)
            or not body["evidenceIds"]
            or body["targetRevisionId"] not in context["revisions_by_id"]
        ):
            reject("REFERENCE_DANGLING")
        for revision_id in body["basisRevisionIds"]:
            assert_opaque_id(revision_id)
            if revision_id not in context["revisions_by_id"]:
                reject("REFERENCE_DANGLING")
        for evidence_id in body["evidenceIds"]:
            assert_opaque_id(evidence_id)
            if evidence_id not in context["evidence_by_id"]:
                reject("REFERENCE_DANGLING")
        context["assessments_by_id"][body["assessmentId"]] = {
            "body": body,
            "record": record,
        }
        return

    if kind == "AcceptanceDecision":
        assert_exact_keys(
            body,
            [
                "decisionId",
                "action",
                "actorId",
                "policyId",
                "purpose",
                "targetRevisionId",
                "revokesDecisionId",
            ],
        )
        assert_opaque_id(body["decisionId"])
        assert_opaque_id(body["actorId"])
        assert_opaque_id(body["policyId"])
        assert_opaque_id(body["purpose"])
        assert_opaque_id(body["targetRevisionId"])
        if body["decisionId"] in context["decisions_by_id"]:
            reject("RECORD_ID_CONFLICT")
        policy = next(
            (
                item
                for item in context["profile"]["policies"]
                if item["policyId"] == body["policyId"]
            ),
            None,
        )
        revision = context["revisions_by_id"].get(body["targetRevisionId"])
        if (
            policy is None
            or policy["purpose"] != body["purpose"]
            or revision is None
            or revision["body"]["assertionId"] != policy["eligibleAssertionId"]
        ):
            reject("DECISION_INVALID")
        if body["action"] == "accept":
            if body["revokesDecisionId"] is not None:
                reject("DECISION_INVALID")
        elif body["action"] == "revoke":
            assert_opaque_id(body["revokesDecisionId"], "DECISION_INVALID")
            revoked = context["decisions_by_id"].get(body["revokesDecisionId"])
            if (
                revoked is None
                or revoked["body"]["action"] != "accept"
                or revoked["body"]["policyId"] != body["policyId"]
                or revoked["body"]["purpose"] != body["purpose"]
                or revoked["body"]["targetRevisionId"] != body["targetRevisionId"]
                or body["revokesDecisionId"] in context["revoked_decision_ids"]
            ):
                reject("DECISION_INVALID")
            context["revoked_decision_ids"].add(body["revokesDecisionId"])
        else:
            reject("DECISION_INVALID")
        context["decisions_by_id"][body["decisionId"]] = {
            "body": body,
            "record": record,
        }


def validate_records(records_with_bytes, profile, source_files):
    context = {
        "profile": profile,
        "source_files": source_files,
        "sources_by_id": {},
        "source_record_by_path": {},
        "source_record_by_id": {},
        "evidence_by_id": {},
        "revisions_by_id": {},
        "latest_revision_by_assertion": {},
        "assessments_by_id": {},
        "decisions_by_id": {},
        "revoked_decision_ids": set(),
    }
    record_ids = set()
    previous_bytes = None
    previous_recorded_at = ""
    for index, item in enumerate(records_with_bytes):
        record = item["value"]
        assert_exact_keys(
            record,
            [
                "format",
                "recordId",
                "recordedSequence",
                "recordedAt",
                "previousRecordSha256",
                "kind",
                "body",
            ],
        )
        if record["format"] != RECORD_FORMAT or record["kind"] not in RECORD_KINDS:
            reject("UNKNOWN_FORMAT")
        assert_opaque_id(record["recordId"])
        if record["recordId"] in record_ids:
            reject("RECORD_ID_CONFLICT")
        record_ids.add(record["recordId"])
        expected_sequence = index + 1
        if (
            not isinstance(record["recordedSequence"], int)
            or isinstance(record["recordedSequence"], bool)
            or record["recordedSequence"] != expected_sequence
        ):
            reject("RECORDED_ORDER_INVALID")
        expected_path = "records/{:04d}-{}.json".format(
            expected_sequence, record["recordId"]
        )
        if item["path"] != expected_path:
            reject("RECORD_PATH_INVALID")
        assert_timestamp(record["recordedAt"], "RECORDED_ORDER_INVALID")
        if record["recordedAt"] <= previous_recorded_at:
            reject("RECORDED_ORDER_INVALID")
        previous_recorded_at = record["recordedAt"]
        if index == 0:
            if record["previousRecordSha256"] is not None:
                reject("RECORD_CHAIN_INVALID")
        else:
            assert_sha256(record["previousRecordSha256"], "RECORD_CHAIN_INVALID")
            if record["previousRecordSha256"] != sha256(previous_bytes):
                reject("RECORD_CHAIN_INVALID")
        validate_record_body(record, context)
        previous_bytes = item["bytes"]
    if len(context["source_record_by_path"]) != len(source_files):
        reject("SOURCE_HASH_MISMATCH")
    return context, sha256(previous_bytes) if previous_bytes is not None else None


def active_acceptance(records, revisions_by_id, horizon, policy):
    visible = [
        record
        for record in records
        if record["recordedAt"] <= horizon["recordedAsOf"]
    ]
    decisions = [
        record
        for record in visible
        if record["kind"] == "AcceptanceDecision"
        and record["body"]["policyId"] == policy["policyId"]
        and record["body"]["purpose"] == policy["purpose"]
    ]
    revoked = {
        record["body"]["revokesDecisionId"]
        for record in decisions
        if record["body"]["action"] == "revoke"
    }
    active = []
    for record in decisions:
        if record["body"]["action"] != "accept":
            continue
        if record["body"]["decisionId"] in revoked:
            continue
        revision = revisions_by_id.get(record["body"]["targetRevisionId"])
        if (
            revision is not None
            and revision["body"]["assertionId"] == policy["eligibleAssertionId"]
            and revision["body"]["validFrom"] <= horizon["validAt"]
        ):
            active.append(record)
    if len(active) > 1:
        reject("POLICY_AMBIGUOUS")
    return (active[0] if active else None), visible


def reduce_semantic_views(profile, records):
    revisions_by_id = {
        record["body"]["revisionId"]: {"body": record["body"], "record": record}
        for record in records
        if record["kind"] == "AssertionRevision"
    }
    views = []
    for horizon in profile["horizons"]:
        for policy in profile["policies"]:
            active, visible = active_acceptance(
                records, revisions_by_id, horizon, policy
            )
            if active is None:
                views.append(
                    {
                        "horizonId": horizon["horizonId"],
                        "recordedAsOf": horizon["recordedAsOf"],
                        "validAt": horizon["validAt"],
                        "policyId": policy["policyId"],
                        "status": "abstain",
                        "value": None,
                        "unit": profile["fact"]["unit"],
                        "revisionId": None,
                        "acceptanceDecisionId": None,
                        "assessmentIds": [],
                        "evidenceIds": [],
                        "reasonCode": "no-active-policy-acceptance",
                    }
                )
                continue
            revision = revisions_by_id[active["body"]["targetRevisionId"]]
            assessments = [
                record
                for record in visible
                if record["kind"] == "Assessment"
                and record["body"]["targetRevisionId"]
                == revision["body"]["revisionId"]
            ]
            evidence_ids = list(revision["body"]["evidenceIds"])
            for assessment in assessments:
                for evidence_id in assessment["body"]["evidenceIds"]:
                    if evidence_id not in evidence_ids:
                        evidence_ids.append(evidence_id)
            views.append(
                {
                    "horizonId": horizon["horizonId"],
                    "recordedAsOf": horizon["recordedAsOf"],
                    "validAt": horizon["validAt"],
                    "policyId": policy["policyId"],
                    "status": "selected",
                    "value": revision["body"]["value"],
                    "unit": revision["body"]["unit"],
                    "revisionId": revision["body"]["revisionId"],
                    "acceptanceDecisionId": active["body"]["decisionId"],
                    "assessmentIds": [
                        record["body"]["assessmentId"] for record in assessments
                    ],
                    "evidenceIds": evidence_ids,
                    "reasonCode": (
                        "sole-active-policy-acceptance"
                        if not assessments
                        else "sole-active-policy-acceptance-with-challenge"
                    ),
                }
            )
    return {
        "format": SEMANTIC_FORMAT,
        "identity": profile["identity"],
        "views": views,
    }


def validate_manifest(manifest):
    assert_exact_keys(
        manifest,
        ["format", "identity", "recordCount", "recordHeadSha256", "files"],
    )
    if manifest["format"] != BUNDLE_FORMAT or not isinstance(
        manifest["identity"], str
    ):
        reject("UNKNOWN_FORMAT")
    if (
        not isinstance(manifest["recordCount"], int)
        or isinstance(manifest["recordCount"], bool)
        or manifest["recordCount"] < 1
        or manifest["recordCount"] > 32
        or not isinstance(manifest["files"], list)
    ):
        reject("BUNDLE_LIMIT_EXCEEDED")
    assert_sha256(manifest["recordHeadSha256"], "RECORD_CHAIN_INVALID")
    paths = set()
    for entry in manifest["files"]:
        assert_exact_keys(entry, ["path", "role", "mediaType", "size", "sha256"])
        assert_safe_relative_path(entry["path"])
        if entry["path"] == "manifest.json" or entry["path"] in paths:
            reject("BUNDLE_ENTRY_UNSAFE")
        paths.add(entry["path"])
        if (
            entry["role"] not in ("profile", "source", "record")
            or not isinstance(entry["mediaType"], str)
            or MEDIA_TYPE_PATTERN.fullmatch(entry["mediaType"]) is None
            or not isinstance(entry["size"], int)
            or isinstance(entry["size"], bool)
            or entry["size"] < 0
        ):
            reject("BUNDLE_ENTRY_UNSAFE")
        assert_sha256(entry["sha256"], "BUNDLE_ENTRY_UNSAFE")


def verify_bundle(bundle_root, expected_manifest_sha256):
    assert_sha256(expected_manifest_sha256, "MANIFEST_HASH_INVALID")
    files = list_bundle_files(bundle_root)
    if "manifest.json" not in files:
        reject("BUNDLE_FILE_MISSING")
    if len(files) > 64:
        reject("BUNDLE_LIMIT_EXCEEDED")
    manifest_bytes = read_regular_no_follow(os.path.join(bundle_root, "manifest.json"))
    if sha256(manifest_bytes) != expected_manifest_sha256:
        reject("MANIFEST_HASH_MISMATCH")
    manifest = parse_strict_json(manifest_bytes, canonical=True)
    validate_manifest(manifest)
    actual_files = sorted(item for item in files if item != "manifest.json")
    declared_files = sorted(entry["path"] for entry in manifest["files"])
    for declared in declared_files:
        if declared not in actual_files:
            reject("BUNDLE_FILE_MISSING")
    for actual in actual_files:
        if actual not in declared_files:
            reject("BUNDLE_FILE_UNDECLARED")
    total_bytes = len(manifest_bytes)
    file_bytes = {}
    for entry in manifest["files"]:
        filename = os.path.join(bundle_root, *entry["path"].split("/"))
        value = read_regular_no_follow(filename)
        total_bytes += len(value)
        if len(value) != entry["size"] or sha256(value) != entry["sha256"]:
            reject("BUNDLE_FILE_HASH_MISMATCH")
        file_bytes[entry["path"]] = {
            "bytes": value,
            "mediaType": entry["mediaType"],
            "role": entry["role"],
        }
    if total_bytes > 1024 * 1024:
        reject("BUNDLE_LIMIT_EXCEEDED")
    profile_entries = [
        entry for entry in manifest["files"] if entry["role"] == "profile"
    ]
    if len(profile_entries) != 1 or profile_entries[0]["path"] != "profile.json":
        reject("BUNDLE_ENTRY_UNSAFE")
    profile = parse_strict_json(file_bytes["profile.json"]["bytes"], canonical=True)
    validate_profile(profile)
    if profile["identity"] != manifest["identity"]:
        reject("RECORD_SHAPE_INVALID")
    source_files = {}
    for entry in manifest["files"]:
        if entry["role"] != "source":
            continue
        if not entry["path"].startswith("sources/"):
            reject("BUNDLE_ENTRY_UNSAFE")
        item = file_bytes[entry["path"]]
        decode_utf8(item["bytes"])
        source_files[entry["path"]] = item
    records_with_bytes = []
    for entry in manifest["files"]:
        if entry["role"] != "record":
            continue
        if not entry["path"].startswith("records/"):
            reject("BUNDLE_ENTRY_UNSAFE")
        item = file_bytes[entry["path"]]
        records_with_bytes.append(
            {
                "path": entry["path"],
                "bytes": item["bytes"],
                "value": parse_strict_json(item["bytes"], canonical=True),
            }
        )
    records_with_bytes.sort(key=lambda item: item["path"])
    if len(records_with_bytes) != manifest["recordCount"]:
        reject("RECORD_SHAPE_INVALID")
    unused_context, record_head_sha256 = validate_records(
        records_with_bytes, profile, source_files
    )
    if record_head_sha256 != manifest["recordHeadSha256"]:
        reject("RECORD_CHAIN_INVALID")
    records = [item["value"] for item in records_with_bytes]
    return reduce_semantic_views(profile, records)


def parse_arguments(argv):
    parser = argparse.ArgumentParser(add_help=True)
    parser.add_argument("--bundle-root", required=True)
    parser.add_argument("--manifest-sha256", required=True)
    return parser.parse_args(argv)


def main(argv):
    arguments = parse_arguments(argv)
    result = verify_bundle(arguments.bundle_root, arguments.manifest_sha256)
    output = canonical_json(result)
    if len(output) > 65536:
        reject("OUTPUT_LIMIT_EXCEEDED")
    sys.stdout.buffer.write(output)


if __name__ == "__main__":
    try:
        main(sys.argv[1:])
    except BundleError as error:
        sys.stderr.write(error.code + "\n")
        sys.exit(1)
    except Exception:
        sys.stderr.write("UNEXPECTED_FAILURE\n")
        sys.exit(1)
