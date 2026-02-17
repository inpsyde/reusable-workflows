# Playwright test

This workflow executes Playwright-based tests in a controlled and isolated environment via GitHub Actions.

The workflow can:

- execute a building step, both for node and PHP environments (if the PHP version is provided and a `composer.json` file is present)
- create an environment variables file named `.env.ci` dedicated to the test step; load this file using `dotenv-ci` directly in your test script, e.g., `./node_modules/.bin/dotenv -e .env.ci -- npm run e2e`. The file is also sourced before `PRE_SCRIPT`, making all variables available as environment variables.
- execute the tests using Playwright — either via a custom npm script or directly with `--grep`, `--grep-invert`, and `--project` filters
- upload the artifacts

**Simplest possible example:**

```yml
name: E2E Testing

on:
  workflow_dispatch:
jobs:
  e2e-playwright:
    uses: inpsyde/reusable-workflows/.github/workflows/test-playwright.yml@main
    with:
      ARTIFACT_PATH: './artifacts'
      SCRIPT_NAME: 'ci-test-e2e'
```

## Configuration parameters

### Inputs

| Name                            | Default                         | Description                                                                                       |
|---------------------------------|---------------------------------|---------------------------------------------------------------------------------------------------|
| `ARTIFACT_INCLUDE_HIDDEN_FILES` | `false`                         | Whether to include hidden files in the artifact                                                   |
| `ARTIFACT_NAME`                 | `'artifact'`                    | Name for the artifact                                                                             |
| `ARTIFACT_OVERWRITE`            | `false`                         | Determine if an artifact with a matching name will be deleted before a new one is uploaded or not |
| `ARTIFACT_PATH`                 |                                 | A file, directory or wildcard pattern that describes what to upload                               |
| `ARTIFACT_RETENTION_DAYS`       | `30`                            | Duration after which artifact will expire in day                                                  |
| `COMPOSER_DEPS_INSTALL`         | `false`                         | Whether to install Composer dependencies                                                          |
| `NODE_VERSION`                  | `18`                            | Node version with which the node script will be executed                                          |
| `NPM_REGISTRY_DOMAIN`           | `'https://npm.pkg.github.com/'` | Domain of the private npm registry                                                                |
| `PHP_VERSION`                   | `'8.2'`                         | PHP version with which the dependencies are installed                                             |
| `PLAYWRIGHT_BROWSER_ARGS`       | `'--with-deps'`                 | Set of arguments passed to `npx playwright install`                                               |
| `PLAYWRIGHT_GREP`               | `''`                            | Grep pattern to filter tests. When any Playwright flag is set, `SCRIPT_NAME` is ignored and `npx playwright test` is used directly |
| `PLAYWRIGHT_GREP_INVERT`        | `''`                            | Grep pattern to exclude tests. Passed as `--grep-invert` flag. When any Playwright flag is set, `SCRIPT_NAME` is ignored and `npx playwright test` is used directly |
| `PLAYWRIGHT_PROJECT`            | `''`                            | Playwright project name from `playwright.config`. When any Playwright flag is set, `SCRIPT_NAME` is ignored and `npx playwright test` is used directly |
| `PRE_SCRIPT`                    | `''`                            | Run custom shell code before executing the test script. `GH_TOKEN` and all `ENV_FILE_DATA` variables are available |
| `SCRIPT_NAME`                   | `''`                            | The name of a custom npm script to run the tests. Ignored when any Playwright flag is set         |
| `WORK_DIR`                      | `'.'`                           | Working directory for npm install, Playwright install, PRE_SCRIPT, and test execution             |

> **Note:** Setting any combination of `PLAYWRIGHT_GREP`, `PLAYWRIGHT_GREP_INVERT`, or `PLAYWRIGHT_PROJECT` will bypass `SCRIPT_NAME` and run `npx playwright test` directly with the specified flags.

### Secrets

| Name                  | Description                                                                              |
|-----------------------|------------------------------------------------------------------------------------------|
| `ENV_FILE_DATA`       | Additional environment variables for the tests. Also sourced before `PRE_SCRIPT`         |
| `COMPOSER_AUTH_JSON`  | Authentication for privately hosted packages and repositories as a JSON formatted object |
| `NPM_REGISTRY_TOKEN`  | Authentication for the private npm registry                                              |
| `GITHUB_USER_EMAIL`   | Email address for the GitHub user configuration                                          |
| `GITHUB_USER_NAME`    | Username for the GitHub user configuration                                               |
| `GITHUB_USER_SSH_KEY` | Private SSH key associated with the GitHub user passed as `GITHUB_USER_NAME`             |

**Example with configuration parameters:**

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
      ARTIFACT_PATH: |
        artifacts/*
        playwright-report/
      ARTIFACT_INCLUDE_HIDDEN_FILES: true
      SCRIPT_NAME: 'ci-test-e2e'
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

**Example with subdirectory and grep mode:**

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
          - grep
      TEST_GREP_PATTERN:
        description: 'Grep pattern (only used when TEST_SUITE == "grep")'
        required: false
        type: string
      TEST_GREP_INVERT_PATTERN:
        description: 'Grep invert pattern (only used when TEST_SUITE == "grep")'
        required: false
        type: string
      TEST_PROJECT:
        description: 'Playwright project name (only used when TEST_SUITE == "grep")'
        required: false
        default: 'all'
        type: string

jobs:
  e2e-playwright:
    uses: inpsyde/reusable-workflows/.github/workflows/test-playwright.yml@main
    with:
      WORK_DIR: 'tests/qa'
      ARTIFACT_PATH: |
        tests/qa/artifacts/*
        tests/qa/playwright-report/
      SCRIPT_NAME: ${{ inputs.TEST_SUITE != 'grep' && format('test:{0}', inputs.TEST_SUITE) || '' }}
      PLAYWRIGHT_GREP: ${{ inputs.TEST_SUITE == 'grep' && inputs.TEST_GREP_PATTERN || '' }}
      PLAYWRIGHT_GREP_INVERT: ${{ inputs.TEST_SUITE == 'grep' && inputs.TEST_GREP_INVERT_PATTERN || '' }}
      PLAYWRIGHT_PROJECT: ${{ inputs.TEST_SUITE == 'grep' && inputs.TEST_PROJECT || '' }}
      NODE_VERSION: 22
      PLAYWRIGHT_BROWSER_ARGS: 'chromium --with-deps'
      PRE_SCRIPT: |
        gh run download ${{ github.run_id }} -n my-plugin -D resources/files
        npm run setup:env
    secrets:
      ENV_FILE_DATA: ${{ secrets.ENV_FILE_DATA }}
```

**Example of secrets:**

For `ENV_FILE_DATA`:

```SHELL
TEST_EXEC_KEY=YOUR-KEY
WP_BASE_URL=https://example.com
```
