# async-node-events ChangeLog

## 2.0.0 - 2019-11-08

### Changed
- **BREAKING**: `EventEmitter` is exported from module.
  - For CommonJS use `const {EventEmitter} = require('async-node-events');`
  - For ES Modules use `import {EventEmitter} from 'async-node-events';`
- **BREAKING**: Make `emit()` async function and resolve to `true`/`false` if
  listeners were called rather than returning `this`.
- **BREAKING**: Listeners called through sync functions (`on`, `off`, etc) will
  all be called in a sync manner, and must not return a Promise.
- **BREAKING**: ``emitSync`` is now like ``emit`` but only handles synchronous
  listeners.
- **BREAKING**: ``emit`` and ``emitSync`` return `false` when cancelled and
  `true` if not cancelled. This differs from Node.js API that indicates if
  there were listeners. Use `listenerCount` to check for listeners.
- Update dependencies.
- Switch from gulp to simple npm scripts and nyc.
- Switch to ES modules using 'esm' for Node.js support.
- Update test suite.
- Modernize code.
  - async/await
  - arrow functions
  - various new ES features
  - use Map

### Added
- Add eslint support and update style.
- `off()` as alias for removeListener.
- Instance `listenerCount()`.

### Removed
- **BREAKING**: Listener manipulation API is now *always* synchronous. Remove
  old explicit sync/async API.
  - `onSync()` / `onceSync()` / `addListenerSync()`
  - `onAsync()` / `onceAsync()` / `addListenerAsync()`

## 1.0.0 - 2018-05-10

### Changed
- Release 1.0.0.

## 0.0.8 - 2018-05-10

### Added
- Add support for promise-based async listeners.

## 0.0.7 (up to early 2018)

- See git history for changes.
