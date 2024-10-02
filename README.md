# Syde Reusable Workflows

## Introduction to GitHub Actions

With [GitHub Actions](https://github.com/features/actions), you can create custom workflows for the
software development lifecycle directly in your GitHub repository. These workflows consist of
different tasks, called actions, that can be executed automatically when certain events occur.

At Syde, we use GitHub Actions for a wide range of tasks. From various quality assurance tests (
e.g., static analysis checks, PHPUnit tests, etc.), to asset (pre)compilation
with [Composer Asset Compiler](https://github.com/inpsyde/composer-asset-compiler), release
generation, deployments (CI/CD), and container registry management: all automatable, recurring tasks
are performed in GitHub Actions.

## About reusable workflows

To avoid code duplication of GitHub Actions workflow files across thousands of repositories, we
utilize [reusable workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows).
This allows us to DRY (don't repeat yourself) configurations so we don't have to copy and paste
workflows from one repository to another.

## Calling reusable workflows

In the calling workflow file, use the `uses` property to specify the location and version of a
reusable workflow file to run as a job.

```yml
name: {Job name}
on:
  pull_request:
jobs:
  {topic}-{workflow}:
    uses: inpsyde/reusable-workflows/.github/workflows/{topic}-{workflow}.yml@main
```

Please note that the individual workflows have different (optional) parameters that you can pass
either as `input`s or `secret`s. To learn more, consult the documentation of the individual workflow
groups here:

* Assets linting and formatting with [`@wordpress/scripts`](./docs/wp-scripts.md)
* Linting, formatting, and testing tools for [PHP](./docs/php.md)
* [Linting GitHub Actions workflow files](./docs/lint-workflows.md)
* Unit tests for [JavaScript](./docs/js.md)
* Assets compilation with [Composer Asset Compiler](./docs/assets-compilation.md) or
  the [Build and push](./docs/build-and-push-assets.md) approach
* [Create plugin archive](./docs/archive-creation.md)
* [Automatic release](./docs/automatic-release.md)
* [DDEV Playwright](./docs/ddev-playwright.md)

**Note:**

Workflow files prefixed with `_` are specific to the repository and cannot be reused.
