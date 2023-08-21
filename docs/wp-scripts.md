# Reusable workflows – `@wordpress/scripts`

## Lint

This workflow runs [ESLint](https://eslint.org/), [Stylelint](https://stylelint.io/),
and [markdownlint](https://github.com/DavidAnson/markdownlint) wrapped in the
the [`@wordpress/scripts`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/)
library. It does so by executing the `wp-scripts` binary in the `./node_modules/.bin/` folder.

**Simplest possible example:**

```yml
name: Static code analysis assets
on: [push]
jobs:
  wp-scripts-lint:
    uses: inpsyde/reusable-workflows/.github/workflows/wp-scripts-lint.yml@main
```

### Configuration parameters

#### Inputs

| Name                    | Default                        | Description                                                                       |
|-------------------------|--------------------------------|-----------------------------------------------------------------------------------|
| `NODE_OPTIONS`          | `''`                           | Space-separated list of command-line Node options                                 |
| `NODE_VERSION`          | 16                             | Node version with which the assets will be compiled                               |
| `NPM_REGISTRY_DOMAIN`   | `https://npm.pkg.github.com/`  | Domain of the private npm registry                                                |
| `PACKAGE_MANAGER`       | `yarn`                         | Package manager with which the dependencies should be installed (`npm` or `yarn`) |
| `LINT_TOOLS`            | `'["js", "style", "md-docs"]'` | Array of checks to be executed by @wordpress/scripts                              |
| `ESLINT_ARGS`           | `''`                           | Set of arguments passed to `wp-script lint-js`                                    |
| `STYLELINT_ARGS`        | `'--formatter github'`         | Set of arguments passed to `wp-script lint-style`                                 |
| `MARKDOWNLINT_ARGS`     | `'--ignore LICENSE.md`         | Set of arguments passed to `wp-script lint-md-docs`                               |
| `PACKAGE_JSONLINT_ARGS` | `''`                           | Set of arguments passed to `wp-scripts lint-pkg-json`                             |

> :info: **By default, "pkg-json" is not part of the `LINT_TOOLS` input.**

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
name: Static code analysis assets
on:
  pull_request:
jobs:
  wp-scripts-lint-js:
    uses: inpsyde/reusable-workflows/.github/workflows/wp-scripts-lint-js.yml@main
    secrets:
      NPM_REGISTRY_TOKEN: ${{ secrets.NPM_REGISTRY_TOKEN }}
      ENV_VARS: >-
        [{"name":"EXAMPLE_USERNAME", "value":"${{ secrets.USERNAME }}"}]
    with:
      NODE_VERSION: 18
      ESLINT_ARGS: '-o eslint_report.json -f json'
      STYLELINT_ARGS: '"./resources/**/*.scss" --formatter github'
```

---
**Note**

Stylelint [requires quotes](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/#lint-style) around file glob patterns.

---
