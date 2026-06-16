#!/bin/bash

echo "🔄 Stopping existing processes..."

# Helper to kill PIDs on a port only if their comm is "node"
kill_if_node_on_port() {
  local port=$1
  # get PIDs listening on the port
  pids=$(lsof -ti:"$port")
  if [ -z "$pids" ]; then
    echo "ℹ No process on port $port"
    return
  fi

  # filter to PIDs whose comm is "node" and kill them
  killed=false
  for pid in $pids; do
    # get the command name (comm)
    comm=$(ps -p "$pid" -o comm= 2>/dev/null)
    if [ "$comm" = "node" ]; then
      kill -9 "$pid" 2>/dev/null && echo "✓ Killed node (PID $pid) on port $port" || echo "✗ Failed to kill PID $pid"
      killed=true
    fi
  done

  if [ "$killed" = false ]; then
    echo "ℹ No 'node' process on port $port"
  fi
}

kill_if_node_on_port 3000
kill_if_node_on_port 5173

echo ""
echo "🚀 Starting services..."

cd server || exit 1
node server.js &
SERVER_PID=$!
echo "✓ Server started on http://localhost:3000 (PID: $SERVER_PID)"

cd ../client || exit 1
npm run dev &
CLIENT_PID=$!
echo "✓ Client starting on http://localhost:5173 (PID: $CLIENT_PID)"

echo ""
echo "✅ Both services are starting up!"
echo ""
echo "📝 Server: http://localhost:3000"
echo "📝 Client: http://localhost:5173"
echo ""
echo "To stop the services, run:"
echo "  kill $SERVER_PID $CLIENT_PID"
echo "  or use: lsof -ti:3000,5173 | xargs kill -9"

