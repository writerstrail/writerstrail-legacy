#!/usr/bin/env bash

npm install bower sequelize-cli@1.7.0
./node_modules/.bin/bower install
./node_modules/.bin/sequelize db:migrate --env production
