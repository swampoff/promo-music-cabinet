import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Microscope, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users,
  TrendingUp,
  Star,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { NewTrackTestModal } from '@/app/components/track-test/NewTrackTestModal';
import { TrackTestDetailsModal } from '@/app/components/track-test/TrackTestDetailsModal';

interface TrackTestRequest {
  id: string;
  track_title: string;
  artist_name: string;
  genre?: string;
  status: string;
  payment_status: string;
  payment_amount: number;
  required_expert_count: number;
  completed_reviews_count: number;
  average_rating?: number;
  category_averages?: {
    mixing_mastering: number;
    arrangement: number;
    originality: number;
    commercial_potential: number;
  };
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export default function TrackTestPage() {
  const [requests, setRequests] = useState<TrackTestRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock user ID для тестирования
      const userId = 'demo-user-123';

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/track-test/requests?user_id=${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error('Error fetching track test requests:', err);
      setError('Не удалось загрузить заявки. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'review_in_progress':
      case 'experts_assigned':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'pending_payment':
      case 'pending_moderation':
      case 'pending_expert_assignment':
      case 'pending_admin_review':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'moderation_rejected':
      case 'rejected':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending_payment': 'Ожидает оплаты',
      'pending_moderation': 'На модерации',
      'moderation_rejected': 'Отклонено',
      'pending_expert_assignment': 'Ожидает назначения экспертов',
      'experts_assigned': 'Эксперты назначены',
      'review_in_progress': 'Идет оценка',
      'pending_admin_review': 'Проверка администратора',
      'completed': 'Завершено',
      'rejected': 'Отклонено'
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'review_in_progress':
      case 'experts_assigned':
        return <RefreshCw className="w-4 h-4" />;
      case 'pending_payment':
      case 'pending_moderation':
      case 'pending_expert_assignment':
      case 'pending_admin_review':
        return <Clock className="w-4 h-4" />;
      case 'moderation_rejected':
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <Microscope className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Тест трека
                </h1>
                <p className="text-gray-400">
                  Профессиональная оценка от экспертов музыкальной индустрии
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewRequestModal(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              <Plus className="w-5 h-5" />
              Новый тест
            </motion.button>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Экспертов</p>
                  <p className="text-white text-xl font-bold">до 10</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Star className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Критериев</p>
                  <p className="text-white text-xl font-bold">4</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Clock className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Срок</p>
                  <p className="text-white text-xl font-bold">3-5 дней</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Стоимость</p>
                  <p className="text-white text-xl font-bold">1000 ₽</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400"
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </motion.div>
        ) : requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-block p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-4">
              <Microscope className="w-16 h-16 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Нет активных тестов
            </h3>
            <p className="text-gray-400 mb-6">
              Отправьте свой трек на профессиональную оценку
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewRequestModal(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Создать тест
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {requests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/30 transition-all cursor-pointer"
                onClick={() => setSelectedRequest(request.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">
                        {request.track_title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {getStatusText(request.status)}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 mb-3">{request.artist_name}</p>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{request.completed_reviews_count} / {request.required_expert_count} оценок</span>
                      </div>
                      
                      {request.average_rating && (
                        <div className="flex items-center gap-2 text-yellow-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-bold">{request.average_rating.toFixed(1)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(request.created_at).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                    
                    {request.category_averages && (
                      <div className="mt-4 grid grid-cols-4 gap-3">
                        <div className="text-center">
                          <p className="text-xs text-gray-400 mb-1">Сведение</p>
                          <p className="text-lg font-bold text-purple-400">{request.category_averages.mixing_mastering.toFixed(1)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-400 mb-1">Аранжировка</p>
                          <p className="text-lg font-bold text-blue-400">{request.category_averages.arrangement.toFixed(1)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-400 mb-1">Оригинальность</p>
                          <p className="text-lg font-bold text-pink-400">{request.category_averages.originality.toFixed(1)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-400 mb-1">Потенциал</p>
                          <p className="text-lg font-bold text-green-400">{request.category_averages.commercial_potential.toFixed(1)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {request.status === 'completed' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg bg-purple-500 text-white font-medium text-sm"
                    >
                      Смотреть отчет
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* New Request Modal */}
        <NewTrackTestModal
          isOpen={showNewRequestModal}
          onClose={() => setShowNewRequestModal(false)}
          onSuccess={() => {
            fetchRequests();
            setShowNewRequestModal(false);
          }}
        />

        {/* Track Test Details Modal */}
        <TrackTestDetailsModal
          isOpen={!!selectedRequest}
          requestId={selectedRequest || ''}
          onClose={() => setSelectedRequest(null)}
        />
      </div>
    </div>
  );
}