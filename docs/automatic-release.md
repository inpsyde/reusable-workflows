# Automatic release

This workflow utilizes [semantic-release](https://github.com/semantic-release/semantic-release) to create a package
release.
Note that you must stick to
their [commit message convention](https://github.com/semantic-release/semantic-release#commit-message-format) to use it.

You can provide a `release.config.js` file in your repository to create a custom release that uses the following
semantic-release plugins:

- [git](https://github.com/semantic-release/git)
- [npm](https://github.com/semantic-release/npm)
- [exec](https://github.com/semantic-release/exec)

Otherwise, the workflow will create the release with a [standard set of configurations](../templates/automatic-release/release.config.js), updating the version in the
following files:

- `CHANGELOG.md`
- `composer.json`
- `package-lock.json`
- `package.json`
- `style.css` or `index.php`

By default, every push to the `main` and `next` branches will release a stable version, and every push to the `alpha`
and `beta` branches will create a pre-release version.
If you want to use a different configuration, please provide your custom `release.config.js` file.

**Simplest possible example:**

```yml
name: Release
on:
  push:
    branches:
      - main
      - beta
      - alpha
jobs:
  release:
    uses: inpsyde/reusable-workflows/.github/workflows/automatic-release.yml@main
```

## Pre-releases on non-standard branches

Composer has some boundaries on tag names, because it uses under the hood the PHP function `version_compare()`.
Semantic-release doesn't account for these boundaries, so it can happen a created tag is not valid for Composer packages.
A solution would be to add the [release.config.js file](https://github.com/inpsyde/reusable-workflows/blob/main/templates/automatic-release/release.config.js) in your repository and modify the `tagName` format accordingly.

For example, using the [build-and-push-assets workflow](https://github.com/inpsyde/reusable-workflows/blob/main/.github/workflows/build-and-push-assets.yml) with a setting like this
```yml
name: Build and push assets

on:
  workflow_dispatch:
  push:
    branches: ['main', 'beta', 'alpha']

jobs:
  build-assets:
    uses: inpsyde/reusable-workflows/.github/workflows/build-and-push-assets.yml@main
    with:
      BUILT_BRANCH_SUFFIX: "-built"
```
the `-built` branch is created after the building step of the assets, and you can run the automatic release on the same branch

```yml
name: Release
on:
  push:
    branches:
      - 'main-built'
      - 'beta-built'
      - 'alpha-built'
jobs:
  release:
    uses: inpsyde/reusable-workflows/.github/workflows/automatic-release.yml@main
```
Since `alpha` and `beta` branches are marked as pre-releases, semantic-release will use the branch name in the tag name, generating tags like `1.0.0-beta-built.1`.
Composer is not going to recognize this tag name.
You can fix the issue including the `release.config.js` file in your repository and providing this setting:
```js
tagFormat: '<%- version.replace("-built", "") %>'
```

### Configuration parameters

#### Secrets

| Name                | Required | Default | Description                                                                                       |
|---------------------|----------|---------|---------------------------------------------------------------------------------------------------|
| `GITHUB_USER_TOKEN` | false    | `''`    | Authentication token with write permission needed by the release bot (falls back to GITHUB_TOKEN) |

**Example with configuration parameters:**

```yml
name: Release
on:
  push:
    branches:
      - main
      - alpha
jobs:
  release:
    uses: inpsyde/reusable-workflows/.github/workflows/automatic-release.yml@main
    secrets:
      GITHUB_USER_TOKEN: ${{ secrets.WRITE_TOKEN }}
```
