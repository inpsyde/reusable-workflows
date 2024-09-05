# Automatic release

This workflow utilizes [semantic-release](https://github.com/semantic-release/semantic-release) to
create a package release. Note that you must stick to
their [commit message convention](https://github.com/semantic-release/semantic-release#commit-message-format)
to use it.

You can provide a `release.config.js` file in your repository to create a custom release that uses
the following semantic-release plugins:

- [git](https://github.com/semantic-release/git)
- [npm](https://github.com/semantic-release/npm)
- [exec](https://github.com/semantic-release/exec)

Otherwise, the workflow will create the release with
a [standard set of configurations](../templates/automatic-release/release.config.js), updating the
version in the following files:

- `CHANGELOG.md`
- `composer.json`
- `package-lock.json`
- `package.json`
- `style.css` or the main plugin file (automatically discovered by the workflow)

By default, every push to the `main` and `next` branches will release a stable version, and every
push to the `alpha` and `beta` branches will create a pre-release version. If you want to use a
different configuration, please provide your custom `release.config.js` file.

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

## Configuration parameters

### Inputs

| Name                  | Required | Default                         | Description                        |
|-----------------------|----------|---------------------------------|------------------------------------|
| `NPM_REGISTRY_DOMAIN` | false    | `'https://npm.pkg.github.com/'` | Domain of the private npm registry |

### Secrets

| Name                         | Required | Default | Description                                                                                         |
|------------------------------|----------|---------|-----------------------------------------------------------------------------------------------------|
| `NPM_REGISTRY_TOKEN`         | false    | `''`    | Authentication for the private npm registry                                                         |
| `GITHUB_USER_EMAIL`          | false    | `''`    | Email address for the GitHub user configuration                                                     |
| `GITHUB_USER_NAME`           | false    | `''`    | Username for the GitHub user configuration                                                          |
| `GITHUB_USER_SSH_KEY`        | false    | `''`    | Private SSH key associated with the GitHub user for the token passed as `GITHUB_USER_TOKEN`         |
| `GITHUB_USER_SSH_PUBLIC_KEY` | false    | `''`    | Public SSH key associated with the GitHub user for the token passed as `GITHUB_USER_TOKEN`          |
| `GITHUB_USER_TOKEN`          | false    | `''`    | Authentication token with write permission needed by the release bot (falls back to `GITHUB_TOKEN`) |

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
      GITHUB_USER_TOKEN: ${{ secrets.DEPLOYBOT_REPO_READ_WRITE_TOKEN }}
```

**Example with custom GitHub user and signed commits using SSH key:**

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
      GITHUB_USER_EMAIL: ${{ secrets.DEPLOYBOT_EMAIL }}
      GITHUB_USER_NAME: ${{ secrets.DEPLOYBOT_USER }}
      GITHUB_USER_SSH_KEY: ${{ secrets.DEPLOYBOT_SSH_PRIVATE_KEY }}
      GITHUB_USER_SSH_PUBLIC_KEY: ${{ secrets.DEPLOYBOT_SSH_PUBLIC_KEY }}
      GITHUB_USER_TOKEN: ${{ secrets.DEPLOYBOT_REPO_READ_WRITE_TOKEN }}
```
