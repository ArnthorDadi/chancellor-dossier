#!/bin/bash
# ralph-once.sh

RALPH_PROMPT="1. Find the highest-priority feature in @plans/prd.json and work only on that.
EOF
2. Check that the types check via 'pnpm typecheck' and tests pass via 'pnpm test'.
3. Update the prd with the work done.
4. Append a progress note to @progress.txt for the next run.
5. Commit the feature.

ONLY WORK ON A SINGLE FEATURE.
FOR EACH STEP PRINT TO THE CONSOLE WHAT IS HAPPENING. KEEP IT CONCISE, SACRIFICE GRAMMAR FOR CONCISION.

If the PRD is complete, output <promise>COMPLETE</promise>."

echo "🚀 Starting Ralph once... 🚀"


opencode run "$RALPH_PROMPT" \
  -f "plans/prd.json" \
  -f "progress.txt" \
  -m google/gemini-2.5-flash

exit o

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT" || exit

GIT_NAME=$(git config user.name)
GIT_EMAIL=$(git config user.email)

echo "🚀 Starting Ralph once..."

docker run -it --rm \
  --user "$(id -u):$(id -g)" \
  -v "$PROJECT_ROOT:/app" \
  -w /app \
  --env-file .env \
  -e HOME=/tmp \
  -e OPENCODE_PERMISSION="all" \
  -e GIT_AUTHOR_NAME="$GIT_NAME" \
  -e GIT_AUTHOR_EMAIL="$GIT_EMAIL" \
  -e GIT_COMMITTER_NAME="$GIT_NAME" \
  -e GIT_COMMITTER_EMAIL="$GIT_EMAIL" \
  ghcr.io/anomalyco/opencode \
  opencode run "$RALPH_PROMPT" \
  -f "plans/prd.json" \
  -f "progress.txt" \
  -m google/gemini-2.0-flash

#RALPH_PROMPT="@plans/prd.json @progress.txt \
#1. Find the highest-priority feature to work on and work only on that feature. This should be the one your decide has the highest priority - not necessarily the first in the list. \
#2. Check that the types checks via pnpm typecheck and that the tests pass via pnpm test. \
#3. Update the prd with the work that was done. \
#4. Append your progress to progress.txt. Use This to leave a note for the next person working in the codebase. \
#5. Make a it Commit of that feature. \
#
#ONLY WORK ON A SINGLE FEATURE. \
#If, while implementing the feature, your notice the prd is completed, output <promise>COMPLETE</promise>."
#
#opencode run "$RALPH_PROMPT"
