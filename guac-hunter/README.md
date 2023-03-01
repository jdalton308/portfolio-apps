### Guac Game

#### Installation & Local Development

    $ npm i
    $ gulp

A livereload server runs on `localhost:8000` and serves `public/`. Check out `src/` for the app.

##### A note on `public/`

Compiled files built via `gulp build` are excluded from git. This includes:

- All HTML files; refer to `src/html`
- All CSS files; refer to `src/scss`
- All JS files; refer to `src/js`

This does not include:

- All image files. They belong in `public/assets/img`
- Any other resource files. They belong in `public/resources`

#### Integrating with GUAC -- `asset-manifest.js`

`resources/js/asset-manifest.js` is written automatically based on the available image assets on the server. To run:

    $ cd ~/projects/chipotle-guac # Note: root of repo
    $ npm run asset-manifest

This will do the following:

1. Pull down the available packages from S3
2. Write the packages as an `exports` array to `resources/js/asset-manifest.js` (e.g., `module.exports = […]`)
3. Build `guac-game` so the frontend JS is up to date

> **Note:** guac-game's `js` task has `resources/js` included as a search path. `require('asset-manifest')` will work just fine.

#### Deployment

From the root directory:

    $ cd ~/projects/chipotle-guac # Note: root of repo
    $ npm run deploy.game

This will prompt you for an environment to deploy to (`staging` or `production` for US, `staging-uk` or `production-uk` for UK), build the frontend, and then finally deploy.

#### Running the game in offline mode

From the root directory:

    $ ASSET_MANIFEST_OFFLINE=1 npm run asset-manifest

This will download each manifest file to `public/guac-packages` and update `asset-manifest.js` with relative links (e.g. `/guac-packages/<package>.json`).
