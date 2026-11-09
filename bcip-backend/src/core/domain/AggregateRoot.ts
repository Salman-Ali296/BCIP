import { ValueObject } from './ValueObject';

export abstract class AggregateRoot<TProps> {
    private readonly domainEvents: unknown[] = [];

    public constructor(
        public readonly id: ValueObject<string>,
        public readonly props: TProps,
    ) { }

    protected addEvent(event: unknown): void {
        this.domainEvents.push(event);
    }

    public getUncommittedEvents(): readonly unknown[] {
        return this.domainEvents;
    }
}