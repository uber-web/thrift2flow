* Enums now use strings instead of ints to match thriftrw
* Enums use Object.freeze to avoid mutations.
* typedefs of enums are now also values.
* Suffix parameter was removed. This caused invalid type definitions because of name collisions.