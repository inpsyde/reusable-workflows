# Playwright test

This workflow executes Playwright-based tests in a controlled and isolated environment via GitHub
Actions.

The workflow can:

- execute a building step, both for node and PHP environments (if the PHP version is provided and
  a `composer.json` file is present)
- create an environment variables file named `.env.ci` dedicated to the test step; load this file
  using `dotenv-ci` directly in your test script,
  e.g., `./node_modules/.bin/dotenv -e .env.ci -- npm run e2e`
- execute the tests using Playwright
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
| `ARTIFACT_INCLUDE_HIDDEN_FILES` | `false`                         | Whether to include hidden files in the provided path in the artifact                              |
| `ARTIFACT_NAME`                 | `'artifact'`                    | Name for the artifact                                                                             |
| `ARTIFACT_OVERWRITE`            | `false`                         | Determine if an artifact with a matching name will be deleted before a new one is uploaded or not |
| `ARTIFACT_PATH`                 |                                 | A file, directory or wildcard pattern that describes what to upload                               |
| `ARTIFACT_RETENTION_DAYS`       | `30`                            | Duration after which artifact will expire in day                                                  |
| `NODE_VERSION`                  | `18`                            | Node version with which the node script will be executed                                          |
| `NPM_REGISTRY_DOMAIN`           | `'https://npm.pkg.github.com/'` | Domain of the private npm registry                                                                |
| `PHP_VERSION`                   |                                 | PHP version with which the dependencies are installed                                             |
| `PLAYWRIGHT_BROWSER_ARGS`       | `'--with-deps'`                 | Set of arguments passed to `npx playwright install`                                               |
| `SCRIPT_NAME`                   |                                 | The name of a custom script to run the tests                                                      | 

### Secrets

| Name                  | Description                                                                              |
|-----------------------|------------------------------------------------------------------------------------------|
| `ENV_FILE_DATA`       | Additional environment variables for the tests                                           |
| `COMPOSER_AUTH_JSON`  | Authentication for privately hosted packages and repositories as a JSON formatted object |
| `NPM_REGISTRY_TOKEN`  | Authentication for the private npm registry                                              |
| `GITHUB_USER_EMAIL`   | Email address for the GitHub user configuration                                          |
| `GITHUB_USER_NAME`    | Username for the GitHub user configuration                                               |
| `GITHUB_USER_SSH_KEY` | Private SSH key associated with the GitHub user passed as `GITHUB_USER_NAME`             |
| `ENV_VARS`            | Additional environment variables as a JSON formatted object                              |

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
      PHP_VERSION: ${{ matrix.php }}
      NODE_VERSION: 20
      PLAYWRIGHT_BROWSER_ARGS: 'chromium --with-deps'
    secrets:
      ENV_FILE_DATA: ${{ secrets.ENV_FILE_DATA }}
      COMPOSER_AUTH_JSON: '${{ secrets.PACKAGIST_AUTH_JSON }}'
      GITHUB_USER_EMAIL: ${{ secrets.DEPLOYBOT_EMAIL }}
      GITHUB_USER_NAME: ${{ secrets.DEPLOYBOT_USER }}
      GITHUB_USER_SSH_KEY: ${{ secrets.DEPLOYBOT_SSH_PRIVATE_KEY }}
      NPM_REGISTRY_TOKEN: ${{ secrets.DEPLOYBOT_PACKAGES_READ_ACCESS_TOKEN}}
```

**Example of secrets:**

For `ENV_FILE_DATA`:

```SHELL
TEST_EXEC_KEY=YOUR-KEY
WP_BASE_URL=https://example.com
```
