# Client website editor

A self-hosted SvelteKit 2 / Svelte 5 website with an in-place visual editor using adapter-node, SQLite, Drizzle migrations, database-backed Better Auth sessions, Zod validation, and local Sharp-optimized media. In `/admin`, use the page selector in the toolbar, click outlined text to edit it directly, or click the hero image to open the blurred-backdrop media picker. Pages are provisioned by the developer; client accounts can edit them but cannot create new routes.

## Building editable pages

The public page and visual editor render the same `SitePage` component. You no longer wire form fields such as `draft.navigation.about` into the admin screen. Build the site with the reusable editor components and give each editable value a stable ID:

```svelte
<EditSurface id="contact" label="Contact section" as="section">
	<EditText id="contact.heading" as="h2" fallback="Let's talk" />
	<EditImage id="contact.image" label="Contact image" />
	<EditButton id="contact.cta" href="/contact" fallback="Contact us" />
</EditSurface>
```

When this component appears in `/admin`, its text, image and colors register themselves and become editable automatically. The button destination stays fixed in source code; only its visible label and colors can be changed. New text is stored as escaped structured JSON, not HTML. Use unique, permanent IDs: changing an ID creates a new content value instead of renaming the old one.

The available primitives are in `src/lib/builder/`: `EditText`, `EditImage`, `EditButton`, and `EditSurface`. The starter layout is `src/lib/components/SitePage.svelte`. Normal Svelte markup can be mixed around these primitives; only annotated components are editable, which keeps scripts, links, layout behavior, and arbitrary DOM attributes outside the client's control.

## Local test site

Requires Node.js 22 or newer and `tar` (for upload backups).

```sh
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:5173`. The dummy editor account is user ID `admin`, password `admin`. This intentionally weak credential is only for local/disposable testing. Registration is disabled in the running application, and the seed script refuses to create this account in production unless an explicit unsafe override is supplied.

Drizzle schema changes are made in `src/lib/server/db/schema.ts`, committed with `npm run db:generate`, and applied with `npm run db:migrate`. Never use `drizzle-kit push` in production.

## Storage and security model

Production defaults are fixed outside each application release:

- Database: `/var/lib/client-website/database/website.sqlite`
- Media: `/var/lib/client-website/uploads`
- Backups: `/var/backups/client-website`

All of these paths, plus local `data/`, SQLite sidecar files, uploads, environment secrets, backups, and adapter output are ignored by Git. Draft and published JSON are separate columns; no complete HTML is stored. Publishing validates the draft and writes both its immutable revision and published snapshot in one SQLite transaction.

Images are limited to 10 MB, 12,000 pixels per side, and 40 megapixels. Sharp must successfully decode JPEG, PNG, WebP, or AVIF input. The original bytes and filename are discarded; only re-encoded WebP/AVIF variants with random UUID names are exposed. Alt text is required and kept in SQLite.

SQLite starts in WAL mode with foreign keys, a 5-second busy timeout, and `synchronous=NORMAL`. Backups use SQLite's online backup API, so copying a live WAL database directly is unnecessary and unsafe.

## Production deployment

Create a dedicated account and persistent directories once:

```sh
sudo useradd --system --home /var/lib/client-website --shell /usr/sbin/nologin client-website
sudo install -d -o client-website -g client-website -m 0750 \
  /var/lib/client-website/database /var/lib/client-website/uploads \
  /var/backups/client-website /opt/client-website
```

Deploy each release to a versioned directory below `/opt/client-website`, run `npm ci && npm run build`, then point `/opt/client-website/current` at that release. The symlink can change on every deployment; `/var/lib/client-website` remains untouched.

Create `/etc/client-website.env` (mode `0600`):

```ini
DATABASE_PATH=/var/lib/client-website/database/website.sqlite
UPLOAD_DIR=/var/lib/client-website/uploads
BACKUP_DIR=/var/backups/client-website
BETTER_AUTH_URL=https://example.com
BETTER_AUTH_SECRET=replace-with-output-of-openssl-rand-base64-32
HOST=127.0.0.1
PORT=3000
ORIGIN=https://example.com
```

Apply migrations as the service user before restarting. Do not run the insecure demo seed in production.

```sh
sudo -u client-website env NODE_ENV=production \
  DATABASE_PATH=/var/lib/client-website/database/website.sqlite npm run db:migrate
sudo cp deploy/client-website.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now client-website
```

Use either `deploy/nginx.conf` or `deploy/Caddyfile` as the TLS reverse proxy template. Both forward requests to adapter-node on loopback; set the real hostname and enable HTTPS. `ORIGIN` and `BETTER_AUTH_URL` must match that public HTTPS origin.

## Daily backup and restore

Install and enable the supplied systemd timer:

```sh
sudo cp deploy/client-website-backup.{service,timer} /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now client-website-backup.timer
sudo systemctl start client-website-backup.service  # initial test
```

It creates an online SQLite snapshot and a compressed uploads archive daily at 02:30, retaining 14 days by default. Backups on the same disk do not protect against disk loss: sync `/var/backups/client-website` to encrypted off-host storage and regularly test restores.

To restore, stop the app, preserve the current data directories, restore one matching SQLite snapshot and uploads archive, verify ownership is `client-website:client-website`, then start the service. Never overwrite the live database while the app is running.
