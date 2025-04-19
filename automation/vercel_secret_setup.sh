#!/bin/bash

# Setup secrets for GitHub repositories (requires GitHub CLI installed)

REPO_LIST=(app_1 app_2 app_3 app_4 app_5 app_6 app_7 app_8 app_9 app_10)

for REPO in "${REPO_LIST[@]}"
do
  echo "Setting secrets for $REPO..."
  gh secret set VERCEL_TOKEN --repo your-org-name/$REPO --body "your-vercel-token"
  gh secret set VERCEL_ORG_ID --repo your-org-name/$REPO --body "your-vercel-org-id"
  gh secret set VERCEL_PROJECT_ID --repo your-org-name/$REPO --body "project-id-for-$REPO"
done
