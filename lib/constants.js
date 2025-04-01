export const acceptTypes = new Map([
    ['formData', 'multipart/form-data'],
    ['json', 'application/json'],
    ['text', 'text/*']
]);
export const requestMethods = ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT'];
export const responseTypes = ['arrayBuffer', 'blob', 'bytes', 'formData', 'json', 'text'];
export const retryMethods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'PUT', 'TRACE'];
export const retryStatusCodes = [408, 413, 429, 500, 502, 503, 504];
