# WebContainer Compatibility

## Supported Runtimes

Runtime | Supported | Reason (if not supported) | Fallback Driver
--- | ---: | --- | ---
node | true |  | 
npm | true |  | 
npx | true |  | 
python3 | false | WebContainers lack POSIX syscalls required by CPython interpreter (clone, execve, fork). | docker
python | false | Alias of python3. Same limitation applies. | docker
go | false | Go runtime requires Linux syscalls (clone3, mmap) unavailable in browser sandbox. | docker
rustc | false | Rust compiler requires fork/exec and filesystem mounts unavailable in WebContainers. | docker
cargo | false | Cargo depends on rustc. Same limitation applies. | docker

## Native npm Packages

Package | Native | Recommended Alternative
--- | ---: | ---
better-sqlite3 | true | sql.js
sharp | true | (none known)
bcrypt | true | bcryptjs
canvas | true | (none known)
node-sass | true | sass
sqlite3 | true | sql.js

## Notes

These entries are defined in packages/sandbox/src/drivers/webcontainer/runtime-compat-matrix.ts and packages/sandbox/src/drivers/webcontainer/native-dependency-checker.ts. Update those files to extend the matrix or add package entries.
