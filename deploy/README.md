# Medval Venezuela deployment

Canonical identifiers: remote directory `/srv/medval-ve`, Compose project
`medval-ve`, app image/container `medval-ve-web`, MongoDB database `medval_ve`,
default network `medval-ve_default` and nginx upstream `medval-ve-web:3000`.
The production override also publishes the compatibility alias `medval-web-ve`
because the existing Nginx Proxy Manager entry for
`medval-ve.aaron-henriquez.com` already uses that name.

The production reverse proxy is Nginx Proxy Manager on the existing Docker
network `nginx_default`. Production deployments merge `compose.production.yml`
into `compose.yml` so the app joins that network on every container recreation.
The app also stays on `medval-ve_default` to reach MongoDB. MongoDB only joins the
private default network.

Configure the Medval Venezuela proxy host with:

- Scheme: `http`
- Forward hostname: `medval-ve-web` (existing NPM entry: `medval-web-ve`)
- Forward port: `3000`

`deploy.sh` checks that `nginx_default` exists before building. The `deploy` user
must be able to write `/srv/medval-ve/compose.yml`, `/srv/medval-ve/compose.production.yml`
and read `/srv/medval-ve/.env`. The production override is only used for production
deployments.

## Recovering an existing deployment

Before the production networking change is deployed, the owner can attach the
running app to the proxy network once:

```bash
docker network connect nginx_default medval-ve-web
```

Then save the proxy host with the upstream settings above. The new deployment
configuration makes this connection persistent across subsequent deployments.

For manual production Compose commands on the VPS, include both files:
`docker compose -p medval-ve -f compose.yml -f compose.production.yml …`.
