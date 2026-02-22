declare const emitter: any;
export function emit(topic: string, payload?: any): void;
export function on(topic: string, listener: (...args: any[]) => void): void;
export default emitter;

