#!/bin/bash
# Start the full Dump backend (infrastructure + all services)

set -e
cd "$(dirname "$0")"

PIDS=()

cleanup() {
  echo ""
  echo "Stopping all services..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null && wait "$pid" 2>/dev/null
  done
  echo "All services stopped."
  exit 0
}

trap cleanup INT TERM

echo "Starting infrastructure (Postgres x3, Kafka, MinIO)..."
docker compose up -d

echo "Waiting for infrastructure to be ready..."
sleep 5

echo "Starting auth-service on :8081..."
./mvnw -pl auth-service spring-boot:run -q &
PIDS+=($!)

echo "Starting event-service on :8082..."
./mvnw -pl event-service spring-boot:run -q &
PIDS+=($!)

echo "Starting media-service on :8083..."
./mvnw -pl media-service spring-boot:run -q &
PIDS+=($!)

# Give gRPC services a head start before the gateway
sleep 8

echo "Starting api-gateway on :8080..."
./mvnw -pl api-gateway spring-boot:run -q &
PIDS+=($!)

echo ""
echo "All services starting. API gateway will be available at http://localhost:8080"
echo "Press Ctrl+C to stop all services."

# Wait for any background process to exit, or Ctrl+C
wait
