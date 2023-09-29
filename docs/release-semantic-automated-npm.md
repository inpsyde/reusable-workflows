# Release semantic automated

This workflow utilizes the [Semantic Release](https://github.com/semantic-release/semantic-release) package to create a release of a package that uses npm.
Mind that, in order to use Semantic Release, you need to stick to their convention about commit messages.

You can provide a release.config.js file in your repository to create a custom release that uses the following Semantic Release plugins:
- git
- npm
- exec

Otherwise, the workflow will create the release with a standard set of configurations, updating the version in the following files:
- style.css or index.php 
- CHANGELOG.md
- package-lock.json
- package.json
- composer.json

If you don't ship any of these files the release process will not fail.

Another standard set of configurations is on the branches: every push to `main` and `next` branches will release a stable version, every push to `alpha` and `beta` branches will release a pre-release version.
If you would like another setting, please provide your custom release.config.js file.

Packages based on yarn will not be released using this automation.

**Simplest possible example:**

```yml
name: Release
on:
  push:
    branches:
      - main
      - beta
      - alpha
jobs:
  release:
    uses: inpsyde/reusable-workflows/.github/workflows/release-semantic-automated-npm.yml@main
```

### Configuration parameters

#### Inputs

| Name                  | Default                                                                                       | Description                                          |
|-----------------------|-----------------------------------------------------------------------------------------------|------------------------------------------------------|
| `NODE_VERSION`        | 18                                                                                            | Node version with which the release will be executed |

**Example with configuration parameters:**

```yml
name: Release
on:
  push:
    branches:
      - main
      - alpha
jobs:
  release:
    uses: inpsyde/reusable-workflows/.github/workflows/release-semantic-automated-npm.yml@main
    with:
      NODE_VERSION: 16
```
