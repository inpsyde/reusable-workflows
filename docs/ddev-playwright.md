# Run Playwright tests using the project's DDEV setup

This reusable workflow:

1. Launches DDEV.
2. Runs the provided command to setup the environment (install WP, plugins, ...), such as `ddev orchestrate` from [inpsyde/ddev-wordpress-plugin-template](https://github.com/inpsyde/ddev-wordpress-plugin-template).
3. If Ngrok auth token is provided, setups Ngrok. Ngrok can be needed if the website must be accessed by some third-party service, e.g. webhooks.
   1. Launches Ngrok, by default using `vendor/bin/ddev-share` from [inpsyde/ddev-tools](https://github.com/inpsyde/ddev-tools).
   2. Saves the URL to the specified env variable, by default `BASEURL`.
4. Installs Playwright and its deps via the provided command, such as `yarn install && yarn playwright install --with-deps` or `ddev pw-install-host` from [inpsyde/ddev-wordpress-plugin-template](https://github.com/inpsyde/ddev-wordpress-plugin-template).
5. Runs Playwright tests via the provided command, such as `yarn playwright test` or `ddev pw-host test` from [inpsyde/ddev-wordpress-plugin-template](https://github.com/inpsyde/ddev-wordpress-plugin-template).

It is possible to add any env variables for the "host" and for DDEV.

The "host" env variables (`ENV_VARS`) can be used in the tests (Playwright runs outside of DDEV), such as user credentials, card numbers.
To keep things simple and avoid passing hundreds of variables,
consider using some kind of `.env` file, and commit `.env.example` with usable defaults for parameters that do not have to be secret,
then add `cp .env.example .env` in `PLAYWRIGHT_INSTALL_CMD` (`ddev pw-install-host` already includes it).

The DDEV env variables (`DDEV_ENV_VARS`) can be used for debug flags of your project needed for the tests to run properly 
(e.g. using placeholder product images or non-live mode).

Also, it is possible to change some DDEV config values, such as the PHP version (`PHP_VERSION`).

## Usage example:

```yml
name: Run Playwright tests via DDEV
on:
  push:
jobs:
  ddev-playwright:
    uses: inpsyde/reusable-workflows/.github/workflows/ddev-playwright.yml@main
    secrets:
      COMPOSER_AUTH_JSON: ${{ secrets.PACKAGIST_AUTH_JSON }}
      NGROK_AUTH_TOKEN: ${{ secrets.NGROK_AUTH_TOKEN }}
      ENV_VARS: >-
        [
          {"name": "SOME_USERNAME", "value": "${{ secrets.SOME_USERNAME }}"},
          {"name": "SOME_PASSWORD", "value": "${{ secrets.SOME_PASSWORD }}"}
        ]
      DDEV_ENV_VARS: >-
        [
          {"name": "SOME_DEBUG_FLAG", "value": "true"}
        ]
    with:
      DDEV_ORCHESTRATE_CMD: ddev orchestrate
      PLAYWRIGHT_INSTALL_CMD: ddev pw-install-host
      PLAYWRIGHT_RUN_CMD: ddev pw-host test
```

## Configuration parameters

### Inputs

| Name                     | Default                   | Description                                                                                                                                                                                                                                           |
|--------------------------|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `PHP_VERSION`            | `""`                      | PHP version which will override the version set in the DDEV config.                                                                                                                                                                                   |
| `NODE_VERSION`           | `""`                      | Node.js version which will override the version set in the DDEV config.                                                                                                                                                                               |
| `DDEV_ORCHESTRATE_CMD`   | `""`                      | The command for setting up the DDEV website, such as `ddev orchestrate` from [inpsyde/ddev-wordpress-plugin-template](https://github.com/inpsyde/ddev-wordpress-plugin-template).                                                                     |
| `PLAYWRIGHT_INSTALL_CMD` | `""`                      | The command for installing Playwright and its deps, such as `yarn install && yarn playwright install --with-deps` or `ddev pw-install-host` from [inpsyde/ddev-wordpress-plugin-template](https://github.com/inpsyde/ddev-wordpress-plugin-template). |
| `PLAYWRIGHT_RUN_CMD`     | `""`                      | The command for running Playwright tests, such as `yarn playwright test` or `ddev pw-host test` from [inpsyde/ddev-wordpress-plugin-template](https://github.com/inpsyde/ddev-wordpress-plugin-template).                                             |
| `NGROK_START_CMD`        | `"vendor/bin/ddev-share"` | The command for starting Ngrok, such as `ddev-share` from [inpsyde/ddev-tools](https://github.com/inpsyde/ddev-tools).                                                                                                                                |
| `BASEURL_ENV_NAME`       | `"BASEURL"`               | The name of the env variable with the base URL for Playwright. Used for overwriting it with the URL from Ngrok.                                                                                                                                       |

## Secrets

| Name                 | Description                                                                               |
|----------------------|-------------------------------------------------------------------------------------------|
| `NPM_REGISTRY_TOKEN` | Authentication for the private npm registry.                                              |
| `COMPOSER_AUTH_JSON` | Authentication for privately hosted packages and repositories as a JSON formatted object. |
| `ENV_VARS`           | Additional environment variables as a JSON formatted object.                              |
| `DDEV_ENV_VARS`      | Additional environment variables for DDEV as a JSON formatted object.                     |
| `NGROK_AUTH_TOKEN`   | The auth token for Ngrok. If not provided, skips Ngrok.                                   |