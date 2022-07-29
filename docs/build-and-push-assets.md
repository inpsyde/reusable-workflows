# Build and push assets

This action can be used to build your assets in a controlled isolated environment via GitHub Actions. To achieve that, the reusable-workflow will install your `package.json`-dependencies, build your assets and pushes them afterwards into your repository. When doing a normal push into a branch a "DEV"-script can be executed, while creating a GitHub Tag, the "PROD"-script will be executed.

> :information_source: **Please note:** When using the workflow, the compiled assets' target folder(s) must be git-ignored, and also marked as linguist-generated in .gitattributes.

> We still don't push assets in version control, it is the GitHub Bot that puts assets in version control, not us. ;-)

Simplest possible example:

```yml
name: Build and push assets
on:
  push:
jobs:
  build-assets:
    uses: inpsyde/reusable-workflows/.github/workflows/build-and-push-assets.yml@main
    secrets:
      GITHUB_USER_EMAIL: ${{ secrets.INPSYDE_BOT_EMAIL }}
      GITHUB_USER_NAME: ${{ secrets.INPSYDE_BOT_USER }}
      NPM_REGISTRY_TOKEN: ${{ secrets.DEPLOYBOT_PACKAGES_READ_ACCESS_TOKEN }}
```

## Configuration parameters

### Inputs

| Name                  | Default                         | Description                                                              |
|-----------------------|---------------------------------|--------------------------------------------------------------------------|
| `NODE_VERSION`        | `16`                            | Node version with which the assets will be compiled                      |
| `NPM_REGISTRY_DOMAIN` | `"https://npm.pkg.github.com/"` | Domain of the private npm registry                                       |
| `PACKAGE_MANAGER`     | `"auto"`                        | Package manager. Supported are "yarn" and "npm"                          |
| `DEPS_INSTALL`        | `"yes"`                         | Install dependencies before compiling? Options: `"yes"` (default) `"no"` |
| `COMPILE_SCRIPT_PROD` | `"encore prod"`                 | Script added to `npm run` or `yarn` to build PROD assets                 |
| `COMPILE_SCRIPT_DEV`  | `"encore dev"`                  | Script added to `npm run` or `yarn` to build DEV assets                  |
| `ASSETS_TARGET_PATHS` | `"./assets"`                    | Target path(s) for compiled assets                                       |


## Secrets

| Name                 | Description                                  |
|----------------------|----------------------------------------------|
| `NPM_REGISTRY_TOKEN` | Authentication for the private npm registry. |
| `GITHUB_USER_EMAIL`  | Github User email used in `git config`.      |
| `GITHUB_USER_NAME`   | Github User name used in `git config`.       |


## Frequently asked questions

### What will happen to outdated or invalid generated assets?

The reusable-workflow will not take care of removing old assets. If you use Webpack Encore you can use following to clean up your old assets:

```js
Encore.cleanupOutputBeforeBuild( ['*.js', '*.css'] )
```

### Can I have multiple output-folders in my repository root?

Yes, you can simply define multiple folders in `inputs.ASSETS_TARGET_PATHS` by separating them with whitespace:

```yaml
name: Build and push assets
on:
  push:
jobs:
  build-assets:
    uses: inpsyde/reusable-workflows/.github/workflows/build-and-push-assets.yml@main
    inputs:
      ASSETS_TARGET_PATHS: "assets/ resources/ modules/"
    secrets:
      GITHUB_USER_EMAIL: ${{ secrets.INPSYDE_BOT_EMAIL }}
      GITHUB_USER_NAME: ${{ secrets.INPSYDE_BOT_USER }}
      NPM_REGISTRY_TOKEN: ${{ secrets.DEPLOYBOT_PACKAGES_READ_ACCESS_TOKEN }}
```
