# Build and push assets

This action can be used to build your assets in a controlled and isolated environment via GitHub Actions.

To achieve that, the reusable workflow will:

1. install `package.json`dependencies
2. build package's assets via a build script (see below)
3. push built assets back to the repository.



## Building script

In step *2* above, the assets are" built", whatever that means for a package. For maximum flexibility, the workflow relies on a "script" to be defined in `pakcage.json`. There are two possible building scripts: a "*dev*" script (which will run on regular push to branches), and a "*prod*" script which will run when pushing a tag).

By default, the two scripts are `encore dev` and `encore prod` but can be configured via [inputs](#inputs).



## Notes on the "tag" workflow

When a tag is pushed, the 3-step workflow above is extended with an additional step: the **just-pushed tag is moved** to point to the commit that contains compiled assets.



## Recommendations for consuming packages

- The consuming packages compiled assets' target folder(s) must be **git-ignored and marked as `linguist-generated` in `.gitattributes`.
- The calling workflows should use [concurrency settings](https://docs.github.com/en/actions/using-jobs/using-concurrency) to avoid conflicts when a push happens before the current workflow is not completed.
- It is suggested for calling workflows to use https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#example-including-paths) to avoid running the workflow if no asset sources are changed.



## Simple usage example:

```yml
name: Build and push assets

on:
    workflow_dispatch:
    push:
    	paths:
    	    - '**workflows/assets-build-and-push.yml'
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
        secrets:
            GITHUB_USER_EMAIL: ${{ secrets.INPSYDE_BOT_EMAIL }}
            GITHUB_USER_NAME: ${{ secrets.INPSYDE_BOT_USER }}
            NPM_REGISTRY_TOKEN: ${{ secrets.DEPLOYBOT_PACKAGES_READ_ACCESS_TOKEN }}
```

This is not the "simplest" possible example, but it showcases all the recommendations.



## Configuration parameters

### Inputs

| Name                  | Default                         | Description                                                              |
|-----------------------|---------------------------------|--------------------------------------------------------------------------|
| `NODE_VERSION`        | `16`                            | Node version with which the assets will be compiled                      |
| `NPM_REGISTRY_DOMAIN` | `"https://npm.pkg.github.com/"` | Domain of the private npm registry                                       |
| `PACKAGE_MANAGER`     | `"auto"`                        | Package manager. Supported are "yarn" and "npm"                          |
| `DEPS_INSTALL`        | `"yes"`                         | Install dependencies before compiling? Options: `"yes"` (default) `"no"` |
| `COMPILE_SCRIPT_PROD` | `"encore prod"`                 | Script added to `npm run` or `yarn` to build PROD assets                 |
| `COMPILE_SCRIPT_DEV`  | `"encore dev"`                  | Script added to `npm run` or `yarn` to build DEV assets                  |
| `ASSETS_TARGET_PATHS` | `"./assets"`                    | Target path(s) for compiled assets                                       |



## Secrets

| Name                 | Description                                  |
| -------------------- | -------------------------------------------- |
| `NPM_REGISTRY_TOKEN` | Authentication for the private npm registry. |
| `GITHUB_USER_EMAIL`  | GitHub User email used in `git config`.      |
| `GITHUB_USER_NAME`   | GitHub User name used in `git config`.       |



## FAQ



> *Did not we always say that is a good practice to not push assets compiled in version control?*

*We* still don't push assets in version control, it is the GitHub Bot that puts assets in version control, not us ;-)

---



> *What will happen to outdated or invalid generated assets?*

The reusable workflow does not remove previously built assets that might cause conflicts. That is the responsibility of the consuming workflow or the "build" process. For example, using Webpack Encore, something like the following can be used to clean up previously built assets and avoid conflicts:

```js
Encore.cleanupOutputBeforeBuild( ['*.js', '*.css'] )
```

---



> *Can I have multiple output folders for my package?*

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
```

---



> *Will I have merge conflicts during PRs merging?*

No, if you follow the recommendations in this document you shouldn't. 

When compiled assets are Git-ignored, they will be ignored by GitHub even if PR assets conflict with the base branch assets. And when merged the PR assets will silently override what is in the base branch. That might not be correct, but that's not relevant: upon merge, the workflow will run again, re-compiling assets to their correct status.

Moreover, having assets marked as `linguist-generated` in `.gitattributes` will prevent GitHub from even showing compiled assets in the PR, making the process entirely transparent to users.

---



> *What will happen if I push before the current workflow is completed?*

By following recommendations, nothing bad. The recommended [concurrency settings](https://docs.github.com/en/actions/using-jobs/using-concurrency) will make sure that GitHub stops processing the incomplete workflow, and starts a new workflow as soon as the new commit is pushed. In the end, as far as the workflow is concerned, it would be the same as the two commits would have been made as a single commit including both.

---



> *Will the workflow mess with/add noise to the Git history? How do we make sure which "compilation" commit belongs to which source-changing commit?*

As a side effect of using the recommended [concurrency settings](https://docs.github.com/en/actions/using-jobs/using-concurrency), the Git history will be linear. The compilation commit would normally refer to the previous commit, whatever that is. In the case of cherry-picking or another non-linear branch merging that "linearity" could be compromised. That is why the workflow adds to the commit message the commit hash that caused the compilation to happen.

Regarding "noise", indeed it will be there. However, considering all workflow commits with be prefixed with `[BOT]` it would be pretty easy to ignore them without any cognitive effort.

---



> *When using commit-precise Composer requirements like "dev-master#a1bcde0" there's the risk to point to a package's status that has no compiled assets.*

That's true. However, commit-precise requirements are not recommended (especially in production), usually temporary, and objectively rare. In the rare case we need to keep a specific commit hash, we can surely be careful in choosing the commit hash wisely.

---



> *What happens if I create a release using GitHub UI?*

If the release is created for an existing tag, the only care needed is to wait before making the release that the workflow completes, and so the tag is moved.

Unfortunately, creating a release via GitHub UI for a non-existing tag is **incompatible** with this workflow. GitHub in that case would create a tag and then associate the release with it. However, the tag creation would not trigger the workflow. Hence the release will point to a tag that does not contain assets. And even if the workflow is configured to run on release publishing, the workflow will fail because there's no "current branch" on release, so the workflow would try to push a commit made in a "detached HEAD" status, failing.

In theory, it is possible to make the workflow 100% compliant with a release via UI. However (as of now), the complexity needed has been judged not worthwhile the effort.
