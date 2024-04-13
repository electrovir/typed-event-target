import {clickElement} from '@augment-vir/browser-testing';
import {wait, waitUntilTruthy} from '@augment-vir/common';
import {assert, fixture, html} from '@open-wc/testing';
import {assertInstanceOf} from 'run-time-assertions';
import {listenTo} from './listen-to';

describe(listenTo.name, () => {
    it('works', async () => {
        const instance = await fixture(html`
            <div>Hello There</div>
        `);

        assertInstanceOf(instance, HTMLDivElement);

        const events: Event[] = [];
        const remover = listenTo(instance, 'click', (event) => {
            events.push(event);
        });

        await clickElement(instance);
        await waitUntilTruthy(() => events.length === 1);

        remover();
        await clickElement(instance);
        await wait(1000);
        assert.lengthOf(events, 1);
    });
});
