#!/bin/bash
#
#
docker build -f Dockerfile.traefik -t yti-comments-ui . --build-arg NPMRC
