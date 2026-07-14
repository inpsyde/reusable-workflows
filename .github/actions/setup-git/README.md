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
