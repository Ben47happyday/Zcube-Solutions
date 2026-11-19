#!/usr/bin/env bash
set -euo pipefail

# Render's "python" runtime only ships Python — runtime can never be
# changed on an existing service (a hard platform restriction), so to
# run the Next.js app in this SAME service we install a portable Node.js
# build (a plain tarball, no apt/root needed) straight into the repo
# checkout, rather than switching to a Docker runtime.
NODE_VERSION="20.18.1"
NODE_DIR="$(pwd)/.node-runtime"

if [ ! -x "$NODE_DIR/bin/node" ]; then
  mkdir -p "$NODE_DIR"
  curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz" \
    | tar -xz -C "$NODE_DIR" --strip-components=1
fi

export PATH="$NODE_DIR/bin:$PATH"

pip install -r backend/requirements.txt

cd matchi-webportal
npm ci
npm run build
