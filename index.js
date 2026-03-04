import retry from 'p-retry';
import {
    acceptTypes,
    requestMethods,
    responseTypes,
    retryMethods,
    retryStatusCodes
} from './lib/constants.js';
import { handleResponse, throwFetchError } from './lib/errors.js';
import * as hooks from './lib/hooks.js';

const sendRequest = async (input, options) => {
    return retry(async () => {
        const request = new Request(input, options);
        const fetchOptions = options.timeout ? { signal : AbortSignal.any([request.signal, AbortSignal.timeout(options.timeout)]) } : {};

        try {
            const response = await handleResponse(request, options, await options.fetch(request, fetchOptions));
            return response;
        }
        catch (error) {
            throwFetchError(request, options, error);
        }
    }, {
        ...options.retry,
        shouldRetry(error) {
            // In Node.js: fetch('foo:')
            const isUnknownScheme = error.name === 'NetworkError' && error.cause?.cause?.message === 'unknown scheme';
            const isFatal = error.name === 'AbortError' || isUnknownScheme;

            if (isFatal) {
                return false;
            }
            if (error.name === 'HTTPError') {
                return options.retry.methods.includes(error.request.method)
                    && options.retry.statusCodes.includes(error.response.status);
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
        timeout         : options.timeout ?? 30_000
    };

    if (typeof input === 'string') {
        if (options.prefix) {
            options.prefix += options.prefix.endsWith('/') ? '' : '/';

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

    const hookResult = await hooks.beforeRequest(input, options);

    if (!(hookResult instanceof Response)) {
        input = hookResult;
    }

    const fetched = hookResult instanceof Response ? hookResult : await sendRequest(input, options);
    const response = await hooks.afterResponse(input, options, fetched);

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
