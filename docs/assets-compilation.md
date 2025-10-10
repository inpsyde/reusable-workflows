# Assets compilation

> [!CAUTION]
> This workflow is deprecated and will be removed soon. Use `.github/workflows/build-and-distribute.yml` ([documentation](build-and-distribute.md)) instead.

This workflow utilizes
the [Composer Asset Compiler](https://github.com/inpsyde/composer-asset-compiler) to compile assets.
For details, refer
to [Pre-compilation](https://github.com/inpsyde/composer-asset-compiler#pre-compilation).

**Simplest possible example:**

```yml
name: Assets compilation
on:
  schedule:
    - cron: '0 0 * * 0'
jobs:
  assets-compilation:
    uses: inpsyde/reusable-workflows/.github/workflows/build-assets-compilation.yml@main
```

## Configuration parameters

### Inputs

| Name                  | Default                         | Description                                                     |
|-----------------------|---------------------------------|-----------------------------------------------------------------|
| `NODE_OPTIONS`        | `''`                            | Space-separated list of command-line Node options               |
| `NODE_VERSION`        | `18`                            | Node version with which the assets will be compiled             |
| `NPM_REGISTRY_DOMAIN` | `'https://npm.pkg.github.com/'` | Domain of the private npm registry                              |
| `PHP_VERSION`         | `'8.2'`                         | PHP version with which the assets compilation is to be executed |
| `COMPOSER_ARGS`       | `'--prefer-dist'`               | Set of arguments passed to Composer                             |
| `COMPILE_ASSETS_ARGS` | `'-v --env=root'`               | Set of arguments passed to Composer Asset Compiler              |

### Secrets

| Name                  | Description                                                                              |
|-----------------------|------------------------------------------------------------------------------------------|
| `COMPOSER_AUTH_JSON`  | Authentication for privately hosted packages and repositories as a JSON formatted object |
| `NPM_REGISTRY_TOKEN`  | Authentication for the private npm registry                                              |
| `GITHUB_USER_EMAIL`   | Email address for the GitHub user configuration                                          |
| `GITHUB_USER_NAME`    | Username for the GitHub user configuration                                               |
| `GITHUB_USER_SSH_KEY` | Private SSH key associated with the GitHub user passed as `GITHUB_USER_NAME`             |
| `ENV_VARS`            | Additional environment variables as a JSON formatted object                              |

**Example with configuration parameters:**

```yml
name: Assets compilation
on:
  schedule:
    - cron: '0 0 * * 0'
jobs:
  assets-compilation:
    uses: inpsyde/reusable-workflows/.github/workflows/build-assets-compilation.yml@main
    secrets:
      COMPOSER_AUTH_JSON: ${{ secrets.COMPOSER_AUTH_JSON }}
      NPM_REGISTRY_TOKEN: ${{ secrets.NPM_REGISTRY_TOKEN }}
      ENV_VARS: >-
        [{"name":"EXAMPLE_USERNAME", "value":"${{ secrets.USERNAME }}"}]
    with:
      COMPILE_ASSETS_ARGS: '-vv --env=root'
      NPM_REGISTRY_DOMAIN: 'https://registry.example.com/'
      NODE_VERSION: 14
```
