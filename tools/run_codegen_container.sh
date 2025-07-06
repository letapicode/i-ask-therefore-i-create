#!/bin/sh
# Build and run the codegen service inside a Docker container
IMAGE=codegen-service

docker build -f apps/codegen/Dockerfile -t $IMAGE .
docker run --rm -p 3003:3003 $IMAGE
