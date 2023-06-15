# Reusable workflows – WordPress Scripts

## Quality Assurance

This contains 3 workflows for linting "styles" (`stylelint`), "scripts" (`eslint`) and markdown files (`markdownlint`) by executing the `@wordpress/scripts` executable `wp-scripts`.
**Simplest possible example:**

```yml
name: Front-Office QA
on: [push]
jobs:
  wp-scripts-js:
    uses: inpsyde/reusable-workflows/.github/workflows/wp-scripts-js.yml@main
  wp-scripts-style:
    uses: inpsyde/reusable-workflows/.github/workflows/wp-scripts-style.yml@main
  wp-scripts-markdown:
    uses: inpsyde/reusable-workflows/.github/workflows/wp-scripts-markdown.yml@main
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
  wp-scripts-js:
    uses: inpsyde/reusable-workflows/.github/workflows/static-wp-scripts-js.yml@main
    secrets:
      NPM_REGISTRY_TOKEN: ${{ secrets.NPM_REGISTRY_TOKEN }}
    with:
      NODE_VERSION: 18
```