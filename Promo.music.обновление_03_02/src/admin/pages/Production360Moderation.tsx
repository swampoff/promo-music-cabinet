/**
 * PRODUCTION 360 MODERATION - Модерация комплексных проектов полного цикла
 * Версия: 2.0 (Полная доработка)
 * Adaptive: 320px → 4K
 * Фичи: Детальный просмотр, управление прогрессом, оценка стоимости, timeline
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, CheckCircle, XCircle, Search, Zap, DollarSign, 
  Eye, MessageSquare, Clock, TrendingUp, FileText, 
  Calendar, Users, Target, Award, X, AlertCircle,
  ArrowRight, CheckCheck, PlayCircle, Pause, RefreshCw
} from 'lucide-react';
import { useData, type Production360, type Production360Status } from '@/contexts/DataContext';

type FilterStatus = 'all' | 'pending_payment' | 'pending_review' | 'approved' | 'rejected' | 'in_progress' | 'completed';

export function Production360Moderation() {
  const { production360: allProduction = [] } = useData();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Production360 | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showEstimateModal, setShowEstimateModal] = useState(false);

  // Filtering
  let filtered = allProduction;
  if (filterStatus !== 'all') filtered = filtered.filter(p => p.status === filterStatus);
  if (searchQuery) filtered = filtered.filter(p => 
    p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const stats = {
    total: allProduction.length,
    pending: allProduction.filter(p => p.status === 'pending_payment' || p.status === 'pending_review').length,
    approved: allProduction.filter(p => p.status === 'approved').length,
    inProgress: allProduction.filter(p => p.status === 'in_progress').length,
    completed: allProduction.filter(p => p.status === 'completed').length,
    rejected: allProduction.filter(p => p.status === 'rejected').length,
    totalRevenue: allProduction.filter(p => p.isPaid).reduce((sum, p) => sum + p.finalPrice, 0),
    estimatedValue: allProduction.filter(p => p.estimatedFullPrice).reduce((sum, p) => sum + (p.estimatedFullPrice || 0), 0),
  };

  const statusConfig = {
    pending_payment: { label: 'Ожидает оплаты', icon: Clock, color: 'orange' },
    pending_review: { label: 'На модерации', icon: Eye, color: 'yellow' },
    approved: { label: 'Одобрено', icon: CheckCircle, color: 'green' },
    rejected: { label: 'Отклонено', icon: XCircle, color: 'red' },
    in_progress: { label: 'В работе', icon: PlayCircle, color: 'blue' },
    completed: { label: 'Завершено', icon: Award, color: 'purple' },
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_review;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border
        ${status === 'pending_payment' && 'bg-orange-500/20 text-orange-400 border-orange-500/30'}
        ${status === 'pending_review' && 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}
        ${status === 'approved' && 'bg-green-500/20 text-green-400 border-green-500/30'}
        ${status === 'rejected' && 'bg-red-500/20 text-red-400 border-red-500/30'}
        ${status === 'in_progress' && 'bg-blue-500/20 text-blue-400 border-blue-500/30'}
        ${status === 'completed' && 'bg-purple-500/20 text-purple-400 border-purple-500/30'}
      `}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const openDetailModal = (project: Production360) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  const openProgressModal = (project: Production360) => {
    setSelectedProject(project);
    setShowProgressModal(true);
  };

  const openEstimateModal = (project: Production360) => {
    setSelectedProject(project);
    setShowEstimateModal(true);
  };

  return (
    <div className="space-y-3 md:space-y-6">
      {/* ENHANCED STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-8 gap-2 md:gap-3">
        {[
          { label: 'Всего', value: stats.total, icon: Box, color: 'bg-white/5' },
          { label: 'Ожидают', value: stats.pending, icon: Clock, color: 'bg-yellow-500/10 border-yellow-500/20' },
          { label: 'Одобрено', value: stats.approved, icon: CheckCircle, color: 'bg-green-500/10 border-green-500/20' },
          { label: 'В работе', value: stats.inProgress, icon: PlayCircle, color: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Завершено', value: stats.completed, icon: Award, color: 'bg-purple-500/10 border-purple-500/20' },
          { label: 'Отклонено', value: stats.rejected, icon: XCircle, color: 'bg-red-500/10 border-red-500/20' },
          { label: 'Доход', value: `₽${(stats.totalRevenue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'bg-green-500/10 border-green-500/20' },
          { label: 'Потенциал', value: `₽${(stats.estimatedValue / 1000000).toFixed(1)}M`, icon: TrendingUp, color: 'bg-cyan-500/10 border-cyan-500/20' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }}
              className={`backdrop-blur-xl rounded-lg border border-white/10 p-2.5 md:p-3 ${stat.color}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
              <div className="text-lg md:text-xl font-bold text-white">{stat.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* SEARCH & FILTER */}
      <div className="backdrop-blur-xl bg-white/5 rounded-lg md:rounded-xl border border-white/10 p-3 md:p-4">
        <div className="flex flex-col md:flex-row gap-2 md:gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Поиск по проекту, артисту..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value as FilterStatus)}
            className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">Все статусы ({stats.total})</option>
            <option value="pending_payment">Ожидает оплаты ({allProduction.filter(p => p.status === 'pending_payment').length})</option>
            <option value="pending_review">На модерации ({allProduction.filter(p => p.status === 'pending_review').length})</option>
            <option value="approved">Одобрено ({stats.approved})</option>
            <option value="in_progress">В работе ({stats.inProgress})</option>
            <option value="completed">Завершено ({stats.completed})</option>
            <option value="rejected">Отклонено ({stats.rejected})</option>
          </select>
        </div>
      </div>

      {/* PROJECTS LIST */}
      {filtered.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-12 text-center"
        >
          <Box className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Проекты не найдены</h3>
          <p className="text-gray-400">Измените параметры поиска или фильтры</p>
        </motion.div>
      ) : (
        <div className="grid gap-3 md:gap-4 grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((project, i) => (
            <ProjectCard 
              key={project.id}
              project={project}
              index={i}
              onViewDetails={() => openDetailModal(project)}
              onManageProgress={() => openProgressModal(project)}
              onSetEstimate={() => openEstimateModal(project)}
              getStatusBadge={getStatusBadge}
            />
          ))}
        </div>
      )}

      {/* MODALS */}
      <DetailModal 
        project={selectedProject}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        getStatusBadge={getStatusBadge}
      />

      <ProgressModal
        project={selectedProject}
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
      />

      <EstimateModal
        project={selectedProject}
        isOpen={showEstimateModal}
        onClose={() => setShowEstimateModal(false)}
      />
    </div>
  );
}

// ============================================================
// PROJECT CARD COMPONENT
// ============================================================

interface ProjectCardProps {
  project: Production360;
  index: number;
  onViewDetails: () => void;
  onManageProgress: () => void;
  onSetEstimate: () => void;
  getStatusBadge: (status: string) => JSX.Element;
}

function ProjectCard({ project, index, onViewDetails, onManageProgress, onSetEstimate, getStatusBadge }: ProjectCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: index * 0.05 }}
      className="group backdrop-blur-xl bg-white/5 rounded-lg md:rounded-xl border border-white/10 p-3 md:p-4 hover:bg-white/10 transition-all hover:border-white/20"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {project.artistAvatar && (
            <img src={project.artistAvatar} alt={project.artist} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white/10" />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-semibold text-white mb-1 truncate">{project.projectName}</h3>
            <p className="text-xs md:text-sm text-gray-400 truncate">{project.artist}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">{project.genre}</span>
            </div>
          </div>
        </div>
        {getStatusBadge(project.status)}
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs text-gray-400">{project.userRole === 'label' ? 'Лейбл' : 'Артист'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs text-blue-400 font-medium">{project.subscriptionPlan.replace('artist_', '').replace('_', ' ').toUpperCase()}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs md:text-sm text-gray-400 mb-3 line-clamp-2">{project.projectDescription}</p>

      {/* Services */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
          <CheckCheck className="w-3.5 h-3.5" />
          Услуги:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(project.services).filter(([_, v]) => v).map(([k]) => (
            <span key={k} className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-xs border border-blue-500/30">
              {k === 'concept' && '📝 Концепция'}
              {k === 'recording' && '🎙️ Запись'}
              {k === 'mixing' && '🎚️ Сведение'}
              {k === 'videoContent' && '🎬 Видео'}
              {k === 'distribution' && '📦 Дистрибуция'}
              {k === 'promotion' && '📢 Промо'}
            </span>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2.5 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
          <div className="text-xs text-gray-400 mb-1">Консультация</div>
          <div className="text-base font-bold text-green-400">₽{project.finalPrice.toLocaleString()}</div>
          {project.discount > 0 && (
            <div className="text-xs text-green-400/70 font-medium">Скидка -{project.discount}%</div>
          )}
        </div>
        {project.estimatedFullPrice ? (
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <div className="text-xs text-gray-400 mb-1">Полный цикл</div>
            <div className="text-base font-bold text-blue-400">₽{(project.estimatedFullPrice / 1000).toFixed(0)}K</div>
            <div className="text-xs text-blue-400/70">Оценка</div>
          </div>
        ) : (
          <button
            onClick={onSetEstimate}
            className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex flex-col items-center justify-center gap-1"
          >
            <DollarSign className="w-4 h-4 text-gray-400" />
            <div className="text-xs text-gray-400">Оценить</div>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {project.status === 'in_progress' && project.progress && (
        <div className="mb-3 p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-blue-400 font-medium flex items-center gap-1.5">
              <PlayCircle className="w-3.5 h-3.5" />
              {project.progress.currentStage === 'concept' && 'Концепция'}
              {project.progress.currentStage === 'recording' && 'Запись'}
              {project.progress.currentStage === 'mixing' && 'Сведение'}
              {project.progress.currentStage === 'video' && 'Видео'}
              {project.progress.currentStage === 'distribution' && 'Дистрибуция'}
              {project.progress.currentStage === 'promotion' && 'Промо'}
            </span>
            <span className="text-xs text-blue-400 font-bold">{project.progress.completedPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${project.progress.completedPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
            />
          </div>
          {project.progress.estimatedCompletion && (
            <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Завершение: {new Date(project.progress.estimatedCompletion).toLocaleDateString('ru-RU')}
            </div>
          )}
        </div>
      )}

      {/* Rejection Reason */}
      {project.status === 'rejected' && project.rejectionReason && (
        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 mb-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-medium text-red-400 mb-1">Причина отклонения:</div>
              <p className="text-xs text-red-400/80">{project.rejectionReason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onViewDetails}
          className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-500/30 text-blue-400 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          Детали
        </button>
        
        {(project.status === 'in_progress' || project.status === 'approved') && (
          <button
            onClick={onManageProgress}
            className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 text-purple-400 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Прогресс
          </button>
        )}
      </div>

      {/* Dates */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
        <span>Подано: {new Date(project.submittedDate).toLocaleDateString('ru-RU')}</span>
        {project.isPaid && (
          <span className="text-green-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Оплачено
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================
// DETAIL MODAL
// ============================================================

interface DetailModalProps {
  project: Production360 | null;
  isOpen: boolean;
  onClose: () => void;
  getStatusBadge: (status: string) => JSX.Element;
}

function DetailModal({ project, isOpen, onClose, getStatusBadge }: DetailModalProps) {
  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 overflow-hidden"
          >
            <div className="h-full backdrop-blur-2xl bg-gradient-to-br from-gray-900/95 via-gray-900/98 to-black/95 rounded-2xl border border-white/10 shadow-2xl flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between p-4 md:p-6 border-b border-white/10">
                <div className="flex items-start gap-4 flex-1">
                  {project.artistAvatar && (
                    <img src={project.artistAvatar} alt={project.artist} className="w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 border-white/10" />
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{project.projectName}</h2>
                    <p className="text-gray-400 mb-2">{project.artist} • {project.genre}</p>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(project.status)}
                      <span className="text-xs text-gray-500">{project.userRole === 'label' ? '🏢 Лейбл' : '🎤 Артист'}</span>
                      <span className="text-xs text-blue-400 font-medium">{project.subscriptionPlan.replace('artist_', '').toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {/* Description */}
                <section>
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    Описание проекта
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{project.projectDescription}</p>
                </section>

                {/* Goals & Audience */}
                <div className="grid md:grid-cols-2 gap-4">
                  <section className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-400" />
                      Цели проекта
                    </h3>
                    <p className="text-sm text-gray-300">{project.projectGoals}</p>
                  </section>

                  <section className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      Целевая аудитория
                    </h3>
                    <p className="text-sm text-gray-300">{project.targetAudience}</p>
                  </section>
                </div>

                {/* Services */}
                <section className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-blue-400" />
                    Выбранные услуги
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(project.services).map(([key, enabled]) => (
                      <div key={key} className={`p-2 rounded-lg border ${enabled ? 'bg-green-500/20 border-green-500/30' : 'bg-white/5 border-white/10 opacity-40'}`}>
                        <div className="flex items-center gap-2">
                          {enabled ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <XCircle className="w-3.5 h-3.5 text-gray-500" />}
                          <span className={`text-xs font-medium ${enabled ? 'text-green-400' : 'text-gray-500'}`}>
                            {key === 'concept' && 'Концепция'}
                            {key === 'recording' && 'Запись'}
                            {key === 'mixing' && 'Сведение'}
                            {key === 'videoContent' && 'Видео'}
                            {key === 'distribution' && 'Дистрибуция'}
                            {key === 'promotion' && 'Промо'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Financial */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                    <div className="text-xs text-gray-400 mb-1">Консультация</div>
                    <div className="text-2xl font-bold text-green-400 mb-1">₽{project.finalPrice.toLocaleString()}</div>
                    {project.discount > 0 && (
                      <div className="text-xs text-green-400/70">Скидка: -{project.discount}% (₽{(project.basePrice - project.finalPrice).toLocaleString()})</div>
                    )}
                    {project.isPaid ? (
                      <div className="text-xs text-green-400 flex items-center gap-1 mt-2">
                        <CheckCircle className="w-3 h-3" />
                        Оплачено
                      </div>
                    ) : (
                      <div className="text-xs text-orange-400 flex items-center gap-1 mt-2">
                        <Clock className="w-3 h-3" />
                        Ожидает оплаты
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <div className="text-xs text-gray-400 mb-1">Полный цикл (оценка)</div>
                    <div className="text-2xl font-bold text-blue-400 mb-1">
                      {project.estimatedFullPrice ? `₽${(project.estimatedFullPrice / 1000).toFixed(0)}K` : 'Не указано'}
                    </div>
                    <div className="text-xs text-blue-400/70">Определяется после консультации</div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <div className="text-xs text-gray-400 mb-1">ROI потенциал</div>
                    <div className="text-2xl font-bold text-purple-400 mb-1">
                      {project.estimatedFullPrice ? `${((project.estimatedFullPrice / project.finalPrice) * 100).toFixed(0)}%` : 'N/A'}
                    </div>
                    <div className="text-xs text-purple-400/70">Оценочная множитель</div>
                  </div>
                </div>

                {/* References */}
                {project.references && project.references.length > 0 && (
                  <section>
                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-400" />
                      Референсы
                    </h3>
                    <div className="space-y-2">
                      {project.references.map((ref, i) => (
                        <a key={i} href={ref} target="_blank" rel="noopener noreferrer"
                          className="block p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2">
                          <ArrowRight className="w-3.5 h-3.5" />
                          {ref}
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {/* Existing Material */}
                {project.existingMaterial && (
                  <section className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="text-sm font-semibold text-white mb-2">Существующие материалы</h3>
                    <p className="text-sm text-gray-300">{project.existingMaterial}</p>
                  </section>
                )}

                {/* Moderation Note */}
                {project.moderationNote && (
                  <section className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <h3 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Заметка модератора
                    </h3>
                    <p className="text-sm text-yellow-400/80">{project.moderationNote}</p>
                  </section>
                )}

                {/* Timeline */}
                <section className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    Временная шкала
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5" />
                      <div>
                        <div className="text-xs text-gray-400">Подано</div>
                        <div className="text-sm text-white">{new Date(project.submittedDate).toLocaleString('ru-RU')}</div>
                      </div>
                    </div>
                    {project.approvedDate && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5" />
                        <div>
                          <div className="text-xs text-gray-400">Одобрено</div>
                          <div className="text-sm text-white">{new Date(project.approvedDate).toLocaleString('ru-RU')}</div>
                        </div>
                      </div>
                    )}
                    {project.completedDate && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5" />
                        <div>
                          <div className="text-xs text-gray-400">Завершено</div>
                          <div className="text-sm text-white">{new Date(project.completedDate).toLocaleString('ru-RU')}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Footer Actions */}
              <div className="p-4 md:p-6 border-t border-white/10 flex gap-3">
                {project.status === 'pending_review' && (
                  <>
                    <button className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium transition-all flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Одобрить проект
                    </button>
                    <button className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium transition-all flex items-center justify-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Отклонить
                    </button>
                  </>
                )}
                <button onClick={onClose} className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all">
                  Закрыть
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// PROGRESS MODAL
// ============================================================

interface ProgressModalProps {
  project: Production360 | null;
  isOpen: boolean;
  onClose: () => void;
}

function ProgressModal({ project, isOpen, onClose }: ProgressModalProps) {
  const [stage, setStage] = useState<string>(project?.progress?.currentStage || 'concept');
  const [percentage, setPercentage] = useState<number>(project?.progress?.completedPercentage || 0);
  const [estimatedCompletion, setEstimatedCompletion] = useState<string>(
    project?.progress?.estimatedCompletion ? new Date(project.progress.estimatedCompletion).toISOString().split('T')[0] : ''
  );

  if (!project) return null;

  const stages = [
    { value: 'concept', label: '📝 Концепция', color: 'from-purple-500 to-pink-500' },
    { value: 'recording', label: '🎙️ Запись', color: 'from-red-500 to-orange-500' },
    { value: 'mixing', label: '🎚️ Сведение', color: 'from-orange-500 to-yellow-500' },
    { value: 'video', label: '🎬 Видео', color: 'from-yellow-500 to-green-500' },
    { value: 'distribution', label: '📦 Дистрибуция', color: 'from-green-500 to-cyan-500' },
    { value: 'promotion', label: '📢 Промо', color: 'from-cyan-500 to-blue-500' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50"
          >
            <div className="h-full md:h-auto backdrop-blur-2xl bg-gradient-to-br from-gray-900/95 to-black/95 rounded-2xl border border-white/10 shadow-2xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Управление прогрессом</h2>
                  <p className="text-sm text-gray-400">{project.projectName}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto">
                {/* Current Stage */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3">Текущий этап</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {stages.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setStage(s.value)}
                        className={`p-3 rounded-lg border transition-all ${
                          stage === s.value
                            ? `bg-gradient-to-r ${s.color} border-white/20 text-white`
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-sm font-medium">{s.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress Percentage */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3">Процент выполнения: {percentage}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={percentage}
                    onChange={(e) => setPercentage(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(6, 182, 212) ${percentage}%, rgba(255,255,255,0.1) ${percentage}%, rgba(255,255,255,0.1) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Estimated Completion */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Ожидаемая дата завершения</label>
                  <input
                    type="date"
                    value={estimatedCompletion}
                    onChange={(e) => setEstimatedCompletion(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                {/* Preview */}
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <h3 className="text-sm font-semibold text-white mb-3">Предпросмотр</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-400">{stages.find(s => s.value === stage)?.label}</span>
                      <span className="text-sm font-bold text-blue-400">{percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    {estimatedCompletion && (
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Завершение: {new Date(estimatedCompletion).toLocaleDateString('ru-RU')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 flex gap-3">
                <button className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium transition-all">
                  Сохранить изменения
                </button>
                <button onClick={onClose} className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all">
                  Отмена
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// ESTIMATE MODAL
// ============================================================

interface EstimateModalProps {
  project: Production360 | null;
  isOpen: boolean;
  onClose: () => void;
}

function EstimateModal({ project, isOpen, onClose }: EstimateModalProps) {
  const [estimate, setEstimate] = useState<string>(project?.estimatedFullPrice?.toString() || '');
  const [notes, setNotes] = useState<string>('');

  if (!project) return null;

  const calculateBreakdown = () => {
    const total = Number(estimate) || 0;
    return {
      concept: Math.round(total * 0.1),
      recording: Math.round(total * 0.25),
      mixing: Math.round(total * 0.2),
      video: Math.round(total * 0.25),
      distribution: Math.round(total * 0.1),
      promotion: Math.round(total * 0.1),
    };
  };

  const breakdown = calculateBreakdown();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50"
          >
            <div className="h-full md:h-auto backdrop-blur-2xl bg-gradient-to-br from-gray-900/95 to-black/95 rounded-2xl border border-white/10 shadow-2xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Оценка стоимости полного цикла</h2>
                  <p className="text-sm text-gray-400">{project.projectName}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto">
                {/* Total Estimate */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Общая стоимость (₽)</label>
                  <input
                    type="number"
                    value={estimate}
                    onChange={(e) => setEstimate(e.target.value)}
                    placeholder="Введите оценочную стоимость..."
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                {/* Breakdown */}
                {estimate && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <h3 className="text-sm font-semibold text-white mb-3">Примерное распределение по этапам:</h3>
                    <div className="space-y-2">
                      {[
                        { label: '📝 Концепция и разработка', value: breakdown.concept, percent: 10 },
                        { label: '🎙️ Запись и производство', value: breakdown.recording, percent: 25 },
                        { label: '🎚️ Сведение и мастеринг', value: breakdown.mixing, percent: 20 },
                        { label: '🎬 Видеоконтент', value: breakdown.video, percent: 25 },
                        { label: '📦 Дистрибуция', value: breakdown.distribution, percent: 10 },
                        { label: '📢 Продвижение', value: breakdown.promotion, percent: 10 },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                          <span className="text-sm text-gray-300">{item.label}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">{item.percent}%</span>
                            <span className="text-sm font-semibold text-blue-400">₽{item.value.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Заметки и комментарии</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Добавьте детали оценки, условия, сроки..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                {/* Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="text-xs text-gray-400 mb-1">Консультация (оплачено)</div>
                    <div className="text-xl font-bold text-green-400">₽{project.finalPrice.toLocaleString()}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="text-xs text-gray-400 mb-1">Полный цикл (оценка)</div>
                    <div className="text-xl font-bold text-blue-400">
                      {estimate ? `₽${Number(estimate).toLocaleString()}` : 'Не указано'}
                    </div>
                  </div>
                </div>

                {estimate && (
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-400">Множитель ROI:</span>
                      <span className="text-2xl font-bold text-purple-400">
                        {((Number(estimate) / project.finalPrice) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-xs text-purple-400/70 mt-1">
                      Полный цикл в {(Number(estimate) / project.finalPrice).toFixed(1)}x дороже консультации
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 flex gap-3">
                <button className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium transition-all flex items-center justify-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Сохранить оценку
                </button>
                <button onClick={onClose} className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all">
                  Отмена
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
