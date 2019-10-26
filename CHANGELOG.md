# async-node-events ChangeLog

## 2.0.0 - 2019-xx-xx

### Changed
- **BREAKING**: Make `emit()` async function and resolve to `true`/`false` if
  listeners were called rather than returning `this`.
- Update dependencies.
- Switch from gulp to simple npm scripts and nyc.
- Switch to ES modules using 'esm' for Node.js support.
- Update test suite.
- Modernize code.
  - async/await
  - arrow functions
  - various new ES features

### Added
- Add eslint support and update style.
- `off()` as alias for removeListener.
- Instance `listenerCount()`.

## 1.0.0 - 2018-05-10

### Changed
- Release 1.0.0.

## 0.0.8 - 2018-05-10

### Added
- Add support for promise-based async listeners.

## 0.0.7 (up to early 2018)

- See git history for changes.
