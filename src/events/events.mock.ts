import {ArrayElement} from '@augment-vir/common';
import {defineTypedEvent} from './typed-event';

export enum SubEventTypeEnum {
    Herp = 'herp',
    Derp = 'derp',
}

export class SubEventHerp extends defineTypedEvent(SubEventTypeEnum.Herp) {}
export class SubEventDerp extends defineTypedEvent(SubEventTypeEnum.Derp) {}

export const possibleEvents = [
    SubEventHerp,
    SubEventDerp,
];

export type PossibleEvent = InstanceType<ArrayElement<typeof possibleEvents>>;
