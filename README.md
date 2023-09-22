# Inpsyde Reusable Workflows

## Introduction to GitHub Actions

With [GitHub Actions](https://github.com/features/actions), you can create custom workflows for the
software development lifecycle directly in your Github repository. These workflows consist of
different tasks, called actions, that can be executed automatically when certain events occur.

At Inpsyde, we use GitHub Actions for a wide range of tasks. From various quality assurance tests
(e.g. static analysis checks, PHPUnit tests, etc.), to asset (pre)compilation
with [Composer Asset Compiler](https://github.com/inpsyde/composer-asset-compiler), release
generation, deployments (CI/CD), and container registry management: all automatable, recurring tasks
are performed in GitHub Actions.

## About reusable workflows

To avoid code duplication of GitHub Actions workflow files across thousands of repositories, we
utilize [reusable workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows).
This allows us to DRY (don't repeat yourself) configurations, so we don't have to copy and paste
workflows from one repository to another.
Refer to the documentation to learn how to use reusable workflows.

## Available workflows

To learn more, consult the documentation of the individual workflow
groups here:

[PHP](./docs/php.md)  
[JavaScript](./docs/js.md)  
[Sass](./docs/sass.md)  
[Assets compilation](./docs/assets-compilation.md)

## Commonly used inputs and secrets

### node-based workflows

**Inputs**

| name                  | workflows           |                           |                          |                              |                         |              |                    |
|-----------------------|---------------------|---------------------------|--------------------------|------------------------------|-------------------------|--------------|--------------------|
|                       | wp-scripts-lint.yml | build-and-push-assets.yml | build-plugin-archive.yml | build-assets-compilation.yml | static-analysis-php.yml | lint-php.yml | tests-unit-php.yml |
| PHP_VERSION           |                     |                           | x                        | x                            | x                       | x            | x                  |
| COMPOSER_ARGS         |                     |                           | x                        | x                            | x                       | x            | x                  |
| COMPILE_ASSETS_ARGS   |                     |                           | x                        | x                            |                         |              |                    |
| PACKAGE_MANAGER       | x                   | x                         | x                        |                              |                         |              |                    |
| NODE_VERSION          | x                   | x                         | x                        | x                            |                         |              |                    |
| NODE_OPTIONS          | x                   | x                         | x                        | x                            |                         |              |                    |
| NPM_REGISTRY_DOMAIN   | x                   | x                         | x                        | x                            |                         |              |                    |
| WORKING_DIRECTORY     |                     | x                         |                          |                              |                         |              |                    |
| DEPS_INSTALL          |                     | x                         |                          |                              |                         |              |                    |
| COMPILE_SCRIPT_PROD   |                     | x                         |                          |                              |                         |              |                    |
| COMPILE_SCRIPT_DEV    |                     | x                         |                          |                              |                         |              |                    |
| ASSETS_TARGET_PATHS   |                     | x                         |                          |                              |                         |              |                    |
| PLUGIN_MAIN_FILE      |                     |                           | x                        |                              |                         |              |                    |
| PLUGIN_VERSION        |                     |                           | x                        |                              |                         |              |                    |
| ARCHIVE_NAME          |                     |                           | x                        |                              |                         |              |                    |
| PRE_SCRIPT            |                     |                           | x                        |                              |                         |              |                    |
| LINT_ARGS             |                     |                           |                          |                              |                         | x            |                    |
| PSALM_ARGS            |                     |                           |                          |                              | x                       |              |                    |
| PHPUNIT_ARGS          |                     |                           |                          |                              |                         |              | x                  |
| LINT_TOOLS            | x                   |                           |                          |                              |                         |              |                    |
| ESLINT_ARGS           | x                   |                           |                          |                              |                         |              |                    |
| STYLELINT_ARGS        | x                   |                           |                          |                              |                         |              |                    |
| MARKDOWNLINT_ARGS     | x                   |                           |                          |                              |                         |              |                    |
| PACKAGE_JSONLINT_ARGS | x                   |                           |                          |                              |                         |              |                    |

**Secrets**

| name                | workflows           |                           |                          |                              |                         |              |                    |
|---------------------|---------------------|---------------------------|--------------------------|------------------------------|-------------------------|--------------|--------------------|
|                     | wp-scripts-lint.yml | build-and-push-assets.yml | build-plugin-archive.yml | build-assets-compilation.yml | static-analysis-php.yml | lint-php.yml | tests-unit-php.yml |
| NPM_REGISTRY_TOKEN  | x                   | x                         | x                        | x                            |                         |              |                    |
| COMPOSER_AUTH_JSON  |                     |                           | x                        | x                            | x                       | x            | x                  |
| GITHUB_USER_EMAIL   |                     | x                         |                          | x                            |                         |              |                    |
| GITHUB_USER_SSH_KEY |                     | x                         |                          | x                            |                         |              |                    |
| GITHUB_USER_NAME    |                     |                           |                          | x                            |                         |              |                    |
| ENV_VARS            | x                   | x                         | x                        | x                            | x                       | x            | x                  |


### PHP-based workflows

**Inputs**

| name                  | workflows           |                           |                          |                              |                         |              |                    |
|-----------------------|---------------------|---------------------------|--------------------------|------------------------------|-------------------------|--------------|--------------------|
|                       | wp-scripts-lint.yml | build-and-push-assets.yml | build-plugin-archive.yml | build-assets-compilation.yml | static-analysis-php.yml | lint-php.yml | tests-unit-php.yml |
| PHP_VERSION           |                     |                           | x                        | x                            | x                       | x            | x                  |
| COMPOSER_ARGS         |                     |                           | x                        | x                            | x                       | x            | x                  |
| COMPILE_ASSETS_ARGS   |                     |                           | x                        | x                            |                         |              |                    |
| PACKAGE_MANAGER       | x                   | x                         | x                        |                              |                         |              |                    |
| NODE_VERSION          | x                   | x                         | x                        | x                            |                         |              |                    |
| NODE_OPTIONS          | x                   | x                         | x                        | x                            |                         |              |                    |
| NPM_REGISTRY_DOMAIN   | x                   | x                         | x                        | x                            |                         |              |                    |
| WORKING_DIRECTORY     |                     | x                         |                          |                              |                         |              |                    |
| DEPS_INSTALL          |                     | x                         |                          |                              |                         |              |                    |
| COMPILE_SCRIPT_PROD   |                     | x                         |                          |                              |                         |              |                    |
| COMPILE_SCRIPT_DEV    |                     | x                         |                          |                              |                         |              |                    |
| ASSETS_TARGET_PATHS   |                     | x                         |                          |                              |                         |              |                    |
| PLUGIN_MAIN_FILE      |                     |                           | x                        |                              |                         |              |                    |
| PLUGIN_VERSION        |                     |                           | x                        |                              |                         |              |                    |
| ARCHIVE_NAME          |                     |                           | x                        |                              |                         |              |                    |
| PRE_SCRIPT            |                     |                           | x                        |                              |                         |              |                    |
| LINT_ARGS             |                     |                           |                          |                              |                         | x            |                    |
| PSALM_ARGS            |                     |                           |                          |                              | x                       |              |                    |
| PHPUNIT_ARGS          |                     |                           |                          |                              |                         |              | x                  |
| LINT_TOOLS            | x                   |                           |                          |                              |                         |              |                    |
| ESLINT_ARGS           | x                   |                           |                          |                              |                         |              |                    |
| STYLELINT_ARGS        | x                   |                           |                          |                              |                         |              |                    |
| MARKDOWNLINT_ARGS     | x                   |                           |                          |                              |                         |              |                    |
| PACKAGE_JSONLINT_ARGS | x                   |                           |                          |                              |                         |              |                    |

**Secrets**

| name                | workflows           |                           |                          |                              |                         |              |                    |
|---------------------|---------------------|---------------------------|--------------------------|------------------------------|-------------------------|--------------|--------------------|
|                     | wp-scripts-lint.yml | build-and-push-assets.yml | build-plugin-archive.yml | build-assets-compilation.yml | static-analysis-php.yml | lint-php.yml | tests-unit-php.yml |
| NPM_REGISTRY_TOKEN  | x                   | x                         | x                        | x                            |                         |              |                    |
| COMPOSER_AUTH_JSON  |                     |                           | x                        | x                            | x                       | x            | x                  |
| GITHUB_USER_EMAIL   |                     | x                         |                          | x                            |                         |              |                    |
| GITHUB_USER_SSH_KEY |                     | x                         |                          | x                            |                         |              |                    |
| GITHUB_USER_NAME    |                     |                           |                          | x                            |                         |              |                    |
| ENV_VARS            | x                   | x                         | x                        | x                            | x                       | x            | x                  |
