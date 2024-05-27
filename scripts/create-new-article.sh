#!/bin/bash

target_dir="./articles"
if [[ ! -d "$target_dir" ]]; then
    echo "Directory $target_dir does not exist."
    exit 1
fi

# Get the highest numbered file
latest_file=$(ls -1 "$target_dir" | grep -E '^[0-9]{3}\.md$' | sort -n | tail -n 1)

if [[ -z "$latest_file" ]]; then
    # If there are no files, start with 001.md
    next_number=1
else
    # Extract the number from the latest file and increment it
    latest_number=$(echo "$latest_file" | grep -oE '^[0-9]{3}')
    next_number=$((10#$latest_number + 1))
fi

# Format the next number to be 3 digits (e.g., 001, 002, 003)
if [[ $next_number != "404" ]] then
    next_file=$(printf "%03d.md" "$next_number")
fi

# Create the new file
touch "$target_dir/$next_file"
