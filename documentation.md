# UrbanRang Craft — Deployment & Architecture Documentation

> Single-context reference for the UrbanRang Craft public website, admin UI, Worker API, Cloudflare R2/D1 resources, and deployment relationships. Update this file whenever repositories, domains, bindings, or deployment flows change.

## 1. High-Level Architecture

```text
PUBLIC WEBSITE
GitHub: W4R10CK99/UrbanRangCraft
        ↓
      Vercel
        ↓
  Public website
        ↓ GET content.json
Cloudflare R2
  urban-rang-craft
        ↓
media.urbanrangcraft.com


ADMIN
Admin UI GitHub repository
        ↓
Cloudflare Pages
        ↓
admin-ui.urbanrangcraft.com
        ↓ API
Cloudflare Worker
urbanrang-craft-admin-api
        ├── D1: urbanrang-craft-admin
        └── R2: urban-rang-craft
```

## 2. Repositories

### Public Website

GitHub:

```text
W4R10CK99/UrbanRangCraft
```

Main files:

```text
UrbanRangCraft/
├── index.html
├── script.js
├── style.css
└── ...
```

Deployment:

```text
GitHub → Vercel → public website
```

The public website is static frontend code. It does not directly write to R2.

### Admin UI

Separate repository/project from the public website.

Deployment:

```text
GitHub → Cloudflare Pages → Admin UI
```

Production domain:

```text
https://admin-ui.urbanrangcraft.com
```

Testing Pages domain:

```text
https://admin-urban.pages.dev
```

The admin UI is used for authentication and media management.

### Worker

The Worker project lives under the admin project:

```text
worker/
├── src/
│   └── index.js
├── schema.sql
├── wrangler.json
└── ...
```

Worker name:

```text
urbanrang-craft-admin-api
```

Worker URL:

```text
https://urbanrang-craft-admin-api.urbanrangcraft.workers.dev
```

Deploy from `worker/`:

```bash
npx wrangler deploy
```

## 3. Cloudflare Resources

### R2

Bucket:

```text
urban-rang-craft
```

Public media domain:

```text
https://media.urbanrangcraft.com
```

R2 stores:

```text
images/
images/managed/
videos/
content.json
...
```

Exact folders may evolve.

### D1

Database:

```text
urbanrang-craft-admin
```

Region:

```text
APAC
```

Database ID:

```text
ae1248af-b1ab-49d8-92b3-3af212c2a8b6
```

Worker binding:

```text
DB
```

The generated Wrangler configuration may also contain:

```text
urbanrang_craft_admin
```

If both bindings exist, verify which one the application actually uses before removing either.

## 4. Worker Bindings

The Worker uses:

```text
env.DB
    → Cloudflare D1: urbanrang-craft-admin

env.MEDIA_BUCKET
    → Cloudflare R2: urban-rang-craft

env.ALLOWED_ORIGINS
    → allowed browser origins

SESSION_SECRET
    → Worker secret used for sessions
```

Current allowed origins include:

```text
https://admin-ui.urbanrangcraft.com
https://admin-urban.pages.dev
```

If the admin domain changes, update the Worker configuration.

## 5. Public Website → R2 Flow

The website reads:

```text
https://media.urbanrangcraft.com/content.json
```

Conceptually:

```text
Vercel website
    ↓
GET content.json
    ↓
R2
    ├── hero
    ├── services
    ├── projects
    └── reels
```

The website's JavaScript resolves media URLs from the manifest.

This means changing media should normally **not require a Vercel deployment**.

## 6. content.json

`content.json` is the media/content manifest.

Conceptual structure:

```json
{
  "hero": {
    "src": "...",
    "alt": "..."
  },
  "services": {
    "painting": {
      "src": "...",
      "alt": "..."
    },
    "wallpaper": {
      "src": "...",
      "alt": "..."
    },
    "moulding": {
      "src": "...",
      "alt": "..."
    },
    "ceiling": {
      "src": "...",
      "alt": "..."
    }
  },
  "projects": [],
  "reels": []
}
```

Treat the actual current `content.json` as the source of truth for the exact schema.

## 7. Media Management Model

### Fixed Media Slots

Hero and service/title-card images are logical slots.

Examples:

```text
Hero
Painting
Wallpaper
Moulding
Ceiling
...
```

The admin selects a slot and uploads any filename.

The filename does not determine the logical slot.

Conceptually:

```text
Admin uploads:
my-new-ceiling-photo.jpg

Worker:
1. Stores the uploaded object in R2
2. Updates the ceiling reference in content.json

Website:
reads content.json
→ gets the new ceiling path
→ displays the new image
```

Managed replacements may live under:

```text
images/managed/
```

Existing legacy images may remain under their original paths.

### Projects / Work Media

Projects are a collection.

Operations:

```text
Add
Delete
```

Example:

```text
project-1
project-2
project-3
project-4

+ project-5

→ project-1
  project-2
  project-3
  project-4
  project-5
```

### Reels

Reels use the same collection model:

```text
Add reel
Delete reel
```

## 8. Admin Authentication

The admin system intentionally uses simple application-level authentication.

Current flow:

```text
Admin UI
   ↓ POST /api/auth/login
Worker
   ↓
D1 users table
   ↓
password hash verification
   ↓
session
   ↓
GET /api/auth/me
```

There is no dependency on:

```text
Cloudflare Access
Google Identity
```

The previous Cloudflare Access admin application was removed.

The system is intentionally simple because only approximately 2–3 administrators are expected.

## 9. D1 Users

The authentication database contains a users table conceptually like:

```text
users
├── id
├── username
└── password_hash
```

Passwords are never stored as plaintext.

The application uses PBKDF2-SHA256 hashes in a format such as:

```text
pbkdf2-sha256$100000$<salt>$<hash>
```

Additional users can be inserted later with a properly generated password hash.

## 10. SESSION_SECRET

The Worker secret is:

```text
SESSION_SECRET
```

Created with:

```bash
npx wrangler secret put SESSION_SECRET
```

Never commit its value to GitHub.

If it is intentionally rotated:

```bash
npx wrangler secret put SESSION_SECRET
```

## 11. D1 Commands

Apply schema remotely:

```bash
npx wrangler d1 execute urbanrang-craft-admin --remote --file=schema.sql
```

Query users:

```bash
npx wrangler d1 execute urbanrang-craft-admin --remote --command "SELECT username FROM users;"
```

Important: `--remote` targets production D1. Without it, Wrangler uses the local development database.

### PowerShell and password hashes

PBKDF2 hashes contain `$`, which PowerShell can interpret as variable expansion.

When inserting hashes from PowerShell, ensure the `$` characters are passed literally.

## 12. Admin UI → Worker

The browser does not directly access D1 or R2 credentials.

Flow:

```text
Admin UI
   ↓ authenticated API request
Worker
   ├── validate session
   ├── perform operation
   ├── R2 operation
   └── update content.json when required
```

## 13. Media Update Flow

### Hero / Service Image

```text
Admin login
    ↓
Select logical slot
    ↓
Upload any filename
    ↓
Worker
    ↓
R2 upload
    ↓
content.json reference updated
    ↓
Website fetches content.json
    ↓
New image displayed
```

### Project / Reel

Add:

```text
Admin UI
    ↓
Worker
    ↓
R2 upload
    ↓
content.json updated
    ↓
Website renders new item
```

Delete:

```text
Admin UI
    ↓
Worker
    ↓
R2 object deleted
    ↓
content.json updated
    ↓
Website stops rendering item
```

## 14. Deployment Flow

### Public website

```text
1. Modify local website
2. Test
3. Commit
4. Push to W4R10CK99/UrbanRangCraft
5. Vercel deploys
6. Test production
```

### Admin UI

```text
1. Modify admin UI
2. Test
3. Commit
4. Push to admin repository
5. Cloudflare Pages deploys
6. Test login and media operations
```

### Worker

From `worker/`:

```bash
npx wrangler deploy
```

Then test the API and admin UI.

### D1 schema changes

```text
1. Prepare migration/schema SQL
2. Review carefully
3. Apply to remote D1
4. Verify with SELECT
5. Deploy dependent Worker code
```

Do not recreate the production database casually.

## 15. Caching / Stale Media Debugging

If a media change is not visible:

```text
1. Check the new R2 object
2. Check content.json
3. Open content.json directly
4. Check browser Network tab
5. Verify loaded JSON contains the new path
6. Verify script.js renders that field
7. Hard refresh
8. Investigate CDN/browser caching
```

Chrome hard refresh:

```text
Ctrl + Shift + R
```

Do not change application code solely because an old image appears until the manifest and Network response have been checked.

## 16. Debugging Authentication

If login fails:

```text
1. Check Worker deployment
2. Check SESSION_SECRET
3. Check D1 users
4. Check username/password
5. Check /api/auth/login
6. Check /api/auth/me
7. Check cookies
8. Check CORS / ALLOWED_ORIGINS
```

Worker logs:

```bash
npx wrangler tail urbanrang-craft-admin-api
```

Typical successful browser flow:

```text
POST /api/auth/login
        ↓
session created
        ↓
GET /api/auth/me
        ↓
dashboard opens
```

## 17. Source-of-Truth Rules

### Public website code

```text
GitHub:
W4R10CK99/UrbanRangCraft

Deployment:
Vercel
```

### Admin UI code

```text
Admin UI GitHub repository

Deployment:
Cloudflare Pages
```

### API code

```text
worker/src/index.js

Deployment:
Cloudflare Workers
```

### Database

```text
Cloudflare D1
urbanrang-craft-admin
```

### Media

```text
Cloudflare R2
urban-rang-craft
```

### Media manifest

```text
Cloudflare R2
content.json
```

## 18. Production Identifiers

```text
Public GitHub:
W4R10CK99/UrbanRangCraft

Worker:
urbanrang-craft-admin-api

Worker URL:
https://urbanrang-craft-admin-api.urbanrangcraft.workers.dev

R2 bucket:
urban-rang-craft

Media domain:
https://media.urbanrangcraft.com

D1:
urbanrang-craft-admin

D1 ID:
ae1248af-b1ab-49d8-92b3-3af212c2a8b6

Admin domain:
https://admin-ui.urbanrangcraft.com

Admin Pages domain:
https://admin-urban.pages.dev

Content manifest:
https://media.urbanrangcraft.com/content.json
```

## 19. Security Rules

Never commit:

```text
SESSION_SECRET
plaintext passwords
R2 access keys
Cloudflare API tokens
database credentials
```

The public website must never contain admin credentials.

R2 write access stays behind the Worker/admin system.

The public website consumes public media only.

## 20. Design Philosophy

The project intentionally favors simplicity.

Expected administrators:

```text
~2–3
```

Therefore the current system avoids unnecessary infrastructure such as:

```text
Google Identity
Cloudflare Access for admin login
enterprise IAM
complex role/permission systems
```

Current preferred architecture:

```text
Simple Admin UI
      ↓
Simple Worker API
      ↓
D1 authentication
      +
R2 media storage
      +
content.json manifest
      ↓
Static public website
```

Do not introduce more infrastructure unless requirements actually demand it.

## 21. Important Architectural Rule

The public website should not need a code deployment merely because an image or video changes.

Preferred media flow:

```text
Admin UI
   ↓
Worker
   ↓
R2 + content.json
   ↓
Public website
```

A Vercel deployment should generally be needed only when website code changes.

## 22. Future ChatGPT Context

When starting a future UrbanRang Craft conversation, provide this document first.

The minimum context is:

```text
PUBLIC:
W4R10CK99/UrbanRangCraft → Vercel

ADMIN:
separate repository → Cloudflare Pages
admin-ui.urbanrangcraft.com

API:
Cloudflare Worker
urbanrang-craft-admin-api

DATABASE:
Cloudflare D1
urbanrang-craft-admin

STORAGE:
Cloudflare R2
urban-rang-craft

MEDIA:
media.urbanrangcraft.com

MANIFEST:
media.urbanrangcraft.com/content.json

AUTH:
Worker + D1 application-level authentication
(no Cloudflare Access / Google Identity)

MEDIA:
Hero/service images are fixed logical slots.
Projects/reels are add/delete collections.
```
