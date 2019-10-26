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
      const hadListener = await emitter.emit('doesNotExist');
      expect(hadListener).to.be.false;
    });

    it('should call once listeners and remove them', async () => {
      const emitter = new EventEmitter();
      let emitted = false;
      emitter._oneTimeListeners = {test: [function() {
        emitted = true;
      }]};
      const hadListener = await emitter.emit('test');
      expect(hadListener).to.be.true;
      expect(emitted).to.be.true;
      expect(emitter._oneTimeListeners).to.not.include.key('test');
    });

    it('should call regular listeners without removing them', async () => {
      const emitter = new EventEmitter();
      let emitted = false;
      emitter._eventListeners = {test: [function() {
        emitted = true;
      }]};
      const hadListener = await emitter.emit('test');
      expect(hadListener).to.be.true;
      expect(emitted).to.be.true;
      expect(emitter._eventListeners).to.include.key('test');
    });

    it('should call multiple listeners async', async () => {
      let emissions = 0;
      const emitter = new EventEmitter();
      function emissionCounter(next) {
        emissions++;
        next();
      }
      emitter._eventListeners = {test: [emissionCounter, emissionCounter]};
      emitter._oneTimeListeners = {test: [emissionCounter]};

      const hadListener = await emitter.emit('test');
      expect(hadListener).to.be.true;
      expect(emissions).to.equal(3);
    });

    it('should call multiple listeners sync', async () => {
      let emissions = 0;
      const emitter = new EventEmitter();
      function emissionCounter() {
        emissions++;
      }
      emitter._eventListeners = {test: [emissionCounter, emissionCounter]};
      emitter._oneTimeListeners = {test: [emissionCounter]};

      const hadListener = await emitter.emit('test');
      expect(hadListener).to.be.true;
      expect(emissions).to.equal(3);
    });
  });

  describe('#listeners / #listenerCount', () => {
    it('should return all registered listeners', async () => {
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

  describe('#on', () => {
    it('should add a listener', async () => {
      const emitter = new EventEmitter();
      emitter.on('fake', console.log);
      emitter.onSync('fake', console.log);
      emitter.onAsync('fake', console.log);
      expect(emitter._eventListeners.fake).to.have.length(3);
    });

    it('should respect the maxListeners property', () => {
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
  });

  describe('#once', () => {
    it('should add a listener', () => {
      const emitter = new EventEmitter();
      emitter.once('fake', console.log);
      emitter.onceSync('fake', console.log);
      emitter.onceAsync('fake', console.log);
      expect(emitter._oneTimeListeners.fake).to.have.length(3);
    });

    it('should respect the maxListeners property', () => {
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
    it('should remove a listener', () => {
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
  });

  describe('#removeAllListeners', () => {
    it('should remove all listeners', () => {
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
