# Deploy with Deployer

This workflow automates deployments using [Deployer](https://deployer.org/), executing the deployment recipe defined in
the consuming repository's `deployment/` directory.

To achieve that, the reusable workflow:

1. Checks out the repository
2. Sets up PHP and installs Composer dependencies (production only)
3. Optionally establishes a WireGuard VPN tunnel to reach private networks
4. Detects and builds npm workspaces if present
5. Installs Deployer from the `deployment/` directory
6. Configures SSH access to the target host
7. Runs the Deployer `deploy` command for the specified environment

## Repository structure

The consuming repository is expected to have a `deployment/` directory with its own `composer.json` that includes
Deployer as a dependency. The `deploy.php` recipe inside that directory should read connection parameters from
environment variables to avoid storing sensitive data in the repository.
The following is a basic configuration for the host in the `deploy.php` file:

```php
$hostname = getenv('DEPLOY_HOSTNAME');
$port = getenv('DEPLOY_PORT');
$user = getenv('DEPLOY_USER');

host('acme_staging')
    ->setHostname($hostname)
    ->setRemoteUser($user)
    ->setPort((int) $port)
    ->setDeployPath('~/deployments')
	->setSshArguments([
	    '-o UserKnownHostsFile=/dev/null'
		'-o StrictHostKeyChecking=no',
	]);
```

## Simple usage example

```yml
name: Deploy
on:
  workflow_dispatch:
    inputs:
      ENVIRONMENT:
        description: 'Target environment'
        required: true
        type: choice
        options:
          - staging
          - production
jobs:
  deploy:
    uses: inpsyde/reusable-workflows/.github/workflows/deploy-deployer.yml@main
    secrets:
      DEPLOY_HOSTNAME: ${{ secrets.DEPLOY_HOSTNAME }}
      DEPLOY_PORT: ${{ secrets.DEPLOY_PORT }}
      DEPLOY_USER: ${{ secrets.DEPLOY_USER }}
      GITHUB_USER_SSH_KEY: ${{ secrets.DEPLOYBOT_SSH_PRIVATE_KEY }}
      COMPOSER_AUTH_JSON: ${{ secrets.PACKAGIST_AUTH_JSON }}
    with:
      ENVIRONMENT: ${{ inputs.ENVIRONMENT }}
```

## Configuration parameters

### Inputs

| Name                  | Default                         | Description                                              |
|-----------------------|---------------------------------|----------------------------------------------------------|
| `ENVIRONMENT`         |                                 | Name of the target environment to load Deployer settings |
| `VERBOSITY`           | `'v'`                           | Deployer command verbosity                               |
| `PHP_VERSION`         | `'8.2'`                         | PHP version with which the scripts are executed          |
| `NODE_VERSION`        | `'22'`                          | Node.js version to use when npm workspaces are detected  |
| `NPM_REGISTRY_DOMAIN` | `'https://npm.pkg.github.com/'` | Domain of the private npm registry                       |

### Secrets

| Name                      | Required | Description                                                                              |
|---------------------------|----------|------------------------------------------------------------------------------------------|
| `DEPLOY_HOSTNAME`         | Yes      | Hostname or IP address of the target server                                              |
| `DEPLOY_PORT`             | Yes      | SSH port on the target server                                                            |
| `DEPLOY_USER`             | Yes      | SSH user on the target server                                                            |
| `GITHUB_USER_SSH_KEY`     | Yes      | Private SSH key used for repository checkout and remote server access                    |
| `COMPOSER_AUTH_JSON`      | Yes      | Authentication for privately hosted packages and repositories as a JSON formatted object |
| `WIREGUARD_CONFIGURATION` | No       | The full content of the WireGuard configuration file for VPN tunnel setup                |
| `NPM_REGISTRY_TOKEN`      | No       | Authentication for the private npm registry                                              |

**Example with configuration parameters:**

```yml
name: Deploy
on:
  workflow_dispatch:
    inputs:
      ENVIRONMENT:
        description: 'Target environment'
        required: true
        type: choice
        options:
          - staging
          - production
jobs:
  deploy:
    uses: inpsyde/reusable-workflows/.github/workflows/deploy-deployer.yml@main
    secrets:
      DEPLOY_HOSTNAME: ${{ secrets.DEPLOY_HOSTNAME }}
      DEPLOY_PORT: ${{ secrets.DEPLOY_PORT }}
      DEPLOY_USER: ${{ secrets.DEPLOY_USER }}
      GITHUB_USER_SSH_KEY: ${{ secrets.DEPLOYBOT_SSH_PRIVATE_KEY }}
      COMPOSER_AUTH_JSON: ${{ secrets.PACKAGIST_AUTH_JSON }}
      WIREGUARD_CONFIGURATION: ${{ secrets.WIREGUARD_CONFIGURATION }}
      NPM_REGISTRY_TOKEN: ${{ secrets.NPM_REGISTRY_TOKEN }}
    with:
      ENVIRONMENT: ${{ inputs.ENVIRONMENT }}
      PHP_VERSION: '8.3'
      NODE_VERSION: '22'
      VERBOSITY: 'vvv'
```
