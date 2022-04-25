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

| Name                  | Default                                 | Description                                         |
|-----------------------|-----------------------------------------|-----------------------------------------------------|
| `NPM_REGISTRY_DOMAIN` | `'https://npm.pkg.github.com/'`         | Domain of the private npm registry                  |
| `NODE_VERSION`        | 16                                      | Node version with which the assets will be compiled |
| `ESLINT_ARGS`         | `'./resources --ext .js,.jsx,.ts,.tsx'` | Set of arguments passed to ESLint                   |

#### Secrets

| Name                 | Description                                  |
|----------------------|----------------------------------------------|
| `NPM_REGISTRY_TOKEN` | Authentication for the private npm registry. |

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
