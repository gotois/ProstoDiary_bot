#!/usr/bin/env bash

if [ "$NODE_ENV" = "production" ]
then
    echo "Skip project preparing..."
else
    ncu ;
    npm run clean ;
fi
