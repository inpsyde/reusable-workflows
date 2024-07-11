# Run Woo QIT

This workflow runs the [Quality Insights Toolkit](https://qit.woo.com/) tests.

Usually it should be used after the [archive creation workflow](/docs/archive-creation.md).

## Simple usage example:

```yml
name: Create release package and run QIT
on:
  workflow_dispatch:
jobs:
  create_archive:
    uses: inpsyde/reusable-workflows/.github/workflows/build-plugin-archive.yml@main
  qit:
    strategy:
      matrix:
        test: ['activation', 'security']
    uses: inpsyde/reusable-workflows/.github/workflows/woo-qit.yml@main
    needs: create_archive
    secrets:
      WOO_PARTNER_USER: ${{ secrets.WOO_PARTNER_USER }}
      WOO_PARTNER_SECRET: ${{ secrets.WOO_PARTNER_SECRET }}
    with:
      ARTIFACT: ${{ needs.create_archive.outputs.artifact }}
      QIT_TEST: ${{ matrix.test }}
```

## Configuration parameters

### Inputs

| Name                   | Default                | Description                                                                                              |
|------------------------|------------------------|----------------------------------------------------------------------------------------------------------|
| `ARTIFACT`             |                        | The name of the generated artifact, usually the output of the archive creation workflow.                 |
| `PLUGIN_FOLDER_NAME`   | `''`                   | The name of the plugin folder/slug (falls back to the repository name).                                  |
| `QIT_TEST`             | `'activation'`         | The name of the QIT test to run (activation, security, ...).                                             |
| `QIT_OPTIONS`          | `''`                   | The string with additional QIT options, such as `'--wordpress_version=6.5.1 --optional_features=hpos'`.  |


## Secrets

| Name                 | Description                                                                              |
|----------------------|------------------------------------------------------------------------------------------|
| `WOO_PARTNER_USER`   | The Woo.com email.                                                                       |
| `WOO_PARTNER_SECRET` | The Woo.com [QIT token](https://qit.woo.com/docs/support/authenticating/).               |
