#!/bin/bash

# Найти все .tsx файлы в src/ и заменить импорты motion
find src -name "*.tsx" -type f -exec sed -i "s/from 'motion\/react'/from 'motion'/g" {} \;

echo "✅ Motion imports fixed!"
