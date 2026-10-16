# Furniture & Home Interiors — Website + Admin

Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · MongoDB/Mongoose. Public furniture catalog with product inquiries, plus a protected admin panel. All content and uploaded images persist in MongoDB.

## Local setup

```bash
npm install
cp .env.example .env.local        # fill in the values below
npm run seed                      # sample categories, products, gallery, page content (idempotent)
npm run create-admin -- --email you@example.com --name "Your Name"
npm run dev                       # http://localhost:3000  ·  admin: /admin/login
```

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | yes | MongoDB Atlas connection string, including the database name |
| `SESSION_SECRET` | yes | 32+ random characters; signs admin session tokens |
| `NEXT_PUBLIC_SITE_URL` | yes in production | Public base URL, used for the sitemap, canonical URLs and the same-origin check on upload routes |

## Scripts

- `npm run create-admin -- --email … [--name …] [--reset]` creates an admin or resets a password. It reads the password from `ADMIN_PASSWORD` or a hidden prompt (12+ characters). There is no public registration.
- `npm run seed` inserts sample data only where it is missing. It never overwrites admin edits and never runs on app start. **The sample products are placeholders and do not describe real inventory**, so replace them in the admin panel.
- `npm run import-assets -- --logo <file> --founder <file>` stores the original logo and founder portrait in MongoDB media and points the site at them. It skips any value already customised in the admin panel unless you pass `--force`.
- `npm run build && npm run verify` runs the end-to-end check: in-memory MongoDB, the production server and headless Chrome/Edge. It covers pages, auth, uploads, chunking, replacement cleanup, a restart and more (82 checks).

## Brand assets

The original logo and founder portrait files were not supplied separately, so `public/brand/logo.png` and `public/brand/founder.jpg` are cropped from the reference design. **Replace them with the full-resolution originals** in either of two ways:
- **Admin panel:** use Settings → Logo, and Page Content → Founder portrait.
- **Command line:** run `npm run import-assets -- --logo original-logo.png --founder founder.jpg --force`.

## Image storage

- Uploads go to `POST /api/upload` (admin only, same-origin only). The route checks file signatures as well as the declared type, enforces the 8 MB limit, and gives each file a server-generated name. Images are stored as binary data in the `StoredUpload` collection and served from `GET /api/uploads/{folder}/{filename}` with immutable caching. Nothing is written to disk, so uploads survive redeploys.
- Files over 3.5 MB are sent in 1 MB chunks, because Vercel limits request bodies to about 4.5 MB. Chunks are held temporarily in MongoDB and tied to the signed-in admin. Repeated chunks are handled safely, and the file is assembled and validated only once every chunk has arrived. Unfinished sessions expire through TTL indexes.
- Content documents store only URL strings. When an image is replaced or removed, the old file is deleted only after the new value is saved, and only if nothing else still references it. **Settings → Clean up unused uploads** removes files from abandoned edits after a 24-hour grace period.

## Deploying to Vercel

1. Import the repository and set the three environment variables above.
2. In MongoDB Atlas, allow access from Vercel (Network Access → `0.0.0.0/0`, or use the Vercel integration).
3. Deploy. Then run `npm run seed` and `npm run create-admin` once from your machine against the production `MONGODB_URI`.

**Known constraints:**
- Vercel's response limit (about 4.5 MB) can apply to very large originals served through `/api/uploads`. The route streams its response, and pages load images through `next/image` (`/_next/image`), which serves resized copies, so visitors rarely request originals directly. For best results, upload images under about 4 MB.
- MongoDB documents are capped at 16 MB, which is comfortably above the 8 MB upload limit.
