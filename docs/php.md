<!-- markdownlint-disable MD024 -->

# Reusable workflows – PHP

## Coding standards analysis

This workflow runs [PHP_CodeSniffer](https://github.com/squizlabs/PHP_CodeSniffer). It does so by
executing the binary in the `./vendor/bin/` folder.

**Simplest possible example:**

```yml
name: Coding standards analysis PHP
on:
  push:
  pull_request:
jobs:
  coding-standards-analysis-php:
    uses: inpsyde/reusable-workflows/.github/workflows/coding-standards-php.yml@main
```

### Configuration parameters

#### Inputs

| Name            | Default                                                  | Description                                     |
|-----------------|----------------------------------------------------------|-------------------------------------------------|
| `PHP_VERSION`   | `'8.2'`                                                  | PHP version with which the scripts are executed |
| `COMPOSER_ARGS` | `'--prefer-dist'`                                        | Set of arguments passed to Composer             |
| `PHPCS_ARGS`    | `'--report-full --report-checkstyle=./phpcs-report.xml'` | Set of arguments passed to PHP_CodeSniffer      |
| `CS2PR_ARGS`    | `'--graceful-warnings ./phpcs-report.xml'`               | Set of arguments passed to cs2pr                |

#### Secrets

| Name                 | Description                                                                              |
|----------------------|------------------------------------------------------------------------------------------|
| `COMPOSER_AUTH_JSON` | Authentication for privately hosted packages and repositories as a JSON formatted object |
| `ENV_VARS`           | Additional environment variables as a JSON formatted object                              |

**Example with configuration parameters:**

```yml
name: Coding standards analysis PHP
on:
  push:
  pull_request:
jobs:
  coding-standards-analysis-php:
    uses: inpsyde/reusable-workflows/.github/workflows/coding-standards-php.yml@main
    secrets:
      COMPOSER_AUTH_JSON: ${{ secrets.COMPOSER_AUTH_JSON }}
      ENV_VARS: >-
        [{"name":"EXAMPLE_USERNAME", "value":"${{ secrets.USERNAME }}"}]
    with:
      PHPCS_ARGS: '--report=summary'
```

**Note**: Coding _standards_ analysis should only be performed with the highest supported PHP
version. Use the [Lint PHP](#lint-php) workflow to check code _compatibility_ with multiple PHP
versions.

## Static code analysis

This workflow runs [Psalm](https://psalm.dev/). It does so by executing the binary in
the `./vendor/bin/` folder.

**Simplest possible example:**

```yml
name: Static code analysis PHP
on:
  push:
  pull_request:
jobs:
  static-code-analysis-php:
    uses: inpsyde/reusable-workflows/.github/workflows/static-analysis-php.yml@main
```

### Configuration parameters

#### Inputs

| Name            | Default                               | Description                                     |
|-----------------|---------------------------------------|-------------------------------------------------|
| `PHP_VERSION`   | `'8.2'`                               | PHP version with which the scripts are executed |
| `COMPOSER_ARGS` | `'--prefer-dist'`                     | Set of arguments passed to Composer             |
| `PSALM_ARGS`    | `'--output-format=github --no-cache'` | Set of arguments passed to Psalm                |

#### Secrets

| Name                 | Description                                                                              |
|----------------------|------------------------------------------------------------------------------------------|
| `COMPOSER_AUTH_JSON` | Authentication for privately hosted packages and repositories as a JSON formatted object |
| `ENV_VARS`           | Additional environment variables as a JSON formatted object                              |

**Example with configuration parameters:**

```yml
name: Static code analysis PHP
on:
  push:
  pull_request:
jobs:
  static-code-analysis-php:
    uses: inpsyde/reusable-workflows/.github/workflows/static-analysis-php.yml@main
    secrets:
      COMPOSER_AUTH_JSON: ${{ secrets.COMPOSER_AUTH_JSON }}
      ENV_VARS: >-
        [{"name":"EXAMPLE_USERNAME", "value":"${{ secrets.USERNAME }}"}]
    with:
      PSALM_ARGS: '--threads=3'
```

**Note**: Static code analysis can only be performed with a specific PHP version and not in a PHP
matrix, as it should always be tested with the highest PHP version in use. To check compatibility
with multiple PHP versions, use the [Lint PHP](#lint-php) workflow.

## Unit tests PHP

This workflow runs [PHPUnit](https://phpunit.de/). It does so by executing the binary in
the `./vendor/bin/` folder.

**Simplest possible example:**

```yml
name: Unit tests PHP
on:
  push:
  pull_request:
jobs:
  tests-unit-php:
    uses: inpsyde/reusable-workflows/.github/workflows/tests-unit-php.yml@main
```

### Configuration parameters

#### Inputs

| Name            | Default             | Description                                     |
|-----------------|---------------------|-------------------------------------------------|
| `PHP_VERSION`   | `'8.2'`             | PHP version with which the scripts are executed |
| `COMPOSER_ARGS` | `'--prefer-dist'`   | Set of arguments passed to Composer             |
| `PHPUNIT_ARGS`  | `'--coverage-text'` | Set of arguments passed to PHPUnit              |

#### Secrets

| Name                 | Description                                                                              |
|----------------------|------------------------------------------------------------------------------------------|
| `COMPOSER_AUTH_JSON` | Authentication for privately hosted packages and repositories as a JSON formatted object |
| `ENV_VARS`           | Additional environment variables as a JSON formatted object                              |

**Example with configuration parameters:**

```yml
name: Unit tests PHP
on:
  push:
  pull_request:
jobs:
  tests-unit-php:
    strategy:
      matrix:
        php: [ "8.1", "8.2", "8.3" ]
    uses: inpsyde/reusable-workflows/.github/workflows/tests-unit-php.yml@main
    with:
      PHP_VERSION: ${{ matrix.php }}
      PHPUNIT_ARGS: '--coverage-text --debug'
```

## Lint PHP

This workflow runs [PHP Parallel Lint](https://github.com/php-parallel-lint/PHP-Parallel-Lint).

**Simplest possible example:**

```yml
name: Lint PHP
on:
  push:
  pull_request:
jobs:
  lint-php:
    uses: inpsyde/reusable-workflows/.github/workflows/lint-php.yml@main
```

### Configuration parameters

#### Inputs

| Name                    | Default                                 | Description                                                    |
|-------------------------|-----------------------------------------|----------------------------------------------------------------|
| `PHP_VERSION`           | `'8.2'`                                 | PHP version with which the scripts are executed                |
| `COMPOSER_ARGS`         | `'--prefer-dist'`                       | Set of arguments passed to Composer                            |
| `LINT_ARGS`             | `'-e php --colors --show-deprecated .'` | Set of arguments passed to PHP Parallel Lint                   |
| `COMPOSER_DEPS_INSTALL` | `false`                                 | Whether or not to install Composer dependencies before linting |

#### Secrets

| Name                 | Description                                                                              |
|----------------------|------------------------------------------------------------------------------------------|
| `COMPOSER_AUTH_JSON` | Authentication for privately hosted packages and repositories as a JSON formatted object |
| `ENV_VARS`           | Additional environment variables as a JSON formatted object                              |

**Example with configuration parameters:**

```yml
name: Lint PHP
on:
  push:
  pull_request:
jobs:
  lint-php:
    uses: inpsyde/reusable-workflows/.github/workflows/lint-php.yml@main
    secrets:
      COMPOSER_AUTH_JSON: ${{ secrets.COMPOSER_AUTH_JSON }}
      ENV_VARS: >-
        [{"name":"EXAMPLE_USERNAME", "value":"${{ secrets.USERNAME }}"}]
    with:
      PHP_VERSION: '8.1'
      LINT_ARGS: '. --exclude vendor'
      COMPOSER_DEPS_INSTALL: true
```

**Example with `PHP_VERSION` in matrix:**

```yml
name: Lint PHP
on:
  push:
  pull_request:
jobs:
  lint-php:
    strategy:
      matrix:
        php: [ "8.1", "8.2", "8.3" ]
    uses: inpsyde/reusable-workflows/.github/workflows/lint-php.yml@main
    with:
      PHP_VERSION: ${{ matrix.php }}
```
