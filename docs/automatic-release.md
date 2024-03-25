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
- `style.css` or the main plugin file (automatically discovered by the workflow)

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
Semantic-release doesn't account for these boundaries, so it can happen a created tag is not valid for Composer
packages.

This workflow already ships the solution in case you are using it after the [build-and-push-assets](https://github.com/inpsyde/reusable-workflows/blob/main/.github/workflows/build-and-push-assets.yml) one.
If a custom solution is needed,
the [release.config.js file](https://github.com/inpsyde/reusable-workflows/blob/main/templates/automatic-release/release.config.js)
file must be added in your repository and the `tagName` format must be modified accordingly.

### Configuration parameters
## Configuration parameters

### Secrets

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
