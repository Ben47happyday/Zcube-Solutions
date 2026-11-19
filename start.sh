#!/usr/bin/env bash
set -e

# Matchi Webportal's Next.js server runs on its own internal port — it is
# never exposed directly. The Flask app (the only process bound to the
# public $PORT) reverse-proxies /solutions/matchihomeware/* to it; see
# matchihomeware_proxy in backend/app.py.
(cd matchi-webportal && PORT=3001 npm start) &

cd backend
# gthread + multiple threads: the default sync worker handles one
# request at a time, so a catalog page's ~100 concurrent image requests
# (every one proxied through this process to the Next.js app) queued up
# behind each other and a chunk of them timed out as 502s.
exec gunicorn --chdir . app:app --bind 0.0.0.0:"${PORT:-10000}" --worker-class gthread --threads 8
