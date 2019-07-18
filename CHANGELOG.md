# v1.0.0

* Major version bump to prevent backwards-incompatible changes in the future.

# v0.7.0

* Update CLI command line options to require both `outputDir` and `path`.
  * Example: thrift2flow --path="idl/code.foo.bar" --outputDir="src/types/idl" idl/code.foo.bar/*/*/*.thrift
* Enums now use strings instead of ints to match thriftrw
* Enums use Object.freeze to avoid mutations.
* typedefs of enums are now also values.
* Suffix parameter was removed. This caused invalid type definitions because of name collisions.
* Most types are now Exact. Enums are also now ReadOnly
