import {assert, waitUntil} from '@augment-vir/assert';
import {wait} from '@augment-vir/common';
import {describe, it, testWeb} from '@augment-vir/test';
import {html} from 'element-vir';
import {listenTo, listenToGlobal} from './listen-to.js';

describe(listenTo.name, () => {
    it('works', async () => {
        const instance = await testWeb.render(html`
            <div>Hello There</div>
        `);

        assert.instanceOf(instance, HTMLDivElement);

        const events: Event[] = [];
        const remover = listenTo(instance, 'click', (event) => {
            events.push(event);
        });

        await testWeb.click(instance);
        await waitUntil.isTruthy(() => events.length === 1);

        remover();
        await testWeb.click(instance);
        await wait({
            seconds: 1,
        });
        assert.isLengthExactly(events, 1);
    });
});

describe(listenToGlobal.name, () => {
    it('works', async () => {
        const instance = await testWeb.render(html`
            <div>Hello There</div>
        `);

        assert.instanceOf(instance, HTMLDivElement);

        const events: Event[] = [];
        const remover = listenToGlobal('click', (event) => {
            events.push(event);
        });

        await testWeb.click(instance);
        await waitUntil.isTruthy(() => events.length === 1);

        remover();
        await testWeb.click(instance);
        await wait({
            seconds: 1,
        });
        assert.isLengthExactly(events, 1);
    });
});
