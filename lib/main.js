import isPromise from 'is-promise';

// ## printMaxListenersWarning
// is a listener that prints a warning when the max listeners has been exceeded
// just like the ``EventEmitter`` does, but now you can clear it out by
// executing ``this.removeAllListeners('maxListenersPassed')`` in your
// constructor function just after running the ``EventEmitter`` constructor
// function in your own constructor function.
function printMaxListenersWarning(eventName, listenerCount) {
  console.warn(
    'The Event ' + eventName + ' has exceeded ' + this._maxListeners +
    ' listeners, currently at ' + listenerCount);
}

// # EventEmitter
// Constructor function, a replacement for ``EventEmitter`` that also allows
// for asynchronous event listeners and allows event listeners to cancel events
// if they return `false`. Event listeners may be either synchronous like DOM
// events or asynchronous to better fit a async/await Promise style.  (Because
// of that, making an event placed inside of a high performance loop is
// probably a bad idea because the event listeners can introduce an
// unpredictable delay.) The ``EventEmitter`` constructor function attaches
// three "please don't touch" properties to itself (or its inheriting object)
// to keep track of listeners and the maximum number of allowed listeners.
export function EventEmitter() {
  this._eventListeners = new Map();
  this._onceListeners = new Map();
  this._maxListeners = 10;
  this.on('maxListenersPassed', printMaxListenersWarning.bind(this));
}

// ## emitSync
// Operates just like ``emit`` except all listeners must be synchronous.
EventEmitter.prototype.emitSync = function emitSync(eventName, ...args) {
  // Short-circuit for emit calls with no listeners
  if(!this._onceListeners.has(eventName) &&
    !this._eventListeners.has(eventName)) {
    return;
  }

  // Copy listeners arrays to ensure listener call order
  const onceListeners = [...(this._onceListeners.get(eventName) || [])];
  const eventListeners = [...(this._eventListeners.get(eventName) || [])];

  // process once listeners first
  if(onceListeners.length > 0) {
    for(const listener of onceListeners) {
      // remove from emitter list
      // get again in case already removed
      const _onceListeners = this._onceListeners.get(eventName);
      if(_onceListeners) {
        const idx = _onceListeners.indexOf(listener);
        if(idx !== -1) {
          _onceListeners.splice(idx, 1);
        }
      }
      // emit 'removeListener'
      this.emitSync('removeListener', eventName, listener);

      // invoke listener, exceptions are not caught
      const result = listener(...args);
      // check for async result
      if(isPromise(result)) {
        throw new TypeError(`async listeners not allowed for "${eventName}"`);
      }
      // check if event canceled
      if(result === false) {
        return false;
      }
    }
    // remove once list if empty
    const _onceListeners = this._onceListeners.get(eventName);
    if(_onceListeners.length === 0) {
      this._onceListeners.delete(eventName);
    }
  }

  // process regular listeners
  for(const listener of eventListeners) {
    // invoke listener, exceptions are not caught
    const result = listener(...args);
    // check for async result
    if(isPromise(result)) {
      throw new TypeError(`async listeners not allowed for "${eventName}"`);
    }
    // check if event canceled
    if(result === false) {
      return false;
    }
  }
};

// ## emit
// Takes and event name and a variable number of arguments. Listeners can be
// asynchronous and return a Promise or synchronous. Listeners can cancel
// events if their return value is `false` or is a Promise that resolves to
// `false`. Event cancelation immediately ends all processing of event
// listeners and returns `false`. If the event was emitted to all listeners
// then undefined is returned. The order of event listeners is the order they
// were attached, but ``once`` listeners are given priority over ``on``
// listeners (so its possible to do a one-time cancelation and not have any of
// the ``on`` listeners called).
EventEmitter.prototype.emit = async function emit(eventName, ...args) {
  // Short-circuit for emit calls with no listeners
  if(!this._onceListeners.has(eventName) &&
    !this._eventListeners.has(eventName)) {
    return;
  }

  // Copy listeners arrays to ensure listener call order
  const onceListeners = [...(this._onceListeners.get(eventName) || [])];
  const eventListeners = [...(this._eventListeners.get(eventName) || [])];

  // process once listeners first
  if(onceListeners.length > 0) {
    for(const listener of onceListeners) {
      // remove from emitter list
      // get again in case already removed
      const _onceListeners = this._onceListeners.get(eventName);
      if(_onceListeners) {
        const idx = _onceListeners.indexOf(listener);
        if(idx !== -1) {
          _onceListeners.splice(idx, 1);
        }
      }
      // emit 'removeListener'
      this.emitSync('removeListener', eventName, listener);

      // invoke listener, exceptions are not caught
      const cancel = await listener(...args);
      // check if event canceled
      if(cancel === false) {
        return false;
      }
    }
    // remove list if empty
    const _onceListeners = this._onceListeners.get(eventName);
    if(_onceListeners && _onceListeners.length === 0) {
      this._onceListeners.delete(eventName);
    }
  }

  // process regular listeners
  for(const listener of eventListeners) {
    // invoke listener, exceptions are not caught
    const cancel = await listener(...args);
    // check if event canceled
    if(cancel === false) {
      return false;
    }
  }
};

// ## _on
function _on(emitter, listeners, eventName, listener) {
  // emit 'newListener' before listener added
  emitter.emitSync('newListener', eventName, listener);
  let eventListeners = listeners.get(eventName);
  if(!eventListeners) {
    eventListeners = [];
    listeners.set(eventName, eventListeners);
  }
  eventListeners.push(listener);
  if(emitter._maxListeners !== 0 && emitter._maxListeners !== Infinity) {
    const listenerCount = emitter.listenerCount(eventName);
    if(listenerCount > emitter._maxListeners) {
      emitter.emitSync('maxListenersPassed', eventName, listenerCount);
    }
  }
  return emitter;
}

// ## on
// The bread-n-butter of an EventEmitter, registering listeners for events. In
// this implementation, the event types are lazily determined, as this is the
// most obvious implementation for Javascript, and high performance for
// registering listeners shouldn't be an issue. If the total number of
// listeners exceeds the maximum specified, the ``maxListenersPassed`` event is
// fired with the event name and listener count as arguments provided to the
// listener. Like all events internal to ``EventEmitter``, it is not
// cancelable, itself. Once registered, the ``newListener`` event is emitted.
EventEmitter.prototype.on = function on(eventName, listener) {
  return _on(this, this._eventListeners, eventName, listener);
};

// ## addListener
// Alias for ``on``.
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

// ## once
// The ``once`` method works very similar to the ``on`` method, except
// listeners are removed from the emitter before being invoked.
EventEmitter.prototype.once = function once(eventName, listener) {
  return _on(this, this._onceListeners, eventName, listener);
};

// ## off
// Removes the first listener for an event.  Fires the ``removeListener`` event
// if found.  Note that a listener could be registered multiple times.
EventEmitter.prototype.off = function off(
  eventName, listener) {
  for(const _listeners of [this._eventListeners, this._onceListeners]) {
    if(_listeners.has(eventName)) {
      const removedListeners = [];
      const remainingListeners = _listeners.get(eventName)
        .filter(registeredListener => {
          if(registeredListener === listener) {
            removedListeners.push(listener);
            return false;
          }
          return true;
        });
      if(remainingListeners.length === 0) {
        _listeners.delete(eventName);
      } else {
        _listeners.set(eventName, remainingListeners);
      }
      // emit 'removeListener' after listener is removed
      for(const listener of removedListeners) {
        this.emitSync('removeListener', eventName, listener);
      }
    }
  }
  return this;
};

// ## removeListener
// Alias for ``off``.
EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

// ## removeAllListeners
// If an event name is provided, it removes all of the listeners for that event
// and emits the ``removeListener`` event for each listener. If not called with
// an event name, it removes all listeners for all events.
EventEmitter.prototype.removeAllListeners = function removeAllListeners(
  eventName) {
  if(eventName) {
    for(const _listeners of [this._eventListeners, this._onceListeners]) {
      const listeners = _listeners.get(eventName) || [];
      delete _listeners.delete(eventName);
      // emit 'removeListener' after listener is removed
      for(const listener of listeners) {
        this.emitSync('removeListener', listener);
      }
    }
  } else {
    for(const _listeners of [this._eventListeners, this._onceListeners]) {
      for(const eventName of _listeners.keys()) {
        this.removeAllListeners(eventName);
      }
    }
  }
  return this;
};

// ## setMaxListeners
// Set the maximum number of listeners before a warning is issued. Use `0` or
// `Infinity` for unlimited listeners.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(count) {
  this._maxListeners = count;
  return this;
};

// ## listeners
// Returns an array of registered listeners for the given event. This array is
// a copy so you can alter it at will, but the functions it points to are not
// copies, so properties attached to them will propagate back into
// ``EventEmitter``.
EventEmitter.prototype.listeners = function listeners(eventName) {
  return [
    ...(this._eventListeners.get(eventName) || []),
    ...(this._onceListeners.get(eventName) || [])
  ];
};

// ## listenerCount
// Return the number of listeners registered for the given event.
EventEmitter.prototype.listenerCount = function listenerCount(eventName) {
  return (
    (this._eventListeners.get(eventName) || []).length +
    (this._onceListeners.get(eventName) || []).length
  );
};

// ## listenerCount
// Given an ``EventEmitter`` instance and an event name, it returns the number
// of listeners registered on that event.
EventEmitter.listenerCount = function listenerCount(instance, eventName) {
  return instance.listenerCount(eventName);
};
