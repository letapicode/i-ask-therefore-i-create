#!/bin/sh
# Run Terraform plan for all infrastructure modules
for dir in infrastructure/*; do
  if [ -f "$dir/main.tf" ]; then
    (cd "$dir" && terraform init -input=false >/dev/null && terraform fmt && terraform plan)
  fi
done
