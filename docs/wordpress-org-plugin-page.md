# WordPress.org Plugin Page

This reusable workflow updates what the [WordPress.org plugin directory](https://wordpress.org/plugins/) shows on a plugin's page (the `readme.txt` and the banners, icons, screenshots, and Playground blueprints) **without releasing a new plugin version**.

Use it for changes like:

- adding or removing promotional links in `readme.txt`
- bumping `Tested up to` after verifying compatibility with a new WordPress release
- fixing typos, FAQ entries, or screenshot captions
- temporarily swapping a banner (e.g. for a campaign) and reverting it later
- refreshing screenshots or adding a Playground preview blueprint

To ship new plugin code, use [WordPress.org Release](./wordpress-org-release.md) instead. That workflow also publishes `readme.txt` as part of every release, so both workflows keep the plugin page in sync with Git.

To achieve that, this workflow:

1. Checks out the Git repository at `GIT_REF`
2. When `SYNC_README` is enabled, reads the `Stable tag` from `readme.txt`
3. When `SYNC_ASSETS` is enabled, validates every file in `ASSETS_DIR` (names, size limits, real image format and dimensions, blueprint JSON), and fails if the directory is missing or empty, or contains symlinks or unsupported subdirectories
4. Checks out only the needed parts of the WordPress.org SVN repository: `trunk/readme.txt`, the list of tags, the readme of the stable tag, and `/assets`. Plugin code is never fetched
5. Verifies that the `Stable tag` in Git equals the `Stable tag` in SVN trunk and that this tag exists
6. Copies `readme.txt` into `tags/<Stable tag>/` (which is what WordPress.org renders) and into `trunk/`. The trunk copy is skipped with a warning if trunk contains unreleased changes, see [Trunk previews](#trunk-previews). A warning is also shown if `Requires at least` or `Requires PHP` changes: unless the main plugin file declares them, WordPress uses these values to block installs and updates of the published version on sites that don't meet them. A notice reminds about [Release Confirmation](#release-confirmation) whenever the tag's `readme.txt` changes
7. Mirrors `ASSETS_DIR` to SVN `/assets` via `rsync --delete`, so files removed from Git are removed from WordPress.org as well, and sets the correct `svn:mime-type` on every asset. Fails if this would remove the last icon or banner from the plugin page, and warns if it removes all screenshots
8. Fails if anything would change that the enabled options don't allow: `trunk/readme.txt` and `tags/<Stable tag>/readme.txt` with `SYNC_README`, and recognized asset files in `/assets` with `SYNC_ASSETS`
9. Shows the `svn status`, the removed files, and the `readme.txt` diff in the log and in the job summary on the run page
10. Commits all changes in a single SVN commit (or uploads them as an artifact in `DRY_RUN` mode). If nothing changed, the workflow ends successfully without committing

> [!IMPORTANT]
> This workflow never creates tags, never changes the `Stable tag`, and never touches plugin code. Changing the `Stable tag` means publishing a different version, which is a release.

> [!NOTE]
> WordPress.org renders the plugin page from the `readme.txt` in the tag that `Stable tag` points to, not from trunk. The WordPress.org [plugin developer FAQ](https://developer.wordpress.org/plugins/wordpress-org/plugin-developer-faq/#do-i-need-to-release-a-new-version-of-my-plugin-every-time-i-update-the-readme) explicitly allows cosmetic readme and asset changes without a new release, as long as both trunk and the tag are updated.

> [!NOTE]
> Assets are served through a CDN and cached heavily. Changes can take a few minutes, and under high load up to several hours, to show up on the plugin page.

## Simple usage example

This workflow cannot be triggered directly. Create a workflow file in your plugin's repository that calls it via `uses:`, as shown below.

```yml
name: Update WordPress.org plugin page
on:
  workflow_dispatch:
    inputs:
      GIT_REF:
        description: 'Git tag or branch to read readme.txt and assets from'
        required: true
      SYNC_README:
        description: 'Update readme.txt'
        type: boolean
        default: true
      SYNC_ASSETS:
        description: 'Update banners, icons, screenshots, and blueprints'
        type: boolean
        default: true
      DRY_RUN:
        description: 'Upload the changes as an artifact instead of committing to SVN'
        type: boolean
        default: true
jobs:
  update-plugin-page:
    uses: inpsyde/reusable-workflows/.github/workflows/wordpress-org-plugin-page.yml@main
    with:
      SVN_PLUGIN_SLUG: my-plugin
      GIT_REF: ${{ inputs.GIT_REF }}
      SYNC_README: ${{ inputs.SYNC_README }}
      SYNC_ASSETS: ${{ inputs.SYNC_ASSETS }}
      DRY_RUN: ${{ inputs.DRY_RUN }}
    secrets:
      SVN_USERNAME: ${{ secrets.SVN_USERNAME }}
      SVN_PASSWORD: ${{ secrets.SVN_PASSWORD }}
```

`GIT_REF` should point to a ref whose `readme.txt` describes the **currently published** version, such as the Git tag of the latest release plus the cosmetic change, or the branch that holds the released state. A development branch whose `readme.txt` already carries the next version's `Stable tag` fails the Stable tag check by design.

> [!IMPORTANT]
> `DRY_RUN` defaults to `true`, so a caller that doesn't pass it only previews the changes. Set `DRY_RUN: false` to actually update the plugin page.

## Advanced usage: requiring manual approval

To require approval before the plugin page is updated, add an `environment:` key to the calling job and configure protection rules (required reviewers, wait timers, etc.) for that environment in your repository settings under **Settings → Environments**.

```yml
jobs:
  update-plugin-page:
    environment: wordpress-org  # enforces protection rules configured in repository settings
    uses: inpsyde/reusable-workflows/.github/workflows/wordpress-org-plugin-page.yml@main
    with:
      SVN_PLUGIN_SLUG: my-plugin
      GIT_REF: ${{ inputs.GIT_REF }}
      DRY_RUN: false
    secrets:
      SVN_USERNAME: ${{ secrets.SVN_USERNAME }}
      SVN_PASSWORD: ${{ secrets.SVN_PASSWORD }}
```

> [!NOTE]
> The `environment:` key alone does nothing: protection rules must be explicitly configured in repository settings. An environment with no rules configured provides no approval gate.

> [!WARNING]
> An environment's **deployment branch** rule restricts the ref the *calling* workflow runs from, not `GIT_REF`. With `GIT_REF` as a free-text input, anyone allowed to run the workflow can publish the readme and assets from any branch, regardless of the environment rule. If you rely on branch rules, pass `${{ github.sha }}` or `${{ github.ref_name }}` as `GIT_REF`, or offer a `choice` input instead.

## Adopting the workflow

Assets are mirrored, so the assets directory in Git must contain **every** asset that should stay on WordPress.org. Before the first run, import the current assets from SVN:

```shell
svn export https://plugins.svn.wordpress.org/my-plugin/assets .wordpress-org
```

Then:

1. Commit the `.wordpress-org` directory. Don't store it in Git LFS, see [Supported asset files](#supported-asset-files).
2. Add `.wordpress-org/` to `.distignore` so the assets don't end up in the plugin package or in SVN trunk during releases.
3. Run the workflow with `DRY_RUN: true`. The SVN changes in the job summary should list **no content changes** in `/assets`. Property-only changes (` M`) are expected where existing assets lack the correct `svn:mime-type`.
4. Fix any files the validation rejects. Some are ignored by WordPress.org (e.g. `icon_128x128.png`), others are only rejected by this workflow's stricter rules (e.g. a raster fallback for `icon.svg`).

## Trunk previews

If SVN `trunk/readme.txt` differs from `tags/<Stable tag>/readme.txt` before the sync, trunk holds unreleased changes, for example a preview published with the release workflow's `UPDATE_TRUNK_ONLY` mode. Overwriting it would silently revert those changes, so in that case the workflow only updates the tag's `readme.txt` and shows a warning, both as an annotation and in the job summary. Make sure the same change is part of the upcoming release, so that it isn't lost when the next version is published.

## Release Confirmation

[Release Confirmation](https://developer.wordpress.org/plugins/wordpress-org/release-confirmation-emails/) is an opt-in WordPress.org feature that requires committers to confirm every release by email. Plugin committers can check whether it is enabled for the plugin on WordPress.org.

> [!WARNING]
> For plugins with Release Confirmation enabled, the handbook explicitly states that released tags can't be altered, including the readme (e.g. for `Tested up to`). Updating `readme.txt` with this workflow is therefore **not officially supported** for these plugins. Use it at your own risk, or keep `SYNC_README: false` and ship readme changes with the next release.

Judging by the plugin directory importer's code, the scenario appears to be handled: WordPress.org treats any commit to an already released tag as a [modified release](https://github.com/WordPress/wordpress.org/commit/8d1727f0e331ccfebce432bdfcf4c30db16e2803), even one that only changes `readme.txt`. Updating `tags/<Stable tag>/readme.txt` then:

- reopens that release for confirmation and sends the confirmation email to all committers again
- restarts the release cooldown
- keeps the plugin page from updating until the release is confirmed again

This behavior isn't documented and may change. It's also unclear whether the downloadable ZIP of the release is rebuilt with the new `readme.txt`.

Asset-only runs (`SYNC_README: false`) don't touch any tag and are not affected.

## Supported asset files

Any file with a name WordPress.org would ignore fails the validation. On top of the WordPress.org rules, this workflow requires:

- a raster fallback for `icon.svg`
- at least one default (non-localized) icon and banner, if the plugin page has them today. A run that would remove the last one fails, which catches an incomplete assets directory. To remove them on purpose, delete them by hand in SVN
- at most 10 blueprints (WordPress.org would silently import only the first 10)
- banners and raster icons with exactly the dimensions their name says, and raster files in the format their extension says
- regular files only: symlinks and subdirectories other than `blueprints/` are rejected

Hidden files like `.gitkeep` are ignored.

| Type | File names | Formats | Max size |
|---|---|---|---|
| Banner | `banner-772x250`, `banner-1544x500` | png, jpg, jpeg, gif | 4 MB |
| Icon | `icon-128x128`, `icon-256x256`, `icon.svg` | png, jpg, jpeg, gif (`icon.svg` requires one of them as fallback) | 1 MB |
| Screenshot | `screenshot-1`, `screenshot-2`, … | png, jpg, jpeg, gif | 10 MB |
| Blueprint | `blueprints/blueprint.json`, `blueprints/blueprint-<name>.json` | JSON object or array, max. 10 files | 100 KB |

Banners, icons, and screenshots can be localized with an `-rtl` and/or a locale suffix, e.g. `banner-772x250-rtl.png`, `banner-1544x500-de.png`, or `screenshot-1-es_ES.png`. Screenshot captions come from the `== Screenshots ==` section of `readme.txt`. See [Plugin Assets](https://developer.wordpress.org/plugins/wordpress-org/plugin-assets/) for details.

> [!WARNING]
> Git LFS is not supported. `actions/checkout` doesn't fetch LFS files by default, so the workflow would see small pointer files instead of images. The format check rejects them.

> [!NOTE]
> A blueprint enables the "Live Preview" button for plugin committers only. To show it to everyone, a committer must set the preview to public in the plugin's **Advanced View** on WordPress.org. See [Previews and Blueprints](https://developer.wordpress.org/plugins/wordpress-org/previews-and-blueprints/).

## Configuration parameters

### Inputs

| Name | Required | Default | Description |
|---|---|---|---|
| `SVN_PLUGIN_SLUG` | yes | — | WordPress.org plugin slug (e.g. `my-plugin`) |
| `GIT_REF` | yes | — | Git ref to read `readme.txt` and the assets directory from (tag, branch, or commit SHA) |
| `SYNC_README` | no | `true` | Update `readme.txt` in SVN trunk and in the tag referenced by `Stable tag` |
| `SYNC_ASSETS` | no | `true` | Mirror `ASSETS_DIR` to the SVN `/assets` directory |
| `ASSETS_DIR` | no | `.wordpress-org` | Directory in the Git repository holding the WordPress.org assets |
| `DRY_RUN` | no | `true` | Upload the files that would be committed as an artifact instead of committing to SVN |

At least one of `SYNC_README` and `SYNC_ASSETS` must be enabled.

### Secrets

| Name | Required | Description |
|---|---|---|
| `SVN_USERNAME` | yes | WordPress.org SVN username |
| `SVN_PASSWORD` | yes | WordPress.org SVN password |

> [!NOTE]
> WordPress.org SVN does not support SSH keys or tokens. The `SVN_USERNAME` and `SVN_PASSWORD` secrets are the only supported authentication method.

## Dry run

With `DRY_RUN: true`, nothing is committed. The job summary on the run page shows every file that would be added (`A`), deleted (`D`), modified (`M`), or have its properties changed (` M`), lists removed files separately, and shows the `readme.txt` diff.

If anything would change, an artifact named `<slug>-plugin-page` is uploaded. It contains exactly what would be committed, in its final state, each only if it would change:

- `tags/<Stable tag>/readme.txt`
- `trunk/readme.txt` (see [Trunk previews](#trunk-previews))
- `assets/`: the complete assets directory, if anything in it would change

If nothing would change, no artifact is uploaded and the job summary says that the plugin page is already up to date.

## Troubleshooting

Changes are committed in a single atomic SVN commit, and a run without changes succeeds. If a run fails, even in the commit step because of a network error, **Re-run failed jobs** is always safe. The re-run either commits the changes or reports that the plugin page is already up to date, so there is no need to fix anything in SVN by hand. If the commit failed because someone else committed in the meantime (e.g. a release running at the same time), wait until that run has finished. If that was a release, the re-run fails the Stable tag check instead, because the release published a new version: run the workflow again with a `GIT_REF` that matches it. If `GIT_REF` is a branch, a re-run uses its current state, which may include newer commits.
