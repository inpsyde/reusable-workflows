# Playwright test

This workflow executes Playwright-based tests in a controlled and isolated environment via GitHub Actions.

The workflow can:

- execute a building step, both for node and PHP environments (if the PHP version is provided and a `composer.json` file is present)
- compile frontend assets via `npm run build` (skipped gracefully if no `build` script is defined in `package.json`)
- cache the Playwright browser binaries across runs, keyed on the lockfile and the requested browser set, so browsers are downloaded only when the Playwright version changes
- create an environment variables file named `.env.ci` dedicated to the test step; load this file using `dotenv-ci` directly in your test script, e.g., `./node_modules/.bin/dotenv -e .env.ci -- npm run e2e`. The file is also sourced before `PRE_SCRIPT`, making all variables available as environment variables
- execute the tests using Playwright via a custom npm script
- upload the artifacts
- optionally start an [ngrok](https://ngrok.com/) tunnel for webhook delivery to `wp-env` environments (when `NGROK_AUTH_TOKEN` is provided)
- optionally append test reporting variables (`TESTRAIL_PLAN_ID`, `TESTRAIL_RUN_ID`, `XRAY_TEST_EXEC_KEY`) to `.env.ci` for integration with TestRail or Xray

**Simplest possible example:**

```yml
name: E2E Testing

on:
  workflow_dispatch:
jobs:
  e2e-playwright:
    uses: inpsyde/reusable-workflows/.github/workflows/test-playwright.yml@main
    with:
      PLAYWRIGHT_ARTIFACT_PATH: './artifacts'
      PLAYWRIGHT_SCRIPT: 'ci-test-e2e'
```

## Configuration parameters

### Inputs

| Name                                        | Default                         | Description                                                                                                         |
|---------------------------------------------|---------------------------------|---------------------------------------------------------------------------------------------------------------------|
| `PLAYWRIGHT_ARTIFACT_INCLUDE_HIDDEN_FILES`  | `false`                         | Whether to include hidden files in the artifact                                                                     |
| `PLAYWRIGHT_ARTIFACT_NAME`                  | `'artifact'`                    | Name for the artifact                                                                                               |
| `PLAYWRIGHT_ARTIFACT_OVERWRITE`             | `false`                         | Determine if an artifact with a matching name will be deleted before a new one is uploaded or not                   |
| `PLAYWRIGHT_ARTIFACT_PATH`                  |                                 | A file, directory or wildcard pattern that describes what to upload                                                 |
| `PLAYWRIGHT_ARTIFACT_RETENTION_DAYS`        | `30`                            | Duration after which artifact will expire in day                                                                    |
| `COMPOSER_DEPS_INSTALL`                     | `false`                         | Whether to install Composer dependencies                                                                            |
| `NGROK_DOMAIN`                              | `''`                            | Reserved ngrok domain for the tunnel (paid account). Required when `NGROK_AUTH_TOKEN` is provided                   |
| `NODE_VERSION`                              | `24`                            | Node version with which the node script will be executed                                                            |
| `NPM_REGISTRY_DOMAIN`                       | `'https://npm.pkg.github.com/'` | Domain of the private npm registry                                                                                  |
| `PHP_VERSION`                               | `'8.2'`                         | PHP version with which the dependencies are installed                                                               |
| `PHP_EXTENSIONS`                            | `''`                            | PHP extensions supported by shivammathur/setup-php to be installed or disabled                                      |
| `PLAYWRIGHT_BROWSER_ARGS`                   | `'--with-deps'`                 | Set of arguments passed to `npx playwright install`. Must include `--with-deps`; see [Browser caching](#browser-caching) |
| `PRE_SCRIPT`                                | `''`                            | Run custom shell code before executing the test script. `GH_TOKEN` and all `ENV_FILE_DATA` variables are available  |
| `PLAYWRIGHT_SCRIPT`                         | `''`                            | The name of a custom npm script to run the tests                                                                    |
| `TESTRAIL_PLAN_ID`                          | `''`                            | TestRail plan ID for reporting. When set, appended to `.env.ci`                                                     |
| `TESTRAIL_RUN_ID`                           | `''`                            | TestRail run ID for reporting. When set, appended to `.env.ci`                                                      |
| `XRAY_TEST_EXEC_KEY`                        | `''`                            | Xray test execution key for reporting. When set, appended to `.env.ci`                                              |


### Secrets

| Name                  | Description                                                                              |
|-----------------------|------------------------------------------------------------------------------------------|
| `COMPOSER_AUTH_JSON`  | Authentication for privately hosted packages and repositories as a JSON formatted object |
| `ENV_FILE_DATA`       | Additional environment variables for the tests. Also sourced before `PRE_SCRIPT`         |
| `GITHUB_USER_EMAIL`   | Email address for the GitHub user configuration                                          |
| `GITHUB_USER_NAME`    | Username for the GitHub user configuration                                               |
| `GITHUB_USER_SSH_KEY` | Private SSH key associated with the GitHub user passed as `GITHUB_USER_NAME`             |
| `NGROK_AUTH_TOKEN`    | Ngrok auth token. When set, ngrok is installed and a tunnel is started before tests run  |
| `NPM_REGISTRY_TOKEN`  | Authentication for the private npm registry                                              |

## Browser caching

The workflow caches the Playwright browser binaries (`~/.cache/ms-playwright`) between runs so they are downloaded only when they actually change, rather than on every push.

- **Cache key.** The key combines the runner OS, a hash of the lockfile (`package-lock.json` / `npm-shrinkwrap.json`), and the value of `PLAYWRIGHT_BROWSER_ARGS`. The lockfile acts as a proxy for the Playwright version, so the cache turns over automatically when Playwright is upgraded. Including the browser args means callers requesting different browser sets (e.g. `chromium` vs. the full set) never share the same entry.
- **Cache miss.** `npx playwright install <PLAYWRIGHT_BROWSER_ARGS>` runs, downloading the browser binaries and their system libraries together, and populates the cache.
- **Cache hit.** The binaries are restored from cache, but the system libraries - installed via `apt`, so they never land in `~/.cache/ms-playwright` - still have to be installed on each fresh runner. The workflow runs `npx playwright install-deps <browser>` (system libraries only, no download) for this. The browser name is parsed out of `PLAYWRIGHT_BROWSER_ARGS` by stripping `--with-deps`; if nothing remains, dependencies for all browsers are installed.

Because the system-library step keys off `--with-deps`, **`PLAYWRIGHT_BROWSER_ARGS` should always include `--with-deps`** (as the default does). On a cache miss it ensures the libraries are downloaded alongside the browsers; on a hit it is stripped so only `install-deps` runs.

The caching is fully internal - there are no additional inputs to set, and callers do not need to change anything. It assumes standard `apt` mirror access, which GitHub-hosted runners provide; on a restricted-network or self-hosted runner, confirm that access first.

## Ngrok tunnel

When `NGROK_AUTH_TOKEN` is provided, the workflow automatically:

1. Installs ngrok on the runner.
2. Starts an HTTPS tunnel to port 80 using the reserved domain from `NGROK_DOMAIN`.
3. Updates `WP_SITEURL`, `WP_HOME` (via `wp-env`) and `WP_BASE_URL` (in `.env.ci`) to the tunnel URL.

This runs **after** `wp-env` boots and **before** `PRE_SCRIPT`, so webhooks from external services (e.g. payment gateways) can reach the test environment.

Requires a [paid ngrok account](https://ngrok.com/pricing) with a reserved domain.

## Test reporting

The workflow supports optional integration with TestRail and Xray. When any of the following inputs are provided, they are appended to `.env.ci` with the same name, making them available to your test runner and reporters:

- `TESTRAIL_PLAN_ID` - TestRail plan ID
- `TESTRAIL_RUN_ID` - TestRail run ID
- `XRAY_TEST_EXEC_KEY` - Xray test execution key

These are regular workflow inputs (not secrets), so they can be passed directly from `workflow_dispatch` inputs for on-demand runs.

## Example with configuration parameters

```yml
name: E2E Testing

on:
  workflow_dispatch:
jobs:
  e2e-playwright:
    uses: inpsyde/reusable-workflows/.github/workflows/test-playwright.yml@main
    strategy:
      matrix:
        php: [ '8.2', '8.3' ]
    with:
      PLAYWRIGHT_ARTIFACT_PATH: |
        artifacts/*
        playwright-report/
      PLAYWRIGHT_ARTIFACT_INCLUDE_HIDDEN_FILES: true
      PLAYWRIGHT_SCRIPT: 'ci-test-e2e'
      COMPOSER_DEPS_INSTALL: true
      PHP_VERSION: ${{ matrix.php }}
      NODE_VERSION: 20
      PLAYWRIGHT_BROWSER_ARGS: 'chromium --with-deps'
      PRE_SCRIPT: |
        echo "Starting custom logic..."
    secrets:
      ENV_FILE_DATA: ${{ secrets.ENV_FILE_DATA }}
      COMPOSER_AUTH_JSON: '${{ secrets.PACKAGIST_AUTH_JSON }}'
      GITHUB_USER_EMAIL: ${{ secrets.DEPLOYBOT_EMAIL }}
      GITHUB_USER_NAME: ${{ secrets.DEPLOYBOT_USER }}
      GITHUB_USER_SSH_KEY: ${{ secrets.DEPLOYBOT_SSH_PRIVATE_KEY }}
      NPM_REGISTRY_TOKEN: ${{ secrets.DEPLOYBOT_PACKAGES_READ_ACCESS_TOKEN}}
```

## Example with ngrok tunnel

```yml
name: E2E Testing

on:
  workflow_dispatch:
jobs:
  e2e-playwright:
    uses: inpsyde/reusable-workflows/.github/workflows/test-playwright.yml@main
    with:
      PLAYWRIGHT_ARTIFACT_PATH: |
        artifacts/*
        playwright-report/
      PLAYWRIGHT_SCRIPT: 'ci-test-e2e'
      NODE_VERSION: 24
      PLAYWRIGHT_BROWSER_ARGS: 'chromium --with-deps'
      NGROK_DOMAIN: ${{ secrets.NGROK_DOMAIN }}
      PRE_SCRIPT: |
        gh run download ${{ github.run_id }} -p "my-plugin-*" -D resources/files
        npm run setup:env
    secrets:
      ENV_FILE_DATA: ${{ secrets.ENV_FILE_DATA }}
      NPM_REGISTRY_TOKEN: ${{ secrets.DEPLOYBOT_PACKAGES_READ_ACCESS_TOKEN }}
      NGROK_AUTH_TOKEN: ${{ secrets.NGROK_AUTH_TOKEN }}
```

## Example with test reporting

```yml
name: E2E Testing

on:
  workflow_dispatch:
    inputs:
      TEST_SUITE:
        description: 'Test suite to run'
        required: true
        default: 'smoke'
        type: choice
        options:
          - smoke
          - critical
          - all
      XRAY_TEST_EXEC_KEY:
        description: 'Xray test execution key'
        required: false
        default: ''

jobs:
  e2e-playwright:
    uses: inpsyde/reusable-workflows/.github/workflows/test-playwright.yml@main
    with:
      PLAYWRIGHT_ARTIFACT_PATH: |
        artifacts/*
        playwright-report/
      PLAYWRIGHT_SCRIPT: ${{ inputs.TEST_SUITE }}
      NODE_VERSION: 24
      XRAY_TEST_EXEC_KEY: ${{ inputs.XRAY_TEST_EXEC_KEY }}
    secrets:
      ENV_FILE_DATA: ${{ secrets.ENV_FILE_DATA }}
      NPM_REGISTRY_TOKEN: ${{ secrets.DEPLOYBOT_PACKAGES_READ_ACCESS_TOKEN }}
```

## Example with custom inputs

```yml
name: E2E Testing

on:
  workflow_dispatch:
    inputs:
      TEST_SUITE:
        description: 'Test suite to run'
        required: true
        default: 'critical'
        type: choice
        options:
          - smoke
          - critical
          - all

jobs:
  e2e-playwright:
    uses: inpsyde/reusable-workflows/.github/workflows/test-playwright.yml@main
    with:
      PLAYWRIGHT_ARTIFACT_PATH: |
        tests/qa/artifacts/*
        tests/qa/playwright-report/
      PLAYWRIGHT_SCRIPT: ${{ inputs.TEST_SUITE }}
      NODE_VERSION: 22
      PLAYWRIGHT_BROWSER_ARGS: 'chromium --with-deps'
      PRE_SCRIPT: |
        gh run download ${{ github.run_id }} -p "my-plugin-*" -D resources/files
        npm run setup:env
    secrets:
      ENV_FILE_DATA: ${{ secrets.ENV_FILE_DATA }}
      NPM_REGISTRY_TOKEN: ${{ secrets.DEPLOYBOT_PACKAGES_READ_ACCESS_TOKEN}}
```

## Example of secrets

For `ENV_FILE_DATA`:

```bash
# playwright-utils config
WP_BASE_URL='http://mywp.site'
WP_USERNAME=admin
WP_PASSWORD=password
WP_BASIC_AUTH_USER=admin
WP_BASIC_AUTH_PASS=password
STORAGE_STATE_PATH='./storage-states'
STORAGE_STATE_PATH_ADMIN='./storage-states/admin.json'
WORDPRESS_DB_USER=root
WORDPRESS_DB_PASSWORD=password

WPCLI_ENV_TYPE= # localhost, vip, wpenv, ddev, ssh
WPCLI_PATH= # for localhost, wpenv
# For WPCLI_ENV_TYPE=ssh
SSH_LOGIN=
SSH_HOST=
SSH_PORT=
SSH_PATH=
# For WPCLI_ENV_TYPE=vip
VIP_APP=
VIP_ENV=

# WooCommerce specific env vars
WC_API_KEY=
WC_API_SECRET=
WC_DEFAULT_COUNTRY=usa
WC_DEFAULT_CURRENCY=USD

# Xray in Jira
XRAY_CLIENT_ID=
XRAY_CLIENT_SECRET=
TEST_EXEC_KEY=

# Ngrok (optional, enables tunnel for webhook delivery)
NGROK_DOMAIN=
NGROK_AUTH_TOKEN=
```

## Examples of `PRE_SCRIPT`

### VIP connection

```bash
PRE_SCRIPT: |
      npm install -g @automattic/vip
      mkdir -p ~/.config/configstore
      echo '{"vip-go-cli": "'"$VIP_TOKEN"'"}' > ~/.config/configstore/vip-go-cli.json
```

### Distributing vars per env

In case of several test environments (staging, production, etc.) `PRE_SCRIPT` can be used to setup env-specific vars from `ENV_FILE_DATA`. For example `PERCY_TOKEN`:

```bash
PRE_SCRIPT: |
      echo "PERCY_TOKEN=$PERCY_TOKEN_STAGE" >> "$GITHUB_ENV"
```

### Download and zip plugin artifact

For cases when plugin is built within the same workflow:

```bash
PRE_SCRIPT: |
  gh run download ${{ github.run_id }} -p "woocommerce-paypal-payments-*" -D tests/qa/resources/files
  cd tests/qa/resources/files
  mv woocommerce-paypal-payments-*/woocommerce-paypal-payments .
  zip -r woocommerce-paypal-payments.zip woocommerce-paypal-payments
  rm -rf woocommerce-paypal-payments woocommerce-paypal-payments-*/
```
