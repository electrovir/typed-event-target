import {TypedEventTarget} from '..';
import {MyEvent1, MyEvent2} from './typed-events.example';

export class MyTypedEventTarget extends TypedEventTarget<MyEvent1 | MyEvent2> {}
