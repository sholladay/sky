import test from 'ava';
import {
    AbortError,
    HTTPError,
    NetworkError,
    TimeoutError
} from '../lib/errors.js';
import sky from '../index.js';
import withPage from './helpers/browser.js';
import withServer from './helpers/server.js';

const range = (start, length) => {
    return Array.from({ length }, (x, i) => {
        return start + i;
    });
};

test('sky()', withServer, async (t, server) => {
    const response = await sky(server.info.uri);

    t.true(response instanceof Response);
    t.is(response.status, 200);
    t.deepEqual(await response.json(), {
        headers : {
            accept            : '*/*',
            'accept-encoding' : 'gzip, deflate',
            'accept-language' : '*',
            connection        : 'keep-alive',
            host              : server.info.host.toLowerCase() + ':' + server.info.port,
            'sec-fetch-mode'  : 'cors',
            'user-agent'      : 'node'
        },
        method : 'get',
        url    : new URL(server.info.uri).href
    });
});

test('sky() throws HTTPError for 4xx status codes', withServer, async (t, server) => {
    t.plan(594);
    // Skip HTTP status 407 as it is not supported by fetch() in Node.js
    // See: https://github.com/nodejs/undici/issues/2896
    const statuses = range(400, 100).toSpliced(7, 1);
    await Promise.all(statuses.map(async (status) => {
        const error = await t.throwsAsync(sky(server.info.uri + '/status/' + status));

        t.true(error instanceof HTTPError);
        t.is(error.message, `Request failed due to status code ${status} ${error.response.statusText}: GET ${error.response.url}`);
        t.true(error.response instanceof Response);
        t.is(error.response.status, status);
        t.deepEqual(await error.response.json(), {
            headers : {
                accept            : '*/*',
                'accept-encoding' : 'gzip, deflate',
                'accept-language' : '*',
                connection        : 'keep-alive',
                host              : server.info.host.toLowerCase() + ':' + server.info.port,
                'sec-fetch-mode'  : 'cors',
                'user-agent'      : 'node'
            },
            method : 'get',
            url    : new URL(server.info.uri) + 'status/' + status
        });
    }));
});

test('sky() throws HTTPError for 5xx status codes', withServer, async (t, server) => {
    t.plan(600);
    const statuses = range(500, 100);
    await Promise.all(statuses.map(async (status) => {
        const error = await t.throwsAsync(sky(server.info.uri + '/status/' + status));

        t.true(error instanceof HTTPError);
        t.is(error.message, `Request failed due to status code ${status} ${error.response.statusText}: GET ${error.response.url}`);
        t.true(error.response instanceof Response);
        t.is(error.response.status, status);
        t.deepEqual(await error.response.json(), {
            headers : {
                accept            : '*/*',
                'accept-encoding' : 'gzip, deflate',
                'accept-language' : '*',
                connection        : 'keep-alive',
                host              : server.info.host.toLowerCase() + ':' + server.info.port,
                'sec-fetch-mode'  : 'cors',
                'user-agent'      : 'node'
            },
            method : 'get',
            url    : new URL(server.info.uri) + 'status/' + status
        });
    }));
});

test('sky() waits up to 30 seconds for a response', withServer, async (t, server) => {
    t.timeout(32_000);

    const startTime = Date.now();
    const response = await sky(server.info.uri + '/sleep/29500');
    const endTime = Date.now();

    t.true(response instanceof Response);
    t.is(response.status, 200);
    t.deepEqual(await response.json(), {
        headers : {
            accept            : '*/*',
            'accept-encoding' : 'gzip, deflate',
            'accept-language' : '*',
            connection        : 'keep-alive',
            host              : server.info.host.toLowerCase() + ':' + server.info.port,
            'sec-fetch-mode'  : 'cors',
            'user-agent'      : 'node'
        },
        method : 'get',
        url    : new URL(server.info.uri) + 'sleep/29500'
    });
    t.true((endTime - startTime) >= 29_500, 'must wait as long as it takes within the timeout limit');
    t.true((endTime - startTime) < 30_500, 'must not take much longer than the timeout limit');
});

test('sky() throws TimeoutError after 30 seconds with no response', withServer, async (t, server) => {
    t.timeout(32_000);

    const startTime = Date.now();
    const error = await t.throwsAsync(sky(server.info.uri + '/sleep/30500'));
    const endTime = Date.now();

    t.true(error instanceof TimeoutError);
    t.is(error.message, `Request aborted due to timeout: GET ${new URL(server.info.uri)}sleep/30500`);
    t.true(error.request instanceof Request);
    t.true((endTime - startTime) >= 30_000, 'must wait the full timeout limit for each try, plus the gap between tries');
    t.true((endTime - startTime) < 30_500, 'must not take much longer than the timeout limit of the last retry');
});

test('sky() throws NetworkError quickly if server is unreachable', async (t) => {
    const startTime = Date.now();
    const error = await t.throwsAsync(sky('invalid:'));
    const endTime = Date.now();

    t.true(error instanceof NetworkError);
    t.is(error.message, 'Request failed due to URL or network connection: GET invalid:');
    t.true(error.request instanceof Request);
    t.true((endTime - startTime) < 100, 'must detect invalid destination immediately');
});

test('sky() throws NetworkError for cross-origin failure and mentions CORS', withPage, async (t, server, page) => {
    await page.goto(server.info.uri);
    await page.addScriptTag({ path : 'build/global.js' });
    const error = await t.throwsAsync(page.evaluate(async () => {
        await sky('invalid:');
    }));

    // Remove noise caused by Playwright serializing the error
    const errorMessage = error.message.replace('page.evaluate: ', '').replace(/\n.*/sv, '');
    t.is(errorMessage, 'NetworkError: Request failed due to URL or network connection or CORS denied: GET invalid:');
});

test('sky() throws AbortError if signal is aborted while in progress', withServer, async (t, server) => {
    const controller = new AbortController();
    setTimeout(() => {
        controller.abort();
    }, 500);
    const startTime = Date.now();
    const error = await t.throwsAsync(sky(server.info.uri + '/sleep/1500', { signal : controller.signal }));
    const endTime = Date.now();

    t.true(error instanceof AbortError);
    t.is(error.message, `Request aborted: GET ${new URL(server.info.uri)}sleep/1500`);
    t.true(error.request instanceof Request);
    t.true((endTime - startTime) >= 500, 'must wait the full time until user aborts');
    t.true((endTime - startTime) < 1000, 'must not take much longer after abort');
});

test('sky() throws AbortError if signal is aborted already', withServer, async (t, server) => {
    const startTime = Date.now();
    const error = await t.throwsAsync(sky(server.info.uri + '/sleep/500', { signal : AbortSignal.abort() }));
    const endTime = Date.now();

    t.true(error instanceof AbortError);
    t.is(error.message, `Request aborted: GET ${new URL(server.info.uri)}sleep/500`);
    t.true(error.request instanceof Request);
    t.true((endTime - startTime) < 100, 'must detect aborted signal immediately');
});

test('sky() throws AbortError if signal is aborted with a custom message', withServer, async (t, server) => {
    const startTime = Date.now();
    const error = await t.throwsAsync(sky(server.info.uri + '/sleep/500', { signal : AbortSignal.abort('lunch break') }));
    const endTime = Date.now();

    t.true(error instanceof AbortError);
    t.is(error.message, `Request aborted due to lunch break: GET ${new URL(server.info.uri)}sleep/500`);
    t.true(error.request instanceof Request);
    t.true((endTime - startTime) < 100, 'must detect aborted signal immediately');
});

test('sky() throws AbortError if signal is aborted with a custom error', withServer, async (t, server) => {
    class FooError extends Error {}
    const customError = new FooError();
    const startTime = Date.now();
    const error = await t.throwsAsync(sky(server.info.uri + '/sleep/500', { signal : AbortSignal.abort(customError) }));
    const endTime = Date.now();

    t.true(error instanceof AbortError);
    t.is(error.message, `Request aborted: GET ${new URL(server.info.uri)}sleep/500`);
    t.is(error.cause, customError);
    t.true(error.request instanceof Request);
    t.true((endTime - startTime) < 100, 'must detect aborted signal immediately');
});
