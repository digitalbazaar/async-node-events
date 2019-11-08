import {expect} from 'chai';
import {EventEmitter} from '..';

describe('EventEmitter', function() {
  describe('#constructor', function() {
    it('should construct without error', function() {
      const emitter = new EventEmitter();
      expect(emitter).to.not.be.undefined;
    });
  });

  describe('#emit', () => {
    it('should not error when emitting a nonexistent event async', async () => {
      const emitter = new EventEmitter();
      const finished = await emitter.emit('doesNotExist');
      expect(finished).to.be.undefined;
    });

    it('should call once listeners and remove them', async () => {
      const emitter = new EventEmitter();
      let emitted = false;
      emitter.once('test', function() {
        emitted = true;
      });
      const finished = await emitter.emit('test');
      expect(finished).to.be.undefined;
      expect(emitted).to.be.true;
      expect(emitter.listeners('test').length).to.equal(0);
    });

    it('should call regular listeners without removing them', async () => {
      const emitter = new EventEmitter();
      let emitted = false;
      emitter.on('test', function() {
        emitted = true;
      });
      const finished = await emitter.emit('test');
      expect(finished).to.be.undefined;
      expect(emitted).to.be.true;
      expect(emitter._eventListeners.has('test')).to.be.true;
    });

    it('should call multiple listeners async', async () => {
      let emissions = 0;
      const emitter = new EventEmitter();
      function emissionCounter() {
        emissions++;
      }
      emitter.on('test', emissionCounter);
      emitter.on('test', emissionCounter);
      emitter.once('test', emissionCounter);

      const finished = await emitter.emit('test');
      expect(finished).to.be.undefined;
      expect(emissions).to.equal(3);
    });

    it('should call multiple listeners sync', async () => {
      let emissions = 0;
      const emitter = new EventEmitter();
      function emissionCounter() {
        emissions++;
      }
      emitter.on('test', emissionCounter);
      emitter.on('test', emissionCounter);
      emitter.once('test', emissionCounter);

      const finished = await emitter.emit('test');
      expect(finished).to.be.undefined;
      expect(emissions).to.equal(3);
    });

    it('should handle Object property event names', async () => {
      let emissions = 0;
      const emitter = new EventEmitter();
      function emissionCounter() {
        emissions++;
      }
      emitter.on('toString', emissionCounter);
      emitter.on('toString', emissionCounter);
      emitter.once('toString', emissionCounter);

      const finished = await emitter.emit('toString');
      expect(finished).to.be.undefined;
      expect(emissions).to.equal(3);
    });

    it('should cancel events', async () => {
      let emissions0 = 0;
      let emissions1 = 0;
      const emitter = new EventEmitter();
      function emissionCounter0() {
        emissions0++;
        return false;
      }
      function emissionCounter1() {
        emissions1++;
      }
      emitter.on('test', emissionCounter0);
      emitter.on('test', emissionCounter1);

      const finished = await emitter.emit('test');
      expect(finished).to.be.false;
      expect(emissions0).to.equal(1);
      expect(emissions1).to.equal(0);
    });

    it('should cancel from once events', async () => {
      let emissions0 = 0;
      let emissions1 = 0;
      const emitter = new EventEmitter();
      function emissionCounter0() {
        emissions0++;
        return false;
      }
      function emissionCounter1() {
        emissions1++;
      }
      emitter.once('test', emissionCounter0);
      emitter.on('test', emissionCounter1);

      const finished = await emitter.emit('test');
      expect(finished).to.be.false;
      expect(emissions0).to.equal(1);
      expect(emissions1).to.equal(0);
    });
  });

  describe('#listeners / #listenerCount', () => {
    it('should return all registered listeners', async () => {
      const emitter = new EventEmitter();
      emitter.on('test', console.log);
      emitter.on('test', console.info);
      emitter.on('other', console.warn);
      emitter.once('test', console.log);

      expect(EventEmitter.listenerCount(emitter, 'test')).to.equal(3);
      expect(EventEmitter.listenerCount(emitter, 'other')).to.equal(1);
      expect(emitter.listeners('test')).to.have.length(3);
      expect(emitter.listeners('other')).to.have.length(1);
    });
  });

  describe('#on', () => {
    it('should add a listener', async () => {
      const emitter = new EventEmitter();
      emitter.on('fake', console.log);
      expect(emitter._eventListeners.get('fake')).to.have.length(1);
    });

    it('should respect the maxListeners property', async () => {
      const emitter = new EventEmitter();
      let emissions = 0;
      emitter.setMaxListeners(2);
      emitter.on('maxListenersPassed', function() {
        emissions++;
      });
      emitter.on('fake', console.log);
      emitter.on('fake', console.log);
      emitter.on('fake', console.log);
      expect(emissions).to.equal(1);
    });

    it('should call newListener', async () => {
      const emitter = new EventEmitter();
      let emissions = 0;
      const eventName = 'test';
      const listener = function() {};
      emitter.on('newListener', function(_eventName, _listener) {
        if(_eventName === eventName && _listener === listener) {
          emissions++;
        }
      });
      emitter.on(eventName, listener);
      expect(emissions).to.equal(1);
    });

    it('should fail on async newListener', async () => {
      const emitter = new EventEmitter();
      emitter.on('newListener', async () => {});
      let err;
      try {
        emitter.on('test', async () => {});
      } catch(e) {
        err = e;
      }
      expect(err).to.not.be.undefined;
    });
  });

  describe('#once', () => {
    it('should add a listener', async () => {
      const emitter = new EventEmitter();
      emitter.once('fake', console.log);
      expect(emitter._onceListeners.get('fake')).to.have.length(1);
    });

    it('should respect the maxListeners property', async () => {
      const emitter = new EventEmitter();
      let emissions = 0;
      emitter.setMaxListeners(2);
      emitter.once('maxListenersPassed', function() {
        emissions++;
      });
      emitter.once('fake', console.log);
      emitter.once('fake', console.log);
      emitter.once('fake', console.log);
      expect(emissions).to.equal(1);
    });
  });

  describe('#removeListener', () => {
    it('should remove a listener', async () => {
      const emitter = new EventEmitter();
      function handleBlargh() {
      }
      emitter.on('blargh', handleBlargh);
      emitter.on('blargh', console.log);
      emitter.once('blargh', handleBlargh);
      emitter.on('weagoo', handleBlargh);

      emitter.removeListener('blargh', handleBlargh);
      expect(emitter._eventListeners.get('blargh')).to.have.length(1);
      expect(emitter._onceListeners.get('blargh')).to.be.undefined;
      expect(emitter._eventListeners.get('weagoo')).to.have.length(1);
    });

    it('should be okay if no listeners exist to remove', () => {
      const emitter = new EventEmitter();
      function handleBlargh() {
      }
      emitter.on('weagoo', console.log);

      emitter.removeListener('blargh', handleBlargh);
      emitter.removeListener('weeagoo', handleBlargh);
      expect(emitter.listeners('blargh')).to.have.length(0);
      expect(emitter.listeners('weagoo')).to.have.length(1);
    });

    it('should call removeListener', async () => {
      const emitter = new EventEmitter();
      let emissions = 0;
      const eventName = 'test';
      const listener = function() {};
      emitter.on('removeListener', function(_eventName, _listener) {
        if(_eventName == eventName && _listener === listener) {
          emissions++;
        }
      });
      emitter.on(eventName, listener);
      emitter.off(eventName, listener);
      expect(emissions).to.equal(1);
    });

    it('should fail on async removeListener', async () => {
      const emitter = new EventEmitter();
      const listener = async () => {};
      emitter.on('removeListener', async () => {});
      let err;
      try {
        emitter.on('test', listener);
        emitter.off('test', listener);
      } catch(e) {
        err = e;
      }
      expect(err).to.not.be.undefined;
    });
  });

  describe('#removeAllListeners', () => {
    it('should remove all listeners', async () => {
      const emitter = new EventEmitter();
      function handleBlargh() {
      }
      emitter.on('blargh', handleBlargh);
      emitter.on('blargh', console.log);
      emitter.once('blargh', handleBlargh);
      emitter.on('weagoo', handleBlargh);

      emitter.removeAllListeners('blargh');
      expect(emitter.listeners('blargh')).to.have.length(0);
      expect(emitter._eventListeners.get('weagoo')).to.have.length(1);
    });
  });
});
