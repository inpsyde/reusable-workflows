# Set up OpenVPN

This composite action installs OpenVPN and establishes a VPN connection using the provided configuration and credentials. It should be used before any step that sets up SSH keys for remote hosts behind a VPN.

## Simple usage example

```yml
steps:
  - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
  - uses: ./.github/actions/setup-openvpn
    with:
      ovpn-config: ${{ secrets.OVPN_CONFIG }}
      ovpn-username: ${{ secrets.OVPN_USERNAME }}
      ovpn-password: ${{ secrets.OVPN_PASSWORD }}
```

## Inputs

| Name            | Default | Description                            |
|-----------------|---------|----------------------------------------|
| `ovpn-config`   | -       | OpenVPN configuration file content.    |
| `ovpn-username` | -       | OpenVPN username for authentication.   |
| `ovpn-password` | -       | OpenVPN password for authentication.   |

## Usage with SSH

The VPN connection must be established before configuring SSH keys for remote hosts.

```yml
steps:
  - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1

  - name: Set up OpenVPN
    uses: inpsyde/reusable-workflows/.github/actions/setup-openvpn@main
    with:
      ovpn-config: ${{ secrets.OVPN_CONFIG }}
      ovpn-username: ${{ secrets.OVPN_USERNAME }}
      ovpn-password: ${{ secrets.OVPN_PASSWORD }}

  - name: Configure SSH key
    run: |
      mkdir -p ~/.ssh
      ssh-keyscan -p ${{ secrets.DEPLOY_PORT }} ${{ secrets.DEPLOY_HOSTNAME }} >> ~/.ssh/known_hosts

  # Deployment steps can now reach hosts behind the VPN
```
