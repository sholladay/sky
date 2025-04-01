import test from 'ava';
import sky from '../index.js';
import withServer from './helpers/server.js';

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
