# Cloudflare SvelteKit website editor

A SvelteKit 2 / Svelte 5 visual website editor deployed to Cloudflare Workers. Content, users, and sessions live in Cloudflare D1; uploaded media lives in a private R2 bucket and is served through the application.

## Editable pages

The public page and visual editor render the same `SitePage` component. Add editable content with the primitives in `src/lib/builder` and give every value a stable ID:

```svelte
<EditSurface id="contact" label="Contact section" as="section">
	<EditText id="contact.heading" as="h2" fallback="Let's talk" />
	<EditImage id="contact.image" label="Contact image" />
	<EditButton id="contact.cta" href="/contact" fallback="Contact us" />
</EditSurface>
```

Text is stored as escaped structured JSON, not HTML. Button destinations and application code remain developer-controlled. Changing an ID creates a new content value rather than renaming the old value.

## Local development

Requires Node.js 22 or newer.

```sh
npm install
cp .dev.vars.example .dev.vars
cp .env.example .env
npm run db:migrate
npm run dev
```

Use long random values in `.dev.vars` and use the same `SETUP_TOKEN` in `.env`. In another terminal, provision the local administrator and starter pages:

```sh
npm run db:seed
```

Open `http://localhost:5173/admin/login` and sign in as `admin` with the `ADMIN_PASSWORD` from `.env`.

## Cloudflare deployment

Authenticate Wrangler and deploy once:

```sh
npx wrangler login
npm run deploy
```

Wrangler automatically provisions and binds the `911db1337` D1 database as `CONTENT_DB`, plus the `MEDIA_STORE` R2 bucket declared in `wrangler.jsonc`. A Git-connected Cloudflare build provisions them in the same way.

Set production secrets. `BETTER_AUTH_URL` must be the final HTTPS Workers or custom-domain origin.

```sh
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put BETTER_AUTH_URL
npx wrangler secret put SETUP_TOKEN
```

Apply the schema after the first deployment has provisioned D1:

```sh
npm run db:migrate:remote
```

Provision the production administrator once:

```sh
SEED_URL=https://your-site.example \
SETUP_TOKEN='the-same-setup-token' \
ADMIN_PASSWORD='a-strong-password' \
npm run db:seed
```

Then remove the one-time setup secret so the endpoint becomes unavailable:

```sh
npx wrangler secret delete SETUP_TOKEN
```

Public Better Auth registration routes are always blocked. The setup endpoint returns `404` without the setup secret and refuses to run after the administrator exists.

## Cloudflare Git build settings

Use the repository root and these commands:

```text
Build command: npm run build
Deploy command: npx wrangler deploy
```

The committed Wrangler configuration automatically provisions D1 and R2. Add `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `SETUP_TOKEN` as encrypted variables in the Cloudflare project, then apply the remote D1 migration after its first deployment.

## Database changes

Change `src/lib/server/db/schema.ts`, generate and commit a migration, then apply it locally and remotely:

```sh
npm run db:generate
npm run db:migrate
npm run db:migrate:remote
```

Do not use `drizzle-kit push` against production.

## Media model

Uploads are limited to 10 MB, 12,000 pixels per side, and 40 megapixels. JPEG, PNG, WebP, and AVIF inputs are decoded for metadata validation, stored with UUID keys in R2, and served with immutable caching and content-type protection.

The open-source deployment stores validated originals. Automatic transcoding and responsive variants would require adding a Cloudflare Images binding, which is a separately billed product.
