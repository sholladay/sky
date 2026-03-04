export const afterResponse = async (input, options, response) => {
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

    return response;
};

export const beforeRequest = async (input, options) => {
    let response;
    for (const hook of options.hooks.beforeRequest) {
        // eslint-disable-next-line no-await-in-loop
        const result = await hook({
            input,
            options
        });

        if (result instanceof Response) {
            response = result;
        }
        else if (result) {
            input = result;
        }
    }
    return response || input;
};
