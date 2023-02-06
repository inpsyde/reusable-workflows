# Create archive

This action can be used to create plugin/theme archives in a controlled and isolated environment via GitHub Actions.

To achieve that, the reusable workflow:

1. installs dependencies (including dev-dependencies) defined in `composer.json`
2. executes `inpsyde/composer-assets-compiler` if required & configured by the package
3. executes `inpsyde/wp-translation-downloader` if required & configured by the package
4. re-installs composer dependencies without de-dependencies
5. runs `wp dist-archive` to create the final archive (with builtin support for a `.distignore` file)


## Simple usage example:

```yml
name: Create release package
on:
  workflow_dispatch:
    inputs:
      PACKAGE_VERSION:
        description: 'Package Version'
        required: true
jobs:
  create_archive:
    uses: inpsyde/reusable-workflows/.github/workflows/build-plugin-archive.yml@main
    secrets:
      COMPOSER_AUTH_JSON: ${{ secrets.PACKAGIST_AUTH_JSON }}
    with:
      PLUGIN_MAIN_FILE: ./my-plugin.php
      PLUGIN_VERSION: ${{ inputs.PACKAGE_VERSION }}
      #EXTRA_PHP_FILE: ./config/archive.php
      EXTRA_PHP: |
        echo 'hello world!';

```

## Configuration parameters

### Inputs

| Name                  | Default                                                       | Description                                                             |
|-----------------------|---------------------------------------------------------------|-------------------------------------------------------------------------|
| `PLUGIN_MAIN_FILE`    | `"./index.php"`                                               | The path/name of the plugin main file.                                  |
| `PLUGIN_VERSION`      | -                                                             | The plugin version                                                      |
| `COMPOSER_ARGS_DEV`   | `'--prefer-dist'`                                             | Set of arguments passed to Composer for build setup.                    |
| `COMPOSER_ARGS`       | `'--no-dev --no-scripts --prefer-dist --optimize-autoloader'` | Set of arguments passed to Composer for production setup.               |
| `NODE_VERSION`        | `"16"`                                                        | Node version with which the assets will be compiled                     |
| `NPM_REGISTRY_DOMAIN` | `"https://npm.pkg.github.com/"`                               | Domain of the private npm registry                                      |
| `EXTRA_PHP_FILE`      | `""`                                                          | Path to a custom php script to run before creating the release archive. |
| `EXTRA_PHP`           | `""`                                                          | Run custom php code before creating the release archive.                |


## Secrets

| Name                 | Description                                                                              |
|----------------------|------------------------------------------------------------------------------------------|
| `NPM_REGISTRY_TOKEN` | Authentication for the private npm registry                                              |
| `COMPOSER_AUTH_JSON` | Authentication for privately hosted packages and repositories as a JSON formatted object |
| `ENV_VARS`           | Additional environment variables as a JSON formatted object.                             |
