import retry from 'p-retry';
import {
    acceptTypes,
    requestMethods,
    responseTypes,
    retryMethods,
    retryStatusCodes
} from './lib/constants.js';
import { handleFetchError, handleFetchSuccess } from './lib/errors.js';

const sendRequest = async (input, options) => {
    let hookResponse;

    for (const hook of options.hooks.beforeRequest) {
        // eslint-disable-next-line no-await-in-loop
        const result = await hook({
            input,
            options
        });

        if (result instanceof Response) {
            hookResponse = result;
        }
        if (result) {
            input = result;
        }
    }

    if (hookResponse) {
        return hookResponse;
    }

    return retry(() => {
        const request = new Request(input, options);

        return options.fetch(
            request,
            options.timeout === false ?
                {} :
                { signal : AbortSignal.any([request.signal, AbortSignal.timeout(options.timeout)]) }
            // eslint-disable-next-line promise/prefer-await-to-then
        ).then(
            handleFetchSuccess(request, options),
            handleFetchError(request, options)
        );
    }, {
        ...options.retry,
        shouldRetry(error) {
            const isFatal = error.name === 'AbortError' ||
                (
                    // In Node.js: fetch('foo:')
                    error.name === 'NetworkError' &&
                    error.cause?.cause?.message === 'unknown scheme'
                );

            if (isFatal) {
                return false;
            }
            if (error.name === 'HTTPError') {
                return options.retry.methods.includes(error.request.method) &&
                    options.retry.statusCodes.includes(error.response.status);
            }

            return options.retry.shouldRetry?.(error) ?? true;
        }
    });
};

// eslint-disable-next-line complexity
const main = async (input, options) => {
    options = {
        ...options,
        fetch   : options.fetch || fetch.bind(globalThis),
        headers : new Headers(options.headers || input.headers),
        hooks   : {
            afterResponse : [],
            beforeRequest : [],
            ...options.hooks
        },
        prefix : String(options.prefix || ''),
        retry  : {
            maxRetryTime : 30_000,
            methods      : retryMethods,
            retries      : typeof options.retry === 'number' ? options.retry : 4,
            statusCodes  : retryStatusCodes,
            ...options.retry
        },
        stringifyJson   : options.stringifyJson || JSON.stringify,
        throwHttpErrors : options.throwHttpErrors !== false,
        timeout         : options.timeout ?? 30_000,
    };

    if (typeof input === 'string') {
        if (options.prefix) {
            if (!options.prefix.endsWith('/')) {
                options.prefix += '/';
            }
            if (input.startsWith('/')) {
                input = input.slice(1);
            }

            input = options.prefix + input;
        }

        if (options.baseUrl) {
            input = new URL(input, (new Request(options.baseUrl)).url);
        }
    }

    if (options.json !== undefined) {
        options.body = options.stringifyJson(options.json);
        options.headers.set('Content-Type', options.headers.get('Content-Type') ?? acceptTypes.get('json'));
    }
    if (acceptTypes.has(options.responseType)) {
        options.headers.set('Accept', options.headers.get('Accept') ?? acceptTypes.get(options.responseType));
    }

    let response = await sendRequest(input, options);

    for (const hook of options.hooks.afterResponse) {
        // eslint-disable-next-line no-await-in-loop
        const result = await hook({
            input,
            options,
            response
        });

        if (result instanceof Response) {
            response = result;
        }
    }

    if (options.responseType === 'json' && options.parseJson) {
        return options.parseJson(await response.text());
    }
    if (options.responseType) {
        return response[options.responseType]();
    }

    return response;
};

const createInstance = (defaults) => {
    const instance = (input, options) => {
        return main(input, {
            ...defaults,
            ...options
        });
    };

    instance.create = (newDefaults) => {
        return createInstance(newDefaults);
    };
    instance.extend = (newDefaults) => {
        if (typeof newDefaults === 'function') {
            newDefaults = newDefaults(defaults || {});
        }
        return createInstance({
            ...defaults,
            ...newDefaults
        });
    };

    for (const method of requestMethods) {
        instance[method.toLowerCase()] = (input, options) => {
            return instance(input, {
                ...defaults,
                ...options,
                method
            });
        };

        for (const responseType of responseTypes) {
            instance[method.toLowerCase()][responseType] = (input, options) => {
                return instance(input, {
                    ...defaults,
                    ...options,
                    method,
                    responseType
                });
            };
        }
    }

    for (const responseType of responseTypes) {
        instance[responseType] = (input, options) => {
            return instance(input, {
                ...defaults,
                ...options,
                responseType
            });
        };

        for (const method of requestMethods) {
            instance[responseType][method.toLowerCase()] = (input, options) => {
                return instance(input, {
                    ...defaults,
                    ...options,
                    method,
                    responseType
                });
            };
        }
    }

    return instance;
};

const sky = createInstance();

export const { delete : del } = sky;
export const { get } = sky;
export const { head } = sky;
export const { patch } = sky;
export const { post } = sky;
export const { put } = sky;

export const { arrayBuffer } = sky;
export const { blob } = sky;
export const { bytes } = sky;
export const { formData } = sky;
export const { json } = sky;
export const { text } = sky;

export {
    AbortError,
    HTTPError,
    NetworkError,
    TimeoutError
} from './lib/errors.js';

export default sky;
