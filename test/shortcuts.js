import test from 'ava';
import sky, { get, post, json } from '../index.js';
import withServer from './helpers/server.js';

test('get()', withServer, async (t, server) => {
    const response = await get(server.info.uri);

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
        url    : server.info.uri.toLowerCase() + '/'
    });
});

test('get.json()', withServer, async (t, server) => {
    const data = await get.json(server.info.uri);

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

test('json()', withServer, async (t, server) => {
    const data = await json(server.info.uri);

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

test('json.get()', withServer, async (t, server) => {
    const data = await json.get(server.info.uri);

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

test('json.post()', withServer, async (t, server) => {
    const data = await json.post(server.info.uri);

    t.deepEqual(data, {
        body    : null,
        headers : {
            accept            : 'application/json',
            'accept-encoding' : 'gzip, deflate',
            'accept-language' : '*',
            connection        : 'keep-alive',
            'content-length'  : '0',
            host              : server.info.host.toLowerCase() + ':' + server.info.port,
            'sec-fetch-mode'  : 'cors',
            'user-agent'      : 'node'
        },
        method : 'post',
        url    : server.info.uri.toLowerCase() + '/'
    });
});

test('post()', withServer, async (t, server) => {
    const response = await post(server.info.uri);

    t.true(response instanceof Response);
    t.is(response.status, 200);
    t.deepEqual(await response.json(), {
        body    : null,
        headers : {
            accept            : '*/*',
            'accept-encoding' : 'gzip, deflate',
            'accept-language' : '*',
            connection        : 'keep-alive',
            'content-length'  : '0',
            host              : server.info.host.toLowerCase() + ':' + server.info.port,
            'sec-fetch-mode'  : 'cors',
            'user-agent'      : 'node'
        },
        method : 'post',
        url    : server.info.uri.toLowerCase() + '/'
    });
});

test('post.json()', withServer, async (t, server) => {
    const data = await post.json(server.info.uri);

    t.deepEqual(data, {
        body    : null,
        headers : {
            accept            : 'application/json',
            'accept-encoding' : 'gzip, deflate',
            'accept-language' : '*',
            connection        : 'keep-alive',
            'content-length'  : '0',
            host              : server.info.host.toLowerCase() + ':' + server.info.port,
            'sec-fetch-mode'  : 'cors',
            'user-agent'      : 'node'
        },
        method : 'post',
        url    : server.info.uri.toLowerCase() + '/'
    });
});

test('sky.get()', withServer, async (t, server) => {
    const response = await sky.get(server.info.uri);

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
        url    : server.info.uri.toLowerCase() + '/'
    });
});

test('sky.get.json()', withServer, async (t, server) => {
    const data = await sky.get.json(server.info.uri);

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

test('sky.json()', withServer, async (t, server) => {
    const data = await sky.json(server.info.uri);

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

test('sky.json.get()', withServer, async (t, server) => {
    const data = await sky.json.get(server.info.uri);

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

test('sky.json.post()', withServer, async (t, server) => {
    const data = await sky.json.post(server.info.uri);

    t.deepEqual(data, {
        body    : null,
        headers : {
            accept            : 'application/json',
            'accept-encoding' : 'gzip, deflate',
            'accept-language' : '*',
            connection        : 'keep-alive',
            'content-length'  : '0',
            host              : server.info.host.toLowerCase() + ':' + server.info.port,
            'sec-fetch-mode'  : 'cors',
            'user-agent'      : 'node'
        },
        method : 'post',
        url    : server.info.uri.toLowerCase() + '/'
    });
});

test('sky.post()', withServer, async (t, server) => {
    const response = await sky.post(server.info.uri);

    t.true(response instanceof Response);
    t.is(response.status, 200);
    t.deepEqual(await response.json(), {
        body    : null,
        headers : {
            accept            : '*/*',
            'accept-encoding' : 'gzip, deflate',
            'accept-language' : '*',
            connection        : 'keep-alive',
            'content-length'  : '0',
            host              : server.info.host.toLowerCase() + ':' + server.info.port,
            'sec-fetch-mode'  : 'cors',
            'user-agent'      : 'node'
        },
        method : 'post',
        url    : server.info.uri.toLowerCase() + '/'
    });
});

test('sky.post.json()', withServer, async (t, server) => {
    const data = await sky.post.json(server.info.uri);

    t.deepEqual(data, {
        body    : null,
        headers : {
            accept            : 'application/json',
            'accept-encoding' : 'gzip, deflate',
            'accept-language' : '*',
            connection        : 'keep-alive',
            'content-length'  : '0',
            host              : server.info.host.toLowerCase() + ':' + server.info.port,
            'sec-fetch-mode'  : 'cors',
            'user-agent'      : 'node'
        },
        method : 'post',
        url    : server.info.uri.toLowerCase() + '/'
    });
});
