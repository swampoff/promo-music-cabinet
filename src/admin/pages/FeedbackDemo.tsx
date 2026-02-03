/**
 * FEEDBACK DEMO - Демонстрация портала обратной связи
 * Временная страница для тестирования
 * Updated: 2026-02-01
 */

import { ExternalLink, Music2 } from 'lucide-react';

export function FeedbackDemo() {
  // Генерация тестового токена
  const generateTestToken = () => {
    const data = {
      distributionId: 'dist_1',
      recipientId: 'rec_radio_1',
      timestamp: Date.now(),
    };
    return btoa(JSON.stringify(data));
  };

  const testToken = generateTestToken();
  const feedbackUrl = `/feedback/${testToken}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Демонстрация портала обратной связи
          </h1>
          <p className="text-gray-400">
            Тестирование системы получения отзывов от получателей рассылок
          </p>
        </div>

        {/* Demo Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <Music2 className="w-8 h-8 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Сценарий</h2>
          </div>

          <div className="space-y-6 mb-8">
            <div className="bg-black/30 rounded-xl p-6">
              <div className="text-sm text-purple-400 font-semibold mb-2">ШАГ 1</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Отправка рассылки
              </h3>
              <p className="text-gray-300">
                Администратор создает рассылку трека "CREAM SODA - Я делаю шаг" на радиостанцию "Эхо Москвы FM"
              </p>
            </div>

            <div className="bg-black/30 rounded-xl p-6">
              <div className="text-sm text-purple-400 font-semibold mb-2">ШАГ 2</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Получатель получает письмо
              </h3>
              <p className="text-gray-300 mb-4">
                В письме есть уникальная ссылка "Прослушать и оставить отзыв"
              </p>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                <div className="text-xs text-purple-400 mb-2">Тестовая ссылка:</div>
                <code className="text-sm text-white break-all">
                  {window.location.origin}{feedbackUrl}
                </code>
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-6">
              <div className="text-sm text-purple-400 font-semibold mb-2">ШАГ 3</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Оставить отзыв
              </h3>
              <p className="text-gray-300">
                Получатель переходит по ссылке, прослушивает трек и оставляет один из трех типов отзывов:
              </p>
              <ul className="mt-3 space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Положительный (Взяли в ротацию)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Нейтральный (Рассмотрим позже)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Отрицательный (Не подходит)
                </li>
              </ul>
            </div>
          </div>

          {/* Test Button */}
          <a
            href={feedbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            <ExternalLink className="w-5 h-5" />
            Открыть портал обратной связи (новая вкладка)
          </a>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">
            ℹ️ Информация
          </h3>
          <div className="text-gray-300 space-y-2">
            <p>
              • Портал обратной связи работает без авторизации (публичный доступ)
            </p>
            <p>
              • После отправки отзыва данные сохраняются в localStorage
            </p>
            <p>
              • В production версии отзывы будут отправляться на сервер и автоматически обновлять статус получателя
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
