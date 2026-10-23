<!-- markdownlint-disable MD024 -->

# Reusable workflows – PHP

## Coding standards analysis

This workflow runs [PHP_CodeSniffer](https://github.com/squizlabs/PHP_CodeSniffer). It does so by
executing the binary resolved via `composer config bin-dir`.

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

| Name             | Default                                                  | Description                                                                    |
|------------------|----------------------------------------------------------|--------------------------------------------------------------------------------|
| `PHP_VERSION`    | `'8.2'`                                                  | PHP version with which the scripts are executed                                |
| `PHP_EXTENSIONS` | `''`                                                     | PHP extensions supported by shivammathur/setup-php to be installed or disabled |
| `COMPOSER_ARGS`  | `'--prefer-dist'`                                        | Set of arguments passed to Composer                                            |
| `PHPCS_ARGS`     | `'--report-full --report-checkstyle=./phpcs-report.xml'` | Set of arguments passed to PHP_CodeSniffer                                     |
| `CS2PR_ARGS`     | `'--graceful-warnings ./phpcs-report.xml'`               | Set of arguments passed to cs2pr                                               |

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

This workflow runs either [Psalm](https://psalm.dev/) or [PHPStan](https://phpstan.org/), or both, based on the
existence of a supported configuration file in your repository root folder.

It does so by executing the binary resolved via `composer config bin-dir`.

**Supported configuration files:**

| Tool    | Files                                                    |
|---------|----------------------------------------------------------|
| Psalm   | `psalm.xml`, `psalm.xml.dist`                            |
| PHPStan | `phpstan.dist.neon`, `phpstan.neon`, `phpstan.neon.dist` |

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

| Name             | Default                               | Description                                                                    |
|------------------|---------------------------------------|--------------------------------------------------------------------------------|
| `PHP_VERSION`    | `'8.2'`                               | PHP version with which the scripts are executed                                |
| `PHP_EXTENSIONS` | `''`                                  | PHP extensions supported by shivammathur/setup-php to be installed or disabled |
| `COMPOSER_ARGS`  | `'--prefer-dist'`                     | Set of arguments passed to Composer                                            |
| `PSALM_ARGS`     | `'--output-format=github --no-cache'` | Set of arguments passed to Psalm                                               |
| `PHPSTAN_ARGS`   | `'--no-progress --memory-limit=1G'`   | Set of arguments passed to PHPStan                                             |

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

This workflow runs [PHPUnit](https://phpunit.de/). It does so by executing the binary resolved via
`composer config bin-dir`.

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

| Name             | Default             | Description                                                                    |
|------------------|---------------------|--------------------------------------------------------------------------------|
| `PHP_VERSION`    | `'8.2'`             | PHP version with which the scripts are executed                                |
| `PHP_EXTENSIONS` | `''`                | PHP extensions supported by shivammathur/setup-php to be installed or disabled |
| `COMPOSER_ARGS`  | `'--prefer-dist'`   | Set of arguments passed to Composer                                            |
| `PHPUNIT_ARGS`   | `'--coverage-text'` | Set of arguments passed to PHPUnit                                             |

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

## Integration tests PHP

This workflow runs [PHPUnit](https://phpunit.de/) with the integration test configuration. It does
so by executing the binary resolved via `composer config bin-dir`.

The project must have a `phpunit-integration.xml.dist` file in the root directory. If the file is
missing, the workflow fails before it builds the assets and installs the dependencies.

Before the tests, the workflow installs the npm dependencies and runs `npm run build --if-present`.
This makes the compiled assets (for example, `blocks-manifest.php`) available to the tests. If the
project has no `build` script, the workflow skips the build.

**Simplest possible example:**

```yml
name: Integration tests PHP
on:
  push:
  pull_request:
jobs:
  tests-integration-php:
    uses: inpsyde/reusable-workflows/.github/workflows/tests-integration-php.yml@main
```

### Configuration parameters

#### Inputs

| Name                  | Default                         | Description                                                                    |
|-----------------------|---------------------------------|--------------------------------------------------------------------------------|
| `PHP_VERSION`         | `'8.2'`                         | PHP version with which the scripts are executed                                |
| `PHP_EXTENSIONS`      | `''`                            | PHP extensions supported by shivammathur/setup-php to be installed or disabled |
| `COMPOSER_ARGS`       | `'--prefer-dist'`               | Set of arguments passed to Composer                                            |
| `PHPUNIT_ARGS`        | `'--no-coverage'`               | Set of arguments passed to PHPUnit                                             |
| `NODE_VERSION`        | `'24'`                          | Node version with which the assets are built                                   |
| `NPM_REGISTRY_DOMAIN` | `'https://npm.pkg.github.com/'` | Domain of the private npm registry                                             |

#### Secrets

| Name                  | Description                                                                              |
|-----------------------|------------------------------------------------------------------------------------------|
| `COMPOSER_AUTH_JSON`  | Authentication for privately hosted packages and repositories as a JSON formatted object |
| `ENV_VARS`            | Additional environment variables as a JSON formatted object                              |
| `NPM_REGISTRY_TOKEN`  | Authentication for the private npm registry                                              |
| `GITHUB_USER_EMAIL`   | Email address for the GitHub user configuration                                          |
| `GITHUB_USER_NAME`    | Username for the GitHub user configuration                                               |
| `GITHUB_USER_SSH_KEY` | Private SSH key associated with the GitHub user passed as `GITHUB_USER_NAME`             |

**Example with configuration parameters:**

```yml
name: Integration tests PHP
on:
  push:
  pull_request:
jobs:
  tests-integration-php:
    strategy:
      fail-fast: false
      matrix:
        wp: [ "6.9", "7.1" ]
    uses: inpsyde/reusable-workflows/.github/workflows/tests-integration-php.yml@main
    secrets:
      COMPOSER_AUTH_JSON: ${{ secrets.COMPOSER_AUTH_JSON }}
      NPM_REGISTRY_TOKEN: ${{ secrets.NPM_REGISTRY_TOKEN }}
      ENV_VARS: >-
        [{"name":"WP_CORE_VERSION", "value":"${{ matrix.wp }}"}]
    with:
      PHPUNIT_ARGS: '--coverage-text'
```

**Note**: The environment variables from `ENV_VARS` are set before the asset build, so the build
and the tests can both use them.

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

| Name                    | Default                                 | Description                                                                    |
|-------------------------|-----------------------------------------|--------------------------------------------------------------------------------|
| `PHP_VERSION`           | `'8.2'`                                 | PHP version with which the scripts are executed                                |
| `PHP_EXTENSIONS`        | `''`                                    | PHP extensions supported by shivammathur/setup-php to be installed or disabled |
| `COMPOSER_ARGS`         | `'--prefer-dist'`                       | Set of arguments passed to Composer                                            |
| `LINT_ARGS`             | `'-e php --colors --show-deprecated .'` | Set of arguments passed to PHP Parallel Lint                                   |
| `COMPOSER_DEPS_INSTALL` | `false`                                 | Whether or not to install Composer dependencies before linting                 |

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
