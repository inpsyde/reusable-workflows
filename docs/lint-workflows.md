# Lint GitHub Actions workflows

This workflow runs [actionlint](https://github.com/rhysd/actionlint). It does so by executing the
linter inside a Docker container using the official `actionlint` Docker image.

**Example:**

```yml
name: Lint GitHub Actions workflows
on:
  pull_request:
jobs:
  lint-workflows:
    uses: inpsyde/reusable-workflows/.github/workflows/lint-workflows.yml@main
```
