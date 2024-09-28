import {MyTypedEventTarget} from './my-event-target.example.js';
import {MyEvent1} from './typed-events.example.js';

const myInstance = new MyTypedEventTarget();

function myListener(event: MyEvent1) {
    console.info(event);
}

myInstance.addEventListener(MyEvent1.type, myListener);
myInstance.dispatchEvent(new MyEvent1());
myInstance.removeEventListener(MyEvent1.type, myListener);
