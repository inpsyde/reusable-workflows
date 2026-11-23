# WordPress.org Plugin Page

This reusable workflow updates what the [WordPress.org plugin directory](https://wordpress.org/plugins/) shows on a plugin's page (the `readme.txt` and the banners, icons, screenshots, and Playground blueprints) **without releasing a new plugin version**.

Use it for changes like:

- adding or removing promotional links in `readme.txt`
- bumping `Tested up to` after verifying compatibility with a new WordPress release
- fixing typos, FAQ entries, or screenshot captions
- temporarily swapping a banner (e.g. for a campaign) and reverting it later
- refreshing screenshots or adding a Playground preview blueprint

To ship new plugin code, use [WordPress.org Release](./wordpress-org-release.md) instead. That workflow also publishes `readme.txt` as part of every release, but not the assets, see [Common tasks](#common-tasks).

How it works:

- **Validate:** with `SYNC_README`, `readme.txt` must be a regular file (not a symlink) with exactly one `Stable tag:` line before the first `== Section ==`. With `SYNC_ASSETS`, every file in `ASSETS_DIR` must be a [supported asset](#supported-asset-files).
- **Check the version:** with `SYNC_README`, the `Stable tag` in Git must equal the one in SVN trunk, and that tag must exist. Only `trunk/readme.txt`, the tag's `readme.txt`, and `/assets` are checked out from SVN, never plugin code.
- **Sync:** `readme.txt` is copied into `tags/<Stable tag>/` (which WordPress.org renders) and `trunk/`, see [Trunk previews](#trunk-previews) and [Release Confirmation](#release-confirmation). `ASSETS_DIR` is mirrored to `/assets`, so files removed from Git are removed from WordPress.org too. The run fails if it would remove the last icon or banner, or change anything other than these files, and warns if it removes all screenshots.
- **Publish:** the changes are shown in the job summary, then committed in a single SVN commit, or uploaded as an artifact in a [dry run](#dry-run). A run without changes succeeds without committing.

> [!IMPORTANT]
> This workflow never creates tags, never changes the `Stable tag`, and never touches plugin code. Changing the `Stable tag` means publishing a different version, which is a release.

> [!NOTE]
> WordPress.org renders the plugin page from the `readme.txt` in the tag that `Stable tag` points to, not from trunk. The WordPress.org [plugin developer FAQ](https://developer.wordpress.org/plugins/wordpress-org/plugin-developer-faq/#do-i-need-to-release-a-new-version-of-my-plugin-every-time-i-update-the-readme) explicitly allows cosmetic readme and asset changes without a new release, as long as both trunk and the tag are updated.

> [!NOTE]
> `Requires at least` and `Requires PHP` in `readme.txt` aren't just displayed: unless the main plugin file declares them, WordPress uses them to block installs and updates of the published version on sites that don't meet them. The workflow warns when a run changes them.

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

For which ref to pass as `GIT_REF`, see [Choosing `GIT_REF`](#choosing-git_ref).

> [!IMPORTANT]
> `DRY_RUN` defaults to `true`, so a caller that doesn't pass it only previews the changes. Set `DRY_RUN: false` to actually update the plugin page.

## Choosing `GIT_REF`

The workflow publishes `readme.txt` and `ASSETS_DIR` from `GIT_REF` as they are, and ignores the plugin code. In `GIT_REF`, both should match what is currently published, plus only the change you want to publish.

To get there, create a branch from the latest release: its Git tag, or the commit you released from if you don't tag releases. If the plugin page was updated with this workflow after the release, create it from that update's branch instead, or your run reverts that update.

```shell
git switch -c plugin-page/tested-up-to-6.9 v1.2.3
# edit readme.txt, e.g. "Tested up to: 6.9"
git commit -am "Bump Tested up to 6.9"
git push -u origin HEAD
```

1. Run the workflow with `GIT_REF: plugin-page/tested-up-to-6.9` and `DRY_RUN: true`. In the job summary, the SVN changes and the `readme.txt` diff should show only your change.
2. Run it again with `DRY_RUN: false`.
3. Merge the branch into your development branch, so the next release keeps the change.

> [!WARNING]
> A development branch is risky as `GIT_REF`. Until the next release, its `Stable tag` usually still names the published version, so the Stable tag check passes. But its `readme.txt` may already contain a changelog entry, upgrade notice, or FAQ entries for the next version, and its assets may include screenshots of unreleased features. The workflow publishes all of it without a warning.

## Common tasks

Make each change on a branch created as described in [Choosing `GIT_REF`](#choosing-git_ref), and check the dry run before publishing.

| Task | Change on the branch | `SYNC_README` | `SYNC_ASSETS` |
|---|---|---|---|
| Bump `Tested up to`, add or remove a promo link | `readme.txt` | `true` | `false` |
| Campaign banner | Replace `banner-*.png` in `.wordpress-org/` | `false` | `true` |
| Revert the campaign banner | `git revert` the banner commit, and merge the revert into your development branch too | `false` | `true` |
| New screenshots | `screenshot-N.png` and its caption in `== Screenshots ==` | `true` | `true` |
| Playground preview | Add `blueprints/blueprint.json`, then make the preview public in the plugin's **Advanced View** | `false` | `true` |
| Keep assets current after each release | None, see below | `false` | `true` |

The release workflow doesn't publish `.wordpress-org/` (it's excluded via `.distignore`, see [Adopting the workflow](#adopting-the-workflow)), so assets changed in Git only reach WordPress.org with this workflow. To publish them with every release, run it right after the release:

```yml
jobs:
  release:
    uses: inpsyde/reusable-workflows/.github/workflows/wordpress-org-release.yml@main
    with:
      SVN_PLUGIN_SLUG: my-plugin
      PLUGIN_VERSION: ${{ inputs.PLUGIN_VERSION }}
      GIT_REF: ${{ inputs.GIT_REF }}
      UPDATE_TRUNK_ONLY: false
    secrets:
      SVN_USERNAME: ${{ secrets.SVN_USERNAME }}
      SVN_PASSWORD: ${{ secrets.SVN_PASSWORD }}
  plugin-page:
    needs: release
    uses: inpsyde/reusable-workflows/.github/workflows/wordpress-org-plugin-page.yml@main
    with:
      SVN_PLUGIN_SLUG: my-plugin
      GIT_REF: ${{ inputs.GIT_REF }}
      SYNC_README: false  # the release already published readme.txt
      DRY_RUN: false
    secrets:
      SVN_USERNAME: ${{ secrets.SVN_USERNAME }}
      SVN_PASSWORD: ${{ secrets.SVN_PASSWORD }}
```

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
> An environment's **deployment branch** rule restricts the ref the *calling* workflow runs from, not `GIT_REF`. With `GIT_REF` as a free-text input, anyone allowed to run the workflow can publish the readme and assets from any branch, regardless of the environment rule. This includes pull request refs like `refs/pull/<n>/head`, so even a fork's pull request can be published. If you rely on branch rules, pass `${{ github.sha }}` or `${{ github.ref_name }}` as `GIT_REF`, or offer a `choice` input instead.

To use a branch created as described in [Choosing `GIT_REF`](#choosing-git_ref), run the calling workflow from that branch with `GIT_REF: ${{ github.sha }}`, and allow only `plugin-page/*` branches, with `if:` as below or with the environment's deployment branch rule. Both only check the branch name, not what the branch contains, so check the dry run either way.

```yml
on:
  workflow_dispatch:
    inputs:
      DRY_RUN:
        description: 'Upload the changes as an artifact instead of committing to SVN'
        type: boolean
        default: true
jobs:
  update-plugin-page:
    if: startsWith(github.ref, 'refs/heads/plugin-page/')  # runs from other branches are skipped
    environment: wordpress-org
    uses: inpsyde/reusable-workflows/.github/workflows/wordpress-org-plugin-page.yml@main
    with:
      SVN_PLUGIN_SLUG: my-plugin
      GIT_REF: ${{ github.sha }}
      DRY_RUN: ${{ inputs.DRY_RUN }}
    secrets:
      SVN_USERNAME: ${{ secrets.SVN_USERNAME }}
      SVN_PASSWORD: ${{ secrets.SVN_PASSWORD }}
```

The calling workflow file must exist on that branch. If the release is older than the file, copy it over and commit it, e.g. `git restore --source=develop -- .github/workflows/update-plugin-page.yml`.

## Adopting the workflow

Assets are mirrored, so the assets directory in Git must contain **every** asset that should stay on WordPress.org. Before the first run, import the current assets from SVN:

```shell
svn export https://plugins.svn.wordpress.org/my-plugin/assets .wordpress-org
```

If `.wordpress-org` already exists, add `--force` to export into it.

Then:

1. Commit the `.wordpress-org` directory. Don't store it in Git LFS, see [Supported asset files](#supported-asset-files).
2. Add `.wordpress-org/` to `.distignore` so the assets don't end up in the plugin package or in SVN trunk during releases.
3. Run the workflow with `DRY_RUN: true`. The SVN changes in the job summary should list **no content changes** in `/assets`. Property-only changes (` M`) are expected where existing images lack the correct `svn:mime-type`, or existing blueprints have one.
4. Fix any files the validation rejects. Some are ignored by WordPress.org (e.g. `icon_128x128.png`), others are only rejected by this workflow's stricter rules (e.g. a raster fallback for `icon.svg`).

## Trunk previews

If SVN `trunk/readme.txt` differs from `tags/<Stable tag>/readme.txt` before the sync, trunk holds unreleased changes, for example a preview published with the release workflow's `UPDATE_TRUNK_ONLY` mode. Overwriting it would silently revert those changes, so in that case the workflow only updates the tag's `readme.txt` and shows a warning, both as an annotation and in the job summary. Make sure the same change is part of the upcoming release, so that it isn't lost when the next version is published.

## Release Confirmation

[Release Confirmation](https://developer.wordpress.org/plugins/wordpress-org/release-confirmation-emails/) is an opt-in WordPress.org feature that requires committers to confirm every release by email. Plugin committers can check whether it is enabled for the plugin on WordPress.org.

> [!WARNING]
> For plugins with Release Confirmation enabled, the handbook explicitly states that released tags can't be altered, including the readme (e.g. for `Tested up to`). Updating `readme.txt` with this workflow is therefore **not officially supported** for these plugins. Use it at your own risk, or keep `SYNC_README: false` and ship readme changes with the next release.

Judging by the plugin directory importer's code, the scenario appears to be handled: WordPress.org treats any commit to an already released tag as a [modified release](https://github.com/WordPress/wordpress.org/commit/8d1727f0e331ccfebce432bdfcf4c30db16e2803), even one that only changes `readme.txt`. Updating `tags/<Stable tag>/readme.txt` then:

- reopens that release for confirmation and sends the confirmation email to all committers again
- restarts the release cooldown, a delay WordPress.org can apply before it serves a new release
- keeps the plugin page from updating until the release is confirmed again
- marks the release's ZIP as not built, so it is rebuilt with the new `readme.txt` once the release is confirmed again

This behavior isn't documented and may change. Whenever the tag's `readme.txt` changes, the workflow points this out in a notice and in the job summary.

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
| `GIT_REF` | yes | — | Git ref to read `readme.txt` and the assets directory from (tag, branch, or full 40-character commit SHA) |
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

Changes are committed in a single atomic SVN commit, so **Re-run failed jobs** is always safe: the re-run either commits the changes or reports that the plugin page is already up to date. There is no need to fix anything in SVN by hand. If `GIT_REF` is a branch, a re-run uses its current state, which may include newer commits.

- **Stable tag mismatch:** `readme.txt` in `GIT_REF` doesn't describe the published version, e.g. it comes from a development branch or a release happened since. See [Choosing `GIT_REF`](#choosing-git_ref).
- **"Exactly one 'Stable tag:' line":** remove duplicate `Stable tag:` lines, or move the line into the header before the first `== Section ==`.
- **Asset rejected:** the log says why. See [Supported asset files](#supported-asset-files) for names, formats, sizes, and dimensions.
- **Concurrent SVN commit:** someone else committed in the meantime, e.g. a release. Wait until that run has finished, then re-run. If it was a release, the re-run fails the Stable tag check: run the workflow again with a `GIT_REF` that matches the new version.
- **SVN commit timed out, or a network error:** the commit may still have gone through. Re-run to find out.
- **trunk/readme.txt left unchanged:** trunk holds unreleased changes, see [Trunk previews](#trunk-previews).
- **Plugin page not updated:** wait for the CDN cache (minutes, sometimes hours). With [Release Confirmation](#release-confirmation), the release must be confirmed again first.
