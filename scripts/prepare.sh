#!/usr/bin/env bash

if [ "$NODE_ENV" = "TRAVIS_CI" ] || [ "$NODE_ENV" = "production" ]
then
  echo "skip prepare script"
else
  snyk protect;
fi
