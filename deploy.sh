#!/bin/bash
# Deployment khusus Soki-App (JANGAN sentuh public_html / website lain)
TARGET="/home/aapjgfju/Soki-App"
if [ ! -d "$TARGET" ] && [ -d "${HOME}/Soki-App" ]; then
  TARGET="${HOME}/Soki-App"
fi

mkdir -p "$TARGET"
cp -rf dist/* "$TARGET/" 2>/dev/null || true
cp -rf assets "$TARGET/" 2>/dev/null || true
cp -rf public/* "$TARGET/" 2>/dev/null || true
cp -f index.html "$TARGET/index.html" 2>/dev/null || true
cp -f api.php "$TARGET/api.php" 2>/dev/null || true
cp -f .htaccess "$TARGET/.htaccess" 2>/dev/null || true
chmod 755 "$TARGET" 2>/dev/null || true
chmod 644 "$TARGET/.htaccess" 2>/dev/null || true
echo "Deployment berhasil khusus ke folder: $TARGET"

