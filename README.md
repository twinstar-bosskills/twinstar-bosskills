# Twinstart Bosskills

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Caveats

### @libsql

`@libsql/client` is included as `dependency` in order to force Node.js resolution algorithm (thanks @khromov)

> @khromov: esm/cjs problems sounds very package-specific. I don't think it's the norm and if you're having problems with bundling you can install a package as a non-dev dependency and it will use the Node.js resolution algorithm.

### $env/static/private

Some scripts run with `vite-node` might fail with

> Error: Cannot import $env/static/private into client-side code

Setting env variable `TEST` to `true` (eg. `TEST=true`) will skip this import check
