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

## Node version

The action selects the Node version in this order:

1. `node-version-file`, if set.
2. `node-version`, if set.
3. The major version from the `engines.node` property in `package-json-path`. The action uses the
   first number in the constraint, for example `>=24` and `~24.0.0` both resolve to `24`.
4. `node-version-fallback`, if set. The action shows a warning. **Deprecated:** this fallback will
   be removed in a future version.

If no version is found, the action fails.

## Inputs

| Name                    | Default                         | Description                                                                                                 |
|-------------------------|---------------------------------|-------------------------------------------------------------------------------------------------------------|
| `node-version`          | `''`                            | Node version to set up. If empty, the version is discovered (see [Node version](#node-version)).            |
| `node-version-file`     | `''`                            | Path to a file containing the Node version (takes precedence over `node-version`).                          |
| `package-json-path`     | `'package.json'`                | Path to the `package.json` file for the Node version discovery, relative to the workspace root.             |
| `node-version-fallback` | `''`                            | Node version to use if no version is discovered. **Deprecated:** will be removed in a future version.       |
| `registry-url`          | `'https://npm.pkg.github.com/'` | npm registry URL.                                                                                           |
| `node-auth-token`       | `''`                            | Authentication token for the npm registry.                                                                  |
| `node-options`          | `''`                            | Space-separated list of command-line Node options.                                                          |
| `package-manager`       | `'npm'`                         | Package manager to use (`npm` or `yarn`). **Deprecated:** yarn support will be removed in a future version. |
| `install-dependencies`  | `'true'`                        | Whether to install dependencies (`'true'` or `'false'`).                                                    |
