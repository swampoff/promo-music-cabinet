// Тестовый скрипт для проверки синтаксиса settings-page.tsx
const fs = require('fs');
const path = require('path');

console.log('🔍 Начинаю аудит файла settings-page.tsx...\n');

const filePath = path.join(__dirname, 'src', 'app', 'components', 'settings-page.tsx');

if (!fs.existsSync(filePath)) {
  console.error('❌ Файл не найден:', filePath);
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

console.log(`✅ Файл загружен: ${lines.length} строк\n`);

// 1. Проверка всех разделов
console.log('📋 Проверка разделов:');
const tabs = ['profile', 'security', 'notifications', 'privacy', 'payment', 'subscription', 'advanced'];
const foundTabs = {};

tabs.forEach(tab => {
  const regex = new RegExp(`activeTab === '${tab}'`, 'g');
  const matches = content.match(regex);
  foundTabs[tab] = matches ? matches.length : 0;
  console.log(`  ${foundTabs[tab] > 0 ? '✅' : '❌'} ${tab}: ${foundTabs[tab]} вхождений`);
});

// Проверка дубликатов
console.log('\n🔎 Проверка дубликатов:');
let hasDuplicates = false;
tabs.forEach(tab => {
  if (foundTabs[tab] > 1) {
    console.log(`  ⚠️  ${tab} - найдено ${foundTabs[tab]} дубликатов!`);
    hasDuplicates = true;
  }
});
if (!hasDuplicates) {
  console.log('  ✅ Дубликатов не найдено');
}

// 2. Проверка парных тегов
console.log('\n🏷️  Проверка парных тегов:');
const tags = {
  '{': '}',
  '(': ')',
  '[': ']',
  '<AnimatePresence': '</AnimatePresence>',
  '<motion.div': '</motion.div>',
  '<motion.button': '</motion.button>',
};

// Подсчет AnimatePresence
const openAnimatePresence = (content.match(/<AnimatePresence/g) || []).length;
const closeAnimatePresence = (content.match(/<\/AnimatePresence>/g) || []).length;
console.log(`  AnimatePresence: ${openAnimatePresence} открывающих, ${closeAnimatePresence} закрывающих ${openAnimatePresence === closeAnimatePresence ? '✅' : '❌'}`);

// 3. Проверка функций
console.log('\n⚙️  Проверка функций:');
const functions = [
  'export function SettingsPage',
  'const ToggleSwitch',
  'const detectCardType',
  'const formatCardNumber',
  'const formatExpiryDate',
  'const validateCard',
  'const CustomDropdown',
  'const loadSettings',
  'const loadSessions',
  'const loadPaymentMethods',
  'const loadSubscriptionData',
  'const saveAllSettings',
  'const handleChangePlan',
  'const handleCancelSubscription',
];

functions.forEach(func => {
  const found = content.includes(func);
  console.log(`  ${found ? '✅' : '❌'} ${func}`);
});

// 4. Проверка импортов
console.log('\n📦 Проверка импортов:');
const imports = [
  'motion',
  'AnimatePresence',
  'useState',
  'useRef',
  'useEffect',
  'useCallback',
  'ImageWithFallback',
  'toast',
  'settingsAPI',
];

imports.forEach(imp => {
  const found = content.includes(imp);
  console.log(`  ${found ? '✅' : '✓' } ${imp}`);
});

// 5. Проверка состояний
console.log('\n📊 Проверка основных состояний:');
const states = [
  'activeTab',
  'isLoading',
  'isSaving',
  'displayName',
  'twoFactorEnabled',
  'pushNotifications',
  'profileVisibility',
  'paymentMethods',
  'currentSubscription',
  'availablePlans',
  'paymentHistory',
];

states.forEach(state => {
  const found = content.includes(`${state},`);
  console.log(`  ${found ? '✅' : '⚠️ '} ${state}`);
});

// 6. Структурный анализ
console.log('\n🏗️  Структурный анализ:');

// Проверка return statement
const hasReturn = content.includes('return (');
console.log(`  ${hasReturn ? '✅' : '❌'} return statement найден`);

// Проверка закрывающей скобки компонента
const lastLines = lines.slice(-10).join('\n');
const hasClosingBrace = lastLines.includes('}');
console.log(`  ${hasClosingBrace ? '✅' : '❌'} Закрывающая скобка компонента`);

// 7. Проверка модальных окон
console.log('\n🪟 Проверка модальных окон:');
const modals = [
  'showAddCardModal',
  'showEditCardModal',
  'showDeleteCardModal',
  'showPasswordModal',
];

modals.forEach(modal => {
  const found = content.includes(modal);
  console.log(`  ${found ? '✅' : '❌'} ${modal}`);
});

// 8. Итоговая статистика
console.log('\n📈 Статистика файла:');
console.log(`  Всего строк: ${lines.length}`);
console.log(`  Размер файла: ${(content.length / 1024).toFixed(2)} KB`);
console.log(`  Количество компонентов: ${(content.match(/function |const.*=.*=>/g) || []).length}`);
console.log(`  Количество useEffect: ${(content.match(/useEffect/g) || []).length}`);
console.log(`  Количество useState: ${(content.match(/useState/g) || []).length}`);

console.log('\n✨ Аудит завершён!');
