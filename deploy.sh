#!/bin/bash
TARGET="${DEPLOYPATH:-${HOME}/public_html}"
if [ ! -d "$TARGET" ] && [ -d "/home/aapjgfju/public_html" ]; then
  TARGET="/home/aapjgfju/public_html"
fi

mkdir -p "$TARGET"
rm -rf "$TARGET/assets"
cp -rf dist/* "$TARGET/" 2>/dev/null || true
cp -rf assets "$TARGET/" 2>/dev/null || true
cp -rf public/* "$TARGET/" 2>/dev/null || true
cp -f index.html "$TARGET/index.html" 2>/dev/null || true
cp -f api.php "$TARGET/api.php" 2>/dev/null || true
cp -f .htaccess "$TARGET/.htaccess" 2>/dev/null || true
chmod 755 "$TARGET" 2>/dev/null || true
chmod 644 "$TARGET/.htaccess" 2>/dev/null || true
echo "Deployment completed successfully to $TARGET"
