# WordPress.org Release

This reusable workflow publishes a WordPress plugin to the [WordPress.org plugin directory](https://wordpress.org/plugins/) via SVN.

To achieve that, this workflow:

1. Validates that `PLUGIN_VERSION` is formatted as `MAJOR.MINOR.PATCH`
2. Checks out the Git repository at `GIT_REF`
3. Verifies that the version in the plugin file header and `readme.txt` `Stable tag` both match `PLUGIN_VERSION`
4. Checks out the WordPress.org SVN repository (trunk is fully checked out; tag contents are never fetched — only tag names are listed when needed for the version check)
5. Verifies the version does not already exist as an SVN tag (skipped when `UPDATE_TRUNK_ONLY=true`)
6. Synchronizes the Git working directory to SVN trunk via `rsync`, respecting `.distignore` and excluding sensitive files like `auth.json`, `.env`, and `.npmrc`
7. Commits trunk to SVN (or uploads it as an artifact in `DRY_RUN` mode)
8. Creates an SVN tag from trunk (skipped when `UPDATE_TRUNK_ONLY=true` or `DRY_RUN=true`)

> [!NOTE]
> This workflow intentionally fails if the version already exists as an SVN tag. There is no amendment flow.

## Simple usage example

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

## Staged release (trunk first, tag later)

To verify trunk on WordPress.org before publishing, run the workflow twice with the same inputs — first with `UPDATE_TRUNK_ONLY: true` (the default), then with `UPDATE_TRUNK_ONLY: false` once trunk looks correct.

> [!WARNING]
> When `UPDATE_TRUNK_ONLY=true`, the `Stable tag` in `readme.txt` must point to an **already-released** version. If it references a version that doesn't exist as an SVN tag yet, WordPress.org may fall back to serving trunk as the stable release.

## Configuration parameters

### Inputs

| Name | Default | Description |
|---|---|---|
| `SVN_PLUGIN_SLUG` | — | WordPress.org plugin slug (e.g. `my-plugin`) |
| `PLUGIN_VERSION` | — | Version to publish, must be `MAJOR.MINOR.PATCH` |
| `GIT_REF` | — | Git ref to publish (tag, branch, or commit SHA) |
| `DRY_RUN` | `false` | Upload trunk as an artifact instead of committing to SVN |
| `UPDATE_TRUNK_ONLY` | `true` | Sync trunk only; skip tag creation |

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
