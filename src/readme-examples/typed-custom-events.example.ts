import {defineTypedCustomEvent} from '../index.js';

export class MyEvent1 extends defineTypedCustomEvent<string>()('my-event-type-1') {}
export class MyEvent2 extends defineTypedCustomEvent<number>()('my-event-type-2') {}

console.info(new MyEvent1({detail: 'five'}));
console.info(new MyEvent2({detail: 5}));
