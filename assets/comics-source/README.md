# Comic page source files (not committed)

Place issue folders here before running `node scripts/copy-comics.mjs`:

```
assets/comics-source/
  issue-1/
    01-cover.png
    02-inside-cover.png
    ...
```

Files are copied into `public/assets/comics/` preserving folder structure.

Or set `COMICS_SOURCE_DIR` in `.env.local` to another root folder.
