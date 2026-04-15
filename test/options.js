import test from 'ava';
import sky, { HTTPError } from '../index.js';
import withServer from './helpers/server.js';

test('sky() with fetch option', withServer, async (t, server) => {
    const response = await sky.post(server.info.uri + '/status/418', {
        fetch() {
            return new Response('intercepted');
        }
    });

    t.true(response instanceof Response);
    t.is(response.status, 200);
    t.is(await response.text(), 'intercepted');
});

test('sky.post() with body option', withServer, async (t, server) => {
    const response = await sky.post(server.info.uri, { body : 'one two three' });

    t.true(response instanceof Response);
    t.is(response.status, 200);
    t.deepEqual(await response.json(), {
        body    : 'one two three',
        headers : {
            accept            : '*/*',
            'accept-encoding' : 'gzip, deflate',
            'accept-language' : '*',
            connection        : 'keep-alive',
            'content-length'  : '13',
            'content-type'    : 'text/plain;charset=UTF-8',
            host              : server.info.host.toLowerCase() + ':' + server.info.port,
            'sec-fetch-mode'  : 'cors',
            'user-agent'      : 'node'
        },
        method : 'post',
        url    : server.info.uri.toLowerCase() + '/'
    });
});

test('sky.post() with json option', withServer, async (t, server) => {
    const response = await sky.post(server.info.uri, { json : [1, 2, 'a', 'b'] });

    t.true(response instanceof Response);
    t.is(response.status, 200);
    t.deepEqual(await response.json(), {
        body    : [1, 2, 'a', 'b'],
        headers : {
            accept            : '*/*',
            'accept-encoding' : 'gzip, deflate',
            'accept-language' : '*',
            connection        : 'keep-alive',
            'content-length'  : '13',
            'content-type'    : 'application/json',
            host              : server.info.host.toLowerCase() + ':' + server.info.port,
            'sec-fetch-mode'  : 'cors',
            'user-agent'      : 'node'
        },
        method : 'post',
        url    : server.info.uri.toLowerCase() + '/'
    });
});

test('sky.post.json() with body option', withServer, async (t, server) => {
    const data = await sky.post.json(server.info.uri, { body : 'one two three' });

    t.deepEqual(data, {
        body    : 'one two three',
        headers : {
            accept            : 'application/json',
            'accept-encoding' : 'gzip, deflate',
            'accept-language' : '*',
            connection        : 'keep-alive',
            'content-length'  : '13',
            'content-type'    : 'text/plain;charset=UTF-8',
            host              : server.info.host.toLowerCase() + ':' + server.info.port,
            'sec-fetch-mode'  : 'cors',
            'user-agent'      : 'node'
        },
        method : 'post',
        url    : server.info.uri.toLowerCase() + '/'
    });
});

test('sky.post.json() with json option', withServer, async (t, server) => {
    const data = await sky.post.json(server.info.uri, { json : [1, 2, 'a', 'b'] });

    t.deepEqual(data, {
        body    : [1, 2, 'a', 'b'],
        headers : {
            accept            : 'application/json',
            'accept-encoding' : 'gzip, deflate',
            'accept-language' : '*',
            connection        : 'keep-alive',
            'content-length'  : '13',
            'content-type'    : 'application/json',
            host              : server.info.host.toLowerCase() + ':' + server.info.port,
            'sec-fetch-mode'  : 'cors',
            'user-agent'      : 'node'
        },
        method : 'post',
        url    : server.info.uri.toLowerCase() + '/'
    });
});

test('sky.json() with parseJson option', withServer, async (t, server) => {
    const data = await sky.json(server.info.uri, {
        parseJson(text) {
            return JSON.parse(text.toUpperCase());
        }
    });

    t.deepEqual(data, {
        HEADERS : {
            ACCEPT            : 'APPLICATION/JSON',
            'ACCEPT-ENCODING' : 'GZIP, DEFLATE',
            'ACCEPT-LANGUAGE' : '*',
            CONNECTION        : 'KEEP-ALIVE',
            HOST              : server.info.host.toUpperCase() + ':' + server.info.port,
            'SEC-FETCH-MODE'  : 'CORS',
            'USER-AGENT'      : 'NODE'
        },
        METHOD : 'GET',
        URL    : server.info.uri.toUpperCase() + '/'
    });
});

test('sky() with responseType: json', withServer, async (t, server) => {
    const data = await sky(server.info.uri, { responseType : 'json' });

    t.deepEqual(data, {
        headers : {
            accept            : 'application/json',
            'accept-encoding' : 'gzip, deflate',
            'accept-language' : '*',
            connection        : 'keep-alive',
            host              : server.info.host.toLowerCase() + ':' + server.info.port,
            'sec-fetch-mode'  : 'cors',
            'user-agent'      : 'node'
        },
        method : 'get',
        url    : server.info.uri.toLowerCase() + '/'
    });
});

test('sky() with responseType: text', withServer, async (t, server) => {
    const data = await sky(server.info.uri, { responseType : 'text' });

    t.is(data, JSON.stringify({
        headers : {
            host              : server.info.host.toLowerCase() + ':' + server.info.port,
            connection        : 'keep-alive',
            accept            : 'text/*',
            'accept-language' : '*',
            'sec-fetch-mode'  : 'cors',
            'user-agent'      : 'node',
            'accept-encoding' : 'gzip, deflate'
        },
        method : 'get',
        url    : server.info.uri.toLowerCase() + '/'
    }));
});

test('sky.post() with stringifyJson option', withServer, async (t, server) => {
    const response = await sky.post(server.info.uri, {
        json : [1, 2, 'a', 'b'],
        stringifyJson(body) {
            return JSON.stringify(body).toUpperCase();
        }
    });

    t.true(response instanceof Response);
    t.is(response.status, 200);
    t.deepEqual(await response.json(), {
        body    : [1, 2, 'A', 'B'],
        headers : {
            accept            : '*/*',
            'accept-encoding' : 'gzip, deflate',
            'accept-language' : '*',
            connection        : 'keep-alive',
            'content-length'  : '13',
            'content-type'    : 'application/json',
            host              : server.info.host.toLowerCase() + ':' + server.info.port,
            'sec-fetch-mode'  : 'cors',
            'user-agent'      : 'node'
        },
        method : 'post',
        url    : server.info.uri.toLowerCase() + '/'
    });
});

test('sky() with throwHttpErrors: false', withServer, async (t, server) => {
    const response = await sky(server.info.uri + '/status/418', { throwHttpErrors : false });

    t.true(response instanceof Response);
    t.is(response.status, 418);
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
        url    : server.info.uri.toLowerCase() + '/status/418'
    });
});

test('sky() with timeout option', withServer, async (t, server) => {
    t.timeout(35_000);

    const startTime = performance.now();
    const response = await sky(server.info.uri + '/sleep/32000', { timeout : 32_500 });
    const endTime = performance.now();

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
        url    : server.info.uri.toLowerCase() + '/sleep/32000'
    });
    t.true((endTime - startTime) >= 32_000, 'must wait as long as necessary within the timeout limit');
    t.true((endTime - startTime) < 33_000, 'must not take much longer than the timeout limit');
});

test('sky() with retry: 0', withServer, async (t, server) => {
    let requestCount = 0;
    server.ext('onRequest', (request, h) => {
        requestCount += 1;
        return h.continue;
    });

    const error = await t.throwsAsync(sky(server.info.uri + '/status/503', { retry : 0 }));

    t.is(requestCount, 1);
    t.true(error instanceof HTTPError);
    t.true(error.response instanceof Response);
    t.is(error.response.status, 503);
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
        url    : server.info.uri.toLowerCase() + '/status/503'
    });
});

test('sky() with retry: 5', withServer, async (t, server) => {
    let requestCount = 0;
    server.ext('onRequest', (request, h) => {
        requestCount += 1;
        return h.continue;
    });

    const error = await t.throwsAsync(sky(server.info.uri + '/status/503', { retry : 5 }));

    t.is(requestCount, 6);
    t.true(error instanceof HTTPError);
    t.true(error.response instanceof Response);
    t.is(error.response.status, 503);
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
        url    : server.info.uri.toLowerCase() + '/status/503'
    });
});
