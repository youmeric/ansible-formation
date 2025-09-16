#!/usr/bin/env bash
set -euo pipefail

HOST=${1:-localhost}
COUNT=${2:-4}

for i in $(seq 1 "$COUNT"); do
  curl -s "http://$HOST/" || true
done | nl
