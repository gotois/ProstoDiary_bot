#!/usr/bin/env bash

if [ "$NODE_ENV" = "TRAVIS_CI" ]
then
  echo "skip prepare script"
else
  snyk protect;
fi
