Frontend notes
================

- **SCSS → CSS:** The HTML references `assets/css/style.css`. Compile the SCSS entry `assets/scss/styles.scss` to that path.

	Example using the Dart `sass` CLI:

	```bash
	sass assets/scss/styles.scss:assets/css/style.css --no-source-map --style=compressed
	```

- **Filenames:** This project uses `swiper-bundel.min.css` and `swiper-bundel.min.js` (note the existing "bundel" filename). The login page expects these files in `assets/css` and `assets/js` respectively.

- **Page updated:** `assets/pages/login.html` now uses relative `../` paths to load `../css/style.css`, `../css/swiper-bundel.min.css`, `../js/login.js`, and `../js/swiper-bundel.min.js`.

If you want, I can add an npm script or a simple watcher to rebuild SCSS automatically.

Now available scripts
---------------------

I added a `package.json` with small dev scripts. From the `Frontend` folder run:

```bash
npm install
npm run build:css    # one-off build of assets/css/style.css
npm run watch:css    # watch and rebuild SCSS on change
npm run serve        # serves ./assets on http://127.0.0.1:5500 and opens the login page
```

If you prefer a single command, run `npm start` to build then serve.
