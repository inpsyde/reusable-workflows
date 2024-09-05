# Create plugin archive

This action can be used to create plugin archives in a controlled and isolated environment via
GitHub Actions.

To achieve that, the reusable workflow:

1. Installs dependencies (including dev-dependencies) defined in `composer.json`
2. Executes `inpsyde/composer-assets-compiler` if required & configured by the package
3. Executes `inpsyde/wp-translation-downloader` if required & configured by the package
4. Executes PHP-Scoper if configured by the package
5. Executes Rector if configured by the package
6. Re-installs dependencies without dev-dependencies
7. Sets current commit hash and plugin version in the plugin's main file
8. Runs `wp dist-archive` to create the final archive (with builtin support for a `.distignore`
   file)
9. Uploads it as an artifact for download or further processing

## Simple usage example

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
      PLUGIN_MAIN_FILE: my-plugin.php
      PLUGIN_VERSION: ${{ inputs.PACKAGE_VERSION }}
      PRE_SCRIPT: |
        echo 'hello world!';

```

## Configuration parameters

### Inputs

| Name                  | Default                                                       | Description                                                                                    |
|-----------------------|---------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| `NODE_OPTIONS`        | `''`                                                          | Space-separated list of command-line Node options                                              |
| `NODE_VERSION`        | `18`                                                          | Node version with which the assets will be compiled                                            |
| `NPM_REGISTRY_DOMAIN` | `'https://npm.pkg.github.com/'`                               | Domain of the private npm registry                                                             |
| `COMPOSER_ARGS`       | `'--no-dev --no-scripts --prefer-dist --optimize-autoloader'` | Set of arguments passed to Composer when gathering production dependencies                     |
| `PHP_VERSION`         | `'8.0'`                                                       | PHP version to use when gathering production dependencies                                      |
| `PHP_VERSION_BUILD`   | `'8.0'`                                                       | PHP version to use when executing build tools                                                  |
| `ARCHIVE_NAME`        | `''`                                                          | The name of the zip archive (falls back to the repository name)                                |
| `PLUGIN_MAIN_FILE`    | `'index.php'`                                                 | The name of the main plugin file                                                               |
| `PLUGIN_FOLDER_NAME`  | `''`                                                          | The name of the plugin folder (falls back to the archive name, if set, or the repository name) |
| `PLUGIN_VERSION`      | -                                                             | The new plugin version                                                                         |
| `PRE_SCRIPT`          | `''`                                                          | Run custom shell code before creating the release archive                                      |
| `COMPILE_ASSETS_ARGS` | `'-v --env=root'`                                             | Set of arguments passed to Composer Asset Compiler                                             |

#### A note on `PLUGIN_VERSION`

The workflow will accept any arbitrary string and will use it without validation or sanitization.
Adding this would mean reduced flexibility at increased complexity. Adding
standardization/validation is encouraged but should take place in the controlling workflow, where
the conventions and requirements of the project/team/client are known.

## Secrets

| Name                 | Description                                                                              |
|----------------------|------------------------------------------------------------------------------------------|
| `COMPOSER_AUTH_JSON` | Authentication for privately hosted packages and repositories as a JSON formatted object |
| `NPM_REGISTRY_TOKEN` | Authentication for the private npm registry                                              |
| `ENV_VARS`           | Additional environment variables as a JSON formatted object                              |
