<!-- markdownlint-disable MD024 -->

# Update WordPress JS Dependencies

This documentation describes two closely related reusable workflows for updating JavaScript
dependencies that use [WordPress packages](https://www.npmjs.com/search?q=%40wordpress%2F). These
workflows handle automatic updates of the `@wordpress/*` packages to a specified WordPress version (
dist tag) and can optionally create a pull request with all necessary changes.

1. **Update WordPress JS Dependencies Workflow**:  
   This workflow lives in an individual repository (the one containing the WordPress JS dependencies
   to update). It checks out the repository, updates the `@wordpress/*` dependencies to a specific
   tag, and opens a pull request if changes are found.

2. **Update WordPress JS Dependencies Orchestrator Workflow**:  
   This workflow can be placed in a single "orchestrator" repository (e.g., a website repository).
   It triggers the "Update WordPress JS Dependencies Workflow" in multiple other repositories. This
   is accomplished by sending
   a [repository\_dispatch](https://docs.github.com/en/rest/repos/repos#create-a-repository-dispatch-event)
   event to each of the target repositories.

## Update WordPress JS Dependencies Workflow

This workflow updates the `@wordpress/*` dependencies in the current repository to a specified
WordPress version tag (e.g., `wp-6.7`) and creates a pull request containing all modified files.

### Configuration parameters

#### Inputs

| Name                  | Default                         | Description                                           |
|-----------------------|---------------------------------|-------------------------------------------------------|
| `WP_DIST_TAG`          | `'wp-6.7'`                      | The tag to update the dependencies to, e.g., `wp-6.7` |
| `NPM_REGISTRY_DOMAIN` | `'https://npm.pkg.github.com/'` | Domain of the private npm registry                    |

#### Secrets

| Name                         | Description                                                                  |
|------------------------------|------------------------------------------------------------------------------|
| `NPM_REGISTRY_TOKEN`         | Authentication for the private npm registry                                  |
| `GITHUB_USER_EMAIL`          | Email address for the GitHub user configuration                              |
| `GITHUB_USER_NAME`           | Username for the GitHub user configuration                                   |
| `GITHUB_USER_SSH_KEY`        | Private SSH key associated with the GitHub user passed as `GITHUB_USER_NAME` |
| `GITHUB_USER_SSH_PUBLIC_KEY` | Public SSH key associated with the GitHub user passed as `GITHUB_USER_NAME`  |

### Usage example

```yml
name: Update WordPress JS Dependencies

on:
  workflow_dispatch:
    inputs:
      WP_DIST_TAG:
        description: 'The tag to update the dependencies to, e.g., `wp-6.7`.'
        default: 'wp-6.7'
        required: true
        type: string
  repository_dispatch:
    types: [ 'update_wp_dependencies' ]

jobs:
  update-dependencies:
  uses: inpsyde/reusable-workflows/.github/workflows/update-wordpress-js-dependencies.yml@main
  secrets:
    GITHUB_USER_EMAIL: ${{ secrets.DEPLOYBOT_EMAIL }}
    GITHUB_USER_NAME: ${{ secrets.DEPLOYBOT_USER }}
    GITHUB_USER_SSH_KEY: ${{ secrets.DEPLOYBOT_SSH_PRIVATE_KEY }}
    GITHUB_USER_SSH_PUBLIC_KEY: ${{ secrets.DEPLOYBOT_SSH_PUBLIC_KEY }}
    NPM_REGISTRY_TOKEN: ${{ secrets.DEPLOYBOT_PACKAGES_READ_ACCESS_TOKEN }}
  with:
    WP_DIST_TAG: ${{ inputs.WP_DIST_TAG }}
```

## Update WordPress JS Dependencies Orchestrator Workflow

This workflow triggers the “Update WordPress JS Dependencies Workflow” in multiple external
repositories by sending a `repository_dispatch` event to each target repository. This allows you to
maintain a centralized list of repositories needing consistent WordPress JS dependency versions.

### Configuration parameters

#### Inputs

| Name         | Default    | Description                                                    |
|--------------|------------|----------------------------------------------------------------|
| `WP_DIST_TAG` | `'wp-6.7'` | The tag to update the dependencies to, e.g., `wp-6.7`          |
| `PACKAGES`   | `''`       | Comma-separated list of additional `owner/repo`s to be updated |

#### Secrets

| Name           | Description                                                                                                             |
|----------------|-------------------------------------------------------------------------------------------------------------------------|
| `GH_TOKEN` | A personal access token (classic) with `repo` and `workflow` permissions, used to authenticate when calling GitHub APIs |

### Usage example

```yml
name: Update WordPress JS Dependencies Orchestrator

on:
  workflow_dispatch:
    inputs:
      WP_DIST_TAG:
        description: 'The tag to update the dependencies to, e.g., `wp-6.7`'
        required: true
      PACKAGES:
        description: 'Comma-separated list of additional `owner/repo`s to be updated.'
        required: false
        type: string

jobs:
  update-dependency-orchestrator:
    uses: inpsyde/reusable-workflows/.github/workflows/update-wordpress-js-dependencies-orchestrator.yml@main
    with:
      WP_DIST_TAG: ${{ inputs.WP_DIST_TAG }}
      PACKAGES: ${{ inputs.PACKAGES }}
    secrets:
      GH_TOKEN: ${{ secrets.DEPLOYBOT_REPO_READ_WRITE_TOKEN }}
```
