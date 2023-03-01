### Adding a new site
Summary of [firebase docs](https://firebase.google.com/docs/hosting/multisites) for multiple sites

1. Add new "site" in JoeDalton.io Firebase "Portfolio" project
2. Run `firebase target:apply hosting [local target name] [firebase site id] `
3. Update `firebase.json` with new site target, pointing to correct directory
  ```js
    {
      "target": "[local target name]",
      "public": "./[new site directory]",
      "ignore": [
        "firebase.json",
        "**/.*",
        "**/node_modules/**"
      ],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    }
  ```
4. To deploy new site: `firebase deploy --only hosting:[local target name]`