var isAsync = require('is-async');

function AsyncCancelableEvents() {
    this._eventListeners = {};
    this._oneTimeListeners = {};
    this._maxListeners = 10;
}

AsyncCancelableEvents.prototype.emit = function emit(eventName) {
    var argsArray = Array.prototype.slice.call(arguments, 1, arguments.length-1);
    var callback = argsArray[argsArray.length-1] instanceof Function ? argsArray[argsArray.length-1] : undefined;
    if(callback) argsArray.pop();
    var listenersToCall;
    if(this._oneTimeListeners[eventName] instanceof Array) {
        listenersToCall = this._oneTimeListeners[eventName];
        delete this._oneTimeListeners[eventName];
        listenersToCall.forEach(function(listener) {
            this.emitSync('removeListener', listener);
        });
    }
    if(this._eventListeners[eventName] instanceof Array) Array.prototype.push.apply(listenersToCall, this._eventListeners[eventName]);
    var iterate = function iterate(retVal) {
        if(retVal === false) {
            if(callback) callback(false);
        } else {
            if(listenersToCall.length) {
                var listener = listenersToCall.shift();
                if(isAsync(listener)) {
                    listener.apply(null, argsArray);
                } else {
                    argsArray.pop();
                    var result = listener.apply(null, argsArray);
                    argsArray.push(iterate);
                    iterate(result);
                }
            } else {
                if(callback) callback(true);
            }
        }
    };
    argsArray.push(iterate);
    iterate(true);
    return this;
};

AsyncCancelableEvents.prototype.emitAsync = AsyncCancelableEvents.prototype.emit;

AsyncCancelableEvents.prototype.emitSync = function emitSync(eventName) {
    var argsArray = Array.prototype.slice.call(arguments, 1, arguments.length-1);
    var listenersToCall;
    if(this._oneTimeListeners[eventName] instanceof Array) {
        listenersToCall = this._oneTimeListeners[eventName];
        delete this._oneTimeListeners[eventName];
        listenersToCall.forEach(function(listener) {
            this.emitSync('removeListener', listener);
        });
    }
    if(this._eventListeners[eventName] instanceof Array) Array.prototype.push.apply(listenersToCall, this._eventListeners[eventName]);
    var iterate = function(iterate(retVal) {
        if(retVal !== false) {
            if(listenersToCall.length) {
                var listener = listenersToCall.shift();
                if(isAsync(listener)) {
                    listener.apply(null, argsArray);
                } else {
                    argsArray.pop();
                    var result = listener.apply(null, argsArray);
                    argsArray.push(iterate);
                    iterate(result);
                }
            }
        }
    };
    argsArray.push(iterate);
    iterate(true);
    return this;
};

AsyncCancelableEvents.prototype.on = function on(eventName, listener) {
    if(!this._eventListeners) this._eventListeners = {};
    this._eventListeners[eventName] = this._eventListeners[eventName] instanceof Array ? this._eventListeners[eventName] : [];
    this._eventListeners[eventName].push(listener);
    var listenerCount = this._eventListeners[eventName].length + (this._oneTimeListeners[eventName] instanceof Array ? this._oneTimeListeners[eventName].length : 0);
    if(listenerCount > this._maxListeners) this.emitSync('maxListenersPassed', eventName, listenerCount);
    this.emitSync('newListener', listener);
    return this;
};

AsyncCancelableEvents.prototype.onSync = function onSync(eventName, listener) {
    listener.sync = true;
    return this.on(eventName, listener);
};

AsyncCancelableEvents.prototype.onAsync = function onAsync(eventName, listener) {
    listener.async = true;
    return this.on(eventName, listener);
};

AsyncCancelableEvents.prototype.addListener = AsyncCancelableEvents.prototype.on;
AsyncCancelableEvents.prototype.addListenerSync = AsyncCancelableEvents.prototype.onSync;
AsyncCancelableEvents.prototype.addListenerAsync = AsyncCancelableEvents.prototype.onAsync;

AsyncCancelableEvents.prototype.once = function once(eventName, listener) {
    if(!this._oneTimeListeners) this._oneTimeListeners = {};
    this._oneTimeListeners[eventName] = this._oneTimeListeners[eventName] instanceof Array ? this._oneTimeListeners[eventName] : [];
    this._oneTimeListeners[eventName].push(listener);
    var listenerCount = this._oneTimeListeners[eventName].length + (this._eventListeners[eventName] instanceof Array ? this._eventListeners[eventName].length : 0);
    if(listenerCount > this._maxListeners) this.emitSync('maxListenersPassed', eventName, listenerCount);
    this.emitSync('newListener', listener);
    return this;
};

AsyncCancelableEvents.prototype.onceSync = function onceSync(eventName, listener) {
    listener.sync = true;
    return this.once(eventName, listener);
};

AsyncCancelableEvents.prototype.onceAsync = function onceAsync(eventName, listener) {
    listener.async = true;
    return this.once(eventName, listener);
};

AsyncCancelableEvents.prototype.removeListener = function removeListener(eventName, listener) {
    if(this._eventListeners[eventName] instanceof Array) this._eventListeners[eventName] = this._eventListeners[eventName].filter(function(registeredListener) {
        if(registeredListener === listener) {
            this.emitSync('removeListener', listener);
            return false;
        } else {
            return true;
        }
    });
    if(this._oneTimeListeners[eventName] instanceof Array) this._oneTimeListeners[eventName] = this._oneTimeListeners[eventName].filter(function(registeredListener) {
        if(registeredListener === listener) {
            this.emitSync('removeListener', listener);
            return false;
        } else {
            return true;
        }
    });
    return this;
};

AsyncCancelableEvents.prototype.removeAllListeners(eventName) {
    if(eventName) {
        if(this._eventListeners[eventName] instanceof Array) {
            this._eventListeners[eventName].forEach(function(listener) {
                this.emitSync('removeListener', listener);
            });
            delete this._eventListeners[eventName];
        }
        if(this._oneTimeListeners[eventName] instanceof Array) {
            this._oneTimeListeners[eventName].forEach(function(listener) {
                this.emitSync('removeListener', listener);
            });
            delete this._oneTimeListeners[eventName];
        }
    } else {
        Object.keys(this._eventListeners).forEach(function(eventName) {
            this.removeAllListeners(eventName);
        });
        Object.key(this._oneTimeListeners).forEach(function(eventName) {
            this.removeAllListeners(eventName);
        });
    }
    return this;
};

AsyncCancelableEvents.prototype.setMaxListeners(count) {
    this._maxListeners = count;
    return this;
};

AsyncCancelableEvents.prototype.listeners(eventName) {
    var listeners = [];
    if(this._eventListeners[eventName] instanceof Array) Array.prototype.push.apply(listeners, this._eventListeners[eventName]);
    if(this._oneTimeListeners[eventName] instanceof Array) Array.prototype.push.apply(listeners, this._oneTimeListeners[eventName]);
    return listeners;
};

AsyncCancelableEvents.listenerCount(instance, eventName) {
    var count = 0;
    if(instance._eventListeners[eventName] instanceof Array) count += instance._eventListeners[eventName].length;
    if(instance._oneTimeListeners[eventName] instanceof Array) count += instance._oneTimeListeners[eventName].length;
    return count;
};