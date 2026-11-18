# Zcube-Solutions — single Render web service running both the Flask app
# (company site, NAPLAN Prep Hub, and the /solutions/matchihomeware reverse
# proxy) and the Matchi Webportal Next.js app as two processes in one
# container. A plain Render "python" or "node" runtime only ships one
# language, so this needs the Docker runtime instead.
FROM node:20-bookworm-slim

# Python, for the Flask side.
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 python3-venv \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:${PATH}"
RUN pip install --no-cache-dir -r backend/requirements.txt

# Baked in at build time: Next.js inlines NEXT_PUBLIC_* vars into the
# client bundle, so this can't be supplied as a runtime-only env var.
ENV NEXT_PUBLIC_BASE_PATH=/solutions/matchihomeware
RUN cd matchi-webportal && npm ci && npm run build

RUN chmod +x start.sh
CMD ["./start.sh"]
