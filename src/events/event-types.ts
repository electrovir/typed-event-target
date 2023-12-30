export type ExtractEventTypes<PossibleEventsGeneric extends Readonly<Event>> =
    PossibleEventsGeneric['type'];

export type ExtractEventByType<
    PossibleEventsGeneric extends Readonly<Event>,
    EventType extends ExtractEventTypes<PossibleEventsGeneric>,
> = PossibleEventsGeneric extends {type: EventType} ? PossibleEventsGeneric : never;
