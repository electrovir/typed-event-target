/** Extract all event type string types from a union of events. */
export type ExtractEventTypes<EventsUnion extends Readonly<Event>> = EventsUnion['type'];

/** Extract an event type from a union based on the event type string. */
export type ExtractEventByType<
    EventsUnion extends Readonly<Event>,
    EventType extends ExtractEventTypes<EventsUnion>,
> = EventsUnion extends {type: EventType} ? EventsUnion : never;
