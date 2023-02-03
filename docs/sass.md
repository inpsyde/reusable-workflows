# Reusable workflows – Sass

## Static code analysis

This workflow runs [Stylelint](https://stylelint.io/). It does so by executing the binary in
the `./node_modules/.bin/` folder.

**Simplest possible example:**

```yml
name: Static code analysis Sass
on:
  pull_request:
jobs:
  static-code-analysis-sass:
    uses: inpsyde/reusable-workflows/.github/workflows/static-analysis-sass.yml@main
```

### Configuration parameters

#### Inputs

| Name                  | Default                        | Description                                         |
|-----------------------|--------------------------------|-----------------------------------------------------|
| `NPM_REGISTRY_DOMAIN` | `"https://npm.pkg.github.com/` | Domain of the private npm registry                  |
| `NODE_VERSION`        | `"16"`                         | Node version with which the assets will be compiled |
| `STYLELINT_ARGS`      | `"./resources/**/*.scss"`      | Set of arguments passed to Stylelint                |

#### Secrets

| Name                 | Description                                 |
|----------------------|---------------------------------------------|
| `NPM_REGISTRY_TOKEN` | Authentication for the private npm registry |

**Example with configuration parameters:**

```yml
name: Static code analysis Sass
on:
  pull_request:
jobs:
  static-code-analysis-sass:
    uses: inpsyde/reusable-workflows/.github/workflows/static-analysis-sass.yml@main
    secrets:
      NPM_REGISTRY_TOKEN: ${{ secrets.NPM_REGISTRY_TOKEN }}
    with:
      NODE_VERSION: "14"
      STYLELINT_ARGS: "./assets/scss/*.scss"
```
