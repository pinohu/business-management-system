#!/bin/bash

# Auto-publish generated apps to GitHub

BASE_DIR="./generated_apps"
GITHUB_USER="your-github-username"
GITHUB_TOKEN="your-github-token"
ORG="your-org-name"  # or your username if not using an org

for dir in $BASE_DIR/*; do
  if [ -d "$dir" ]; then
    REPO_NAME=$(basename "$dir")
    cd "$dir"

    echo "Initializing $REPO_NAME..."
    git init
    git remote add origin https://$GITHUB_USER:$GITHUB_TOKEN@github.com/$ORG/$REPO_NAME.git
    git add .
    git commit -m "Initial commit for $REPO_NAME"
    git push -u origin main

    cd ../..
  fi
done
