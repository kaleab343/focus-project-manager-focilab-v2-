#!/bin/bash

# Function to process a file
fix_imports() {
  local file=$1
  
  # Create a temporary file
  temp_file=$(mktemp)
  
  # Read the file line by line and fix imports
  while IFS= read -r line; do
    # Fix relative imports to absolute imports with @/
    line=$(echo "$line" | sed 's|from "\.\./context/|from "@/context/|g')
    line=$(echo "$line" | sed 's|from "\.\./hooks/|from "@/hooks/|g')
    line=$(echo "$line" | sed 's|from "\.\./utils/|from "@/utils/|g')
    line=$(echo "$line" | sed 's|from "\.\./\.\./utils/|from "@/utils/|g')
    line=$(echo "$line" | sed 's|from "\.\./components/|from "@/components/|g')
    
    echo "$line" >> "$temp_file"
  done < "$file"
  
  # Replace original file with fixed version
  mv "$temp_file" "$file"
}

# Find all TypeScript/React files and fix imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file; do
  echo "Processing $file..."
  fix_imports "$file"
done

echo "All imports have been updated!" 