# Build and push assets

This action can be used to build assets in a controlled and isolated environment via GitHub Actions.

To achieve that, the reusable workflow:

1. installs dependencies defined in `package.json`
2. builds the package's assets via a build script (see below)
3. pushes built assets back to build branches

## What is build branches?

The workflow supports `branch` and `tag` events.

For `brach` event the new branch with `{{current_branch_name}}-built` name is created
(if it doesn't exist). The pushed code alongside with compiled assets are pushed there.

For `tag` event two options are available. If `RELEASE_BRANCH_NAME` input is defined
and tag commit points to the last main branch commit the release branch is merged with main branch,
assets get compiled and tag is moved to the release branch.

If `RELEASE_BRANCH_NAME` input is empty or the current tag points to not last main branch commit
the new detached commit with compiled assets will be created. The tag will be moved there.

## Build branches protection

Build branches should be protected from accidental pushes. It could be achieved server-side 
with GitHub branch protection rules. In this case `GITHUB_USER_SSH_KEY` secret with SSH key of user
which allowed to bypass protection must be defined.

Locally it's possible with pre-commit hook:
```shell
#!/bin/bash
# prevent commit to build branches
branch=$(git rev-parse --abbrev-ref HEAD)
suffix="-built"
release="release"
echo $branch;
if [[ "$branch" = *$suffix ]] || [ "$branch" == $release ]; then
    echo "pre-commit hook: Can not commit to the build branch."
    exit 1
fi

exit 0
```

## Build script

In step *2* above, the assets are "built", whatever that means for a package. For maximum
flexibility, the workflow relies on a "script" to be defined in `package.json`. There are two
possible building scripts: a "*dev*" script which is executed on regular pushes to branches, and
a "*prod*" script, which is executed when a tag is pushed.

By default, the two scripts are `encore dev` and `encore prod`, but can be configured
via [inputs](#inputs).

## Recommendations for consuming packages

- The calling workflows should
  use ["concurrency" settings](https://docs.github.com/en/actions/using-jobs/using-concurrency) to
  avoid conflicts when a push happens before the current workflow is not completed.
- It is recommended for calling workflows to
  use ["paths" settings](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#example-including-paths)
  to avoid running the workflow when no asset sources are changed.

## Simple usage example:

```yml
name: Build and push assets

on:
  workflow_dispatch:
  push:
    tags: ['*']
    branches: ['*']
    paths:
      - '**workflows/build-and-push-assets.yml' # the workflow file itself
      - '**.ts'
      - '**.scss'
      - '**.js'
      - '**package.json'
      - '**tsconfig.json'
      - '**yarn.lock'

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build-assets:
    uses: inpsyde/reusable-workflows/.github/workflows/build-and-push-assets.yml@main
    with:
      MAIN_BRANCH_NAME: 'main'
      RELEASE_BRANCH_NAME: 'release'
    secrets:
      GITHUB_USER_EMAIL: ${{ secrets.INPSYDE_BOT_EMAIL }}
      GITHUB_USER_NAME: ${{ secrets.INPSYDE_BOT_USER }}
      NPM_REGISTRY_TOKEN: ${{ secrets.DEPLOYBOT_PACKAGES_READ_ACCESS_TOKEN }}
```

This is not the simplest possible example, but it showcases all the recommendations.

## Configuration parameters

### Inputs

| Name                  | Required | Default                       | Description                                                                            |
|-----------------------|----------|-------------------------------|----------------------------------------------------------------------------------------|
| `NPM_REGISTRY_DOMAIN` | no       | `https://npm.pkg.github.com/` | Domain of the private npm registry                                                     |
| `NODE_VERSION`        | no       | 16                            | Node version with which the assets will be compiled                                    |
| `WORKING_DIRECTORY`   | no       | `'./'`                        | Working directory path                                                                 |
| `PACKAGE_MANAGER`     | no       | `'auto'` <sup>**^1**</sup>    | Package manager. Supported are "yarn" and "npm". Required if no lock file is available |
| `DEPS_INSTALL`        | no       | `true`                        | Whether or not to install dependencies before compiling                                |
| `COMPILE_SCRIPT_PROD` | no       | `'encore prod'`               | Script added to `npm run` or `yarn` to build production assets                         |
| `COMPILE_SCRIPT_DEV`  | no       | `'encore dev'`                | Script added to `npm run` or `yarn` to build development assets                        |
| `ASSETS_TARGET_PATHS` | no       | `'./assets'`                  | Target path(s) for compiled assets                                                     |
| `NODE_OPTIONS`        | no       | `''`                          | Space-separated list of command-line Node options                                      |
| `MAIN_BRANCH_NAME`    | yes      | `''`                          | Main repository branch ("main" or "master" usually)                                    |
| `RELEASE_BRANCH_NAME` | no       | `''`                          | Branch that will contain moved tags ("release" or something like this)                 |

<sup>**^1**</sup> `PACKAGE_MANAGER` defaults to "auto" because it tries to determine the package
manager by looking at lock file (e.g. presence of `yarn.lock` means _Yarn_, `npm-shrinkwrap.json`
or `package-lock.json` means _npm_). **In the case no lock file is found in the repository,
then `PACKAGE_MANAGER` input is required**.

## Secrets

| Name                  | Description                                                                  |
|-----------------------|------------------------------------------------------------------------------|
| `NPM_REGISTRY_TOKEN`  | Authentication for the private npm registry                                  |
| `GITHUB_USER_EMAIL`   | Email address for the GitHub user configuration                              |
| `GITHUB_USER_NAME`    | Username for the GitHub user configuration                                   |
| `GITHUB_USER_SSH_KEY` | Private SSH key associated with the GitHub user passed as `GITHUB_USER_NAME` |

## FAQ

> Isn't it bad practice to push compiled assets into version control?

Assets are stored in separated branches. The common development flow is not interrupted.

---

> What happens to outdated or invalid compiled assets?

The reusable workflow does not remove previously compiled assets that may cause conflicts. This is
the responsibility of the consuming workflow or build process. For example, when using Webpack
Encore, something like the following can be used to clean up previously created assets and avoid
conflicts:

```js
Encore.cleanupOutputBeforeBuild(['*.js', '*.css'])
```

---

> Can I have multiple output folders for my package?

Yes, the `inputs.ASSETS_TARGET_PATHS` accepts multiple space-separated paths:

```yaml
name: Build and push assets
on:
  push:
jobs:
  build-assets:
    uses: inpsyde/reusable-workflows/.github/workflows/build-and-push-assets.yml@main
    inputs:
      MAIN_BRANCH_NAME: 'main'
      ASSETS_TARGET_PATHS: "./assets ./modules/Foo/assets ./modules/Bar/assets"
    secrets:
      GITHUB_USER_EMAIL: ${{ secrets.INPSYDE_BOT_EMAIL }}
      GITHUB_USER_NAME: ${{ secrets.INPSYDE_BOT_USER }}
```

---

> How can I see development history?

To verify complied assets for branches you can checkout `-built` counterpart.
Commit with compiled assets starts from `[BUILD]` string following original commit SHA.

If you have release branch defined and always tag the last commit from the main branch 
the release branch contains linear development history with all tags.

---

> What version should I use for Composer?

For tags you can use the regular version. Tags always contains compiled assets.

For branches instead of `dev-main` you should use `dev-main-built` (the same for other branches).

Important is to run composer commands after the workflow has been completed and build branches
and tags had got compiled assets.

---

> What happens when I create a release via the GitHub UI?

When creating the release for an existing tag, you just need to wait until the workflow is complete
before creating a release. This will ensure that the release points to the "moved" tag.

Unfortunately, creating a release via the GitHub UI for a non-existing tag is **incompatible** with
this workflow. In this case, GitHub would first create a tag and then associate the release with it.
However, this tag creation would not trigger the workflow. Consequently, the release points to a tag
that does not contain any assets. And even if the workflow is configured to run when a release is
published, the workflow will fail because there is no "current branch" on release, so the workflow
would try to push a commit made in the "detached HEAD" state, which would fail.

Theoretically, it is possible to make the workflow 100% release-compatible via the UI. However, the
complexity required to do so was not deemed worthwhile.

---

> I use the `git+ssh` protocol for dependencies in `package.json`. How can I use it with this
workflow?

The workflow supports a private SSH key passed via the `GITHUB_USER_SSH_KEY` secret.

By passing a key associated with the GitHub user defined in the required `GITHUB_USER_NAME`, the
workflow can install these packages.

Please note that in such cases it is a good practice not to use a "personal" GitHub user, but an 
_ad-hoc_ "bot" user with an _ad-hoc_ private SSH key used only for the scope.
