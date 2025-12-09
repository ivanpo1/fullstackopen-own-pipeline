#!/bin/bash

echo "Build script"

npm --prefix ./client install
npm --prefix ./server install

npm --prefix ./client run build