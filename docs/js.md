# Reusable workflows – JavaScript

## Unit tests JavaScript

This workflow runs [Jest](https://jestjs.io/). It does so by executing the binary in the
`./node_modules/.bin/` folder.

**Simplest possible example:**

```yml
name: Unit tests JavaScript
on:
  pull_request:
jobs:
  tests-unit-js:
    uses: inpsyde/reusable-workflows/.github/workflows/tests-unit-js.yml@main
```

### Configuration parameters

#### Inputs

| Name                  | Default                                            | Description                                                                       |
|-----------------------|----------------------------------------------------|-----------------------------------------------------------------------------------|
| `NPM_REGISTRY_DOMAIN` | `'https://npm.pkg.github.com/'`                    | Domain of the private npm registry                                                |
| `NODE_VERSION`        | `18`                                               | Node version with which the unit tests are to be executed                         |
| `JEST_ARGS`           | `'--reporters=default --reporters=github-actions'` | Set of arguments passed to Jest                                                   |
| `PACKAGE_MANAGER`     | `'yarn'`                                           | Package manager with which the dependencies should be installed (`npm` or `yarn`) |

**Note**: The default `github-actions` reporter requires Jest 28 or higher.

#### Secrets

| Name                  | Description                                                                  |
|-----------------------|------------------------------------------------------------------------------|
| `NPM_REGISTRY_TOKEN`  | Authentication for the private npm registry                                  |
| `GITHUB_USER_EMAIL`   | Email address for the GitHub user configuration                              |
| `GITHUB_USER_NAME`    | Username for the GitHub user configuration                                   |
| `GITHUB_USER_SSH_KEY` | Private SSH key associated with the GitHub user passed as `GITHUB_USER_NAME` |
| `ENV_VARS`            | Additional environment variables as a JSON formatted object                  |

**Example with configuration parameters:**

```yml
name: Unit tests JavaScript
on:
  pull_request:
jobs:
  tests-unit-js:
    uses: inpsyde/reusable-workflows/.github/workflows/tests-unit-js.yml@main
    secrets:
      NPM_REGISTRY_TOKEN: ${{ secrets.NPM_REGISTRY_TOKEN }}
      ENV_VARS: >-
        [{"name":"EXAMPLE_USERNAME", "value":"${{ secrets.USERNAME }}"}]
    with:
      NODE_VERSION: 14
      JEST_ARGS: 'my-test --reporters=jest-junit --coverage'
```
