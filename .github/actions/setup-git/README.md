# Set up Git

This composite action configures SSH authentication, Git user identity, and optional commit signing.

## Simple usage example

```yml
steps:
  - uses: actions/checkout@v4
  - uses: ./.github/actions/setup-git
    with:
      ssh-private-key: ${{ secrets.GITHUB_USER_SSH_KEY }}
      user-email: ${{ secrets.GITHUB_USER_EMAIL }}
      user-name: ${{ secrets.GITHUB_USER_NAME }}
```

## Inputs

| Name                | Default   | Description                                                                                                      |
|---------------------|-----------|------------------------------------------------------------------------------------------------------------------|
| `ssh-private-key`   | `''`      | Private SSH key for authentication.                                                                              |
| `user-email`        | `''`      | Git user email.                                                                                                  |
| `user-name`         | `''`      | Git user name.                                                                                                   |
| `ssh-public-key`    | `''`      | Public SSH key for commit signing.                                                                               |
| `automated-commits` | `'false'` | Enable Git settings for automated commits (auto-tracks remote branches on push, silences ignored-file warnings). |

## Notes

- Every step in this action is conditional. Steps are skipped when their corresponding inputs are empty, so you only need to provide the inputs relevant to your use case.
  - SSH setup runs only when `ssh-private-key` is provided.
  - Git identity is configured only when both `user-email` and `user-name` are provided.
  - Commit signing is configured only when `ssh-public-key` is provided.
- The `automated-commits` input, when set to `'true'`, applies two Git configuration settings: `push.autoSetupRemote true` (so that `git push` automatically tracks the remote branch without requiring `--set-upstream`) and `advice.addIgnoredFile false` (to suppress warnings when staging files matched by `.gitignore`). This is useful for workflows that create and push commits programmatically.
