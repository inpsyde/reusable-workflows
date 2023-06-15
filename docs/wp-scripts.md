# Reusable workflows – WordPress Scripts

## Quality Assurance

The workflow `static-wp-scripts-qa.yml` will run `lint-md-docs`, `lint-style` and `list-scripts`. It does so by executing the `wp-scrits` binary in
the `./node_modules/.bin/` folder.

**Simplest possible example:**

```yml
name: Front-Office QA
on: [push]
jobs:
  static-wp-scripts-qa:
    uses: inpsyde/reusable-workflows/.github/workflows/static-wp-scripts-qa.yml@main
```

### Configuration parameters

#### Inputs

| Name                  | Default                                                               | Description                                                                       |
|-----------------------|-----------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| `NPM_REGISTRY_DOMAIN` | `https://npm.pkg.github.com/`                                         | Domain of the private npm registry                                                |
| `NODE_VERSION`        | 16                                                                    | Node version with which the assets will be compiled                               |
| `PACKAGE_MANAGER`     | `yarn`                                                                | Package manager with which the dependencies should be installed (`npm` or `yarn`) |
| `NODE_OPTIONS`        | `''`                                                                  | Space-separated list of command-line Node options                                 |

#### Secrets

| Name                 | Description                                 |
|----------------------|---------------------------------------------|
| `NPM_REGISTRY_TOKEN` | Authentication for the private npm registry |

**Example with configuration parameters:**

```yml
name: Front-Office QA
on:
  pull_request:
jobs:
  static-wp-scripts-qa:
    uses: inpsyde/reusable-workflows/.github/workflows/static-wp-scripts-qa.yml@main
    secrets:
      NPM_REGISTRY_TOKEN: ${{ secrets.NPM_REGISTRY_TOKEN }}
    with:
      NODE_VERSION: 18
```