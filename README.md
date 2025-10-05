# Twinstar Bosskills

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

## Deploy

1. create and fill `.env` file
2. `npm run migrations:continue`
3. `npm run build`
4. `npm run start`
5. (optional) `systemctl restart bosskills`

## Caveats

### $env/static/private

Some scripts run with `vite-node` might fail with

> Error: Cannot import $env/static/private into client-side code

Setting env variable `TEST` to `true` (eg. `TEST=true`) will skip this import check
