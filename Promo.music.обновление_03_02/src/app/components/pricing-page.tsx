/**
 * PRICING PAGE - Страница тарифов и услуг
 * Полный каталог всех услуг promo.music с ценами
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  DollarSign, Sparkles, Star, Crown, Building2, Check, X,
  Radio, Megaphone, Tv, Users, TestTube, TrendingUp, Music, Image
} from 'lucide-react';
import {
  SUBSCRIPTION_PRICES,
  SUBSCRIPTION_DISCOUNTS,
  BANNER_PRICES,
  PLAYLIST_PITCHING_PRICES,
  MARKETING_PRICES,
  PITCHING_PRICES,
  TESTING_PRICES,
  DISCOVERY_PRICES,
  calculatePrice,
} from '@/constants/financial';
import { useSubscription } from '@/contexts/SubscriptionContext';

export function PricingPage() {
  const { subscription } = useSubscription();
  const [selectedCategory, setSelectedCategory] = useState<'subscriptions' | 'banners' | 'playlists' | 'marketing' | 'pitching' | 'testing'>('subscriptions');

  const categories = [
    { id: 'subscriptions', label: 'Подписки', icon: Star },
    { id: 'banners', label: 'Баннеры', icon: Image },
    { id: 'playlists', label: 'Плейлисты', icon: Music },
    { id: 'marketing', label: 'Маркетинг', icon: Megaphone },
    { id: 'pitching', label: 'Питчинг', icon: Radio },
    { id: 'testing', label: 'Тестирование', icon: TestTube },
  ];

  const subscriptionIcons = {
    spark: Sparkles,
    start: Star,
    pro: TrendingUp,
    elite: Crown,
    label: Building2,
  };

  const subscriptionColors = {
    spark: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    start: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    pro: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    elite: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
    label: 'from-gray-500/20 to-slate-500/20 border-gray-500/30',
  };

  const getCurrentSubscriptionKey = (): 'none' | 'spark' | 'start' | 'pro' | 'elite' | 'label' => {
    if (!subscription || subscription === 'free') return 'none';
    return subscription as any;
  };

  const currentSub = getCurrentSubscriptionKey();
  const currentDiscount = SUBSCRIPTION_DISCOUNTS[currentSub] || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">💰 Тарифы и услуги</h1>
        <p className="text-gray-400">
          Полный каталог услуг promo.music с актуальными ценами
        </p>
        {currentDiscount > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-green-400">
              Ваша скидка: <strong>-{Math.round(currentDiscount * 100)}%</strong> на все услуги
            </span>
          </div>
        )}
      </motion.div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap
                ${selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-500/50 text-white'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Subscriptions */}
        {selectedCategory === 'subscriptions' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {Object.entries(SUBSCRIPTION_PRICES).map(([key, price]) => {
              const Icon = subscriptionIcons[key as keyof typeof subscriptionIcons];
              const colorClass = subscriptionColors[key as keyof typeof subscriptionColors];
              const discount = SUBSCRIPTION_DISCOUNTS[key as keyof typeof SUBSCRIPTION_DISCOUNTS];

              return (
                <div
                  key={key}
                  className={`
                    relative p-6 rounded-xl border-2 backdrop-blur-sm
                    bg-gradient-to-br ${colorClass}
                  `}
                >
                  {currentSub === key && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                      АКТИВНА
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold capitalize">{key}</h3>
                      {key === 'pro' && <span className="text-xs text-yellow-400">⭐ Популярно</span>}
                      {key === 'elite' && <span className="text-xs text-orange-400">💎 Премиум</span>}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-3xl font-bold">
                      ₽{price.toLocaleString()}
                      <span className="text-sm text-gray-400">/мес</span>
                    </div>
                    {discount > 0 && (
                      <div className="text-sm text-green-400 mt-1">
                        Скидка -{Math.round(discount * 100)}% на все услуги
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    {key === 'spark' && (
                      <>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>1 соцсеть (автопостинг)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Email база до 500</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>5 рассылок по заведениям</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>1 техническая проверка/мес</span>
                        </div>
                      </>
                    )}
                    {key === 'start' && (
                      <>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Всё из Spark</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Email база до 5,000</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>10 рассылок по заведениям</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>1 VK питчинг/квартал</span>
                        </div>
                      </>
                    )}
                    {key === 'pro' && (
                      <>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Всё из Start</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>5 соцсетей + Stories</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>50 рассылок + 100 AI</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Featured 1/квартал</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Промо-бюджет ₽10,000</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>2 баннера включено</span>
                        </div>
                      </>
                    )}
                    {key === 'elite' && (
                      <>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Всё из Pro</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Безлимит автопостинг</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Email 50k + 4 рассылки</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Промо-бюджет ₽50,000</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Питчинг все платформы</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>5 баннеров включено</span>
                        </div>
                      </>
                    )}
                    {key === 'label' && (
                      <>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Всё из Elite для всех артистов</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Персональный менеджер</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Индивидуальные условия</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>VIP поддержка 24/7</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    className={`
                      w-full mt-4 px-4 py-3 rounded-lg font-semibold transition-all
                      ${currentSub === key
                        ? 'bg-green-500/20 border-2 border-green-500/50 text-green-400 cursor-default'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                      }
                    `}
                    disabled={currentSub === key}
                  >
                    {currentSub === key ? '✓ Активная подписка' : 'Оформить подписку'}
                  </button>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Banners */}
        {selectedCategory === 'banners' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Баннерная реклама (7 дней)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(BANNER_PRICES).map(([key, basePrice]) => {
                  const price = calculatePrice(basePrice, currentSub);
                  const saved = basePrice - price;

                  return (
                    <div key={key} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="text-sm text-gray-400 mb-1 capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="text-2xl font-bold mb-2">
                        ₽{price.toLocaleString()}
                      </div>
                      {saved > 0 && (
                        <div className="text-xs text-green-400 mb-2">
                          Экономия: ₽{saved.toLocaleString()}
                        </div>
                      )}
                      <button className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-semibold transition-all text-sm">
                        Заказать
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-sm text-gray-400">
                * Скидки за период: 14 дней -15%, 30 дней -25%, 90 дней -35%
              </div>
            </div>
          </motion.div>
        )}

        {/* Playlists */}
        {selectedCategory === 'playlists' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Плейлист-питчинг (1 трек)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(PLAYLIST_PITCHING_PRICES).map(([key, basePrice]) => {
                  const price = calculatePrice(basePrice, currentSub);
                  const saved = basePrice - price;

                  return (
                    <div key={key} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="text-sm text-gray-400 mb-1 uppercase">
                        {key === 'yandex' && '🎵 Яндекс.Музыка'}
                        {key === 'vk' && '🎵 VK Музыка'}
                        {key === 'zvuk_mts' && '🎵 Звук/МТС'}
                        {key === 'all' && '🎁 Single Boost (все 3)'}
                        {key === 'ep' && '🎁 EP Campaign (3 трека)'}
                        {key === 'album' && '🎁 Album Domination (8+)'}
                      </div>
                      <div className="text-2xl font-bold mb-2">
                        ₽{price.toLocaleString()}
                      </div>
                      {saved > 0 && (
                        <div className="text-xs text-green-400 mb-2">
                          Экономия: ₽{saved.toLocaleString()}
                        </div>
                      )}
                      <button className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-semibold transition-all text-sm">
                        Заказать питчинг
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Marketing */}
        {selectedCategory === 'marketing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Маркетинговые инструменты</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(MARKETING_PRICES).map(([key, basePrice]) => {
                  const price = calculatePrice(basePrice, currentSub);
                  const saved = basePrice - price;

                  return (
                    <div key={key} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="text-sm text-gray-400 mb-1 capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="text-2xl font-bold mb-2">
                        ₽{price.toLocaleString()}
                      </div>
                      {saved > 0 && (
                        <div className="text-xs text-green-400">
                          Экономия: ₽{saved.toLocaleString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Pitching */}
        {selectedCategory === 'pitching' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Питчинг (радио, лейблы, sync, ТВ)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(PITCHING_PRICES).map(([key, basePrice]) => {
                  const price = calculatePrice(basePrice, currentSub);
                  const saved = basePrice - price;

                  return (
                    <div key={key} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="text-sm text-gray-400 mb-1 capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="text-2xl font-bold mb-2">
                        ₽{price.toLocaleString()}
                      </div>
                      {saved > 0 && (
                        <div className="text-xs text-green-400">
                          Экономия: ₽{saved.toLocaleString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Testing */}
        {selectedCategory === 'testing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Тестирование треков</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(TESTING_PRICES).map(([key, basePrice]) => {
                  const price = calculatePrice(basePrice, currentSub);
                  const saved = basePrice - price;

                  return (
                    <div key={key} className="p-6 bg-white/5 rounded-lg border border-white/10">
                      <div className="text-sm text-gray-400 mb-2">
                        🎵 Профессиональное тестирование
                      </div>
                      <div className="text-3xl font-bold mb-2">
                        ₽{price.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-300 mb-3">
                        Полный анализ вашего трека
                      </div>
                      {saved > 0 && (
                        <div className="text-xs text-green-400 mb-3">
                          Экономия: ₽{saved.toLocaleString()}
                        </div>
                      )}
                      <button className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-semibold transition-all text-sm">
                        Заказать тест
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-gray-300">
                  <strong>Что входит:</strong> Техническая экспертиза, коммерческий анализ, рекомендации по улучшению, прогноз стриминг-потенциала
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl"
      >
        <h4 className="text-lg font-bold mb-2">💡 Полезная информация</h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>• <strong>⏰ Важно для питчинга:</strong> Подавайте треки минимум за <strong>2 недели до релиза</strong> для максимального эффекта!</li>
          <li>• <strong>💎 Экономьте с подпиской:</strong> Скидки до 60% на все услуги! Подписка окупается уже с 2-3 заказов.</li>
          <li>• <strong>📊 Комбинируйте услуги:</strong> Питчинг + баннеры + маркетинг дают максимальный результат для релиза.</li>
          <li>• <strong>🎯 Персональные условия:</strong> Для лейблов и крупных проектов предусмотрены индивидуальные тарифы.</li>
          <li>• Все цены актуальны на {new Date().toLocaleDateString('ru-RU')}</li>
        </ul>
      </motion.div>
    </div>
  );
}