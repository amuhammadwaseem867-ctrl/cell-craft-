# CellCraft

Premium storefront for CellCraft: iPhone and Samsung Galaxy smartphones, with full specs, prices in Rand and WhatsApp ordering.

## Run it
It's a static site with no build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Deploy by uploading the folder to any static host (Netlify, Vercel, GitHub Pages, cPanel).

## Edit products and prices
Everything lives in `js/products.js`:
- `price`: number in Rand
- `badge`: `"Box Pack"`, `"Kit Only"`, `"Converted"`, or leave it out
- `img`: filename in `assets/phones/` (without `.jpg`), or `null` to use the built-in device render
- `flagship: true`: shows the phone in the Flagships section
- `specs`: any key/value pairs, shown in the specs popup

The WhatsApp number is set at the top of the same file.

## Files
- `index.html`: page structure
- `css/styles.css`: design (black, champagne gold, ivory)
- `js/app.js`: filters, search, sorting, specs popup, WhatsApp links
- `assets/logo.svg`: CellCraft logo
- `assets/phones/`: product images
