import {ArrayElement} from 'augment-vir';
import {Constructed} from '../augments/constructor';
import {defineTypedEvent} from '../typed-event';

export enum SubEventType {
    Herp = 'herp',
    Derp = 'derp',
}

export class SubEventHerp extends defineTypedEvent(SubEventType.Herp) {}
export class SubEventDerp extends defineTypedEvent(SubEventType.Derp) {}

export const possibleEvents = [
    SubEventHerp,
    SubEventDerp,
];

export type PossibleEvent = Constructed<ArrayElement<typeof possibleEvents>>;
