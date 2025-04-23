#!/bin/bash

# Function to ensure file ends with a single newline
fix_file_ending() {
  local file=$1
  # Ensure file ends with exactly one newline
  sed -i '' -e '$a\' "$file"
  sed -i '' -e :a -e '/^\n*$/{$d;N;ba' -e '}' "$file"
}

# Function to fix imports
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
    line=$(echo "$line" | sed 's|from "\.\./\.\./components/|from "@/components/|g')
    
    echo "$line" >> "$temp_file"
  done < "$file"
  
  # Add final newline
  echo "" >> "$temp_file"
  
  # Replace original file with fixed version
  mv "$temp_file" "$file"
  
  # Fix file ending
  fix_file_ending "$file"
}

# Process all TypeScript/React files
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file; do
  echo "Processing $file..."
  fix_imports "$file"
done

echo "All files have been processed!" 