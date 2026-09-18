# Urbanrang Craft — V1 Logo + Theme Update

This version keeps the original static V1 architecture and adds:

- The supplied Urbanrang Craft logo in `assets/images/urbanrangcraft-logo.png`
- A cropped transparent PNG derived from the supplied 1280×512 JPG logo
- Logo sizing tuned for the 76px desktop header and 68px mobile header
- A muted neutral palette derived from the logo's deep teal and ochre accents
- Light/dark mode toggle at the right side of the header
- Dark-mode preference persisted with `localStorage`
- Existing R2 hero image URL retained from the supplied `index.html`

## Logo dimensions

The supplied logo is 1280×512 (2.5:1). Its visible artwork was cropped to 1126×497 and exported as a transparent PNG so the original black JPG background does not appear on the website.

The header uses approximately 140px logo width on desktop and 118px on mobile, preserving the logo's aspect ratio.

## R2

The current hero image in `index.html` already points to the R2 URL supplied in the uploaded HTML. Other portfolio placeholders remain unchanged so the gallery can be filled incrementally.

## Dark mode

The theme toggle is in the top-right header. The selected mode is stored in `localStorage` under `urbanrang-theme`.

## Performance

The hero image is marked high priority. Below-the-fold portfolio images should remain lazy-loaded when real R2 images are inserted. Reels should use short MP4/H.264 files with posters and `preload="none"`.

## Phase 1: R2-powered portfolio media

The public website now fetches its editable portfolio configuration once from:

`https://media.urbanrangcraft.com/content.json`

That file controls the hero image, the project carousel, and the reels. Media paths in the file are relative to `content.json`, so `images/project-01.webp` resolves to `https://media.urbanrangcraft.com/images/project-01.webp`.

### Upload to R2

Create this object layout in the R2 bucket connected to `media.urbanrangcraft.com`:

```text
content.json
images/
  molding.jpg
  painting.jpeg
  wallpaper.jpg
  ceiling.jpg
  falseCeiling.jpg
  renovation.jpg
videos/ (optional, add when reels are ready)
  reel-01.mp4
  reel-02.mp4
  reel-03.mp4
```

The repository's [content.json](content.json) is the starter manifest. Upload that file to the bucket root after confirming that the listed media filenames match the R2 objects. Edit only the manifest to change the order, labels, or media shown on the live site. If no reels are available, set `"reels": []`; the website then hides the reels section.

Each project needs `src`; `alt` and `title` are recommended. Each reel needs `src`; `poster` and `title` are recommended. The website keeps its built-in placeholder content if the manifest is temporarily unavailable.

### Required R2 CORS rule

Because the Vercel site fetches the manifest from a different origin, allow `GET` and `HEAD` requests from `https://urbanrangcraft.com` (and `https://www.urbanrangcraft.com` if that hostname is used) in the R2 bucket CORS configuration. During preview testing, add the exact Vercel preview origin too. No R2 credentials are used or exposed by the public site.

### Performance behaviour

The browser makes one request for `content.json`. Project images use lazy loading and asynchronous decoding. Reel videos use `preload="none"`, so their video data is not downloaded until a visitor chooses to play one.

Phase 1 does not add a Worker, Cloudflare Access, an admin interface, or upload/delete operations. Those remain for later phases.
