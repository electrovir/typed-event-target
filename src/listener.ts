/**
 * Callbacks that get fired when an event is dispatched.
 *
 * @category Internal
 */
export type TypedEventListener<EventGeneric extends Event> = (event: EventGeneric) => void;

/**
 * Callbacks that get fired when an event is dispatched.
 *
 * @category Internal
 */
export type TypedEventListenerWithRemoval<EventGeneric extends Event> = (
    event: EventGeneric,
    removeSelf: RemoveListenerCallback,
) => void;

/**
 * An object that includes a `handleEvent` method for listening to event dispatches.
 *
 * @category Internal
 */
export type TypedEventListenerObject<EventGeneric extends Event> = {
    handleEvent: TypedEventListener<EventGeneric>;
};

/**
 * Either an object wrapping a listener callback function or a listener callback function itself.
 *
 * @category Internal
 */
export type TypedEventListenerOrEventListenerObject<EventGeneric extends Event> =
    | TypedEventListener<EventGeneric>
    | TypedEventListenerObject<EventGeneric>;

/**
 * Remove an event listener. Instances of this are only obtained by using
 * `TypedListenTarget.listen`.
 *
 * @category Internal
 * @returns True if it was removed.
 */
export type RemoveListenerCallback = () => boolean;
