import hapi from '@hapi/hapi';
import joi from 'joi';

const createServer = async () => {
    const server = hapi.server();

    server.route({
        method : '*',
        path   : '/status/{code}',
        config : {
            validate : {
                params : joi.object().required().keys({
                    code : joi.number().integer().required()
                })
            }
        },
        handler(request, h) {
            return h.response({
                body    : request.payload,
                headers : request.headers,
                method  : request.method,
                url     : request.url
            }).code(request.params.code);
        }
    });

    server.route({
        method : '*',
        path   : '/sleep/{duration}',
        config : {
            validate : {
                params : joi.object().required().keys({
                    duration : joi.number().integer().required().unit('milliseconds')
                })
            }
        },
        async handler(request) {
            await new Promise((resolve) => {
                setTimeout(resolve, request.params.duration);
            });

            return {
                body    : request.payload,
                headers : request.headers,
                method  : request.method,
                url     : request.url
            };
        }
    });

    server.route({
        method : '*',
        path   : '/{path*}',
        handler(request) {
            return {
                body    : request.payload,
                headers : request.headers,
                method  : request.method,
                url     : request.url
            };
        }
    });

    await server.start();

    return server;
};

const withServer = async (t, run) => {
    const server = await createServer();
    try {
        await run(t, server);
    }
    finally {
        await server.stop();
    }
};

export default withServer;
