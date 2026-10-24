#!/bin/sh
# Usage: scripts/set-bundle-id.sh com.company.AppName
# Run from the wish-you-were-beer folder, once, before the first build.
set -e
[ -n "$1" ] || { echo "Give the new bundle ID, for example com.company.AppName"; exit 1; }
OLD=$(sed -n 's/.*"appId": "\(.*\)".*/\1/p' capacitor.config.json)
sed -i.bak "s/$OLD/$1/g" capacitor.config.json ios/App/App.xcodeproj/project.pbxproj
rm -f capacitor.config.json.bak ios/App/App.xcodeproj/project.pbxproj.bak
echo "Bundle ID changed from $OLD to $1"
