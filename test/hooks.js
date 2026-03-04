import test from 'ava';
import sky from '../index.js';
import withServer from './helpers/server.js';

test('sky() skips network request if beforeRequest hook returns a Response', withServer, async (t, server) => {
    let requestCount = 0;
    server.ext('onRequest', (request, h) => {
        requestCount += 1;
        return h.continue;
    });

    const response = await sky(server.info.uri, {
        hooks : {
            beforeRequest : [() => {
                return Response.json({ hook : true });
            }]
        }
    });

    t.is(requestCount, 0);
    t.true(response instanceof Response);
    t.is(response.status, 200);
    t.deepEqual(await response.json(), { hook : true });
});

test('sky.json() parses Response from beforeRequest hook', withServer, async (t, server) => {
    const json = await sky.json(server.info.uri, {
        hooks : {
            beforeRequest : [() => {
                return Response.json({ hook : true });
            }]
        }
    });

    t.deepEqual(json, { hook : true });
});
