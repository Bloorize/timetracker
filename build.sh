#!/bin/bash

# Set production environment variables
echo "Setting up production environment..."

# Create .env.production if it doesn't exist
if [ ! -f .env.production ]; then
  if [ -f .env.local ]; then
    echo "Copying from .env.local to .env.production..."
    cp .env.local .env.production
  else
    echo "ERROR: No environment file found. Please create .env.local or .env.production"
    exit 1
  fi
fi

# Add GENERATE_SOURCEMAP=false to .env.production if not already there
if ! grep -q "GENERATE_SOURCEMAP" .env.production; then
  echo "Adding GENERATE_SOURCEMAP=false to .env.production..."
  echo "GENERATE_SOURCEMAP=false" >> .env.production
fi

# Clean old build
echo "Cleaning previous build..."
rm -rf build

# Run the build
echo "Building for production..."
npm run build

echo "Build completed!"
echo "You can deploy the 'build' directory to your hosting provider." 