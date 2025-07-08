#!/bin/sh
# Run Terraform plan for all infrastructure modules
# Set CLOUD_PROVIDER to "gcp" or "azure" to target other clouds
PROVIDER="${CLOUD_PROVIDER:-$1}"
BASE_DIR="infrastructure"
if [ "$PROVIDER" = "gcp" ] || [ "$PROVIDER" = "azure" ]; then
  BASE_DIR="infrastructure/$PROVIDER"
fi

for dir in "$BASE_DIR"/*; do
  if [ -f "$dir/main.tf" ]; then
    (cd "$dir" && terraform init -input=false >/dev/null && terraform fmt && terraform plan)
  fi
done
