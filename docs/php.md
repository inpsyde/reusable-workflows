# Reusable workflows – PHP

## Static code analysis

This workflow runs both [PHP_CodeSniffer](https://github.com/squizlabs/PHP_CodeSniffer)
and [Psalm](https://psalm.dev/). It does so by executing the binaries in the `./vendor/bin/` folder.

**Simplest possible example:**

```yml
name: Static code analysis PHP
on:
  pull_request:
jobs:
  static-analysis-php:
    uses: inpsyde/reusable-workflows/.github/workflows/php-static-analysis.yml@main
```

### Configuration parameters

#### Inputs

| Name            | Default                                                  | Description                                                       |
|-----------------|----------------------------------------------------------|-------------------------------------------------------------------|
| `PHP_VERSION`   | 7.4                                                      | PHP version with which the static code analysis is to be executed |
| `TARGET`        | `["phpcs", "psalm"]`                                     | Checks to be executed as a JSON formatted object                  |
| `COMPOSER_ARGS` | `'--prefer-dist'`                                        | Set of arguments passed to Composer                               |
| `PHPCS_ARGS`    | `'--report-full --report-checkstyle=./phpcs-report.xml'` | Set of arguments passed to PHP_CodeSniffer                        |
| `PSALM_ARGS`    | `'--output-format=github --no-cache'`                    | Set of arguments passed to Psalm                                  |
| `CS2PR_ARGS`    | `'--graceful-warnings ./phpcs-report.xml'`               | Set of arguments passed to cs2pr                                  |

#### Secrets

| Name                 | Description                                                                              |
|----------------------|------------------------------------------------------------------------------------------|
| `COMPOSER_AUTH_JSON` | Authentication for privately hosted packages and repositories as a JSON formatted object |

**Example with configuration parameters:**

```yml
name: Static code analysis PHP
on:
  pull_request:
jobs:
  static-analysis-php:
    uses: inpsyde/reusable-workflows/.github/workflows/php-static-analysis.yml@main
    secrets:
      COMPOSER_AUTH_JSON: ${{ secrets.COMPOSER_AUTH_JSON }}
    with:
      TARGET: >-
        ["phpcs"]
```

## PHPUnit tests

This workflow runs [PHPUnit](https://phpunit.de/). It does so by executing the binary in
the `./vendor/bin/` folder.

**Simplest possible example:**

```yml
name: Unit tests PHP
on:
  pull_request:
jobs:
  unit-tests-php:
    uses: inpsyde/reusable-workflows/.github/workflows/php-unit-tests.yml@main
```

### Configuration parameters

#### Inputs

| Name            | Default             | Description                                       |
|-----------------|---------------------|---------------------------------------------------|
| `PHP_MATRIX`    | `["7.4"]`           | Matrix of PHP versions as a JSON formatted object |
| `COMPOSER_ARGS` | `'--prefer-dist'`   | Set of arguments passed to Composer               |
| `PHPUNIT_ARGS`  | `'--coverage-text'` | Set of arguments passed to PHPUnit                |

#### Secrets

| Name                 | Description                                                                              |
|----------------------|------------------------------------------------------------------------------------------|
| `COMPOSER_AUTH_JSON` | Authentication for privately hosted packages and repositories as a JSON formatted object |

**Example with configuration parameters:**

```yml
name: Unit tests PHP
on:
  pull_request:
jobs:
  unit-tests-php:
    uses: inpsyde/reusable-workflows/.github/workflows/php-unit-tests.yml@main
    secrets:
      COMPOSER_AUTH_JSON: ${{ secrets.COMPOSER_AUTH_JSON }}
    with:
      PHP_MATRIX: >-
        ["7.4", "8.0", "8.1"]
      PHPUNIT_ARGS: '--coverage-text --debug'
```
