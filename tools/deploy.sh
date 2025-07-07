#!/bin/sh
# Validate compliance hooks then run Terraform plan for all infrastructure modules
node $(dirname "$0")/compliance-report.js
for dir in infrastructure/*; do
  if [ -f "$dir/main.tf" ]; then
    (cd "$dir" && terraform init -input=false >/dev/null && terraform fmt && terraform plan)
  fi
done
