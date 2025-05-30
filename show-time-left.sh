#!/bin/bash

# Get the timestamp of the very first commit (in seconds since epoch)
FIRST_COMMIT_TIMESTAMP=$(git log --reverse --format=%at --max-parents=0 | head -n 1)

# Get the current timestamp (in seconds since epoch)
CURRENT_TIMESTAMP=$(date +%s)

# Calculate the elapsed time in seconds
ELAPSED_SECONDS=$((CURRENT_TIMESTAMP - FIRST_COMMIT_TIMESTAMP))

# Convert elapsed seconds to hours
ELAPSED_HOURS=$((ELAPSED_SECONDS / 3600))

# Define 5 days in hours
FIVE_DAYS_IN_HOURS=120

# Calculate hours left from being 5 days
HOURS_LEFT=$((FIVE_DAYS_IN_HOURS - ELAPSED_HOURS))

# Print the result
echo "Time since first commit: $ELAPSED_HOURS hours"
echo "Hours left from being 5 days (120 hours): $HOURS_LEFT hours"

# Optional: Add a check for negative hours left (meaning it's already past 5 days)
if [ "$HOURS_LEFT" -le 0 ]; then
    echo "Note: It's already been 5 days or more since the first commit."
fi
