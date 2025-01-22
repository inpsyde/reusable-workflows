# Update WP Dependencies

This workflow is meant to ease the task of updating the **@wordpress/name** dependencies.

We are providing two reusable workflows. 

1. One workflow lives in the package having the dependencies, we will call this "Update WP Dependencies Workflow".
2. The other workflow lives in a package that is meant to orchestrate other packages through composer, we will call this "Update WP Dependencies Orchestrator Workflow". 
    This is simply a workflow that triggers the other one in other packages.

## WP Dependencies Update Workflow

The workflow will create a PR with the updated dependencies.


### Configuration parameters for WP Dependencies Update Workflow

#### Inputs for WP Dependencies Update Workflow

| Name                  | Default                         | Description                                                                                                                                                                                                                                                                                                       |
|-----------------------|---------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `WP_SCRIPT_DIST_TAG`  | `'wp-6.7'`                      | The dist tag used by [wp-scripts packages-update](https://github.com/WordPress/gutenberg/tree/trunk/packages/scripts#packages-update). You can see which tags are available by going to any [WordPress Package in NPM](https://www.npmjs.com/package/@wordpress/blocks?activeTab=versions) and see the Tag column |
| `NPM_REGISTRY_DOMAIN` | `'https://npm.pkg.github.com/'` | Domain of the private npm registry                                                                                                                                                                                                                                                                                |


#### Secrets for WP Dependencies Update Workflow

| Name                         | Description                                                                  |
|------------------------------|------------------------------------------------------------------------------|
| `GITHUB_USER_EMAIL`          | Email address for the GitHub user configuration                              |
| `GITHUB_USER_NAME`           | Username for the GitHub user configuration                                   |
| `GITHUB_USER_SSH_KEY`        | Private SSH key associated with the GitHub user passed as `GITHUB_USER_NAME` |
| `GITHUB_USER_SSH_PUBLIC_KEY` | Public SSH key associated with the GitHub user passed as `GITHUB_USER_NAME`  |
| `NPM_REGISTRY_TOKEN`         | Authentication for the private npm registry                                  |

**Example with configuration parameters:**

```yaml
name: WordPress JS Dependencies Update
on:
  workflow_dispatch:
    inputs:
      WP_SCRIPT_DIST_TAG:
        description: The tag to use for updating the dependencies. e.g. wp-6.7
        default: wp-6.7
        required: true
        type: string
  repository_dispatch:
    types: ['update_wp_dependencies']

jobs:
  update_wp_dependencies:
    uses: inpsyde/reusable-workflows/.github/workflows/update-wordpress-js-dependencies.yml@main
    secrets:
        GITHUB_USER_EMAIL: ${{ secrets.DEPLOYBOT_EMAIL }}
        GITHUB_USER_NAME: ${{ secrets.DEPLOYBOT_USER }}
        GITHUB_USER_SSH_KEY: ${{ secrets.DEPLOYBOT_SSH_PRIVATE_KEY }}
        GITHUB_USER_SSH_PUBLIC_KEY: ${{ secrets.DEPLOYBOT_SSH_PUBLIC_KEY }}
        NPM_REGISTRY_TOKEN: ${{ secrets.DEPLOYBOT_PACKAGES_READ_ACCESS_TOKEN }}
    with:
        NPM_REGISTRY_DOMAIN: "https://npm.pkg.github.com/"
        WP_SCRIPT_DIST_TAG: ${{ inputs.WP_SCRIPT_DIST_TAG }}
```

## WP Dependencies Update Orchestrator Workflow

The workflow will trigger the WP Dependencies Update Workflow in other repositories.


### Configuration parameters for WP Dependencies Update Orchestrator Workflow

#### Inputs for WP Dependencies Update Orchestrator Workflow

| Name                  | Default    | Description                                                                                                                                                                                                                                                                                                       |
|-----------------------|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `WP_SCRIPT_DIST_TAG`  | `'wp-6.7'` | The dist tag used by [wp-scripts packages-update](https://github.com/WordPress/gutenberg/tree/trunk/packages/scripts#packages-update). You can see which tags are available by going to any [WordPress Package in NPM](https://www.npmjs.com/package/@wordpress/blocks?activeTab=versions) and see the Tag column |
| `PACKAGES`            | `''`       | A comma-separated list of repository in the form of organization-name/repository-name                                                                                                                                                                                                                             |


#### Secrets for WP Dependencies Update Orchestrator Workflow

| Name           | Description                                       |
|----------------|---------------------------------------------------|
| `GH_API_TOKEN` | A classic API token with repo and workflow access |

**Example with configuration parameters:**

```yaml
name: Call Update WordPress Deps using loop from composer and defined packages

on:
  workflow_dispatch:
    inputs:
      WP_SCRIPT_DIST_TAG:
        description: 'The WP dist tag. e.g.: wp-6.7'
        required: true
      PACKAGES:
        description: Comma separated list of packages to call the update js wordpress dependencies.
        required: false
        type: string


jobs:
  update-dependencies:
    uses: inpsyde/reusable-workflows/.github/workflows/update-wordpress-js-dependencies-orchestrator.yml@main
    with:
      WP_SCRIPT_DIST_TAG: ${{ inputs.WP_SCRIPT_DIST_TAG }}
      PACKAGES: ${{ inputs.PACKAGES }}
    secrets:
      GH_API_TOKEN: ${{ secrets.DEPLOYBOT_REPO_READ_WRITE_TOKEN }}
```

