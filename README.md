# async-node-events

[![NPM Version](https://img.shields.io/npm/v/async-node-events.svg?style=flat-square)](https://npm.im/async-node-devents)
[![Build Status](https://travis-ci.org/digitalbazaar/async-node-events.png?branch=master)](https://travis-ci.org/digitalbazaar/async-node-events)

An EventEmitter replacement that allows both asynchronous and synchronous
emissions and handlers. This is entirely based off of and almost entirely
written by [@dfellis] in his excellent
[async-cancelable-events](https://github.com/dfellis/async-cancelable-events)
module. Even this README is primarily written by [@dfellis]. Recent updates are
from [Digital Bazaar].

This version is primarily targeted at using Promises and async/await with
``emit`` and listeners. Namely, the asynchronous ``emit`` will return a Promise
which can be awaited upon. Listeners are run in series and their result is
awaited upon. Throwing an error from a listener that executed asynchronously
will terminate the listener chain (subsequent listeners will not receive the
emitted event and the ``emit`` Promise will be rejected. Events may also be
canceled by a listener resolving to or returning `false`. This will stop
further event emission to other listeners and return `false` rather than
`undefined`, but not raise an error.

The synchronous ``emitSync`` variant acts like the asynchronous ``emit`` but
only allows synchronous listeners.

The listener manipulation methods (``on``, ``off``, etc) are synchronous and
use ``emitSync`` to emit ``newListener``, ``removeListener``, and
``maxListenersPassed``. Listeners for these events must be synchronous.

- Credit for the original project goes to [David Ellis].
- Improvements and updates by [Digital Bazaar].

## Install

```sh
npm install async-node-events
```

## Usage

```js
var EventEmitter = require('async-node-events').EventEmitter;
var util = require('util');

(async () => {
  const myEmitter = new EventEmitter();
  myEmitter.on('test', async (...) => {
    ...
  });
  await myEmitter.emit('test', ...);
})();

function MyEmittingObject() {
  EventEmitter.call(this);
  ...
}

util.inherits(MyEmittingObject, EventEmitter);
```

The API is intended to be a mostly-drop-in replacement for Node.js'
`EventEmitter` object, except with support for asynchronous listeners.

The primary differences between the `EventEmitter` and `async-node-events` are:

1. Passing the maximum number of listeners allowed will fire off a
   ``maxListenersPassed`` event with the event name and listener count as
   arguments. The warning the official ``EventEmitter`` prints is simply a
   listener for ``async-node-events``, and can be disabled by running
   ``this.removeAllListeners('maxListenersPassed')`` just after the
   ``EventEmitter.call(this)`` listed above.
2. The various synchronous method calls are chainable, so ``foo.on('bar',
   func1).on('baz', func2)`` is valid.
3. ``emit`` and ``emitSync`` return `undefined` if the even was emitted to all
   listeners and `false` when a listener caused cancellation. This differs from
   returning an indication if there were listeners.

## License (MIT)

Copyright (C) 2012-2013 by [David Ellis]

Copyright (C) 2014-2019 [Digital Bazaar]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

[@dfellis]: https://github.com/dfellis
[David Ellis]: https://github.com/dfellis
[Digital Bazaar]: https://github.com/digitalbazaar
