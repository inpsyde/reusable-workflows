# Set up Node

This composite action sets up Node.js, automatically detects lock files for dependency caching, and installs project dependencies.

## Simple usage example

```yml
steps:
  - uses: actions/checkout@v4
  - uses: ./.github/actions/setup-node
    with:
      registry-url: ${{ inputs.NPM_REGISTRY_DOMAIN }}
      node-auth-token: ${{ secrets.NPM_REGISTRY_TOKEN }}
```

## Inputs

| Name                   | Default                         | Description                                                                                                 |
|------------------------|---------------------------------|-------------------------------------------------------------------------------------------------------------|
| `node-version`         | `'18'`                          | Node version to set up.                                                                                     |
| `node-version-file`    | `''`                            | Path to a file containing the Node version (takes precedence over `node-version`).                          |
| `registry-url`         | `'https://npm.pkg.github.com/'` | npm registry URL.                                                                                           |
| `node-auth-token`      | `''`                            | Authentication token for the npm registry.                                                                  |
| `node-options`         | `''`                            | Space-separated list of command-line Node options.                                                          |
| `package-manager`      | `'npm'`                         | Package manager to use (`npm` or `yarn`). **Deprecated:** yarn support will be removed in a future version. |
| `install-dependencies` | `'true'`                        | Whether to install dependencies (`'true'` or `'false'`).                                                    |

## Notes

- Dependency caching is enabled automatically when a lock file is detected (`package-lock.json` or `npm-shrinkwrap.json` for npm, `yarn.lock` for yarn). If no lock file is found, caching is skipped and a plain install is performed instead of a clean install.
- **Yarn support is deprecated.** The `package-manager` input still accepts `'yarn'`, but this option will be removed in a future version. New workflows should use npm.
