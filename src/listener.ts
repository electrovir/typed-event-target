export interface TypedEventListener<EventGeneric extends Event> {
    (event: EventGeneric): void;
}
export interface TypedEventListenerObject<EventGeneric extends Event> {
    handleEvent(event: EventGeneric): void;
}

export type TypedEventListenerOrEventListenerObject<EventGeneric extends Event> =
    | TypedEventListener<EventGeneric>
    | TypedEventListenerObject<EventGeneric>;
