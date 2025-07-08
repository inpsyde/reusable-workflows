# Build and push

This action can be used to build plugin and theme archives and push them to corresponding build branches in a controlled and isolated environment via GitHub Actions.

To achieve that, the reusable workflow:

1. Inspects the origin branch and determines the correlating build branch (prefixed with `dev/`)
2. Installs dependencies (including dev-dependencies) defined in `composer.json`
3. Installs Node.js dependencies and compiles assets via `npm run build`
4. Updates version information in plugin/theme headers and `package.json`
5. Executes [WordPress Translation Downloader](https://github.com/inpsyde/wp-translation-downloader) if configured by the package
6. Executes [PHP-Scoper](https://github.com/humbug/php-scoper) if configured by the package
7. Applies `.distignore` file filtering if present
8. Commits and pushes the build artifact to the determined build branch
9. Uploads the build as a GitHub Actions artifact for download

## Branch naming convention

The workflow automatically determines the build branch by prefixing the origin branch with `dev/`:

- `main` → `dev/main`
- `feature/user-auth` → `dev/feature/user-auth`
- `hotfix/critical-bug` → `dev/hotfix/critical-bug`

This approach keeps build artifacts separate from development branches while maintaining a clear relationship between source and build branches.

## Version handling

If no `PACKAGE_VERSION` is provided, the workflow automatically:

1. Fetches the latest public (non-draft, non-pre-release) release from the repository
2. Normalizes the branch name to be semver-compatible
3. Creates a pre-release version like `1.2.3-main` or `2.0.0-feature-user-auth`
4. Falls back to `0.0.0-{branch}` if no releases exist

## Simple usage example

```yml
name: Build and push
on:
  push:
    branches: [ main, 'feature/**' ]
  workflow_dispatch:
    inputs:
      PACKAGE_VERSION:
        description: 'Package Version'
        required: false
jobs:
  build-and-push:
    uses: inpsyde/reusable-workflows/.github/workflows/build-and-push.yml@main
    secrets:
      COMPOSER_AUTH_JSON: ${{ secrets.PACKAGIST_AUTH_JSON }}
      GITHUB_USER_EMAIL: ${{ secrets.DEPLOYBOT_EMAIL }}
      GITHUB_USER_NAME: ${{ secrets.DEPLOYBOT_USER }}
      GITHUB_USER_SSH_KEY: ${{ secrets.DEPLOYBOT_SSH_PRIVATE_KEY }}
      GITHUB_USER_SSH_PUBLIC_KEY: ${{ secrets.DEPLOYBOT_SSH_PUBLIC_KEY }}
    with:
      PACKAGE_VERSION: ${{ inputs.PACKAGE_VERSION }}
```

## Configuration parameters

### Inputs

| Name                  | Default                                                       | Description                                                                                    |
|-----------------------|---------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| `NODE_OPTIONS`        | `''`                                                          | Space-separated list of command-line Node options                                              |
| `NODE_VERSION`        | `18`                                                          | Node version with which the assets will be compiled                                            |
| `NPM_REGISTRY_DOMAIN` | `'https://npm.pkg.github.com/'`                               | Domain of the private npm registry                                                             |
| `PHP_VERSION`         | `'8.2'`                                                       | PHP version with which the PHP tools are to be executed                                        |
| `PHP_TOOLS`           | `''`                                                          | PHP tools supported by shivammathur/setup-php to be installed                                  |
| `COMPOSER_ARGS`       | `'--no-dev --prefer-dist --optimize-autoloader'`              | Set of arguments passed to Composer when gathering production dependencies                     |
| `PHP_VERSION_BUILD`   | `'8.2'`                                                       | PHP version to use when executing build tools                                                  |
| `PACKAGE_FOLDER_NAME` | `''`                                                          | The name of the package folder (falls back to the repository name)                             |
| `PACKAGE_VERSION`     | `''`                                                          | The new package version. If not provided, will use latest release version with branch name as pre-release identifier |
| `PRE_SCRIPT`          | `''`                                                          | Run custom shell code before building assets                                                   |
| `BUILT_BRANCH_NAME`   | `''`                                                          | Override the automatic build branch naming (defaults to `dev/{origin-branch}`)                 |

#### A note on `PACKAGE_VERSION`

When `PACKAGE_VERSION` is not provided, the workflow automatically generates a version by:
1. Fetching the latest public release (e.g., `1.2.3`)
2. Normalizing the branch name for semver compatibility (e.g., `feature/user-auth` → `feature-user-auth`)
3. Combining them as a pre-release version (e.g., `1.2.3-feature-user-auth`)

This ensures every build has a unique, meaningful version identifier that traces back to both the base release and the source branch.

#### A note on `BUILT_BRANCH_NAME`

By default, the workflow creates build branches with the `dev/` prefix. You can override this behavior by providing a custom `BUILT_BRANCH_NAME`. This is useful for specific branching strategies or when you need to maintain compatibility with existing build processes.

## Secrets

| Name                         | Description                                                                              |
|------------------------------|------------------------------------------------------------------------------------------|
| `COMPOSER_AUTH_JSON`         | Authentication for privately hosted packages and repositories as a JSON formatted object |
| `NPM_REGISTRY_TOKEN`         | Authentication for the private npm registry                                              |
| `GITHUB_USER_EMAIL`          | Email address for the GitHub user configuration                                          |
| `GITHUB_USER_NAME`           | Username for the GitHub user configuration                                               |
| `GITHUB_USER_SSH_KEY`        | Private SSH key associated with the GitHub user passed as `GITHUB_USER_NAME`             |
| `GITHUB_USER_SSH_PUBLIC_KEY` | Public SSH key associated with the GitHub user passed as `GITHUB_USER_NAME`              |
| `ENV_VARS`                   | Additional environment variables as a JSON formatted object                              |

**Example with configuration parameters:**

```yml
name: Build and push
on:
  push:
    branches: [ main, develop, 'feature/**', 'hotfix/**' ]
  workflow_dispatch:
    inputs:
      PACKAGE_VERSION:
        description: 'Package Version'
        required: false
      CUSTOM_BUILD_BRANCH:
        description: 'Custom build branch name'
        required: false
jobs:
  build-and-push:
    uses: inpsyde/reusable-workflows/.github/workflows/build-and-push.yml@main
    secrets:
      COMPOSER_AUTH_JSON: ${{ secrets.PACKAGIST_AUTH_JSON }}
      NPM_REGISTRY_TOKEN: ${{ secrets.NPM_REGISTRY_TOKEN }}
      GITHUB_USER_EMAIL: ${{ secrets.DEPLOYBOT_EMAIL }}
      GITHUB_USER_NAME: ${{ secrets.DEPLOYBOT_USER }}
      GITHUB_USER_SSH_KEY: ${{ secrets.DEPLOYBOT_SSH_PRIVATE_KEY }}
      GITHUB_USER_SSH_PUBLIC_KEY: ${{ secrets.DEPLOYBOT_SSH_PUBLIC_KEY }}
      ENV_VARS: >-
        [{"name":"BUILD_ENV", "value":"production"}]
    with:
      PACKAGE_VERSION: ${{ inputs.PACKAGE_VERSION }}
      BUILT_BRANCH_NAME: ${{ inputs.CUSTOM_BUILD_BRANCH }}
      NODE_VERSION: 20
      PHP_VERSION: '8.3'
      PHP_TOOLS: 'composer, wp-cli'
      PRE_SCRIPT: |
        echo "Starting custom build process..."
        composer install --no-dev --optimize-autoloader
        npm run lint
```

## Build process details

### Version Management

The workflow handles version information for both plugins and themes:

**For plugins** (when `style.css` doesn't exist):
- Updates `Version:` header in the main plugin file
- Updates `SHA:` header with the current commit hash
- Updates version in `package.json`

**For themes** (when `style.css` exists):
- Updates `Version:` header in `style.css`
- Updates `SHA:` header in `style.css`
- Updates version in `package.json`

### Asset Compilation

The workflow expects a `build` script in your `package.json`:

```json
{
  "scripts": {
    "build": "webpack --mode=production"
  }
}
```

### PHP-Scoper Integration

If a `scoper.inc.php` file is present, the workflow will:
1. Run PHP-Scoper to prefix all PHP dependencies
2. Rebuild the autoloader for the scoped dependencies
3. Ensure unique autoload cache keys to prevent conflicts

### Distignore Support

If a `.distignore` file is present, the workflow will:
1. Replace `.gitignore` with `.distignore` for the build process
2. Remove all files and directories listed in `.distignore`
3. Clean up any untracked files that match the ignore patterns

This is particularly useful for excluding source files, tests, and development tools from the final build.

## Artifact Output

The workflow produces two outputs:

1. **Build Branch**: The compiled code pushed to the `dev/{branch}` branch
2. **GitHub Artifact**: A downloadable archive named `{package-name}-{version}` containing the build (without `.git` folder)

## Recommendations

- Use [concurrency settings](https://docs.github.com/en/actions/using-jobs/using-concurrency) to prevent conflicts when multiple pushes occur rapidly
- Consider using [path filters](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#example-including-paths) to avoid unnecessary builds when only documentation changes
- Ensure your `package.json` includes a `build` script for asset compilation
- Use `.distignore` to exclude development files from the final build

**Example with concurrency and path filtering:**

```yml
name: Build and push
on:
  push:
    branches: [ main, 'feature/**' ]
    paths:
      - 'src/**'
      - 'assets/**'
      - 'package.json'
      - 'composer.json'
      - '.github/workflows/build-and-push.yml'

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: false

jobs:
  build-and-push:
    uses: inpsyde/reusable-workflows/.github/workflows/build-and-push.yml@main
    secrets:
      COMPOSER_AUTH_JSON: ${{ secrets.PACKAGIST_AUTH_JSON }}
      GITHUB_USER_EMAIL: ${{ secrets.DEPLOYBOT_EMAIL }}
      GITHUB_USER_NAME: ${{ secrets.DEPLOYBOT_USER }}
      GITHUB_USER_SSH_KEY: ${{ secrets.DEPLOYBOT_SSH_PRIVATE_KEY }}
      GITHUB_USER_SSH_PUBLIC_KEY: ${{ secrets.DEPLOYBOT_SSH_PUBLIC_KEY }}
```

**Note**: Do not set `cancel-in-progress: true` as it can interrupt the build process and lead to incomplete builds being pushed to the build branch.
