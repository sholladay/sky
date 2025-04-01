# sky [![Build status for Sky](https://travis-ci.com/sholladay/sky.svg "Build Status")](https://travis-ci.com/sholladay/sky "Builds")

> HTTP requests with fetch made easy

Sky is an HTTP client built on [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), designed to simplify common use cases, such as making requests that send or receive JSON, as well as error handling.

It is made by one of the [Ky](https://github.com/sindresorhus/ky) maintainers and leverages years of experience to improve upon its design. Features from Sky will be ported to Ky where possible.

## Why?

 - Timeout option
 - Functional, modern internals
 - Discrete error types with helpful messages
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

A base URL for the `input`, which is useful for putting most requests under a given domain or path when using `sky.extend()`, while still allowing certain requests to go elsewhere. Only applied when `input` is a string.

The `input` (including any `prefix`) is _resolved_ against the base URL to determine the final request URL. See the [URL resolution guide](https://developer.mozilla.org/en-US/docs/Web/API/URL_API/Resolving_relative_references) and [parsing algorithm](https://url.spec.whatwg.org/#concept-basic-url-parser) for details.

##### prefix

Type: `string` | [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL)<br>
Example: `'/api'`

A prefix for the `input`, which is useful for putting all requests under a given domain or path when using `sky.extend()`. Only applied when `input` is a string.

If needed, a forward slash `/` is inserted between `prefix` and `input` when they are joined. Any adjacent slashes are removed to avoid duplicates.

If you want some requests to be able to bypass the prefix, you may want to use the `baseUrl` option instead.

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
