# Self-hosted GitHub Actions runner

Repo-scoped runner for `aaronx3011/medval-landing-venezuela`. It runs on the
`lesbian` host (`10.8.0.6`) next to the existing MedVal and task-manager
runners, uses the host Docker daemon to build images, and host networking so it
can reach the staging/production servers over WireGuard/SSH.

Labels: `self-hosted` (automatic), `medval-ve` and `docker`. The workflows in
`.github/workflows/` target `[self-hosted, docker]`.

## Install on the host

```bash
mkdir -p ~/medval-ve-runner
# copy Dockerfile, entrypoint.sh, compose.yaml and .env.example here
cp .env.example .env
chmod 600 .env
```

Fill `.env`:

- `DOCKER_GID`: `stat -c '%g' /var/run/docker.sock` (currently `989`).
- `RUNNER_TOKEN`: a fresh token, valid for one hour:

  ```bash
  gh api -X POST \
    repos/aaronx3011/medval-landing-venezuela/actions/runners/registration-token \
    --jq .token
  ```

Start it:

```bash
docker compose up -d --build
docker compose logs -f
```

The registration is stored in the `runner_config` volume, so later restarts do
not need a new token. To force a re-registration, remove that volume.

## Verify

```bash
gh api repos/aaronx3011/medval-landing-venezuela/actions/runners \
  --jq '.runners[] | {name, status, busy, labels: [.labels[].name]}'
```

The runner should be `online` with the `docker` label. From the host:

```bash
docker exec medval-ve-runner docker version
ls -l /srv/runner-ssh
```

The container runs as UID/GID `1001` and mounts `/srv/runner-ssh` at
`/home/runner/.ssh`, the same deploy key and `known_hosts` used by the other
runners. Keep that directory owned by `1001:1001` (mode `700`) or the deploy
steps cannot read the key.
