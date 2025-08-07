# sky [![Build status for Sky](https://travis-ci.org/sholladay/sky.svg "Build Status")](https://travis-ci.com/sholladay/sky "Builds")

> HTTP requests with fetch made easy

Sky is an experimental HTTP client built on [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), designed to simplify common use cases, such as making requests that send or receive JSON, reusing options between requests, and handling errors.

Sky is based on years of experience maintaining [Ky](https://github.com/sindresorhus/ky) and is a complete rewrite from scratch with the goal of improving upon its design. Improvements will be ported to Ky where feasible.

## Why?

 - Timeout option to cancel requests that take too long
 - Automatic retries for failed requests, with fine-grained control of when and why
 - Automatic body parsing for both succesful and error responses
 - Robust internals, with a functional design that avoids request cloning
 - Dedicated error types with helpful messages, including `NetworkError`, `TimeoutError`, and more
 - Network errors indentify when [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) may be the cause

## Install

```sh
npm install sky
```

## Usage

```js
import sky from 'sky';

const users = await sky.json('/users');
console.log(users);
```

## API

### sky(input, options)

Sends an HTTP [`GET`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/GET) request. Use the `method` option or one of the method shorcuts, such as `sky.post()`, to send a request with a different method.

Returns a [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response).

#### input

Type: `string` | [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) | [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request)<br>
Example: `'/users'`

Where to send the request. See also the `prefix` and `baseUrl` options, which affect the final request URL.

#### options

##### baseUrl

Type: `string` | [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL)<br>
Example: `'/api/'`

A base URL for the `input`, which is useful for putting most requests under a given domain or path when using `sky.extend()`, while still allowing requests with absolute URLs to bypass it and go elsewhere. Only applied when `input` is a string.

The `input` (including any `prefix`) is _resolved_ against the base URL to determine the final request URL. See the [URL resolution guide](https://developer.mozilla.org/en-US/docs/Web/API/URL_API/Resolving_relative_references) and [parsing algorithm](https://url.spec.whatwg.org/#concept-basic-url-parser) for details.

##### prefix

Type: `string` | [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL)<br>
Example: `'/api'`

A prefix for the `input`, which is useful for putting all requests under a given domain or path when using `sky.extend()`. Only applied when `input` is a string.

If needed, a forward slash `/` is inserted between `prefix` and `input` when they are joined. Any adjacent slashes are removed to avoid duplicates.

In most cases, you should use the `baseUrl` option instead, such as if you want some requests with absolute URLs to be able to bypass the prefix.

##### retry

Type: `number` | [`RetryOptions`](https://github.com/sindresorhus/p-retry/tree/0a288cc203d657eb20e317163ae21834b86ba1bb?tab=readme-ov-file#options)

Options for how requests are retried in case of failure.

By default, only requests with a safe method are retried. Also, if the failure is due to a response with a non-2xx HTTP status code, the request is only retried if it is a safe status code.

**See the source code for additional options that are not yet documented.**

## Contributing

See our [contributing guidelines](https://github.com/sholladay/sky/blob/master/CONTRIBUTING.md "Guidelines for participating in this project") for more details.

1. [Fork it](https://github.com/sholladay/sky/fork).
2. Make a feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. [Submit a pull request](https://github.com/sholladay/sky/compare "Submit code to this project for review").

## License

[MPL-2.0](https://github.com/sholladay/sky/blob/master/LICENSE "License for sky") © [Seth Holladay](https://seth-holladay.com "Author of sky")

Go make something, dang it.
