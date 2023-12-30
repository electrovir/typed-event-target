/** Callbacks that get fired when an event is dispatched. */
export type TypedEventListener<EventGeneric extends Event> = (event: EventGeneric) => void;

/** An object that includes a `handleEvent` method for listening to event dispatches. */
export type TypedEventListenerObject<EventGeneric extends Event> = {
    handleEvent: TypedEventListener<EventGeneric>;
};

/** Either an object wrapping a listener callback function or a listener callback function itself. */
export type TypedEventListenerOrEventListenerObject<EventGeneric extends Event> =
    | TypedEventListener<EventGeneric>
    | TypedEventListenerObject<EventGeneric>;
