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

