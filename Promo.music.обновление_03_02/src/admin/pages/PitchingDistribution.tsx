/**
 * PITCHING DISTRIBUTION - Управление рассылками контента
 * Центр дистрибуции одобренного контента по радио, заведениям, СМИ и лейблам
 * Adaptive: 320px → 4K
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Send, Eye, BarChart3, Radio, Building2, Newspaper,
  Briefcase, X, FileAudio, FileVideo, FileText, Calendar,
  CheckCircle, Clock, TrendingUp, Users, Download, Mail,
  Filter, Archive, RefreshCw, AlertCircle, CheckSquare, ExternalLink,
  Play, Pause, Volume2, FileDown
} from 'lucide-react';
import {
  useData,
  type PitchingItem,
  type PitchingItemStatus,
  type PitchingDirection,
  type DistributionBase,
  type PitchingFile,
  type PitchingDistribution
} from '@/contexts/DataContext';
import { MaterialDetailsModal } from '@/admin/components/MaterialDetailsModal';

type FilterStatus = 'all' | 'new' | 'in_progress' | 'distributed' | 'archived';

export function PitchingDistribution() {
  const { pitchingItems: allItems = [], distributionBases = [], updatePitchingItem } = useData();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<PitchingItem | null>(null);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filtering
  const filtered = useMemo(() => {
    let result = allItems;
    
    if (filterStatus !== 'all') {
      result = result.filter(item => item.status === filterStatus);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.artist.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [allItems, filterStatus, searchQuery]);

  // Stats
  const stats = useMemo(() => ({
    total: allItems.length,
    new: allItems.filter(i => i.status === 'new').length,
    inProgress: allItems.filter(i => i.status === 'in_progress').length,
    distributed: allItems.filter(i => i.status === 'distributed').length,
    archived: allItems.filter(i => i.status === 'archived').length,
    totalSent: allItems.reduce((sum, i) => sum + i.totalSent, 0),
    totalRecipients: allItems.reduce((sum, i) => 
      sum + i.distributions.reduce((s, d) => s + d.recipientsCount, 0), 0
    ),
  }), [allItems]);

  const openDistributeModal = (item: PitchingItem) => {
    setSelectedItem(item);
    setShowDistributeModal(true);
  };

  const openReportModal = (item: PitchingItem) => {
    setSelectedItem(item);
    setShowReportModal(true);
  };

  const openDetailsModal = (item: PitchingItem) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'track': return FileAudio;
      case 'video': return FileVideo;
      case 'press_release': return FileText;
      case 'concert': return Calendar;
      default: return FileAudio;
    }
  };

  const getStatusBadge = (status: PitchingItemStatus) => {
    const config = {
      new: { label: 'Новое', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: AlertCircle },
      in_progress: { label: 'В работе', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: RefreshCw },
      distributed: { label: 'Разослано', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: CheckCircle },
      archived: { label: 'Архив', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: Archive },
    };
    const c = config[status];
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${c.color}`}>
        <Icon className="w-3 h-3" />
        {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-3 md:space-y-6">
      {/* TEST FEEDBACK PORTAL BUTTON */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <ExternalLink className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Портал обратной связи</h3>
            </div>
            <p className="text-xs text-gray-400">
              Тестирование системы получения отзывов от получателей рассылок
            </p>
          </div>
          <a
            href={`/feedback/${btoa(JSON.stringify({distributionId:'dist_1',recipientId:'rec_radio_1',timestamp:Date.now()}))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <ExternalLink className="w-4 h-4" />
            Открыть демо
          </a>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-2 md:gap-3">
        {[
          { label: 'Всего', value: stats.total, icon: FileAudio, color: 'bg-white/5' },
          { label: 'Новое', value: stats.new, icon: AlertCircle, color: 'bg-green-500/10 border-green-500/20' },
          { label: 'В работе', value: stats.inProgress, icon: RefreshCw, color: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Разослано', value: stats.distributed, icon: CheckCircle, color: 'bg-purple-500/10 border-purple-500/20' },
          { label: 'Архив', value: stats.archived, icon: Archive, color: 'bg-gray-500/10 border-gray-500/20' },
          { label: 'Рассылок', value: stats.totalSent, icon: Send, color: 'bg-cyan-500/10 border-cyan-500/20' },
          { label: 'Получателей', value: stats.totalRecipients, icon: Users, color: 'bg-orange-500/10 border-orange-500/20' },
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

      {/* SEARCH & FILTERS */}
      <div className="backdrop-blur-xl bg-white/5 rounded-lg md:rounded-xl border border-white/10 p-3 md:p-4">
        <div className="flex flex-col md:flex-row gap-2 md:gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по артисту или треку..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {[
              { value: 'all', label: `Все (${stats.total})`, icon: Filter },
              { value: 'new', label: `Новое (${stats.new})`, icon: AlertCircle },
              { value: 'in_progress', label: `В работе (${stats.inProgress})`, icon: RefreshCw },
              { value: 'distributed', label: `Разослано (${stats.distributed})`, icon: CheckCircle },
              { value: 'archived', label: `Архив (${stats.archived})`, icon: Archive },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setFilterStatus(value as FilterStatus)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  filterStatus === value
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT LIST */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-12 text-center"
        >
          <FileAudio className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Материалы не найдены</h3>
          <p className="text-gray-400">Измените параметры поиска или фильтры</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {/* Table Header (Desktop only) */}
          <div className="hidden lg:grid grid-cols-[auto,1fr,120px,120px,120px,200px] gap-4 px-4 text-xs font-medium text-gray-500 uppercase">
            <div className="w-12">Тип</div>
            <div>Материал</div>
            <div>Дата</div>
            <div>Статус</div>
            <div className="text-center">Рассылок</div>
            <div className="text-right">Действие</div>
          </div>

          {/* Table Rows */}
          {filtered.map((item, i) => (
            <PitchingItemRow
              key={item.id}
              item={item}
              index={i}
              getContentIcon={getContentIcon}
              getStatusBadge={getStatusBadge}
              onDistribute={() => openDistributeModal(item)}
              onViewReport={() => openReportModal(item)}
              onViewDetails={() => openDetailsModal(item)}
            />
          ))}
        </div>
      )}

      {/* MODALS */}
      <DistributeModal
        item={selectedItem}
        isOpen={showDistributeModal}
        onClose={() => setShowDistributeModal(false)}
        distributionBases={distributionBases}
        updatePitchingItem={updatePitchingItem}
      />

      <ReportModal
        item={selectedItem}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

      <MaterialDetailsModal
        item={selectedItem}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onDistribute={() => {
          setShowDetailsModal(false);
          if (selectedItem) openDistributeModal(selectedItem);
        }}
      />
    </div>
  );
}

// ============================================================
// PITCHING ITEM ROW
// ============================================================

interface PitchingItemRowProps {
  item: PitchingItem;
  index: number;
  getContentIcon: (type: string) => any;
  getStatusBadge: (status: PitchingItemStatus) => JSX.Element;
  onDistribute: () => void;
  onViewReport: () => void;
  onViewDetails: () => void;
}

function PitchingItemRow({ item, index, getContentIcon, getStatusBadge, onDistribute, onViewReport, onViewDetails }: PitchingItemRowProps) {
  const Icon = getContentIcon(item.contentType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="backdrop-blur-xl bg-white/5 rounded-lg md:rounded-xl border border-white/10 hover:bg-white/10 transition-all"
    >
      {/* Mobile Layout */}
      <div className="lg:hidden p-3 md:p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                <p className="text-xs text-gray-400">{item.artist}</p>
              </div>
              {getStatusBadge(item.status)}
            </div>
            {item.genre && <p className="text-xs text-gray-500">{item.genre}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{new Date(item.addedToPitchingDate).toLocaleDateString('ru-RU')}</span>
          <span className="flex items-center gap-1">
            <Send className="w-3 h-3" />
            {item.totalSent} рассылок
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onViewDetails}
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            Просмотр
          </button>
          {item.status === 'new' && (
            <button
              onClick={onDistribute}
              className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Создать рассылку
            </button>
          )}
          {item.status === 'in_progress' && (
            <button
              onClick={onDistribute}
              className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 text-purple-400 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Отправить еще
            </button>
          )}
          {item.status === 'distributed' && (
            <button
              onClick={onViewReport}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Посмотреть отчёт
            </button>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid grid-cols-[auto,1fr,120px,120px,120px,200px] gap-4 items-center p-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-400" />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white truncate mb-1">{item.title}</h3>
          <p className="text-xs text-gray-400">{item.artist} {item.genre && `• ${item.genre}`}</p>
        </div>

        <div className="text-sm text-gray-400">
          {new Date(item.addedToPitchingDate).toLocaleDateString('ru-RU')}
        </div>

        <div>
          {getStatusBadge(item.status)}
        </div>

        <div className="text-center">
          <div className="text-lg font-bold text-white">{item.totalSent}</div>
          <div className="text-xs text-gray-500">рассылок</div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onViewDetails}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-all flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            Просмотр
          </button>
          {item.status === 'new' && (
            <button
              onClick={onDistribute}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-medium transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Создать рассылку
            </button>
          )}
          {item.status === 'in_progress' && (
            <button
              onClick={onDistribute}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 text-purple-400 text-sm font-medium transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Отправить еще
            </button>
          )}
          {item.status === 'distributed' && (
            <button
              onClick={onViewReport}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-sm font-medium transition-all flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Посмотреть отчёт
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// DISTRIBUTE MODAL
// ============================================================

interface DistributeModalProps {
  item: PitchingItem | null;
  isOpen: boolean;
  onClose: () => void;
  distributionBases: DistributionBase[];
  updatePitchingItem: (id: number, updates: any) => void;
}

function DistributeModal({ item, isOpen, onClose, distributionBases, updatePitchingItem }: DistributeModalProps) {
  const [direction, setDirection] = useState<PitchingDirection | ''>('');
  const [baseId, setBaseId] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [comment, setComment] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!item) return null;

  // Reset state when modal opens
  const handleOpen = () => {
    setDirection('');
    setBaseId('');
    setSelectedFiles(new Set(item.files.slice(0, 2).map(f => f.id))); // Auto-select first 2 files
    setComment('');
    setIsSending(false);
  };

  // Filter bases by direction
  const availableBases = direction
    ? distributionBases.filter(b => b.direction === direction)
    : [];

  const selectedBase = availableBases.find(b => b.id === baseId);

  const toggleFile = (fileId: string) => {
    const newSet = new Set(selectedFiles);
    if (newSet.has(fileId)) {
      newSet.delete(fileId);
    } else {
      newSet.add(fileId);
    }
    setSelectedFiles(newSet);
  };

  const handleSend = async () => {
    if (!direction || !baseId || selectedFiles.size === 0) return;

    setIsSending(true);

    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newDistribution: PitchingDistribution = {
      id: `dist_${Date.now()}`,
      direction,
      baseId,
      baseName: selectedBase?.name || '',
      filesCount: selectedFiles.size,
      sentDate: new Date().toISOString(),
      comment: comment || undefined,
      recipientsCount: selectedBase?.contactsCount || 0,
      openRate: Math.floor(Math.random() * 30) + 60, // 60-90%
      clickRate: Math.floor(Math.random() * 30) + 40, // 40-70%
    };

    // Update item
    updatePitchingItem(item.id, {
      distributions: [...item.distributions, newDistribution],
      totalSent: item.totalSent + 1,
      lastDistributionDate: newDistribution.sentDate,
      status: item.status === 'new' ? 'in_progress' : item.status,
    });

    setIsSending(false);
    onClose();
  };

  const getDirectionIcon = (dir: PitchingDirection) => {
    switch (dir) {
      case 'radio': return Radio;
      case 'venue': return Building2;
      case 'media': return Newspaper;
      case 'label': return Briefcase;
    }
  };

  const getDirectionLabel = (dir: PitchingDirection) => {
    switch (dir) {
      case 'radio': return 'Отправить на радио';
      case 'venue': return 'Отправить в заведение';
      case 'media': return 'Отправить в СМИ';
      case 'label': return 'Отправить лейблам/продюсерам';
    }
  };

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
            onAnimationComplete={() => isOpen && handleOpen()}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl max-h-[90vh] z-50"
          >
            <div className="h-full md:h-auto backdrop-blur-2xl bg-gradient-to-br from-gray-900/95 to-black/95 rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-start justify-between p-4 md:p-6 border-b border-white/10">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Создать рассылку</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="font-medium text-white">{item.artist}</span>
                    <span>•</span>
                    <span>{item.title}</span>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {/* Step 1: Direction */}
                <section>
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">1</span>
                    КУДА ОТПРАВИТЬ?
                  </h3>
                  <div className="text-xs text-gray-400 mb-3">Выберите направление</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {(['radio', 'venue', 'media', 'label'] as PitchingDirection[]).map(dir => {
                      const Icon = getDirectionIcon(dir);
                      const basesCount = distributionBases.filter(b => b.direction === dir).length;
                      return (
                        <button
                          key={dir}
                          onClick={() => {
                            setDirection(dir);
                            setBaseId(''); // Reset base when direction changes
                          }}
                          className={`p-4 rounded-xl border transition-all ${
                            direction === dir
                              ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/50'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${direction === dir ? 'text-blue-400' : 'text-gray-400'}`} />
                            <div className="flex-1 text-left">
                              <div className={`text-sm font-medium ${direction === dir ? 'text-white' : 'text-gray-300'}`}>
                                {getDirectionLabel(dir)}
                              </div>
                              <div className="text-xs text-gray-500">{basesCount} баз доступно</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Step 2: Base */}
                {direction && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">2</span>
                      ВЫБЕРИТЕ БАЗУ РАССЫЛКИ
                    </h3>
                    <div className="space-y-2">
                      {availableBases.map(base => (
                        <button
                          key={base.id}
                          onClick={() => setBaseId(base.id)}
                          className={`w-full p-4 rounded-xl border transition-all text-left ${
                            baseId === base.id
                              ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/50'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {base.icon && <span className="text-lg">{base.icon}</span>}
                                <span className={`text-sm font-medium ${baseId === base.id ? 'text-white' : 'text-gray-300'}`}>
                                  {base.name}
                                </span>
                              </div>
                              {base.description && (
                                <div className="text-xs text-gray-500">{base.description}</div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${baseId === base.id ? 'text-blue-400' : 'text-gray-400'}`}>
                                {base.contactsCount}
                              </div>
                              <div className="text-xs text-gray-500">контактов</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* Step 3: Files */}
                {baseId && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">3</span>
                      ЧТО ОТПРАВИТЬ?
                    </h3>
                    <div className="text-xs text-gray-400 mb-3">Выберите файлы для отправки</div>
                    <div className="space-y-2">
                      {item.files.map(file => (
                        <label
                          key={file.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedFiles.has(file.id)
                              ? 'bg-green-500/10 border-green-500/30'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedFiles.has(file.id)}
                            onChange={() => toggleFile(file.id)}
                            className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                          />
                          <CheckSquare className={`w-4 h-4 ${selectedFiles.has(file.id) ? 'text-green-400' : 'text-gray-500'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white truncate">{file.name}</div>
                            <div className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* Step 4: Comment */}
                {selectedFiles.size > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">4</span>
                      КОММЕНТАРИЙ (необязательно)
                    </h3>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Например: Плановая рассылка для партнеров, по запросу лейбла..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </motion.section>
                )}

                {/* Preview */}
                {baseId && selectedFiles.size > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
                  >
                    <h3 className="text-sm font-semibold text-blue-400 mb-3">📊 Предпросмотр рассылки</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Направление:</span>
                        <span className="text-white font-medium">{getDirectionLabel(direction!)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">База:</span>
                        <span className="text-white font-medium">{selectedBase?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Получателей:</span>
                        <span className="text-cyan-400 font-bold">{selectedBase?.contactsCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Файлов:</span>
                        <span className="text-cyan-400 font-bold">{selectedFiles.size}</span>
                      </div>
                    </div>
                  </motion.section>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 md:p-6 border-t border-white/10 flex gap-3">
                <button
                  onClick={handleSend}
                  disabled={!direction || !baseId || selectedFiles.size === 0 || isSending}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium transition-all flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Отправить рассылку
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
                >
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
// REPORT MODAL
// ============================================================

interface ReportModalProps {
  item: PitchingItem | null;
  isOpen: boolean;
  onClose: () => void;
}

function ReportModal({ item, isOpen, onClose }: ReportModalProps) {
  if (!item) return null;

  const totalRecipients = item.distributions.reduce((sum, d) => sum + d.recipientsCount, 0);
  const avgOpenRate = item.distributions.length > 0
    ? item.distributions.reduce((sum, d) => sum + (d.openRate || 0), 0) / item.distributions.length
    : 0;
  const avgClickRate = item.distributions.length > 0
    ? item.distributions.reduce((sum, d) => sum + (d.clickRate || 0), 0) / item.distributions.length
    : 0;

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
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl max-h-[90vh] z-50"
          >
            <div className="h-full md:h-auto backdrop-blur-2xl bg-gradient-to-br from-gray-900/95 to-black/95 rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-start justify-between p-4 md:p-6 border-b border-white/10">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Отчёт по рассылкам</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="font-medium text-white">{item.artist}</span>
                    <span>•</span>
                    <span>{item.title}</span>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {/* Overall Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Рассылок', value: item.totalSent, icon: Send, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Получателей', value: totalRecipients, icon: Users, color: 'from-purple-500 to-pink-500' },
                    { label: 'Open Rate', value: `${avgOpenRate.toFixed(0)}%`, icon: Mail, color: 'from-green-500 to-emerald-500' },
                    { label: 'Click Rate', value: `${avgClickRate.toFixed(0)}%`, icon: TrendingUp, color: 'from-orange-500 to-red-500' },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <div key={i} className={`p-4 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10 border border-white/10`}>
                        <Icon className="w-5 h-5 text-white mb-2" />
                        <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-xs text-gray-400">{stat.label}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Distribution History */}
                <section>
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    История рассылок
                  </h3>
                  <div className="space-y-3">
                    {item.distributions.map((dist, i) => (
                      <div key={dist.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white mb-1">{dist.baseName}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(dist.sentDate).toLocaleString('ru-RU')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-cyan-400">{dist.recipientsCount}</div>
                            <div className="text-xs text-gray-500">получателей</div>
                          </div>
                        </div>

                        {dist.comment && (
                          <div className="p-2 rounded-lg bg-white/5 mb-3">
                            <div className="text-xs text-gray-400 mb-1">Комментарий:</div>
                            <div className="text-xs text-gray-300">{dist.comment}</div>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-2 rounded-lg bg-blue-500/10">
                            <div className="text-xs text-gray-400 mb-1">Файлов</div>
                            <div className="text-sm font-bold text-blue-400">{dist.filesCount}</div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-green-500/10">
                            <div className="text-xs text-gray-400 mb-1">Open Rate</div>
                            <div className="text-sm font-bold text-green-400">{dist.openRate}%</div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-orange-500/10">
                            <div className="text-xs text-gray-400 mb-1">Click Rate</div>
                            <div className="text-sm font-bold text-orange-400">{dist.clickRate}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Files Info */}
                <section>
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Download className="w-4 h-4 text-cyan-400" />
                    Отправленные файлы
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {item.files.map(file => (
                      <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <FileAudio className="w-4 h-4 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white truncate">{file.name}</div>
                          <div className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="p-4 md:p-6 border-t border-white/10 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
                >
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