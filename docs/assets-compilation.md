# Assets compilation

This workflow utilizes the [Composer Asset Compiler](https://github.com/inpsyde/composer-asset-compiler) to compile assets. For details, refer to https://github.com/inpsyde/composer-asset-compiler#pre-compilation.

**Simplest possible example:**

```yml
name: Assets compilation
on:
  schedule:
    - cron: '0 0 * * 0'
jobs:
  assets-compilation:
    uses: inpsyde/reusable-workflows/.github/workflows/assets-compilation.yml@main
```

### Configuration parameters

#### Inputs

| Name                  | Default                       | Description                                         |
|-----------------------|-------------------------------|-----------------------------------------------------|
| `NPM_REGISTRY_DOMAIN` | `https://npm.pkg.github.com/` | Domain of the private npm registry                  |
| `NODE_VERSION`        | 16                            | Node version with which the assets will be compiled |
| `COMPOSER_ARGS`       | `'--prefer-dist'`             | Set of arguments passed to Composer                 |
| `COMPILE_ASSETS_ARGS` | `'-v --env=root'`             | Set of arguments passed to Composer Asset Compiler  |

#### Secrets

| Name                 | Description                                                                              |
|----------------------|------------------------------------------------------------------------------------------|
| `COMPOSER_AUTH_JSON` | Authentication for privately hosted packages and repositories as a JSON formatted object |
| `NPM_REGISTRY_TOKEN` | Authentication for the private npm registry.                                             |

**Example with configuration parameters:**

```yml
name: Assets compilation
on:
  schedule:
    - cron: '0 0 * * 0'
jobs:
  assets-compilation:
    uses: inpsyde/reusable-workflows/.github/workflows/assets-compilation.yml@main
    secrets:
      COMPOSER_AUTH_JSON: ${{ secrets.COMPOSER_AUTH_JSON }}
      NPM_REGISTRY_TOKEN: ${{ secrets.NPM_REGISTRY_TOKEN }}
    with:
      COMPOSER_VERBOSITY: '-vv'
      NPM_REGISTRY_DOMAIN: 'https://registry.example.com/'
      NODE_VERSION: 14
```
