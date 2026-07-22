# Comic PNG source exports (not committed)

Place timestamped comic PNG exports here, then run:

```bash
node scripts/copy-comics.mjs
```

Or set `COMICS_SOURCE_DIR` in `.env.local` to another folder.

Expected filename fragments (see `scripts/copy-comics.mjs` for the mapping):

- `07_19_46` → series cover
- `10_44_27` → issue 1
- `11_45_11` → issue 2
- `11_01_39` → issue 3
- `11_07_11` → issue 4
- `11_15_05` → issue 5
