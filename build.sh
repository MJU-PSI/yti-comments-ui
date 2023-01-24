#!/bin/bash
#
#
docker build -f Dockerfile.local -t yti-comments-ui . --build-arg NPMRC
