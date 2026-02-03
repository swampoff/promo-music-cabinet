#!/bin/bash
# Массовая замена импортов Motion на Framer Motion

echo "🔧 Replacing all motion imports with framer-motion..."

# Список файлов для замены
files=(
  "/src/app/components/coins-modal.tsx"
  "/src/app/components/tracks-page.tsx"
  "/src/app/components/upload-page.tsx"
  "/src/app/components/profile-page.tsx"
  "/src/app/components/video-page.tsx"
  "/src/app/components/concerts-page.tsx"
  "/src/app/components/news-page.tsx"
  "/src/app/components/rating-page.tsx"
  "/src/app/components/messages-page.tsx"
  "/src/app/components/settings-page.tsx"
  "/src/app/components/public-content-manager.tsx"
  "/src/app/components/track-pitching-modal.tsx"
  "/src/app/components/video-pitching-modal.tsx"
  "/src/app/components/video-upload-modal.tsx"
  "/src/app/components/concert-upload-modal.tsx"
  "/src/app/components/promoted-concerts-sidebar.tsx"
  "/src/app/components/promoted-news-block.tsx"
  "/src/app/components/donations-page.tsx"
  "/src/app/components/pitching-page.tsx"
  "/src/app/components/payment-method-modal.tsx"
  "/src/app/components/payment-confirmation-modal.tsx"
  "/src/app/components/payment-success-modal.tsx"
  "/src/app/components/analytics-page.tsx"
  "/src/app/components/track-detail-page.tsx"
  "/src/app/components/video-detail-page.tsx"
  "/src/app/components/demo-data-button.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ Fixing: $file"
    sed -i "s/from 'motion'/from 'framer-motion'/g" "$file"
    sed -i "s/from \"motion\"/from \"framer-motion\"/g" "$file"
    sed -i "s/from 'motion\/react'/from 'framer-motion'/g" "$file"
    sed -i "s/from \"motion\/react\"/from \"framer-motion\"/g" "$file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo "✅ All imports replaced!"
echo "🚀 Now run: npm install && npm run dev"
