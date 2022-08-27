import {TypedEventTarget} from '..';
import {MyEvent1, MyEvent2} from './typed-events.example';

export const nowWithTypes = new EventTarget() as TypedEventTarget<MyEvent1 | MyEvent2>;
