# Reusable workflows – JavaScript

## Static code analysis

This workflow runs [ESLint](https://eslint.org/). It does so by executing the binary in
the `./node_modules/.bin/` folder.

**Simplest possible example:**

```yml
name: Static code analysis JavaScript
on:
  pull_request:
jobs:
  static-code-analysis-javascript:
    uses: inpsyde/reusable-workflows/.github/workflows/static-analysis-js.yml@main
```

### Configuration parameters

#### Inputs

| Name                  | Default                                                               | Description                                         |
|-----------------------|-----------------------------------------------------------------------|-----------------------------------------------------|
| `NPM_REGISTRY_DOMAIN` | `'https://npm.pkg.github.com/'`                                       | Domain of the private npm registry                  |
| `NODE_VERSION`        | 16                                                                    | Node version with which the assets will be compiled |
| `ESLINT_ARGS`         | `'-o eslint_report.json -f json --ext .js,.jsx,.ts,.tsx ./resources'` | Set of arguments passed to ESLint                   |
| `PACKAGE_MANAGER`     | `npm`                                                                 | Package manager. Supported are "yarn" and "npm".    |

#### Secrets

| Name                 | Description                                 |
|----------------------|---------------------------------------------|
| `NPM_REGISTRY_TOKEN` | Authentication for the private npm registry |

**Example with configuration parameters:**

```yml
name: Static code analysis JavaScript
on:
  pull_request:
jobs:
  static-code-analysis-javascript:
    uses: inpsyde/reusable-workflows/.github/workflows/static-analysis-js.yml@main
    secrets:
      NPM_REGISTRY_TOKEN: ${{ secrets.NPM_REGISTRY_TOKEN }}
    with:
      NODE_VERSION: 14
      ESLINT_ARGS: './resources --ext .js'
```

## Unit tests JavaScript

This workflow runs [Jest](https://jestjs.io/). It does so by executing the binary in
the `./node_modules/.bin/` folder.

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

| Name                  | Default                                            | Description                                               |
|-----------------------|----------------------------------------------------|-----------------------------------------------------------|
| `NPM_REGISTRY_DOMAIN` | `'https://npm.pkg.github.com/'`                    | Domain of the private npm registry                        |
| `NODE_VERSION`        | 16                                                 | Node version with which the unit tests are to be executed |
| `JEST_ARGS`           | `'--reporters=default --reporters=github-actions'` | Set of arguments passed to Jest                           |
| `PACKAGE_MANAGER`     | `npm`                                              | Package manager. Supported are "yarn" and "npm".          |

**Note**: The default `github-actions` reporter requires Jest 28 or higher.

#### Secrets

| Name                 | Description                                 |
|----------------------|---------------------------------------------|
| `NPM_REGISTRY_TOKEN` | Authentication for the private npm registry |

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
    with:
      NODE_VERSION: 14
      JEST_ARGS: 'my-test --reporters=jest-junit --coverage'
```
