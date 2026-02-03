/**
 * PROMO LAB MODERATION - Модерация заявок на Promo.Lab
 * Собственный лейбл платформы PROMO.FM
 * Adaptive: 320px → 4K
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Award, Search, ExternalLink } from 'lucide-react';
import { useData, type PromoLab } from '@/contexts/DataContext';

type FilterStatus = 'all' | 'pending_review' | 'approved' | 'rejected' | 'in_progress' | 'completed';

export function PromoLabModeration() {
  const { promoLab: allPromoLab = [] } = useData();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering
  let filtered = allPromoLab;
  if (filterStatus !== 'all') filtered = filtered.filter(p => p.status === filterStatus);
  if (searchQuery) filtered = filtered.filter(p => 
    p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const stats = {
    total: allPromoLab.length,
    pending: allPromoLab.filter(p => p.status === 'pending_review').length,
    approved: allPromoLab.filter(p => p.status === 'approved').length,
    inProgress: allPromoLab.filter(p => p.status === 'in_progress').length,
    completed: allPromoLab.filter(p => p.status === 'completed').length,
    rejected: allPromoLab.filter(p => p.status === 'rejected').length,
  };

  const statusBadge = (status: string) => {
    const config = {
      pending_review: { label: 'На модерации', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      approved: { label: 'Одобрено', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
      rejected: { label: 'Отклонено', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
      in_progress: { label: 'В работе', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      completed: { label: 'Завершено', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    };
    const c = config[status as keyof typeof config] || config.pending_review;
    return <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${c.color}`}>{c.label}</span>;
  };

  return (
    <div className="space-y-3 md:space-y-6">
      {/* HEADER */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 mb-3">
          <Award className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-semibold text-purple-300">PROMO.LAB</span>
        </div>
        <p className="text-xs md:text-sm text-gray-400">Собственный лейбл платформы для эксклюзивного сотрудничества • <strong className="text-green-400">БЕСПЛАТНО</strong></p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 md:gap-4">
        {[
          { label: 'Всего', value: stats.total, color: 'bg-white/5' },
          { label: 'Ожидают', value: stats.pending, color: 'bg-yellow-500/10 border-yellow-500/20' },
          { label: 'Одобрено', value: stats.approved, color: 'bg-green-500/10 border-green-500/20' },
          { label: 'В работе', value: stats.inProgress, color: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Завершено', value: stats.completed, color: 'bg-purple-500/10 border-purple-500/20' },
          { label: 'Отклонено', value: stats.rejected, color: 'bg-red-500/10 border-red-500/20' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`backdrop-blur-xl rounded-lg md:rounded-xl border border-white/10 p-3 md:p-4 ${stat.color}`}>
            <div className="text-xs md:text-sm text-gray-400 mb-1">{stat.label}</div>
            <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* SEARCH & FILTER */}
      <div className="backdrop-blur-xl bg-white/5 rounded-lg md:rounded-xl border border-white/10 p-3 md:p-4">
        <div className="flex flex-col md:flex-row gap-2 md:gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Поиск по проекту, артисту, жанру..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as FilterStatus)}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50">
            <option value="all">Все статусы</option>
            <option value="pending_review">На модерации</option>
            <option value="approved">Одобрено</option>
            <option value="in_progress">В работе</option>
            <option value="completed">Завершено</option>
            <option value="rejected">Отклонено</option>
          </select>
        </div>
      </div>

      {/* PROJECTS LIST */}
      {filtered.length === 0 ? (
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-12 text-center">
          <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Заявки не найдены</h3>
          <p className="text-gray-400">Измените параметры поиска</p>
        </div>
      ) : (
        <div className="grid gap-3 md:gap-4 grid-cols-1">
          {filtered.map((project, i) => (
            <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="backdrop-blur-xl bg-white/5 rounded-lg md:rounded-xl border border-white/10 p-3 md:p-4 hover:bg-white/10 transition-all">
              
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-base font-semibold text-white mb-1">{project.projectName}</h3>
                  <p className="text-xs md:text-sm text-gray-400">{project.artist} • {project.genre}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs">🎯 БЕСПЛАТНО</span>
                  </div>
                </div>
                {statusBadge(project.status)}
              </div>

              {/* Description */}
              <p className="text-xs md:text-sm text-gray-400 mb-3 line-clamp-2">{project.projectDescription}</p>

              {/* Motivation */}
              <div className="mb-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="text-xs text-blue-400 font-medium mb-1">💬 Мотивация:</div>
                <p className="text-xs text-gray-300 line-clamp-2">{project.motivation}</p>
              </div>

              {/* Experience & Achievements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                <div className="p-2 rounded-lg bg-white/5">
                  <div className="text-xs text-gray-400 mb-1">Опыт</div>
                  <p className="text-xs text-white line-clamp-2">{project.experience}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <div className="text-xs text-gray-400 mb-1">Достижения</div>
                  <p className="text-xs text-white line-clamp-2">{project.achievements[0] || 'Не указано'}</p>
                </div>
              </div>

              {/* Portfolio Links */}
              {(project.portfolio.spotifyLink || project.portfolio.soundcloudLink || project.portfolio.youtubeLink) && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.portfolio.spotifyLink && (
                    <a href={project.portfolio.spotifyLink} target="_blank" rel="noopener noreferrer" 
                      className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs flex items-center gap-1 hover:bg-green-500/30 transition-colors">
                      Spotify <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {project.portfolio.soundcloudLink && (
                    <a href={project.portfolio.soundcloudLink} target="_blank" rel="noopener noreferrer"
                      className="px-2 py-1 rounded bg-orange-500/20 text-orange-400 text-xs flex items-center gap-1 hover:bg-orange-500/30 transition-colors">
                      SoundCloud <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {project.portfolio.youtubeLink && (
                    <a href={project.portfolio.youtubeLink} target="_blank" rel="noopener noreferrer"
                      className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs flex items-center gap-1 hover:bg-red-500/30 transition-colors">
                      YouTube <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Progress */}
              {project.status === 'in_progress' && project.progress && (
                <div className="mb-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-blue-400 font-medium">{project.progress.description}</span>
                    <span className="text-xs text-blue-400 font-bold">{project.progress.completedPercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${project.progress.completedPercentage}%` }} />
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {project.status === 'rejected' && project.rejectionReason && (
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400"><strong>Причина:</strong> {project.rejectionReason}</p>
                </div>
              )}

              {/* Expected Support */}
              <details className="text-xs text-gray-400">
                <summary className="cursor-pointer hover:text-white transition-colors font-medium">Подробнее</summary>
                <div className="mt-2 space-y-1">
                  <p><strong>Цели:</strong> {project.goals}</p>
                  <p><strong>Ожидает от лейбла:</strong></p>
                  <ul className="list-disc list-inside pl-2">
                    {project.expectedSupport.map((support, i) => (
                      <li key={i}>{support}</li>
                    ))}
                  </ul>
                </div>
              </details>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
