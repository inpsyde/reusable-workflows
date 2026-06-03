# Check plugin archive

This workflow runs some checks on the plugin archive to make sure that everything is ok (especially important if processing the source code via php-scoper or Rector).

Usually it should be run after the [archive creation workflow](/docs/archive-creation.md).

It executes
- [Parallel Lint](https://github.com/php-parallel-lint/PHP-Parallel-Lint) to check the PHP syntax
- [Plugin Check](https://github.com/WordPress/plugin-check) PHP_CodeSniffer rules, as well as optionally other WordPress sniffs.


## Simple usage example:

```yml
name: Create and check release package
on:
  workflow_dispatch:
jobs:
  create_archive:
    uses: inpsyde/reusable-workflows/.github/workflows/build-plugin-archive.yml@main
  check_archive:
    uses: inpsyde/reusable-workflows/.github/workflows/check-plugin-archive.yml@main
    needs: create_archive
    with:
      ARTIFACT: ${{ needs.create_archive.outputs.artifact }}
      PHP_VERSION: '7.4'
```

## Configuration parameters

### Inputs

| Name                   | Default                                       | Description                                                                                    |
|------------------------|-----------------------------------------------|------------------------------------------------------------------------------------------------|
| `ARTIFACT`             |                                               | The name of the generated artifact, usually the output of the archive creation workflow.       |
| `PLUGIN_FOLDER_NAME`   | `''`                                          | The name of the plugin folder (falls back to the repository name).                             |
| `EXCLUDED_SNIFFS`      | `'WordPress.WP.AlternativeFunctions'`         | The comma-separated list of excluded sniffs.                                                   |
| `ADDITIONAL_WP_SNIFFS` | `'WordPress.WP.I18n'`                         | The comma-separated list of additional sniffs to run.                                          |
| `COMPOSER_ARGS`        | `'--no-dev --prefer-dist'`                    | The arguments passed to Composer when installing dependencies.                                 |
| `PHP_VERSION`          | `'7.4'`                                       | The PHP version to use.                                                                        |
