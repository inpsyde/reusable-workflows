# WordPress.org Release

This reusable workflow publishes a WordPress plugin to the [WordPress.org plugin directory](https://wordpress.org/plugins/) via SVN.

To achieve that, this workflow:

1. Validates that `PLUGIN_VERSION` is formatted as `MAJOR.MINOR.PATCH`
2. Checks out the Git repository at `GIT_REF`
3. Verifies that the plugin file header's `Version:` matches `PLUGIN_VERSION`
4. Checks out the WordPress.org SVN repository (trunk is fully checked out; tag contents are never fetched — only tag names are listed when needed for the checks below)
5. Verifies `readme.txt`'s `Stable tag`, depending on `UPDATE_TRUNK_ONLY`:
   - `true` (trunk-only): must already exist as a published SVN tag
   - `false` (new release): must equal `PLUGIN_VERSION`, and must not already exist as an SVN tag
6. Synchronizes the Git working directory to SVN trunk via `rsync` (reporting every added, deleted, or changed file via `--itemize-changes`), respecting `.distignore` and excluding sensitive files like `auth.json`, `.env`, and `.npmrc`
7. Prints the full `svn status` of trunk, so the exact set of additions, deletions, and modifications is visible before anything is committed
8. Commits trunk to SVN (or uploads it as an artifact in `DRY_RUN` mode)
9. Creates an SVN tag from trunk (skipped when `UPDATE_TRUNK_ONLY=true` or `DRY_RUN=true`)

> [!NOTE]
> When creating a new release (`UPDATE_TRUNK_ONLY=false`), this workflow intentionally fails if the version already exists as an SVN tag. There is no amendment flow.

> [!IMPORTANT]
> The plugin's SVN repository must already exist on WordPress.org before running this workflow — including in `DRY_RUN` mode. Initial plugin submission requires a separate manual process via the [WordPress.org plugin submission form](https://wordpress.org/plugins/developers/add/).

## Simple usage example

This workflow cannot be triggered directly. Create a workflow file in your plugin's repository that calls it via `uses:`, as shown below.

```yml
name: Publish to WordPress.org
on:
  workflow_dispatch:
    inputs:
      PLUGIN_VERSION:
        description: 'Version to publish (MAJOR.MINOR.PATCH)'
        required: true
      GIT_REF:
        description: 'Git tag or branch to publish'
        required: true
      UPDATE_TRUNK_ONLY:
        description: 'Only update trunk, skip tag creation'
        type: boolean
        default: true
jobs:
  publish:
    uses: inpsyde/reusable-workflows/.github/workflows/wordpress-org-release.yml@main
    with:
      SVN_PLUGIN_SLUG: my-plugin
      PLUGIN_VERSION: ${{ inputs.PLUGIN_VERSION }}
      GIT_REF: ${{ inputs.GIT_REF }}
      UPDATE_TRUNK_ONLY: ${{ inputs.UPDATE_TRUNK_ONLY == 'true' }}
    secrets:
      SVN_USERNAME: ${{ secrets.SVN_USERNAME }}
      SVN_PASSWORD: ${{ secrets.SVN_PASSWORD }}
      GITHUB_USER_SSH_KEY: ${{ secrets.GITHUB_USER_SSH_KEY }}
```

## Trigger on Git tag push

If your release process creates a Git tag named after the version (e.g. `1.2.3`), the version can be derived directly from the tag — no manual input needed:

```yml
name: Publish to WordPress.org
on:
  push:
    tags: ['[0-9]*.[0-9]*.[0-9]*']
jobs:
  publish:
    uses: inpsyde/reusable-workflows/.github/workflows/wordpress-org-release.yml@main
    with:
      SVN_PLUGIN_SLUG: my-plugin
      PLUGIN_VERSION: ${{ github.ref_name }}
      GIT_REF: ${{ github.ref }}
      UPDATE_TRUNK_ONLY: false
    secrets:
      SVN_USERNAME: ${{ secrets.SVN_USERNAME }}
      SVN_PASSWORD: ${{ secrets.SVN_PASSWORD }}
      GITHUB_USER_SSH_KEY: ${{ secrets.GITHUB_USER_SSH_KEY }}
```

> [!NOTE]
> This pattern requires tags to be named as bare versions (`1.2.3`, not `v1.2.3`). If your project uses `v`-prefixed tags, strip the prefix before passing it: `PLUGIN_VERSION: ${{ github.ref_name }}` would need to become a separate step that outputs `${GITHUB_REF_NAME#v}`.

> [!WARNING]
> The version derived from the Git tag must match the `Version:` header in the main plugin file and the `Stable tag` in `readme.txt`. The workflow will fail if they don't all agree. Make sure these are updated in the same commit that the tag points to.

## Advanced usage: requiring manual approval before tagging

To require a manual approval step before the SVN tag is created, add an `environment:` key to the calling job and configure protection rules (required reviewers, wait timers, etc.) for that environment in your repository settings under **Settings → Environments**.

```yml
name: Publish to WordPress.org
on:
  workflow_dispatch:
    inputs:
      PLUGIN_VERSION:
        description: 'Version to publish (MAJOR.MINOR.PATCH)'
        required: true
      GIT_REF:
        description: 'Git tag or branch to publish'
        required: true
      UPDATE_TRUNK_ONLY:
        description: 'Only update trunk, skip tag creation'
        type: boolean
        default: true
jobs:
  publish:
    environment: wordpress-org-release  # enforces protection rules configured in repository settings
    uses: inpsyde/reusable-workflows/.github/workflows/wordpress-org-release.yml@main
    with:
      SVN_PLUGIN_SLUG: my-plugin
      PLUGIN_VERSION: ${{ inputs.PLUGIN_VERSION }}
      GIT_REF: ${{ inputs.GIT_REF }}
      UPDATE_TRUNK_ONLY: ${{ inputs.UPDATE_TRUNK_ONLY == 'true' }}
    secrets:
      SVN_USERNAME: ${{ secrets.SVN_USERNAME }}
      SVN_PASSWORD: ${{ secrets.SVN_PASSWORD }}
      GITHUB_USER_SSH_KEY: ${{ secrets.GITHUB_USER_SSH_KEY }}
```

> [!NOTE]
> The `environment:` key alone does nothing — protection rules must be explicitly configured in repository settings. An environment with no rules configured provides no approval gate.

## Preview trunk before a release

`UPDATE_TRUNK_ONLY` controls which of two modes the workflow runs in:

- **Trunk-only** (`UPDATE_TRUNK_ONLY: true`, the default): syncs trunk, creates no tag, and requires `readme.txt`'s `Stable tag` to already exist as a published SVN tag — not to equal `PLUGIN_VERSION`. This lets testers grab the upcoming release straight from SVN trunk without it being served as the official "stable" version to everyone else.
- **New release** (`UPDATE_TRUNK_ONLY: false`): syncs trunk and creates a tag, and requires `readme.txt`'s `Stable tag` (along with the plugin file's `Version:` header) to equal `PLUGIN_VERSION`, which must not already exist as an SVN tag.

To preview trunk before publishing, run the workflow twice with the same `PLUGIN_VERSION` and `GIT_REF` — first with `UPDATE_TRUNK_ONLY: true`, then with `UPDATE_TRUNK_ONLY: false` once trunk looks correct. These are two independent, full runs, not two halves of one pipeline: the second run doesn't pick up where the first left off, it re-syncs and re-commits the whole of trunk from scratch and then additionally creates the tag. Keep `readme.txt`'s `Stable tag` pointing at the last published version until that second run; only bump it — together with the plugin file's `Version:` header — when you're ready to actually create the tag.

> [!NOTE]
> The trunk-only check exists because [WordPress.org serves the plugin from trunk instead of a tag when `Stable tag` points to a tag that doesn't exist](https://developer.wordpress.org/plugins/wordpress-org/how-your-readme-txt-works/#how-the-readme-is-parsed) — without it, a trunk-only sync could accidentally push the in-progress release out as "stable" to regular users.

> [!NOTE]
> WordPress.org reads `readme.txt` from the tag that `Stable tag` points to, not from trunk. Updating `readme.txt` in trunk alone will not update the plugin page — a new tag must be created.

## Configuration parameters

### Inputs

| Name | Required | Default | Description |
|---|---|---|---|
| `SVN_PLUGIN_SLUG` | yes | — | WordPress.org plugin slug (e.g. `my-plugin`) |
| `PLUGIN_VERSION` | yes | — | Version to publish, must be `MAJOR.MINOR.PATCH` |
| `GIT_REF` | yes | — | Git ref to publish (tag, branch, or commit SHA) |
| `DRY_RUN` | no | `false` | Upload trunk as an artifact instead of committing to SVN |
| `UPDATE_TRUNK_ONLY` | no | `true` | Sync trunk only; skip tag creation |

### Secrets

| Name | Required | Description |
|---|---|---|
| `SVN_USERNAME` | yes | WordPress.org SVN username |
| `SVN_PASSWORD` | yes | WordPress.org SVN password |
| `GITHUB_USER_SSH_KEY` | yes | SSH key used to check out the Git repository |

> [!NOTE]
> WordPress.org SVN does not support SSH keys or tokens. The `SVN_USERNAME` and `SVN_PASSWORD` secrets are the only supported authentication method.

## File exclusions

The following files are always excluded from the SVN sync, regardless of `.distignore`:

- `.git`, `.svn`
- `.env`, `.env.*`
- `auth.json`, `.npmrc`
- `.distignore` itself

Additional exclusions can be specified via a `.distignore` file in the repository root (same format used by `wp dist-archive`).
