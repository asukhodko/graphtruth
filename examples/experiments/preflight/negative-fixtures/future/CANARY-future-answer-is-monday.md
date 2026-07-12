# Controller-only filename canary

This public synthetic file deliberately carries future information in its
filename. A reveal controller must keep both its name and its bytes outside the
system-under-test filesystem view until the corresponding negative check.
