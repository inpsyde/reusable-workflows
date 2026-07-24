# Set up OpenVPN

This composite action installs OpenVPN and establishes a VPN connection using the provided
configuration and credentials. It should be used before any step that sets up SSH keys for remote
hosts behind a VPN.

## Simple usage example

```yml
steps:
  - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
  - uses: ./.github/actions/setup-openvpn
    env:
      OVPN_CONFIG: ${{ secrets.OVPN_CONFIG }}
      OVPN_USERNAME: ${{ secrets.OVPN_USERNAME }}
      OVPN_PASSWORD: ${{ secrets.OVPN_PASSWORD }}
      OVPN_GATEWAY_IP: ${{ secrets.OVPN_GATEWAY_IP }}
    if: ${{ env.OVPN_CONFIG != '' && env.OVPN_USERNAME != '' && env.OVPN_PASSWORD != '' && env.OVPN_GATEWAY_IP != '' }}
    with:
      ovpn-config: ${{ env.OVPN_CONFIG }}
      ovpn-username: ${{ env.OVPN_USERNAME }}
      ovpn-password: ${{ env.OVPN_PASSWORD }}
      ovpn-gateway-ip: ${{ env.OVPN_GATEWAY_IP }}
```

## Inputs

| Name              | Default | Description                             |
|-------------------|---------|-----------------------------------------|
| `ovpn-config`     | `''`    | OpenVPN configuration file content.     |
| `ovpn-username`   | `''`    | OpenVPN username for authentication.    |
| `ovpn-password`   | `''`    | OpenVPN password for authentication.    |
| `ovpn-gateway-ip` | `''`    | Expected IP address of the VPN gateway. |

## Usage with SSH

The VPN connection must be established before configuring SSH keys for remote hosts.

```yml
steps:
  - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1

  - uses: ./.github/actions/setup-openvpn
    env:
      OVPN_CONFIG: ${{ secrets.OVPN_CONFIG }}
      OVPN_USERNAME: ${{ secrets.OVPN_USERNAME }}
      OVPN_PASSWORD: ${{ secrets.OVPN_PASSWORD }}
      OVPN_GATEWAY_IP: ${{ secrets.OVPN_GATEWAY_IP }}
    if: ${{ env.OVPN_CONFIG != '' && env.OVPN_USERNAME != '' && env.OVPN_PASSWORD != '' && env.OVPN_GATEWAY_IP != '' }}
    with:
      ovpn-config: ${{ env.OVPN_CONFIG }}
      ovpn-username: ${{ env.OVPN_USERNAME }}
      ovpn-password: ${{ env.OVPN_PASSWORD }}
      ovpn-gateway-ip: ${{ env.OVPN_GATEWAY_IP }}

  - name: Configure SSH key
    run: |
      mkdir -p ~/.ssh
      ssh-keyscan -p ${{ secrets.DEPLOY_PORT }} ${{ secrets.DEPLOY_HOSTNAME }} >> ~/.ssh/known_hosts

  # Deployment steps can now reach hosts behind the VPN
```
