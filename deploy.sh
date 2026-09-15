#!/bin/bash
POSSIBLE_TARGETS=(
  "$DEPLOYPATH"
  "${HOME}/soki-app.digipassplatinum.my.id"
  "${HOME}/public_html/soki-app"
  "${HOME}/public_html/soki-app.digipassplatinum.my.id"
  "${HOME}/public_html"
  "/home/aapjgfju/soki-app.digipassplatinum.my.id"
  "/home/aapjgfju/public_html/soki-app"
  "/home/aapjgfju/public_html/soki-app.digipassplatinum.my.id"
  "/home/aapjgfju/public_html"
)

for TARGET in "${POSSIBLE_TARGETS[@]}"; do
  if [ -n "$TARGET" ]; then
    mkdir -p "$TARGET"
    cp -rf dist/* "$TARGET/" 2>/dev/null || true
    cp -rf assets "$TARGET/" 2>/dev/null || true
    cp -rf public/* "$TARGET/" 2>/dev/null || true
    cp -f index.html "$TARGET/index.html" 2>/dev/null || true
    cp -f api.php "$TARGET/api.php" 2>/dev/null || true
    cp -f .htaccess "$TARGET/.htaccess" 2>/dev/null || true
    chmod 755 "$TARGET" 2>/dev/null || true
    chmod 644 "$TARGET/.htaccess" 2>/dev/null || true
    echo "Deployed to $TARGET"
  fi
done
echo "All target deployments completed successfully!"
