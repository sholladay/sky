/* eslint-disable max-lines */
import test from 'ava';
import sky, { get, json, post } from '../index.js';
import withServer from './helpers/server.js';

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

test('sky.create()', withServer, async (t, server) => {
    const usersApi = sky.create({
        baseUrl : server.info.uri + '/api/',
        prefix  : 'users'
    });
    const v2Api = usersApi.create((options) => {
        return { baseUrl : options.baseUrl + 'v2/' };
    });
    const bare = v2Api.extend({ baseUrl : server.info.uri });

    const user = await usersApi.json('123');
    const v2Data = await v2Api.json('123');
    const bareData = await bare.json('123');

    t.is(user.url, server.info.uri.toLowerCase() + '/api/users/123');
    t.is(v2Data.url, server.info.uri.toLowerCase() + '/api/v2/123');
    t.is(bareData.url, server.info.uri.toLowerCase() + '/123');
});

test('sky.extend()', withServer, async (t, server) => {
    const usersApi = sky.extend({
        baseUrl : server.info.uri + '/api/',
        prefix  : 'users'
    });
    const v2UsersApi = usersApi.extend((options) => {
        return { baseUrl : options.baseUrl + 'v2/' };
    });
    const v2PicturesApi = v2UsersApi.extend({ prefix : 'pictures' });

    const user = await usersApi.json('123');
    const v2User = await v2UsersApi.json('123');
    const v2Picture = await v2PicturesApi.json('123');

    t.is(user.url, server.info.uri.toLowerCase() + '/api/users/123');
    t.is(v2User.url, server.info.uri.toLowerCase() + '/api/v2/users/123');
    t.is(v2Picture.url, server.info.uri.toLowerCase() + '/api/v2/pictures/123');
});

test('sky() waits up to 30 seconds for a response', withServer, async (t, server) => {
    t.timeout(32_000);

    const startTime = performance.now();
    const response = await sky(server.info.uri + '/sleep/29500');
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
        url    : new URL(server.info.uri) + 'sleep/29500'
    });
    t.true((endTime - startTime) >= 29_500, 'must wait as long as it takes within the timeout limit');
    t.true((endTime - startTime) < 30_500, 'must not take much longer than the timeout limit');
});

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
