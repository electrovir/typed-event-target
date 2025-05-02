import {TypedEventTarget} from '../index.js';
import {type MyEvent1, type MyEvent2} from './typed-events.example.js';

export class MyTypedEventTarget extends TypedEventTarget<MyEvent1 | MyEvent2> {}
