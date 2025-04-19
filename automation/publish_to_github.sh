#!/bin/bash

# Usage: ./publish_to_github.sh repo-name

REPO_NAME=$1
GITHUB_USER="your-github-username"
GITHUB_TOKEN="your-github-personal-access-token"

if [ -z "$REPO_NAME" ]; then
  echo "❌ Please provide a repository name."
  exit 1
fi

echo "🚀 Initializing Git repository..."
git init
git remote add origin https://$GITHUB_USER:$GITHUB_TOKEN@github.com/$GITHUB_USER/$REPO_NAME.git
git add .
git commit -m "Initial commit from Cursor autonomous builder"
git branch -M main
git push -u origin main

echo "✅ Pushed to https://github.com/$GITHUB_USER/$REPO_NAME"
