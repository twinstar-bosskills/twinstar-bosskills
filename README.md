# Twinstar Bosskills

## Developing

Once you've created a project and installed dependencies with `pnpm install`, start a development server:

```bash
pnpm run dev
```

## Building

To create a production version of your app:

```bash
pnpm run build
```

You can preview the production build with `pnpm run preview`.

## Deploy

1. create and fill `.env` file
2. `pnpm run migrations:mysql:continue`
3. `pnpm run build`
4. `pnpm run start`
5. (optional) `systemctl restart bosskills`

## Caveats

### $env/static/private

Some scripts run with `vite-node` might fail with

> Error: Cannot import $env/static/private into client-side code

Setting env variable `TEST` to `true` (eg. `TEST=true`) will skip this import check
