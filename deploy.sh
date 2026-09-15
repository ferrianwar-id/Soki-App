#!/bin/bash
TARGET="/home/aapjgfju/repositories/Soki-App"

mkdir -p "$TARGET"
rm -f "$TARGET/index.html" "$TARGET/index.php"
rm -rf "$TARGET/assets"
cp -rf dist/* "$TARGET/" 2>/dev/null || true
cp -rf dist "$TARGET/" 2>/dev/null || true
echo "Deployment completed successfully to $TARGET"
