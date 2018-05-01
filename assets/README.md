# WDFN Compiled Static Assets

This project includes compiled assets for Water Data For The Nation. The assets
produced by this project are dependencies of both [`wdfn-server`](../wdfn-server) (Flask) and
[`graph-server`](../graph-server) (node.js).

## Install dependencies

Javascript and SASS assets are built with Node.js v8.9.3. Usage of
[nvm](https://github.com/creationix/nvm) is a convenient way to use a specific
version of Node.js:

```bash
nvm use v8.9.3
```

Node.js dependencies are installed via:

```bash
npm install
```

## Run a development server

Run the node.js development server at
[http://localhost:9000](http://localhost:9000):

```bash
npm run watch
```

## Test the production static assets build locally

To build the complete production package, built to `./dist`:

```bash
npm run build
```

Rather than using the `watch` task, you can serve the manually built assets.
To locally serve the production build without recompiling on filesystem
changes:

```bash
npm run serve:static
```

## Running tests

To run tests in Chrome via Karma, these are equivalent:

```bash
npm test
npm run test
```

To watch Javascript files for changes and re-run tests with Karma on change,
run:

```bash
npm run test:watch
```
