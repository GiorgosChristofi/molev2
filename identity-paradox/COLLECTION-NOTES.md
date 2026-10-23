# Full character collection

610 artworks: 378 from the original export, 216 from the four additional batches, 10 Dragon Ball GT artworks, SSJ3 Goku, separate corrected Goku and Gohan forms, and SSJ Blue Goku, SSJ Blue Vegeta and Ultra Instinct Goku. Supplied names and original filenames are preserved.

- `collection/thumbs/`: 400 × 277 WebP files for gallery browsing and capsule composition.
- `collection/previews/`: supplied 960px WebP previews, retained for future use.
- `collection/originals/`: untouched original files, 1506–1507 × 1044 pixels.
- `collection/characters.json`: supplied source index.
- `collection/source-verification.json`: source dimensions and SHA-256 checksums for each asset.
- `identities.js`: browser-ready index; 10 identities per page, 61 pages, searchable by supplied name.

Selecting an identity initially displays its thumbnail, then swaps to its decoded original. Download links point directly to the original file with its supplied filename; no canvas conversion or recompression occurs. Originals are not fetched during ordinary gallery browsing.

The homepage uses the same collection through `home-identity-vault/characters.json` and `vault-data.js`. Its approved capsule shell is precomposited into small bitmaps, with a bounded pool recycling through the collection. Revealed images and download links use originals.

Deploy the `collection/` directory, including all original files, together with the website. Keep UTF-8 filenames intact. This complete source collection is about 1.78 GB on disk; visitors load individual originals on demand.

The four October 22 batches are added without replacing existing entries. Both Sailor Moon artworks are retained under separate unique IDs. Existing Obito, Kakashi, Escanor and Turnip Head corrections are preserved.

The image formerly named Goku Super Saiyan is now Vegito Super Saiyan. A separate supplied image is used for Goku Super Saiyan. Both originals are preserved unchanged.

The image formerly named Gohan Super Saiyan 2 is now Gohan Super Saiyan. A separate supplied image is used for Gohan Super Saiyan 2. Both originals are preserved unchanged.
