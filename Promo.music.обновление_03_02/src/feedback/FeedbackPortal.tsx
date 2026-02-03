/**
 * FEEDBACK PORTAL - Мини-портал обратной связи
 * Публичная страница для получателей рассылок
 * URL: /feedback/:token
 * Updated: 2026-02-01
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Music2, Download, ThumbsUp, Clock, ThumbsDown, CheckCircle2, Calendar, Users } from 'lucide-react';
import { FeedbackType } from '@/contexts/DataContext';

interface FeedbackPortalData {
  distributionId: string;
  recipientId: string;
  recipientName: string;
  itemId: number;
  artist: string;
  title: string;
  genre: string;
  cover: string;
  audioUrl?: string;
  files: Array<{
    id: string;
    name: string;
    size: number;
    url: string;
  }>;
}

export default function FeedbackPortal() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [data, setData] = useState<FeedbackPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  // Дополнительные поля (зависят от типа ответа)
  const [willRotate, setWillRotate] = useState(false);
  const [rotationStartDate, setRotationStartDate] = useState('');
  const [playlistName, setPlaylistName] = useState('');
  const [estimatedReach, setEstimatedReach] = useState('');

  useEffect(() => {
    // Декодирование токена и загрузка данных
    loadFeedbackData();
  }, [token]);

  const loadFeedbackData = async () => {
    try {
      // В реальности здесь будет запрос к API
      // const response = await fetch(`/api/feedback/${token}`);
      // const data = await response.json();
      
      // Моковые данные для демонстрации
      const mockData: FeedbackPortalData = {
        distributionId: 'dist_1',
        recipientId: 'rec_radio_1',
        recipientName: 'Эхо Москвы FM',
        itemId: 1,
        artist: 'CREAM SODA',
        title: 'Я делаю шаг',
        genre: 'Поп',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
        audioUrl: 'https://example.com/audio.mp3',
        files: [
          { id: '1', name: 'CREAM_SODA_-_Я_делаю_шаг.mp3', size: 8500000, url: '#' },
          { id: '2', name: 'CREAM_SODA_-_Я_делаю_шаг.wav', size: 45000000, url: '#' },
          { id: '3', name: 'Press_Release.pdf', size: 250000, url: '#' },
        ],
      };

      setData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading feedback data:', error);
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedType || !data) return;

    const feedbackData = {
      recipientId: data.recipientId,
      distributionId: data.distributionId,
      itemId: data.itemId,
      type: selectedType,
      message,
      respondedAt: new Date().toISOString(),
      respondedVia: 'portal',
      // Дополнительные поля
      ...(selectedType === 'positive' && willRotate && {
        willRotate,
        rotationStartDate,
        estimatedReach: estimatedReach ? parseInt(estimatedReach) : undefined,
      }),
      ...(playlistName && { playlistName }),
    };

    try {
      // В реальности здесь будет отправка на сервер
      // await fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(feedbackData),
      // });

      // Сохраняем в localStorage для демонстрации
      const existingFeedbacks = JSON.parse(localStorage.getItem('pitching_feedbacks') || '[]');
      existingFeedbacks.push(feedbackData);
      localStorage.setItem('pitching_feedbacks', JSON.stringify(existingFeedbacks));

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} КБ`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 flex items-center justify-center">
        <div className="text-white text-xl">Ссылка недействительна или истекла</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Success Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Спасибо за отзыв! 🎉
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              Ваш ответ успешно отправлен. Артист получит уведомление о вашем решении.
            </p>
            <div className="text-gray-400 text-sm">
              Вы можете закрыть эту страницу
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 py-8 md:py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 mb-4">
            <Music2 className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">PROMO.MUSIC</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Прослушать и оставить отзыв
          </h1>
          <p className="text-gray-400">
            Для: {data.recipientName}
          </p>
        </div>

        {/* Track Info Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Cover */}
            <div className="flex-shrink-0">
              <img
                src={data.cover}
                alt={data.title}
                className="w-full md:w-48 h-48 object-cover rounded-2xl"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="text-sm text-purple-400 font-medium mb-2">{data.genre}</div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{data.title}</h2>
              <div className="text-lg text-gray-300 mb-6">{data.artist}</div>

              {/* Audio Player (если есть) */}
              {data.audioUrl && (
                <div className="bg-black/30 rounded-xl p-4 mb-4">
                  <audio controls className="w-full">
                    <source src={data.audioUrl} type="audio/mpeg" />
                    Ваш браузер не поддерживает аудио плеер.
                  </audio>
                </div>
              )}

              {/* Files Download */}
              <div className="space-y-2">
                <div className="text-sm text-gray-400 mb-2">Доступные файлы:</div>
                {data.files.map((file) => (
                  <a
                    key={file.id}
                    href={file.url}
                    download
                    className="flex items-center justify-between bg-black/30 hover:bg-black/50 transition-colors rounded-xl p-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-purple-400" />
                      <div>
                        <div className="text-white text-sm font-medium group-hover:text-purple-400 transition-colors">
                          {file.name}
                        </div>
                        <div className="text-gray-400 text-xs">{formatFileSize(file.size)}</div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-white mb-6">Ваш отзыв</h3>

          {/* Quick Response Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => setSelectedType('positive')}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                selectedType === 'positive'
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-green-500/50'
              }`}
            >
              <ThumbsUp className="w-8 h-8 mb-2" />
              <div className="font-semibold">Взяли в ротацию</div>
              <div className="text-xs mt-1 opacity-70">Понравилось</div>
            </button>

            <button
              onClick={() => setSelectedType('neutral')}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                selectedType === 'neutral'
                  ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-yellow-500/50'
              }`}
            >
              <Clock className="w-8 h-8 mb-2" />
              <div className="font-semibold">Рассмотрим позже</div>
              <div className="text-xs mt-1 opacity-70">Интересно</div>
            </button>

            <button
              onClick={() => setSelectedType('negative')}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                selectedType === 'negative'
                  ? 'bg-red-500/20 border-red-500 text-red-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-red-500/50'
              }`}
            >
              <ThumbsDown className="w-8 h-8 mb-2" />
              <div className="font-semibold">Не подходит</div>
              <div className="text-xs mt-1 opacity-70">Не наш формат</div>
            </button>
          </div>

          {/* Additional Fields for Positive Response */}
          {selectedType === 'positive' && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 mb-6 space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="willRotate"
                  checked={willRotate}
                  onChange={(e) => setWillRotate(e.target.checked)}
                  className="w-5 h-5 rounded border-green-500/50 bg-black/30 text-green-500 focus:ring-green-500"
                />
                <label htmlFor="willRotate" className="text-white font-medium">
                  Добавим в ротацию
                </label>
              </div>

              {willRotate && (
                <>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Дата начала ротации
                    </label>
                    <input
                      type="date"
                      value={rotationStartDate}
                      onChange={(e) => setRotationStartDate(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Оценочный охват слушателей
                    </label>
                    <input
                      type="number"
                      value={estimatedReach}
                      onChange={(e) => setEstimatedReach(e.target.value)}
                      placeholder="Например: 50000"
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500/50"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Название программы/плейлиста (опционально)
                </label>
                <input
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder="Например: Утреннее шоу"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500/50"
                />
              </div>
            </div>
          )}

          {/* Comment Field */}
          {selectedType && (
            <>
              <div className="mb-6">
                <label className="block text-sm text-gray-300 mb-2">
                  Комментарий (необязательно)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ваши мысли о треке..."
                  rows={4}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitFeedback}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-xl transition-all hover:scale-[1.02]"
              >
                Отправить отзыв
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>Система питчинга PROMO.MUSIC</p>
          <p className="mt-1">© 2026 Все права защищены</p>
        </div>
      </div>
    </div>
  );
}
