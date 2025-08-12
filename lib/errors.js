import isNetworkError from 'is-network-error';

const textDecoder = new TextDecoder();

const isError = (error) => {
    // Error.isError() is new and doesn't have wide support yet
    // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/isError
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native
    return Error.isError?.(error) || error instanceof Error;
};

const isCORSRequest = (request) => {
    if (request.mode !== 'cors') {
        return false;
    }

    let currentUrl;
    try {
        currentUrl = new URL(new Request('').url);
    }
    catch {
        // Server-side runtimes don't implement a base URL or CORS
        return false;
    }

    const requestUrl = new URL(request.url);
    return requestUrl.origin !== currentUrl.origin;
};

export class FetchError extends Error {
    constructor(request, options, message, errorOptions) {
        super(`${message}: ${request.method} ${request.url}`, errorOptions);

        this.name = 'FetchError';
        this.request = request;
        this.options = options;
    }
}

export class AbortError extends FetchError {
    constructor(error, request, options) {
        const reason = (error && typeof error === 'string') ? ` due to ${error}` : '';
        const cause = isError(error) ? error : undefined;

        super(request, options, `Request aborted${reason}`, cause && { cause });

        this.name = 'AbortError';
        this.code = 20;
    }
}
/**
 * An error where a response was received but its status is not within the 200-299 range.
 * Note that if you `catch` this error, and the `error.response` has a body, you must either
 * consume or cancel the body stream, otherwise a memory leak will occur. The body stream
 * will be consumed automatically if the `responseType` option is enabled.
 */
export class HTTPError extends FetchError {
    constructor(request, response, options) {
        const code = (response.status || response.status === 0) ? response.status : '';
        const title = response.statusText || '';
        const status = `${code} ${title}`.trim();
        const reason = status ? `status code ${status}` : 'an unknown error';

        super(request, options, `Request failed due to ${reason}`);

        this.name = 'HTTPError';
        this.response = response;
    }
}

export class NetworkError extends FetchError {
    constructor(error, request, options) {
        const cause = isError(error) ? error : undefined;
        const isCORS = isCORSRequest(request);
        const reason = [
            'URL or network connection',
            // In Node, a fetch() error may have a more specifc .cause attached to it.
            cause?.cause?.code === 'ENOTFOUND' && '(IP did not resolve)',
            isCORS && 'or CORS denied'
        ].filter(Boolean).join(' ');

        super(request, options, `Request failed due to ${reason}`, cause && { cause });

        this.name = 'NetworkError';
        this.code = 19;
        if (isCORS) {
            this.isCrossOrigin = true;
        }
    }
}

export class TimeoutError extends FetchError {
    constructor(error, request, options) {
        const cause = isError(error) ? error : undefined;

        super(request, options, 'Request aborted due to timeout', cause && { cause });

        this.name = 'TimeoutError';
        this.code = 23;
    }
}

export const handleFetchError = (request, options) => {
    return (error) => {
        if (error.name === 'AbortError'
            || (error.code && (error.code === error.ABORT_ERR))
            // Detect when a reason is passed to .abort()
            || error === request.signal.reason
        ) {
            throw new AbortError(error, request, options);
        }
        if (error.name === 'TimeoutError'
            || (error.code && (error.code === error.TIMEOUT_ERR))
        ) {
            throw new TimeoutError(error, request, options);
        }
        if (error.name === 'NetworkError'
            || (error.code && (error.code === error.NETWORK_ERR))
            || isNetworkError(error)
        ) {
            throw new NetworkError(error, request, options);
        }

        throw error;
    };
};

export const handleFetchSuccess = (request, options) => {
    return async (response) => {
        if (!response.ok && options.throwHttpErrors) {
            const error = new HTTPError(request, response, options);
            /**
             * Provide the parsed body for convenience, but also to avoid memory leaks in case
             * the HTTPError is caught and ignored, by ensuring the body stream is consumed.
             */
            if (options.responseType) {
                error.arrayBuffer = await response.arrayBuffer();
                error.bytes = new Uint8Array(error.arrayBuffer);
                try {
                    error.text = textDecoder.decode(error.arrayBuffer);
                    error.json = (options.parseJson || JSON.parse)(error.text);
                }
                catch {
                    // Ignore parsing errors
                }
            }

            throw error;
        }

        return response;
    };
};
