# Discover Real Estate Inc.: Nadeem Khan, Broker

Real estate website for Mississauga, Toronto and the GTA, with a protected admin panel (CMS).
Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · MongoDB/Mongoose. All content and uploaded images are stored in MongoDB.

## Pages

| Page | Route | Notes |
|---|---|---|
| Home | `/` | Every section is editable in admin, and each can be shown or hidden |
| About | `/about` | Broker profile, services, memberships |
| Featured Properties | `/featured-properties` | Links to the property search and featured listings URLs from Settings |
| Condominiums | `/condos`, `/condos/[slug]` | CMS: add a page per building |
| Relocation Services | `/relocation` | Content adapted from propertylimit.com |
| Mortgage Information | `/mortgage` | Payment calculator (Canadian semi-annual compounding, CMHC estimate) |
| Land Transfer Tax | `/land-transfer-tax` | Ontario + Toronto calculator with first-time buyer refunds |
| Market Insights | `/market-insights`, `/market-insights/[slug]` | CMS blog with topics and scheduled publishing |
| Client Reviews | `/testimonials` | Reviews migrated from propertylimit.com, editable |
| Contact | `/contact` | Inquiry form saved to MongoDB; condo and property reference supported |

Every **Search Properties** button opens the external search (`https://www.a1housi.com/property_find_form_common` by default, changeable in **Settings → Property links**). No IDX/MLS feed, booking or payments are built in.

## Admin (`/admin`)

- **Dashboard:** new inquiries, condo and article counts, quick actions.
- **Inquiries:** read, mark new/read/resolved, delete.
- **Condos:** create, edit, publish/unpublish and feature building pages, with photos, facts and feature lists.
- **Market Insights:** write articles. Text supports `## headings`, `- bullets` and `**bold**`. Future dates stay hidden until that day.
- **Page Content:** edit the Homepage, About, Featured Properties, Relocation, Mortgage, Land Transfer Tax, Testimonials and Contact pages.
- **Settings:** logo, broker and brokerage name, contact details (multiple phones), property links, social links, footer and SEO.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run seed                      # starter condos, articles, page content (idempotent, never overwrites edits)
npm run create-admin -- --email you@example.com --name "Your Name"
npm run dev                       # http://localhost:3000 · admin: /admin/login
```

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string, including the database name |
| `SESSION_SECRET` | 32+ random characters; signs admin sessions |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, used for the sitemap, canonical URLs and the upload same-origin check |

## Scripts

- `npm run seed`: adds starter content only where it is missing.
- `npm run convert-to-real-estate -- --confirm`: **one-off** for a database created by the earlier furniture build. It removes furniture data, resets page content to the real estate defaults and keeps contact details, social links and the logo.
- `npm run create-admin -- --email … [--reset]`: creates an admin user or resets their password (12+ characters).
- `npm run import-assets -- --logo <file> --founder <file> [--force]`: stores the original logo and portrait in MongoDB media.
- `npm run build && npm run verify`: end-to-end check with an in-memory database and a headless browser (106 checks).

## Content notes for the client to confirm

- Professional memberships listed on the About page (RECO, TRREB, OREA, MLS®) come from the old site. Please confirm they are current.
- Calculator rates are current Ontario/Toronto rates. Toronto purchases above $3M show "contact us" instead of an estimate.
- Starter condo and article photos are stock images from Unsplash. Replace them with real photos in admin.

## Images

Uploads are stored in MongoDB (`StoredUpload`) and served from `/api/uploads/{folder}/{file}`, so they survive redeploys. Files over 3.5 MB upload in 1 MB chunks to stay under Vercel's request limit. Replaced or removed images are deleted only after the new value is saved and when nothing else uses them.

## Deploying to Vercel

1. Set the three environment variables, using the production domain for `NEXT_PUBLIC_SITE_URL`.
2. Allow Vercel to reach MongoDB Atlas (Network Access).
3. Deploy from `main`.
