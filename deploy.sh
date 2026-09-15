#!/bin/bash
TARGET="/home/aapjgfju/public_html"

mkdir -p "$TARGET"
rm -f "$TARGET/index.html" "$TARGET/index.php"
rm -rf "$TARGET/assets"
cp -rf dist/* "$TARGET/" 2>/dev/null || true
cp -rf public/* "$TARGET/" 2>/dev/null || true
cp -f dist/.htaccess "$TARGET/.htaccess" 2>/dev/null || true
chmod 755 "$TARGET" 2>/dev/null || true
chmod 644 "$TARGET/.htaccess" 2>/dev/null || true
echo "Deployment completed successfully to $TARGET"
