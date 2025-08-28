#!/bin/bash


start_time=$(date +%s)
timeout=60

while true; do
  current_time=$(date +%s)
  elapsed=$(( current_time - start_time ))
  if (( elapsed > timeout )); then
    exit 1
  fi

  status=$(curl -s http://localhost:4566/_localstack/init | jq -r ".completed.READY")
  if [[ "$status" == "true" ]]; then
    break
  fi
  sleep 5
done
