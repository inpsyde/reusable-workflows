# Syde Reusable Workflows

## Introduction to GitHub Actions

With [GitHub Actions](https://github.com/features/actions), you can create custom workflows for the
software development lifecycle directly in your GitHub repository. These workflows consist of
different tasks, called actions, that can be executed automatically when certain events occur.

At Syde, we use GitHub Actions for a wide range of tasks. From various quality assurance tests (
e.g., static analysis checks, PHPUnit tests, etc.), to asset compilation and distribution, release
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
* Linting, formatting, and testing tools for [PHP](./docs/php.md) and [JavaScript](./docs/js.md)
* [Linting GitHub Actions workflow files](./docs/lint-workflows.md)
* End-to-end tests with [Playwright](./docs/test-playwright.md)
* [Build and distribute plugin and theme archives](./docs/build-and-distribute.md)
* [Release to the WordPress.org plugin directory](./docs/wordpress-org-release.md)
* [Quality Insights Toolkit (QIT) for WooCommerce](./docs/woo-qit.md)
* [Deployments with Deployer](./docs/deploy-deployer.md)

**Note:**

Workflow files prefixed with `_` are specific to the repository and cannot be reused.
