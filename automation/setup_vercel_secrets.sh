#!/bin/bash

# Usage: ./setup_vercel_secrets.sh

echo "🔐 Setting up GitHub secrets for Vercel deployment..."

# Replace with your values
REPO="your-repo-name"
OWNER="your-github-username"
GITHUB_TOKEN="your-github-token"

curl -X PUT   -H "Authorization: token $GITHUB_TOKEN"   -H "Accept: application/vnd.github.v3+json"   https://api.github.com/repos/$OWNER/$REPO/actions/secrets/VERCEL_TOKEN   -d '{"encrypted_value":"your-vercel-token"}'

# Repeat for ORG_ID and PROJECT_ID...

echo "✅ Secrets configured for GitHub Actions"
