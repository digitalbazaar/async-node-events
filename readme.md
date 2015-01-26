# async-node-events

An EventEmitter replacement that allows both asynchronous and synchronous emissions and handlers.
This is entirely based off of and almost entirely written by @dfellis in his excellent
[async-cancelable-events](https://github.com/dfellis/async-cancelable-events) module. Even this
README is primarily written by @dfellis.

This version uses the idiomatic node callback continuation style. Namely, once an asynchronous
function has completed, it calls a callback, passing the first parameter as an error
(or `null`) and then optional parameters may follow. Passing an error back from a listener
that executed asynchronously will terminate the listener chain (subsequent listeners will not
receive the emitted event and any callback for the event emitter will receive the error). Events
may also be canceled by passing `false` as the second parameter to a asynchronous listener's
callback -- which is the analog to returning false from a synchronous listener. Both of these
approaches will stop further event emission (to other listeners), but not raise an error.

All credit goes to @dfellis.

## Install

```sh
npm install async-node-events
```

## Usage

```js
var EventEmitter = require('async-node-events');
var util = require('util');

function MyEmittingObject() {
    EventEmitter.call(this);
    ...
}

util.inherits(MyEmittingObject, EventEmitter);
```

The API is intented to be a mostly-drop-in replacement for Node.js' EventEmitter object, except with support for node-styled async callbacks.

The primary differences between the EventEmitter and async-node-events are:

1. If the last argument passed into ``this.emit`` is a function, it is assumed to be a callback that accepts accepts the typical (err, result) tuple.
2. The ``.on`` and ``.once`` methods try to "guess" if the provided handler is synchronous or asynchronous (based on its argument length), or can be explicitly registered as synchronous or asynchronous with ``.onSync``, ``.onAsync``, ``.onceSync``, ``.onceAsync``.
3. Passing the maximum number of listeners allowed will fire off a ``maxListenersPassed`` event with the event name and listener count as arguments. The warning the official ``EventEmitter`` prints is simply a listener for ``async-node-events``, and can be disabled by running ``this.removeAllListeners('maxListenersPassed')`` just after the ``EventEmitter.call(this)`` listed above.
4. The various method calls are chainable, so ``foo.on('bar', func1).on('baz', func2)`` is valid.

The primary difference between async-cancelable-events and async-node-events is:

1. The parameters of asynchronous callbacks use the node idiom of `callback(err:Error|Null, result:Any)` rather than `callback(continue:Boolean)`. If `result:Any` is `false` then it will cancel further event emission to other listeners.

## License (MIT)

Copyright (C) 2012-2013 by David Ellis

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
