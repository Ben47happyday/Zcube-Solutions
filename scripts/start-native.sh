#!/usr/bin/env bash
set -e

export PATH="$(pwd)/.node-runtime/bin:$PATH"

# Next.js runs on its own internal port — it is never exposed directly.
# Flask (the only process bound to the public $PORT) reverse-proxies
# /solutions/matchihomeware/* to it; see matchihomeware_proxy in
# backend/app.py. gthread + multiple threads so a catalog page's burst
# of concurrent image requests (every one proxied through this same
# process) doesn't queue behind a single-threaded worker.
(cd matchi-webportal && PORT=3001 npm start) &

cd backend
exec gunicorn --chdir . app:app --bind 0.0.0.0:"${PORT:-10000}" --worker-class gthread --threads 8
