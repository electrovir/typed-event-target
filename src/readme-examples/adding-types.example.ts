import {type TypedEventTarget} from '../index.js';
import {type MyEvent1, type MyEvent2} from './typed-events.example.js';

export const nowWithTypes = new EventTarget() as TypedEventTarget<MyEvent1 | MyEvent2>;
