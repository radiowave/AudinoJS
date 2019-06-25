#!/bin/bash
echo "Incrementing patch"
npm --no-git-tag-version version patch
git add package.json
git add package-lock.json
