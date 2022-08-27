import {MyTypedEventTarget} from './my-event-target.example';
import {MyEvent1} from './typed-events.example';

const myInstance = new MyTypedEventTarget();

myInstance.addEventListener('my-event-type-1', (event) => {
    console.log(event);
});
myInstance.dispatchEvent(new MyEvent1());
myInstance.removeEventListener('my-event-type-2', () => {});
