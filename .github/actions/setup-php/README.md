# Setup PHP

This composite action sets up PHP using [shivammathur/setup-php](https://github.com/shivammathur/setup-php), validates `composer.json`/`composer.lock`, and installs Composer dependencies via [ramsey/composer-install](https://github.com/ramsey/composer-install).

## Simple usage example

```yml
steps:
  - uses: actions/checkout@v4
  - uses: ./.github/actions/setup-php
    with:
      composer-auth-json: ${{ secrets.COMPOSER_AUTH_JSON }}
```

## Inputs

| Name                 | Default           | Description                                                                               |
|----------------------|-------------------|-------------------------------------------------------------------------------------------|
| `php-version`        | `'8.2'`           | PHP version to set up.                                                                    |
| `php-extensions`     | `''`              | PHP extensions to install or disable.                                                     |
| `php-tools`          | `'composer'`      | PHP tools to install (e.g. `composer`, `cs2pr`, `parallel-lint`).                         |
| `coverage`           | `'none'`          | Code coverage driver (`none`, `xdebug`, `pcov`, or empty for default).                    |
| `composer-install`   | `'true'`          | Whether to validate and install Composer dependencies (`'true'` or `'false'`).            |
| `composer-options`   | `'--prefer-dist'` | Arguments passed to Composer install.                                                     |
| `composer-auth-json` | `''`              | Authentication for privately hosted packages and repositories as a JSON formatted object. |

## Notes

- When `composer-install` is `'true'`, `composer validate` runs automatically before installing dependencies. This ensures that `composer.json` and `composer.lock` are consistent.
