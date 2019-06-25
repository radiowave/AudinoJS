set -e

# Run tests
npm run test

# Run lint
# @TODO

# Bump the package version number
./version.sh

# Build
npm run build