# Reusable workflows – `@wordpress/scripts`

## Lint

This reusable workflow contains internally support for linting "styles" (`stylelint`), "scripts" (`eslint`) and markdown files (`markdownlint`) by executing the `@wordpress/scripts` executable `wp-scripts`.

**Simplest possible example:**

```yml
name: Front-Office QA
on: [push]
jobs:
  wp-scripts-lint:
    uses: inpsyde/reusable-workflows/.github/workflows/wp-scripts-lint.yml@main
```

### Configuration parameters

#### Inputs

| Name                  | Default                                       | Description                                                                                  |
|-----------------------|-----------------------------------------------|----------------------------------------------------------------------------------------------|
| `NPM_REGISTRY_DOMAIN` | `https://npm.pkg.github.com/`                 | Domain of the private npm registry                                                           |
| `NODE_VERSION`        | 16                                            | Node version with which the assets will be compiled                                          |
| `PACKAGE_MANAGER`     | `yarn`                                        | Package manager with which the dependencies should be installed (`npm` or `yarn`)            |
| `NODE_OPTIONS`        | `''`                                          | Space-separated list of command-line Node options                                            |
| `LINT_TOOLS`          | `'["js", "style", "md-docs"]'`                | An array of tools supported by wp-scripts lint-*. Supported are "js", "style" and "md-docs". |
| `ESLINT_ARGS`         | `'--format stylish'`                          | Set of arguments passed to wp-script lint-js.                                                |
| `STYLELINT_ARGS`      | `'--formatter github'`                        | Set of arguments passed to wp-script lint-style.                                             |
| `MARKDOWNLINT_ARGS`   | `'--ignore LICENSE.md --ignore node_modules'` | Set of arguments passed to wp-script lint-md-docs                                            |

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
  wp-scripts-lint-js:
    uses: inpsyde/reusable-workflows/.github/workflows/wp-scripts-lint-js.yml@main
    secrets:
      NPM_REGISTRY_TOKEN: ${{ secrets.NPM_REGISTRY_TOKEN }}
    with:
      NODE_VERSION: 18
      ESLINT_ARGS: '-o eslint_report.json -f json'
      STYLELINT_ARGS: './resources/**/*.scs'
```