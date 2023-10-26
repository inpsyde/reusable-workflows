# Build and push assets

This action can be used to build assets in a controlled and isolated environment via GitHub Actions.

To achieve that, the reusable workflow:

1. installs dependencies defined in `package.json`
2. builds the package's assets via a build script (see below)
3. pushes built assets back to the repository (to the same branch or a defined branch)

## Where are assets stored

Two inputs can be used to define branches as assets storage - `BUILT_BRANCH_SUFFIX` and `RELEASE_BRANCH_NAME`.

`BUILT_BRANCH_SUFFIX` is used only for push to branch events. If defined, compiled assets
will be stored in the branch with name equals current branch plus suffix. For instance,
if `BUILT_BRANCH_SUFFIX` equals `-built` for pushing to the `main` branch, compiled assets will be stored
in the `main-built` branch (a branch will be created if it does not exist).

`RELEASE_BRANCH_NAME` is used only for tag events. If defined and the pushed tag points
to the last commit of the default branch of the GitHub repository, compiled assets will be pushed
to the release branch, and the tag will be moved there.
If the input is undefined or the tag points to one of the previous commits,
the compiled assets will be pushed to the detached commit, and the tag will be moved there.

The main benefit of using `BUILT_BRANCH_SUFFIX` is not to pollute the main development branch
with commits containing compiled assets. With `RELEASE_BRANCH_NAME`, you can gain linear tag history
if you always tag just the last commit from the main development branch.

## Build script

In step *2* above, the assets are "built", whatever that means for a package. For maximum
flexibility, the workflow relies on a "script" to be defined in `package.json`. There are two
possible building scripts: a "*dev*" script which is executed on regular pushes to branches, and
a "*prod*" script, which is executed when a tag is pushed.

By default, the two scripts are `encore dev` and `encore prod`, but can be configured
via [inputs](#inputs).

## Notes on the "tag" workflow

When a tag is pushed, an additional step is added to the 3-step workflow above: the **now pushed tag
is moved** to point to the commit that contains the compiled assets.

## Recommendations for consuming packages

- The consuming packages compiled assets' target folder(s) must be **git-ignored** and marked
  as `linguist-generated` in `.gitattributes`.
- The calling workflows should
  use ["concurrency" settings](https://docs.github.com/en/actions/using-jobs/using-concurrency) to
  avoid conflicts when a push happens before the current workflow is not completed.
- It is recommended for calling workflows to
  use ["paths" settings](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#example-including-paths)
  to avoid running the workflow when no asset sources are changed. It should not be used for built branches
  and release branch strategies because the sync should happen on every push.

## Simple usage example:

```yml
name: Build and push assets

on:
  workflow_dispatch:
  push:
    tags: ['*']
    branches: ['*']
    # Don't include paths if BUILT_BRANCH_SUFFIX or RELEASE_BRANCH_NAME are defined
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
      BUILT_BRANCH_SUFFIX: '-built' # Optionally, to push compiled assets to built branch
      RELEASE_BRANCH_NAME: 'release' # Optionally, to move tags to release branch
    secrets:
      GITHUB_USER_EMAIL: ${{ secrets.INPSYDE_BOT_EMAIL }}
      GITHUB_USER_NAME: ${{ secrets.INPSYDE_BOT_USER }}
      NPM_REGISTRY_TOKEN: ${{ secrets.DEPLOYBOT_PACKAGES_READ_ACCESS_TOKEN }}
```

This is not the simplest possible example, but it showcases all the recommendations.

## Configuration parameters

### Inputs

| Name                  | Default                       | Description                                                                                                                     |
|-----------------------|-------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| `NODE_OPTIONS`        | `''`                          | Space-separated list of command-line Node options                                                                               |
| `NODE_VERSION`        | `18`                          | Node version with which the assets will be compiled                                                                             |
| `NPM_REGISTRY_DOMAIN` | `https://npm.pkg.github.com/` | Domain of the private npm registry                                                                                              |
| `PACKAGE_MANAGER`     | `yarn`                        | Package manager with which the dependencies should be installed (`npm` or `yarn`)                                               |
| `WORKING_DIRECTORY`   | `'./'`                        | Working directory path                                                                                                          |
| `COMPILE_SCRIPT_PROD` | `'encore prod'`               | Script added to `npm run` or `yarn` to build production assets                                                                  |
| `COMPILE_SCRIPT_DEV`  | `'encore dev'`                | Script added to `npm run` or `yarn` to build development assets                                                                 |
| `ASSETS_TARGET_PATHS` | `'./assets'`                  | Target path(s) for compiled assets                                                                                              |
| `BUILT_BRANCH_SUFFIX` | `''`                          | Suffix to calculate target branch for pushing assets on `branch` event                                                          |
| `RELEASE_BRANCH_NAME` | `''`                          | Target branch for pushing compiled assets on `tag` event                                                                        |
| `PHP_VERSION`         | `'8.0'`                       | PHP version with which the PHP tools are to be executed                                                                         |
| `PHP_TOOLS`           | `''`                          | PHP tools supported by [shivammathur/setup-php](https://github.com/shivammathur/setup-php#wrench-tools-support) to be installed |

## Secrets

| Name                  | Description                                                                  |
|-----------------------|------------------------------------------------------------------------------|
| `NPM_REGISTRY_TOKEN`  | Authentication for the private npm registry                                  |
| `GITHUB_USER_EMAIL`   | Email address for the GitHub user configuration                              |
| `GITHUB_USER_NAME`    | Username for the GitHub user configuration                                   |
| `GITHUB_USER_SSH_KEY` | Private SSH key associated with the GitHub user passed as `GITHUB_USER_NAME` |
| `ENV_VARS`            | Additional environment variables as a JSON formatted object                  |

## FAQ

> Isn't it bad practice to push compiled assets into version control?

This is the only supported way by [Composer](https://github.com/composer/packagist/issues/903).

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
      ASSETS_TARGET_PATHS: "./assets ./modules/Foo/assets ./modules/Bar/assets"
    secrets:
      GITHUB_USER_EMAIL: ${{ secrets.INPSYDE_BOT_EMAIL }}
      GITHUB_USER_NAME: ${{ secrets.INPSYDE_BOT_USER }}
      ENV_VARS: >-
        [{"name":"EXAMPLE_USERNAME", "value":"${{ secrets.USERNAME }}"}]
```

---

> Will I have merge conflicts during PRs merging if I don't use `BUILT_BRANCH_SUFFIX`?

No, if you follow the recommendations in this document you shouldn't.

When compiled assets are `.gitignore`d, they are ignored by GitHub, even if the PR's assets conflict
with the base branch's assets. And when the PR is merged, the assets silently overwrite what is in
the base branch. This may not be correct, but it is not relevant: When merging, the workflow is run
again and, re-compiling assets to their correct status.

Also, GitHub will not even show the compiled assets in the PR if the assets are marked
as `linguist-generated` in `.gitattributes`, so the process is completely invisible to users.

---

> What happens if I push before the current workflow is completed?

By following recommendations, nothing bad. The
recommended [concurrency settings](https://docs.github.com/en/actions/using-jobs/using-concurrency)
will make sure that GitHub stops processing the incomplete workflow, and starts a new workflow as
soon as the new commit is pushed. In the end, as far as the workflow is concerned, it would be the
same as the two commits would have been made as a single commit including both.

---

> Does the workflow mess up the git history or add noise to it? How do we know which "compilation"
commit belongs to which "real" commit?

As a side effect of using the
recommended [concurrency settings] (https://docs.github.com/en/actions/using-jobs/using-concurrency)
, the git history will be linear. The compilation commit would normally refer to the previous
commit, whatever that is. In the case of cherry-picking or another non-linear branch merging, this "
linearity" could be compromised. For this reason, the workflow adds to the commit message the commit
hash that triggered the compilation.

As for the "noise", it will indeed be there. However, considering that all workflow commit messages
start with the prefix `[BOT]`, it would be quite easy to ignore them without any cognitive effort.

By defining `BUILT_BRANCH_SUFFIX`, you keep commits containing compiled assets separated in the built branch.

---

> When using commit-precise Composer version constraints like `dev-master#a1bcde`, is there a risk
of referencing a commit that has no compiled assets?

Yes. However, commit-accurate version constraints are not recommended (especially in production),
are usually temporary, and are objectively rare. And in the unlikely event that we need to maintain
a particular commit hash, we can choose the commit hash wisely.

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

---

> What version should I use when requiring the package with Composer?

For tags, the pushed tag name is always used.

For branches, it depends on the `BUILT_BRANCH_SUFFIX` input value. If the input is not provided,
you can use the branch name (i.e., `dev-main` for the `main` branch) as usual. If a suffix was defined,
the built branch should be used. I.e., when `BUILT_BRANCH_SUFFIX` is `-built` and branch `main`,
the `dev-main-built` branch should be used as the package version.
