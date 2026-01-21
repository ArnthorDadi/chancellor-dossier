#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

RALPH_PROMPT='@plans/prd.json @progress.txt
1. Find the highest-priority feature to work on and work only on that feature. This should be the one your decide has the highest priority - not necessarily the first in the list.
2. Check that the types checks via pnpm typecheck and that the tests pass via pnpm test.
3. Update the prd with the work that was done.
4. Append your progress to progress.txt. Use This to leave a note for the next person working in the codebase.
5. Make a it Commit of that feature.
ONLY WORK ON A SINGLE FEATURE.
If, while implementing the feature, your notice the prd is completed, output <promise>COMPLETE</promise>.'

for ((i=1; i<=$1; i++)); do
  echo "Iteration $i"
  echo "-----------------------------------"
  result=$(docker run -it --rm \
             --env-file ".env" \
             --user $(id -u):$(id -g) \
             -v "$(pwd)":/app \
             -w /app \
             ghcr.io/anomalyco/opencode \
             --yes "$RALPH_PROMPT")

# After completing each task, append to progress.txt:
# - Task completed and PRD item reference
# - Key decisions made and reasoning
# - Files changed
# - Any blockers or notes for next iteration
# Keep entries concise. Sacrifice grammar for the sake of concision. This file helps future iterations skip exploration.

  echo "$result"

  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo "PRD complete after $i iterations."
    exit 0
  fi
done
