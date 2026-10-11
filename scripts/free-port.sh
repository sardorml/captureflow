#!/bin/sh
# Stops whatever is still listening on the given ports. `next dev` hands the
# port to a child next-server process; when the parent is killed without the
# child (a closed terminal, a stopped editor task, nx run-many on Ctrl+C), that
# child keeps the port and the next start fails with EADDRINUSE.
for port in "$@"; do
  pids=$(lsof -ti "tcp:$port" -sTCP:LISTEN 2>/dev/null)
  [ -z "$pids" ] && continue
  echo "free-port: stopping $(echo "$pids" | tr '\n' ' ')on :$port"
  kill $pids 2>/dev/null
  sleep 1
  pids=$(lsof -ti "tcp:$port" -sTCP:LISTEN 2>/dev/null)
  [ -n "$pids" ] && kill -9 $pids 2>/dev/null
done
exit 0
