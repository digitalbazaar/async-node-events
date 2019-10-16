const expect = require('chai').expect;
const EventEmitter = require('../lib/async-node-events');

describe('EventEmitter', function() {
  describe('#constructor', function() {
    it('should construct without error', function() {
      new EventEmitter();
    });
  });

  describe('#emit', function() {
    it('should not error when emitting a nonexistent event async', function(
      done) {
      const emitter = new EventEmitter();
      emitter.emitAsync('doesNotExist', done);
    });

    it('should not error when emitting a nonexistent event sync', function() {
      const emitter = new EventEmitter();
      emitter.emitSync('doesNotExist');
      emitter.emit('doesNotExist');
    });

    it('should call once listeners and remove them', function(done) {
      const emitter = new EventEmitter();
      let emitted = false;
      emitter._oneTimeListeners = {test: [function() {
        emitted = true;
      }]};
      emitter.emit('test', function(err) {
        expect(err).to.not.exist;
        expect(emitted).to.be.true;
        expect(emitter._oneTimeListeners).to.not.include.key('test');
        done();
      });
    });

    it('should call regular listeners without removing them', function(done) {
      const emitter = new EventEmitter();
      let emitted = false;
      emitter._eventListeners = {test: [function() {
        emitted = true;
      }]};
      emitter.emit('test', function(err) {
        expect(err).to.not.exist;
        expect(emitted).to.be.true;
        expect(emitter._eventListeners).to.include.key('test');
        done();
      });
    });

    it('should call multiple listeners async', function(done) {
      let emissions = 0;
      const emitter = new EventEmitter();
      function emissionCounter(next) {
        emissions++;
        next();
      }
      emitter._eventListeners = {test: [emissionCounter, emissionCounter]};
      emitter._oneTimeListeners = {test: [emissionCounter]};

      emitter.emit('test', function(err) {
        expect(err).to.not.exist;
        expect(emissions).to.equal(3);
        done();
      });
    });

    it('should call multiple listeners sync', function() {
      let emissions = 0;
      const emitter = new EventEmitter();
      function emissionCounter() {
        emissions++;
      }
      emitter._eventListeners = {test: [emissionCounter, emissionCounter]};
      emitter._oneTimeListeners = {test: [emissionCounter]};

      emitter.emit('test');
      expect(emissions).to.equal(3);
    });
  });

  describe('#listeners / #listenerCount', function() {
    it('should return all registered listeners', function() {
      const emitter = new EventEmitter();
      emitter._eventListeners = {
        test: [console.log, console.info],
        other: [console.warn]
      };
      emitter._oneTimeListeners = {test: [console.log]};

      expect(EventEmitter.listenerCount(emitter, 'test')).to.equal(3);
      expect(EventEmitter.listenerCount(emitter, 'other')).to.equal(1);
      expect(emitter.listeners('test')).to.have.length(3);
      expect(emitter.listeners('other')).to.have.length(1);
    });
  });

  describe('#on', function() {
    it('should add a listener', function() {
      const emitter = new EventEmitter();
      emitter.on('fake', console.log);
      emitter.onSync('fake', console.log);
      emitter.onAsync('fake', console.log);
      expect(emitter._eventListeners.fake).to.have.length(3);
    });

    it('should respect the maxListeners property', function(done) {
      const emitter = new EventEmitter();
      emitter.setMaxListeners(2);
      emitter.on('maxListenersPassed', function() {
        done();
      });
      emitter.on('fake', console.log);
      emitter.on('fake', console.log);
      emitter.on('fake', console.log);
    });
  });

  describe('#once', function() {
    it('should add a listener', function() {
      const emitter = new EventEmitter();
      emitter.once('fake', console.log);
      emitter.onceSync('fake', console.log);
      emitter.onceAsync('fake', console.log);
      expect(emitter._oneTimeListeners.fake).to.have.length(3);
    });

    it('should respect the maxListeners property', function(done) {
      const emitter = new EventEmitter();
      emitter.setMaxListeners(2);
      emitter.once('maxListenersPassed', function() {
        done();
      });
      emitter.once('fake', console.log);
      emitter.once('fake', console.log);
      emitter.once('fake', console.log);
    });
  });

  describe('#removeListener', function() {
    it('should remove a listener', function() {
      const emitter = new EventEmitter();
      function handleBlargh() {
      }
      emitter.on('blargh', handleBlargh);
      emitter.on('blargh', console.log);
      emitter.once('blargh', handleBlargh);
      emitter.on('weagoo', handleBlargh);

      emitter.removeListener('blargh', handleBlargh);
      expect(emitter._eventListeners.blargh).to.have.length(1);
      expect(emitter._oneTimeListeners.blargh).to.have.length(0);
      expect(emitter._eventListeners.weagoo).to.have.length(1);
    });

    it('should be okay if no listeners exist to remove', function() {
      const emitter = new EventEmitter();
      function handleBlargh() {
      }
      emitter.on('weagoo', console.log);

      emitter.removeListener('blargh', handleBlargh);
      emitter.removeListener('weeagoo', handleBlargh);
      expect(emitter.listeners('blargh')).to.have.length(0);
      expect(emitter.listeners('weagoo')).to.have.length(1);
    });

  });

  describe('#removeAllListeners', function() {
    it('should remove all listeners', function() {
      const emitter = new EventEmitter();
      function handleBlargh() {
      }
      emitter.on('blargh', handleBlargh);
      emitter.on('blargh', console.log);
      emitter.once('blargh', handleBlargh);
      emitter.on('weagoo', handleBlargh);

      emitter.removeAllListeners('blargh');
      expect(emitter.listeners('blargh')).to.have.length(0);
      expect(emitter._eventListeners.weagoo).to.have.length(1);
    });
  });
});
