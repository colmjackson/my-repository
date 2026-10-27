#!/usr/bin/env bash
# One-off setup on a Mac: creates the ios/ Xcode project, generates icons, syncs the web files.
set -euo pipefail
cd "$(dirname "$0")/.."

npm install
npm run build
[ -d ios ] || npx cap add ios
npx capacitor-assets generate --ios --iconBackgroundColor '#04434e' --assetPath resources
npx cap sync ios
echo "Done. Run: npm run ios:open"
