import { EventEmitter } from 'events';

const emitter = new EventEmitter();

export function emit(topic, payload) {
  emitter.emit(topic, payload);
}

export function on(topic, listener) {
  emitter.on(topic, listener);
}

export default emitter;
