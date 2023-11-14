# Automatic release

This workflow utilizes [semantic-release](https://github.com/semantic-release/semantic-release) to create a package
release.
Note that you must stick to
their [commit message convention](https://github.com/semantic-release/semantic-release#commit-message-format) to use it.
You can provide a `release.config.js` file in your repository to create a custom release that uses the following
semantic-release plugins:

- git
- npm
- exec
  Otherwise, the workflow will create the release with a standard set of configurations, updating the version in the
  following files:
- `CHANGELOG.md`
- `composer.json`
- `package-lock.json`
- `package.json`
- `style.css` or `index.php`
  By default, every push to the `main` and `next` branches will release a stable version, and every push to the `alpha`
  and `beta` branches will create a pre-release version.
  If you would like another setting, please provide your custom release.config.js file.

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

### Configuration parameters

#### Inputs

| Name                | Required | Default | Description                                                                                       |
|---------------------|----------|---------|---------------------------------------------------------------------------------------------------|
| `NODE_VERSION`      | false    |18       | Node version with which the release will be executed                                              |
| `GITHUB_USER_TOKEN` | false    |''       | Authentication token with write permission needed by the release bot (falls back to GITHUB_TOKEN) |

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
    with:
      NODE_VERSION: 16
    secrets:
      GITHUB_USER_TOKEN: ${{ secrets.WRITE_TOKEN }}
```
