/**
 * PARTNERS MANAGEMENT - Управление партнерами
 * Категории: Радио, Заведения, СМИ, Стримы, Блогеры
 * Ручное и автоматическое добавление партнеров
 * Adaptive: 320px → 4K
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase, Plus, Search, Edit, Trash2, X, ExternalLink,
  CheckCircle, Star, Users, TrendingUp, Mail, Phone, Globe,
  Filter, Download, Eye, ArrowUpDown, ArrowUp, ArrowDown,
  Calendar, DollarSign, BarChart3, MessageSquare, Building2,
  Award, Clock, Activity, RefreshCw, Ban, MapPin, Radio,
  Coffee, Newspaper, Video, UserCheck, Upload, Save
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminChat } from '@/admin/components/AdminChat';
import { validateEmail, validatePhone, formatPhone } from '@/utils/validation';

interface Partner {
  id: number;
  name: string;
  category: 'radio' | 'venue' | 'media' | 'streams' | 'bloggers';
  logo: string;
  status: 'active' | 'inactive' | 'pending';
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  followers: number; // Аудитория/подписчики
  revenue: number;
  joinDate: string;
  description?: string;
  contactPerson?: string;
  commission: number;
  totalOrders: number;
  completedOrders: number;
  rating?: number;
  lastActivity: string;
  addedBy: 'admin' | 'self'; // Кем добавлен
  tags?: string[]; // Теги для поиска
}

type SortField = 'name' | 'joinDate' | 'followers' | 'revenue' | 'rating' | 'lastActivity';
type SortDirection = 'asc' | 'desc';
type FilterStatus = 'all' | 'active' | 'inactive' | 'pending';
type FilterCategory = 'all' | 'radio' | 'venue' | 'media' | 'streams' | 'bloggers';
type FilterAddedBy = 'all' | 'admin' | 'self';

export function PartnersManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [sortField, setSortField] = useState<SortField>('joinDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [filterAddedBy, setFilterAddedBy] = useState<FilterAddedBy>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [chatPartnerId, setChatPartnerId] = useState<string | undefined>();
  const [chatPartnerName, setChatPartnerName] = useState<string | undefined>();
  const [chatPartnerAvatar, setChatPartnerAvatar] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory | null>(null);
  const [selectedOverview, setSelectedOverview] = useState<'all' | 'active' | 'pending' | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'radio' as FilterCategory,
    email: '',
    phone: '',
    website: '',
    address: '',
    contactPerson: '',
    description: '',
    logo: '',
    commission: 15,
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [partners, setPartners] = useState<Partner[]>([
    {
      id: 1,
      name: 'Русское Радио',
      category: 'radio',
      logo: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200',
      status: 'active',
      email: 'promo@rusradio.ru',
      phone: '+7 (495) 777-7777',
      website: 'https://rusradio.ru',
      address: 'Москва, Россия',
      followers: 5200000,
      revenue: 3400000,
      joinDate: '2023-08-15',
      description: 'Крупнейшая радиостанция России с аудиторией более 5 млн слушателей.',
      contactPerson: 'Анна Смирнова',
      commission: 20,
      totalOrders: 842,
      completedOrders: 831,
      rating: 4.8,
      lastActivity: '2026-02-01',
      addedBy: 'admin',
      tags: ['музыка', 'радио', 'эфир', 'ротация'],
    },
    {
      id: 2,
      name: 'Propaganda Moscow',
      category: 'venue',
      logo: 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b0?w=200',
      status: 'active',
      email: 'booking@propagandamoscow.com',
      phone: '+7 (495) 624-5732',
      website: 'https://propagandamoscow.com',
      address: 'Москва, Большой Златоустинский пер., 7',
      followers: 450000,
      revenue: 2100000,
      joinDate: '2024-01-20',
      description: 'Легендарный клуб с многолетней историей и лучшими диджеями.',
      contactPerson: 'Дмитрий Волков',
      commission: 25,
      totalOrders: 234,
      completedOrders: 228,
      rating: 4.9,
      lastActivity: '2026-01-31',
      addedBy: 'self',
      tags: ['клуб', 'концерты', 'москва', 'букинг'],
    },
    {
      id: 3,
      name: 'The Village',
      category: 'media',
      logo: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=200',
      status: 'active',
      email: 'music@the-village.ru',
      phone: '+7 (495) 755-5555',
      website: 'https://the-village.ru',
      address: 'Москва, Россия',
      followers: 1800000,
      revenue: 1500000,
      joinDate: '2024-03-10',
      description: 'Городской интернет-журнал о культуре, музыке и событиях.',
      contactPerson: 'Мария Петрова',
      commission: 18,
      totalOrders: 156,
      completedOrders: 152,
      rating: 4.6,
      lastActivity: '2026-01-30',
      addedBy: 'admin',
      tags: ['медиа', 'статьи', 'интервью', 'обзоры'],
    },
    {
      id: 4,
      name: 'Boiler Room',
      category: 'streams',
      logo: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=200',
      status: 'active',
      email: 'artists@boilerroom.tv',
      phone: '+44 20 7183 4567',
      website: 'https://boilerroom.tv',
      address: 'Лондон, Великобритания',
      followers: 8500000,
      revenue: 4200000,
      joinDate: '2023-11-05',
      description: 'Легендарная платформа для стриминга музыкальных сетов со всего мира.',
      contactPerson: 'James Wilson',
      commission: 22,
      totalOrders: 487,
      completedOrders: 478,
      rating: 4.9,
      lastActivity: '2026-02-01',
      addedBy: 'self',
      tags: ['стримы', 'диджей сеты', 'трансляции', 'мировая сцена'],
    },
    {
      id: 5,
      name: 'Влад Топалов',
      category: 'bloggers',
      logo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      status: 'active',
      email: 'promo@topalov.ru',
      phone: '+7 (999) 123-4567',
      website: 'https://youtube.com/topalov',
      address: 'Москва, Россия',
      followers: 3200000,
      revenue: 2800000,
      joinDate: '2024-02-14',
      description: 'Популярный музыкальный блогер и артист с миллионной аудиторией.',
      contactPerson: 'Влад Топалов',
      commission: 30,
      totalOrders: 89,
      completedOrders: 87,
      rating: 4.7,
      lastActivity: '2026-01-29',
      addedBy: 'self',
      tags: ['youtube', 'блогер', 'музыка', 'обзоры'],
    },
    {
      id: 6,
      name: 'Европа Плюс',
      category: 'radio',
      logo: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=200',
      status: 'active',
      email: 'music@europaplus.ru',
      phone: '+7 (495) 721-7171',
      website: 'https://europaplus.ru',
      address: 'Москва, Россия',
      followers: 6800000,
      revenue: 4100000,
      joinDate: '2023-09-22',
      description: 'Одна из самых популярных радиостанций России.',
      contactPerson: 'Елена Соколова',
      commission: 20,
      totalOrders: 1124,
      completedOrders: 1098,
      rating: 4.8,
      lastActivity: '2026-02-01',
      addedBy: 'admin',
      tags: ['радио', 'хит-парады', 'эфир'],
    },
    {
      id: 7,
      name: 'Gazgolder Club',
      category: 'venue',
      logo: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=200',
      status: 'pending',
      email: 'booking@gazgolder.com',
      phone: '+7 (495) 540-5408',
      website: 'https://gazgolder.com',
      address: 'Москва, Болотная наб., 3с1',
      followers: 890000,
      revenue: 0,
      joinDate: '2026-01-15',
      description: 'Культовый клуб на Болотной набережной. Заявка на модерации.',
      contactPerson: 'Иван Петров',
      commission: 25,
      totalOrders: 0,
      completedOrders: 0,
      rating: 0,
      lastActivity: '2026-01-15',
      addedBy: 'self',
      tags: ['клуб', 'концерты', 'хип-хоп'],
    },
    {
      id: 8,
      name: 'Афиша Daily',
      category: 'media',
      logo: 'https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5?w=200',
      status: 'active',
      email: 'music@daily.afisha.ru',
      phone: '+7 (495) 640-8686',
      website: 'https://daily.afisha.ru',
      address: 'Москва, Россия',
      followers: 2400000,
      revenue: 1900000,
      joinDate: '2024-04-18',
      description: 'Культурный медиа-портал с качественным музыкальным контентом.',
      contactPerson: 'Ольга Новикова',
      commission: 18,
      totalOrders: 267,
      completedOrders: 261,
      rating: 4.7,
      lastActivity: '2026-01-31',
      addedBy: 'admin',
      tags: ['медиа', 'культура', 'музыка', 'события'],
    },
    {
      id: 9,
      name: 'Леша Свик',
      category: 'bloggers',
      logo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      status: 'active',
      email: 'promo@leshasvik.ru',
      website: 'https://instagram.com/leshasvik',
      address: 'Санкт-Петербург, Россия',
      followers: 2800000,
      revenue: 2300000,
      joinDate: '2024-05-22',
      description: 'Артист и блогер с миллионами подписчиков в соцсетях.',
      contactPerson: 'Леша Свик',
      commission: 28,
      totalOrders: 76,
      completedOrders: 74,
      rating: 4.8,
      lastActivity: '2026-01-28',
      addedBy: 'self',
      tags: ['блогер', 'артист', 'инстаграм'],
    },
    {
      id: 10,
      name: 'VK Live',
      category: 'streams',
      logo: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200',
      status: 'active',
      email: 'partners@vk.com',
      phone: '+7 (812) 640-4640',
      website: 'https://vk.com/live',
      address: 'Санкт-Петербург, Россия',
      followers: 12000000,
      revenue: 5600000,
      joinDate: '2023-10-10',
      description: 'Стриминговая платформа VK с огромной аудиторией.',
      contactPerson: 'Александр Иванов',
      commission: 20,
      totalOrders: 1543,
      completedOrders: 1521,
      rating: 4.6,
      lastActivity: '2026-02-01',
      addedBy: 'admin',
      tags: ['стримы', 'vk', 'трансляции', 'концерты'],
    },
  ]);

  // Handlers
  const handleDeletePartner = (partnerId: number) => {
    setPartners(partners.filter(p => p.id !== partnerId));
    toast.success('Партнер удален');
    setSelectedPartner(null);
  };

  const toggleStatus = (partnerId: number) => {
    const partner = partners.find(p => p.id === partnerId);
    if (!partner) return;

    let newStatus: 'active' | 'inactive' | 'pending';
    if (partner.status === 'active') newStatus = 'inactive';
    else if (partner.status === 'inactive') newStatus = 'pending';
    else newStatus = 'active';

    setPartners(partners.map(p =>
      p.id === partnerId ? { ...p, status: newStatus } : p
    ));
    toast.success('Статус партнера обновлен');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Название', 'Категория', 'Статус', 'Email', 'Аудитория', 'Выручка', 'Комиссия', 'Добавил', 'Дата'].join(','),
      ...filteredAndSortedPartners.map(p =>
        [p.id, p.name, p.category, p.status, p.email, p.followers, p.revenue, p.commission + '%', p.addedBy === 'admin' ? 'Админ' : 'Сам', p.joinDate].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `partners-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Данные экспортированы');
  };

  const viewPartnerDetails = (partner: Partner) => {
    setSelectedPartner(partner);
  };

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Название обязательно для заполнения';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email обязателен для заполнения';
    } else {
      const emailError = validateEmail(formData.email);
      if (emailError) errors.email = emailError;
    }

    // Phone validation
    if (formData.phone) {
      const phoneError = validatePhone(formData.phone);
      if (phoneError) errors.phone = phoneError;
    }

    // Category validation
    if (formData.category === 'all') {
      errors.category = 'Выберите категорию';
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    const newPartner: Partner = {
      id: Math.max(...partners.map(p => p.id)) + 1,
      name: formData.name,
      category: formData.category as any,
      logo: formData.logo || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200',
      status: 'active',
      email: formData.email,
      phone: formData.phone,
      website: formData.website,
      address: formData.address,
      followers: 0,
      revenue: 0,
      joinDate: new Date().toISOString().split('T')[0],
      description: formData.description,
      contactPerson: formData.contactPerson,
      commission: formData.commission,
      totalOrders: 0,
      completedOrders: 0,
      rating: 0,
      lastActivity: new Date().toISOString().split('T')[0],
      addedBy: 'admin',
      tags: [],
    };

    setPartners([newPartner, ...partners]);
    setIsAddingPartner(false);
    setFormData({
      name: '',
      category: 'radio',
      email: '',
      phone: '',
      website: '',
      address: '',
      contactPerson: '',
      description: '',
      logo: '',
      commission: 15,
    });
    setFormErrors({});
    toast.success(`Партнер "${formData.name}" успешно добавлен`);
  };

  // Filtering and Sorting
  const filteredAndSortedPartners = partners
    .filter(partner => {
      const matchesSearch =
        partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = filterStatus === 'all' || partner.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || partner.category === filterCategory;
      const matchesAddedBy = filterAddedBy === 'all' || partner.addedBy === filterAddedBy;

      return matchesSearch && matchesStatus && matchesCategory && matchesAddedBy;
    })
    .sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Statistics
  const stats = {
    total: partners.length,
    active: partners.filter(p => p.status === 'active').length,
    pending: partners.filter(p => p.status === 'pending').length,
    byCategory: {
      radio: partners.filter(p => p.category === 'radio').length,
      venue: partners.filter(p => p.category === 'venue').length,
      media: partners.filter(p => p.category === 'media').length,
      streams: partners.filter(p => p.category === 'streams').length,
      bloggers: partners.filter(p => p.category === 'bloggers').length,
    },
    totalFollowers: partners.reduce((sum, p) => sum + p.followers, 0),
    totalRevenue: partners.reduce((sum, p) => sum + p.revenue, 0),
    addedByAdmin: partners.filter(p => p.addedBy === 'admin').length,
    addedBySelf: partners.filter(p => p.addedBy === 'self').length,
  };

  const getCategoryConfig = (category: string) => {
    const configs: { [key: string]: { text: string; bg: string; border: string; icon: any; label: string } } = {
      'radio': { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-400/30', icon: Radio, label: 'Радио' },
      'venue': { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-400/30', icon: Coffee, label: 'Заведения' },
      'media': { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-400/30', icon: Newspaper, label: 'СМИ' },
      'streams': { text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-400/30', icon: Video, label: 'Стримы' },
      'bloggers': { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-400/30', icon: UserCheck, label: 'Блогеры' },
    };
    return configs[category] || { text: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-400/30', icon: Briefcase, label: category };
  };

  const statusColors = {
    active: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-400/30' },
    inactive: { text: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-400/30' },
    pending: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-400/30' },
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 opacity-40" />;
    return sortDirection === 'asc'
      ? <ArrowUp className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
      : <ArrowDown className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-cyan-400" />;
  };

  return (
    <div className="space-y-4 xs:space-y-5 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
            Управление партнерами
          </h1>
          <p className="text-xs xs:text-sm sm:text-base text-gray-400">
            Радио, заведения, СМИ, стримы и блогеры
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 sm:gap-2
              px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3
              rounded-lg xs:rounded-xl
              bg-gradient-to-r from-blue-500 to-cyan-500
              hover:from-blue-600 hover:to-cyan-600
              text-white font-medium
              text-xs xs:text-sm sm:text-base
              transition-all active:scale-95 shadow-lg"
          >
            <Download className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Экспорт</span>
          </button>
          <button
            onClick={() => setIsAddingPartner(true)}
            className="flex items-center gap-1.5 sm:gap-2
              px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3
              rounded-lg xs:rounded-xl
              bg-gradient-to-r from-purple-500 to-pink-500
              hover:from-purple-600 hover:to-pink-600
              text-white font-medium
              text-xs xs:text-sm sm:text-base
              transition-all active:scale-95 shadow-lg"
          >
            <Plus className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Добавить</span>
          </button>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-2 xs:gap-3 sm:gap-4">
        {[
          { label: 'Всего', value: stats.total, icon: Briefcase, color: 'from-blue-500 to-cyan-500', category: null, overview: 'all' as const },
          { label: 'Активных', value: stats.active, icon: CheckCircle, color: 'from-green-500 to-emerald-500', category: null, overview: 'active' as const },
          { label: 'На модерации', value: stats.pending, icon: Clock, color: 'from-orange-500 to-amber-500', category: null, overview: 'pending' as const },
          { label: 'Радио', value: stats.byCategory.radio, icon: Radio, color: 'from-purple-500 to-pink-500', category: 'radio' as const, overview: null },
          { label: 'Заведения', value: stats.byCategory.venue, icon: Coffee, color: 'from-blue-500 to-indigo-500', category: 'venue' as const, overview: null },
          { label: 'СМИ', value: stats.byCategory.media, icon: Newspaper, color: 'from-orange-500 to-red-500', category: 'media' as const, overview: null },
          { label: 'Стримы', value: stats.byCategory.streams, icon: Video, color: 'from-pink-500 to-rose-500', category: 'streams' as const, overview: null },
          { label: 'Блогеры', value: stats.byCategory.bloggers, icon: UserCheck, color: 'from-cyan-500 to-teal-500', category: 'bloggers' as const, overview: null },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => {
                if (stat.category) setSelectedCategory(stat.category);
                if (stat.overview) setSelectedOverview(stat.overview);
              }}
              className={`p-2.5 xs:p-3 sm:p-4 md:p-5
                rounded-lg xs:rounded-xl
                backdrop-blur-md bg-gradient-to-br ${stat.color} bg-opacity-10
                border border-white/10
                hover:bg-opacity-20 transition-all 
                cursor-pointer hover:scale-105 active:scale-95
                text-left`}
            >
              <Icon className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white mb-1 xs:mb-1.5 sm:mb-2" />
              <div className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-0.5">
                {stat.value}
              </div>
              <div className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm text-gray-400 truncate">
                {stat.label}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* SEARCH & FILTERS */}
      <div className="space-y-3 xs:space-y-4">
        <div className="flex flex-col sm:flex-row gap-2 xs:gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 xs:left-4 top-1/2 -translate-y-1/2
              w-4 h-4 xs:w-5 xs:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по названию, email, тегам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full
                pl-10 xs:pl-12 pr-3 xs:pr-4 py-2 xs:py-2.5 sm:py-3
                rounded-lg xs:rounded-xl
                backdrop-blur-md bg-white/5
                border border-white/10
                text-white placeholder-gray-400
                text-xs xs:text-sm sm:text-base
                focus:outline-none focus:border-blue-400/50 transition-colors"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2
              px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3
              rounded-lg xs:rounded-xl
              backdrop-blur-md border
              text-xs xs:text-sm sm:text-base
              transition-all
              ${showFilters
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-400'
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}
          >
            <Filter className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Фильтры</span>
          </button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 xs:p-4 sm:p-5
                rounded-lg xs:rounded-xl
                backdrop-blur-md bg-white/5 border border-white/10
                space-y-3 xs:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-1.5 xs:mb-2">
                      Категория
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 xs:gap-2">
                      {(['all', 'radio', 'venue', 'media', 'streams', 'bloggers'] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setFilterCategory(cat)}
                          className={`px-2 xs:px-3 py-1.5 xs:py-2 sm:py-2.5
                            rounded-lg
                            text-[10px] xs:text-xs sm:text-sm font-medium
                            transition-all
                            ${filterCategory === cat
                              ? 'bg-purple-500/20 border border-purple-400/50 text-purple-400'
                              : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                          {cat === 'all' ? 'Все' : getCategoryConfig(cat).label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-1.5 xs:mb-2">
                      Статус
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 xs:gap-2">
                      {(['all', 'active', 'inactive', 'pending'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-2 xs:px-3 py-1.5 xs:py-2 sm:py-2.5
                            rounded-lg
                            text-[10px] xs:text-xs sm:text-sm font-medium
                            transition-all
                            ${filterStatus === status
                              ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-400'
                              : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                          {status === 'all' ? 'Все' : status === 'active' ? 'Активные' : status === 'inactive' ? 'Неактивные' : 'Модерация'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Added By Filter */}
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-1.5 xs:mb-2">
                      Добавил
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 xs:gap-2">
                      {(['all', 'admin', 'self'] as const).map((source) => (
                        <button
                          key={source}
                          onClick={() => setFilterAddedBy(source)}
                          className={`px-2 xs:px-3 py-1.5 xs:py-2 sm:py-2.5
                            rounded-lg
                            text-[10px] xs:text-xs sm:text-sm font-medium
                            transition-all
                            ${filterAddedBy === source
                              ? 'bg-green-500/20 border border-green-400/50 text-green-400'
                              : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                          {source === 'all' ? 'Все' : source === 'admin' ? 'Админ' : 'Сам'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reset Filters */}
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterCategory('all');
                    setFilterAddedBy('all');
                    setSearchQuery('');
                    toast.success('Фильтры сброшены');
                  }}
                  className="w-full sm:w-auto
                    flex items-center justify-center gap-2
                    px-3 xs:px-4 py-2 xs:py-2.5
                    rounded-lg
                    bg-white/5 hover:bg-white/10
                    border border-white/10
                    text-xs xs:text-sm text-gray-400
                    transition-all"
                >
                  <RefreshCw className="w-3 h-3 xs:w-4 xs:h-4" />
                  Сбросить фильтры
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* PARTNERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
        {filteredAndSortedPartners.length === 0 ? (
          <div className="col-span-full p-8 sm:p-12 md:p-16 text-center">
            <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-gray-600 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-1 sm:mb-2">
              Партнеры не найдены
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-400">
              Попробуйте изменить параметры поиска или фильтры
            </p>
          </div>
        ) : (
          filteredAndSortedPartners.map((partner, index) => {
            const categoryConfig = getCategoryConfig(partner.category);
            const CategoryIcon = categoryConfig.icon;
            
            return (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="backdrop-blur-xl bg-white/5
                  rounded-lg xs:rounded-xl sm:rounded-2xl
                  border border-white/10
                  p-3 xs:p-4 sm:p-5 md:p-6
                  hover:border-cyan-500/30 transition-all group relative"
              >
                {/* Added By Badge */}
                <div className="absolute top-2 xs:top-3 right-2 xs:right-3">
                  <span className={`px-2 py-0.5 xs:px-2.5 xs:py-1
                    rounded-full
                    text-[9px] xs:text-[10px] font-medium
                    ${partner.addedBy === 'admin'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-400/30'
                      : 'bg-green-500/10 text-green-400 border border-green-400/30'
                    }`}
                  >
                    {partner.addedBy === 'admin' ? 'Админ' : 'Заявка'}
                  </span>
                </div>

                {/* Header */}
                <div className="flex items-start gap-2 xs:gap-3 mb-3 xs:mb-4 pr-16">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-lg xs:rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm xs:text-base sm:text-lg font-bold text-white mb-1 truncate">
                      {partner.name}
                    </h3>
                    <div className="flex items-center gap-1.5 xs:gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 xs:px-2.5 py-0.5 xs:py-1
                        rounded-full
                        text-[10px] xs:text-xs font-medium
                        border
                        ${categoryConfig.bg}
                        ${categoryConfig.border}
                        ${categoryConfig.text}`}
                      >
                        <CategoryIcon className="w-2.5 h-2.5 xs:w-3 xs:h-3" />
                        {categoryConfig.label}
                      </span>
                      <span className={`px-2 xs:px-2.5 py-0.5 xs:py-1
                        rounded-full
                        text-[10px] xs:text-xs font-medium
                        border
                        ${statusColors[partner.status].bg}
                        ${statusColors[partner.status].border}
                        ${statusColors[partner.status].text}`}
                      >
                        {partner.status === 'active' ? 'Активен' : partner.status === 'inactive' ? 'Неактивен' : 'Модерация'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {partner.description && (
                  <p className="text-[11px] xs:text-xs sm:text-sm text-gray-400 mb-3 xs:mb-4 line-clamp-2 leading-relaxed">
                    {partner.description}
                  </p>
                )}

                {/* Stats */}
                <div className="space-y-1.5 xs:space-y-2 mb-3 xs:mb-4">
                  <div className="flex items-center justify-between text-xs xs:text-sm">
                    <span className="text-gray-400">Аудитория:</span>
                    <span className="text-white font-semibold">
                      {partner.followers >= 1000000 
                        ? `${(partner.followers / 1000000).toFixed(1)}M` 
                        : `${(partner.followers / 1000).toFixed(0)}K`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs xs:text-sm">
                    <span className="text-gray-400">Выручка:</span>
                    <span className="text-green-400 font-semibold">
                      {partner.revenue >= 1000000
                        ? `${(partner.revenue / 1000000).toFixed(1)}M₽`
                        : `${(partner.revenue / 1000).toFixed(0)}K₽`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs xs:text-sm">
                    <span className="text-gray-400">Комиссия:</span>
                    <span className="text-cyan-400 font-semibold">{partner.commission}%</span>
                  </div>
                  {partner.rating && partner.rating > 0 && (
                    <div className="flex items-center justify-between text-xs xs:text-sm">
                      <span className="text-gray-400">Рейтинг:</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-white font-semibold">{partner.rating}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 xs:gap-2">
                  <button
                    onClick={() => viewPartnerDetails(partner)}
                    className="flex-1 px-3 xs:px-4 py-2 xs:py-2.5
                      rounded-lg xs:rounded-xl
                      bg-purple-500/20 hover:bg-purple-500/30
                      text-purple-400
                      transition-all
                      flex items-center justify-center gap-1.5 xs:gap-2
                      text-[10px] xs:text-xs sm:text-sm font-medium"
                  >
                    <Eye className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                    <span>Подробнее</span>
                  </button>
                  <button
                    onClick={() => handleDeletePartner(partner.id)}
                    className="p-2 xs:p-2.5
                      rounded-lg xs:rounded-xl
                      bg-red-500/20 hover:bg-red-500/30
                      text-red-400
                      transition-all"
                    title="Удалить"
                  >
                    <Trash2 className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ADD PARTNER MODAL */}
      <AnimatePresence>
        {isAddingPartner && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingPartner(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed
                inset-2 xs:inset-4 sm:inset-6 md:inset-8
                lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2
                lg:w-[90vw] lg:max-w-2xl
                max-h-[94vh] sm:max-h-[90vh]
                z-50"
            >
              <form onSubmit={handleAddPartner} className="h-full
                backdrop-blur-2xl bg-gradient-to-br from-gray-900/95 to-black/95
                rounded-xl sm:rounded-2xl
                border border-white/10 shadow-2xl
                flex flex-col overflow-hidden">

                {/* Modal Header */}
                <div className="flex items-center justify-between
                  p-4 xs:p-5 sm:p-6
                  border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 xs:p-3 rounded-lg xs:rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                      <Plus className="w-5 h-5 xs:w-6 xs:h-6 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-white">
                        Добавить партнера
                      </h2>
                      <p className="text-xs xs:text-sm text-gray-400">
                        Заполните информацию о новом партнере
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingPartner(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 xs:w-6 xs:h-6 text-gray-400" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto
                  p-4 xs:p-5 sm:p-6
                  space-y-3 xs:space-y-4">

                  {/* Name */}
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-1.5 xs:mb-2">
                      Название <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Название партнера"
                      className="w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3
                        rounded-lg xs:rounded-xl
                        bg-white/5 border border-white/10
                        text-white placeholder-gray-400
                        text-xs xs:text-sm sm:text-base
                        focus:outline-none focus:border-purple-400/50 transition-colors"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-1.5 xs:mb-2">
                      Категория <span className="text-red-400">*</span>
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3
                        rounded-lg xs:rounded-xl
                        bg-white/5 border border-white/10
                        text-white
                        text-xs xs:text-sm sm:text-base
                        focus:outline-none focus:border-purple-400/50 transition-colors"
                    >
                      <option value="radio">Радио</option>
                      <option value="venue">Заведения</option>
                      <option value="media">СМИ</option>
                      <option value="streams">Стримы</option>
                      <option value="bloggers">Блогеры</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                    {/* Email */}
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-1.5 xs:mb-2">
                        Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (formErrors.email) {
                            const newErrors = { ...formErrors };
                            delete newErrors.email;
                            setFormErrors(newErrors);
                          }
                        }}
                        placeholder="email@example.com"
                        className={`w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3
                          rounded-lg xs:rounded-xl
                          bg-white/5 border ${formErrors.email ? 'border-red-400/50' : 'border-white/10'}
                          text-white placeholder-gray-400
                          text-xs xs:text-sm sm:text-base
                          focus:outline-none ${formErrors.email ? 'focus:border-red-400' : 'focus:border-purple-400/50'} transition-colors`}
                      />
                      {formErrors.email && <p className="text-xs text-red-400 mt-1">{formErrors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-1.5 xs:mb-2">
                        Телефон
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: formatPhone(e.target.value) });
                          if (formErrors.phone) {
                            const newErrors = { ...formErrors };
                            delete newErrors.phone;
                            setFormErrors(newErrors);
                          }
                        }}
                        placeholder="+7 (999) 123-45-67"
                        className={`w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3
                          rounded-lg xs:rounded-xl
                          bg-white/5 border ${formErrors.phone ? 'border-red-400/50' : 'border-white/10'}
                          text-white placeholder-gray-400
                          text-xs xs:text-sm sm:text-base
                          focus:outline-none ${formErrors.phone ? 'focus:border-red-400' : 'focus:border-purple-400/50'} transition-colors`}
                      />
                      {formErrors.phone && <p className="text-xs text-red-400 mt-1">{formErrors.phone}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                    {/* Website */}
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-1.5 xs:mb-2">
                        Веб-сайт
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://example.com"
                        className="w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3
                          rounded-lg xs:rounded-xl
                          bg-white/5 border border-white/10
                          text-white placeholder-gray-400
                          text-xs xs:text-sm sm:text-base
                          focus:outline-none focus:border-purple-400/50 transition-colors"
                      />
                    </div>

                    {/* Contact Person */}
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-1.5 xs:mb-2">
                        Контактное лицо
                      </label>
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        placeholder="Иван Иванов"
                        className="w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3
                          rounded-lg xs:rounded-xl
                          bg-white/5 border border-white/10
                          text-white placeholder-gray-400
                          text-xs xs:text-sm sm:text-base
                          focus:outline-none focus:border-purple-400/50 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-1.5 xs:mb-2">
                      Адрес
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Город, страна"
                      className="w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3
                        rounded-lg xs:rounded-xl
                        bg-white/5 border border-white/10
                        text-white placeholder-gray-400
                        text-xs xs:text-sm sm:text-base
                        focus:outline-none focus:border-purple-400/50 transition-colors"
                    />
                  </div>

                  {/* Commission */}
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-1.5 xs:mb-2">
                      Комиссия (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.commission}
                      onChange={(e) => setFormData({ ...formData, commission: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3
                        rounded-lg xs:rounded-xl
                        bg-white/5 border border-white/10
                        text-white
                        text-xs xs:text-sm sm:text-base
                        focus:outline-none focus:border-purple-400/50 transition-colors"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-1.5 xs:mb-2">
                      Описание
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Краткое описание партнера..."
                      rows={3}
                      className="w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3
                        rounded-lg xs:rounded-xl
                        bg-white/5 border border-white/10
                        text-white placeholder-gray-400
                        text-xs xs:text-sm sm:text-base
                        focus:outline-none focus:border-purple-400/50 transition-colors
                        resize-none"
                    />
                  </div>

                  {/* Logo URL */}
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-1.5 xs:mb-2">
                      URL логотипа
                    </label>
                    <input
                      type="url"
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3
                        rounded-lg xs:rounded-xl
                        bg-white/5 border border-white/10
                        text-white placeholder-gray-400
                        text-xs xs:text-sm sm:text-base
                        focus:outline-none focus:border-purple-400/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 xs:p-5 sm:p-6
                  border-t border-white/10
                  grid grid-cols-2 gap-2 xs:gap-3
                  shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddingPartner(false)}
                    className="flex items-center justify-center gap-2
                      px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5
                      rounded-lg xs:rounded-xl
                      bg-white/10 hover:bg-white/20
                      text-white font-medium
                      text-xs xs:text-sm sm:text-base
                      transition-all active:scale-95"
                  >
                    <X className="w-4 h-4 xs:w-5 xs:h-5" />
                    <span>Отмена</span>
                  </button>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2
                      px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5
                      rounded-lg xs:rounded-xl
                      bg-gradient-to-r from-purple-500 to-pink-500
                      hover:from-purple-600 hover:to-pink-600
                      text-white font-medium
                      text-xs xs:text-sm sm:text-base
                      transition-all active:scale-95"
                  >
                    <Save className="w-4 h-4 xs:w-5 xs:h-5" />
                    <span>Сохранить</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PARTNER DETAILS MODAL */}
      <AnimatePresence>
        {selectedPartner && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPartner(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed
                inset-2 xs:inset-4 sm:inset-6 md:inset-8
                lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2
                lg:w-[90vw] lg:max-w-4xl
                max-h-[94vh] sm:max-h-[90vh]
                z-50"
            >
              <div className="h-full
                backdrop-blur-2xl bg-gradient-to-br from-gray-900/95 to-black/95
                rounded-xl sm:rounded-2xl
                border border-white/10 shadow-2xl
                flex flex-col overflow-hidden">

                {/* Modal Header */}
                <div className="flex items-center justify-between
                  p-4 xs:p-5 sm:p-6 md:p-7
                  border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-3 xs:gap-4 flex-1 min-w-0">
                    <img
                      src={selectedPartner.logo}
                      alt={selectedPartner.name}
                      className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 truncate">
                        {selectedPartner.name}
                      </h2>
                      <div className="flex items-center gap-2 flex-wrap">
                        {(() => {
                          const categoryConfig = getCategoryConfig(selectedPartner.category);
                          const CategoryIcon = categoryConfig.icon;
                          return (
                            <span className={`inline-flex items-center gap-1 px-2 xs:px-3 py-1 xs:py-1.5
                              rounded-lg
                              text-[10px] xs:text-xs font-medium
                              border
                              ${categoryConfig.bg}
                              ${categoryConfig.border}
                              ${categoryConfig.text}`}
                            >
                              <CategoryIcon className="w-3 h-3 xs:w-3.5 xs:h-3.5" />
                              {categoryConfig.label}
                            </span>
                          );
                        })()}
                        <span className={`px-2 xs:px-3 py-1 xs:py-1.5
                          rounded-lg
                          text-[10px] xs:text-xs font-medium
                          border
                          ${statusColors[selectedPartner.status].bg}
                          ${statusColors[selectedPartner.status].border}
                          ${statusColors[selectedPartner.status].text}`}
                        >
                          {selectedPartner.status === 'active' ? 'Активен' : selectedPartner.status === 'inactive' ? 'Неактивен' : 'Модерация'}
                        </span>
                        <span className={`px-2 xs:px-3 py-1 xs:py-1.5
                          rounded-lg
                          text-[10px] xs:text-xs font-medium
                          ${selectedPartner.addedBy === 'admin'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-400/30'
                            : 'bg-green-500/10 text-green-400 border border-green-400/30'
                          }`}
                        >
                          {selectedPartner.addedBy === 'admin' ? 'Добавлен админом' : 'Самостоятельная заявка'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPartner(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                  >
                    <X className="w-5 h-5 xs:w-6 xs:h-6 text-gray-400" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto
                  p-4 xs:p-5 sm:p-6 md:p-8
                  space-y-4 xs:space-y-5 sm:space-y-6">

                  {/* Description */}
                  {selectedPartner.description && (
                    <div className="p-3 xs:p-4 sm:p-5
                      rounded-lg xs:rounded-xl
                      bg-white/5 border border-white/10">
                      <p className="text-xs xs:text-sm sm:text-base text-gray-300 leading-relaxed">
                        {selectedPartner.description}
                      </p>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2 xs:space-y-3">
                    <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-white">
                      Контактная информация
                    </h3>
                    <div className="space-y-2 xs:space-y-3">
                      <div className="flex items-center gap-3 p-3 xs:p-4 rounded-lg xs:rounded-xl bg-white/5">
                        <Mail className="w-4 h-4 xs:w-5 xs:h-5 text-cyan-400 shrink-0" />
                        <span className="text-xs xs:text-sm sm:text-base text-white truncate">
                          {selectedPartner.email}
                        </span>
                      </div>
                      {selectedPartner.phone && (
                        <div className="flex items-center gap-3 p-3 xs:p-4 rounded-lg xs:rounded-xl bg-white/5">
                          <Phone className="w-4 h-4 xs:w-5 xs:h-5 text-cyan-400 shrink-0" />
                          <span className="text-xs xs:text-sm sm:text-base text-white">
                            {selectedPartner.phone}
                          </span>
                        </div>
                      )}
                      {selectedPartner.website && (
                        <a
                          href={selectedPartner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 xs:p-4 rounded-lg xs:rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                        >
                          <Globe className="w-4 h-4 xs:w-5 xs:h-5 text-cyan-400 shrink-0" />
                          <span className="text-xs xs:text-sm sm:text-base text-white truncate flex-1">
                            {selectedPartner.website}
                          </span>
                          <ExternalLink className="w-3 h-3 xs:w-4 xs:h-4 text-gray-400" />
                        </a>
                      )}
                      {selectedPartner.address && (
                        <div className="flex items-center gap-3 p-3 xs:p-4 rounded-lg xs:rounded-xl bg-white/5">
                          <MapPin className="w-4 h-4 xs:w-5 xs:h-5 text-cyan-400 shrink-0" />
                          <span className="text-xs xs:text-sm sm:text-base text-white">
                            {selectedPartner.address}
                          </span>
                        </div>
                      )}
                      {selectedPartner.contactPerson && (
                        <div className="flex items-center gap-3 p-3 xs:p-4 rounded-lg xs:rounded-xl bg-white/5">
                          <Users className="w-4 h-4 xs:w-5 xs:h-5 text-cyan-400 shrink-0" />
                          <span className="text-xs xs:text-sm sm:text-base text-white">
                            {selectedPartner.contactPerson}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div>
                    <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-white mb-3 xs:mb-4">
                      Статистика
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 xs:gap-4">
                      {[
                        { 
                          label: 'Аудитория', 
                          value: selectedPartner.followers >= 1000000 
                            ? `${(selectedPartner.followers / 1000000).toFixed(1)}M` 
                            : `${(selectedPartner.followers / 1000).toFixed(0)}K`,
                          icon: Users, 
                          color: 'from-purple-500 to-pink-500' 
                        },
                        { 
                          label: 'Выручка', 
                          value: selectedPartner.revenue >= 1000000
                            ? `${(selectedPartner.revenue / 1000000).toFixed(1)}M₽`
                            : `${(selectedPartner.revenue / 1000).toFixed(0)}K₽`,
                          icon: DollarSign, 
                          color: 'from-green-500 to-emerald-500' 
                        },
                        { label: 'Комиссия', value: `${selectedPartner.commission}%`, icon: TrendingUp, color: 'from-cyan-500 to-blue-500' },
                        { label: 'Всего заказов', value: selectedPartner.totalOrders, icon: BarChart3, color: 'from-blue-500 to-indigo-500' },
                        { label: 'Завершено', value: selectedPartner.completedOrders, icon: CheckCircle, color: 'from-green-500 to-teal-500' },
                        { label: 'Рейтинг', value: selectedPartner.rating || 'N/A', icon: Star, color: 'from-yellow-500 to-orange-500' },
                        { label: 'Дата вступления', value: new Date(selectedPartner.joinDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }), icon: Calendar, color: 'from-pink-500 to-rose-500' },
                        { label: 'Последняя активность', value: new Date(selectedPartner.lastActivity).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }), icon: Activity, color: 'from-indigo-500 to-purple-500' },
                      ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                          <div key={i} className={`p-3 xs:p-4 sm:p-5
                            rounded-lg xs:rounded-xl
                            bg-gradient-to-br ${stat.color} bg-opacity-10
                            border border-white/10`}
                          >
                            <Icon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white mb-1.5 xs:mb-2" />
                            <div className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-white mb-0.5 xs:mb-1">
                              {stat.value}
                            </div>
                            <div className="text-[10px] xs:text-xs sm:text-sm text-gray-400">
                              {stat.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 xs:p-5 sm:p-6
                  border-t border-white/10
                  grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3
                  shrink-0">
                  {selectedPartner.website && (
                    <a
                      href={selectedPartner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2
                        px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5
                        rounded-lg xs:rounded-xl
                        bg-gradient-to-r from-purple-500 to-pink-500
                        hover:from-purple-600 hover:to-pink-600
                        text-white font-medium
                        text-xs xs:text-sm sm:text-base
                        transition-all active:scale-95"
                    >
                      <Globe className="w-4 h-4 xs:w-5 xs:h-5" />
                      <span>Сайт</span>
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setChatPartnerId(selectedPartner.id.toString());
                      setChatPartnerName(selectedPartner.name);
                      setChatPartnerAvatar(selectedPartner.logo);
                      setSelectedPartner(null);
                      toast.success('Открываем чат с партнером');
                    }}
                    className="flex items-center justify-center gap-2
                      px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5
                      rounded-lg xs:rounded-xl
                      bg-gradient-to-r from-blue-500 to-cyan-500
                      hover:from-blue-600 hover:to-cyan-600
                      text-white font-medium
                      text-xs xs:text-sm sm:text-base
                      transition-all active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4 xs:w-5 xs:h-5" />
                    <span>Написать</span>
                  </button>
                  <button
                    onClick={() => toggleStatus(selectedPartner.id)}
                    className="flex items-center justify-center gap-2
                      px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5
                      rounded-lg xs:rounded-xl
                      bg-white/10 hover:bg-white/20
                      border border-white/10
                      text-white font-medium
                      text-xs xs:text-sm sm:text-base
                      transition-all active:scale-95"
                  >
                    <Activity className="w-4 h-4 xs:w-5 xs:h-5" />
                    <span>Изменить статус</span>
                  </button>
                  <button
                    onClick={() => setSelectedPartner(null)}
                    className="flex items-center justify-center gap-2
                      px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5
                      rounded-lg xs:rounded-xl
                      bg-white/10 hover:bg-white/20
                      text-white font-medium
                      text-xs xs:text-sm sm:text-base
                      transition-all active:scale-95"
                  >
                    <X className="w-4 h-4 xs:w-5 xs:h-5" />
                    <span>Закрыть</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* OVERVIEW DETAILS MODAL (Всего, Активные, На модерации) */}
      <AnimatePresence>
        {selectedOverview && (() => {
          const overviewPartners = selectedOverview === 'all' 
            ? partners 
            : partners.filter(p => p.status === selectedOverview);
          
          const overviewConfig = {
            all: { label: 'Все партнеры', icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
            active: { label: 'Активные партнеры', icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
            pending: { label: 'На модерации', icon: Clock, color: 'from-orange-500 to-amber-500' },
          }[selectedOverview];

          const OverviewIcon = overviewConfig.icon;

          return (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedOverview(null)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed
                  inset-2 xs:inset-4 sm:inset-6
                  lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2
                  lg:w-[95vw] lg:max-w-7xl
                  max-h-[94vh] sm:max-h-[92vh]
                  z-50"
              >
                <div className="h-full
                  backdrop-blur-2xl bg-gradient-to-br from-gray-900/95 to-black/95
                  rounded-xl sm:rounded-2xl
                  border border-white/10 shadow-2xl
                  flex flex-col overflow-hidden">

                  {/* Modal Header */}
                  <div className="flex items-center justify-between
                    p-4 xs:p-5 sm:p-6
                    border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3 xs:gap-4">
                      <div className={`p-3 xs:p-4 rounded-xl xs:rounded-2xl
                        bg-gradient-to-br ${overviewConfig.color} bg-opacity-10
                        border border-white/10`}
                      >
                        <OverviewIcon className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white mb-1">
                          {overviewConfig.label}
                        </h2>
                        <p className="text-xs xs:text-sm sm:text-base text-gray-400">
                          {overviewPartners.length} {overviewPartners.length === 1 ? 'партнер' : 'партнеров'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedOverview(null)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                    >
                      <X className="w-5 h-5 xs:w-6 xs:h-6 text-gray-400" />
                    </button>
                  </div>

                  {/* Stats Summary */}
                  <div className="p-4 xs:p-5 sm:p-6 border-b border-white/10 shrink-0">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 xs:gap-4">
                      {[
                        {
                          label: 'Всего партнеров',
                          value: overviewPartners.length,
                          icon: Briefcase,
                          color: 'from-blue-500 to-cyan-500'
                        },
                        {
                          label: 'Общая аудитория',
                          value: overviewPartners.reduce((sum, p) => sum + p.followers, 0) >= 1000000
                            ? `${(overviewPartners.reduce((sum, p) => sum + p.followers, 0) / 1000000).toFixed(1)}M`
                            : `${(overviewPartners.reduce((sum, p) => sum + p.followers, 0) / 1000).toFixed(0)}K`,
                          icon: Users,
                          color: 'from-purple-500 to-pink-500'
                        },
                        {
                          label: 'Общая выручка',
                          value: `${(overviewPartners.reduce((sum, p) => sum + p.revenue, 0) / 1000000).toFixed(1)}M₽`,
                          icon: DollarSign,
                          color: 'from-green-500 to-emerald-500'
                        },
                        {
                          label: 'Средний рейтинг',
                          value: overviewPartners.filter(p => p.rating).length > 0
                            ? (overviewPartners.reduce((sum, p) => sum + (p.rating || 0), 0) / overviewPartners.filter(p => p.rating).length).toFixed(1)
                            : 'N/A',
                          icon: Star,
                          color: 'from-yellow-500 to-orange-500'
                        },
                      ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                          <div key={i} className={`p-3 xs:p-4 sm:p-5
                            rounded-lg xs:rounded-xl
                            bg-gradient-to-br ${stat.color} bg-opacity-10
                            border border-white/10`}
                          >
                            <Icon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white mb-1.5 xs:mb-2" />
                            <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-white mb-0.5 xs:mb-1">
                              {stat.value}
                            </div>
                            <div className="text-[10px] xs:text-xs sm:text-sm text-gray-400">
                              {stat.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Partners List */}
                  <div className="flex-1 overflow-y-auto p-4 xs:p-5 sm:p-6">
                    {overviewPartners.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 xs:py-16 sm:py-20">
                        <OverviewIcon className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 text-gray-600 mb-4" />
                        <h3 className="text-base xs:text-lg sm:text-xl font-semibold text-white mb-2">
                          Партнеров не найдено
                        </h3>
                        <p className="text-xs xs:text-sm sm:text-base text-gray-400">
                          В разделе "{overviewConfig.label}" пока нет партнеров
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 xs:gap-4 sm:gap-5">
                        {overviewPartners.map((partner, index) => {
                          const categoryConfig = getCategoryConfig(partner.category);
                          const CategoryIcon = categoryConfig.icon;
                          
                          return (
                            <motion.div
                              key={partner.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className="backdrop-blur-xl bg-white/5
                                rounded-lg xs:rounded-xl
                                border border-white/10
                                p-3 xs:p-4 sm:p-5
                                hover:border-cyan-500/30 transition-all group relative"
                            >
                              {/* Added By Badge */}
                              <div className="absolute top-2 xs:top-3 right-2 xs:right-3">
                                <span className={`px-2 py-0.5 xs:px-2.5 xs:py-1
                                  rounded-full
                                  text-[9px] xs:text-[10px] font-medium
                                  ${partner.addedBy === 'admin'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-400/30'
                                    : 'bg-green-500/10 text-green-400 border border-green-400/30'
                                  }`}
                                >
                                  {partner.addedBy === 'admin' ? 'Админ' : 'Заявка'}
                                </span>
                              </div>

                              {/* Header */}
                              <div className="flex items-start gap-2 xs:gap-3 mb-3 xs:mb-4 pr-16">
                                <img
                                  src={partner.logo}
                                  alt={partner.name}
                                  className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-lg xs:rounded-xl object-cover shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-sm xs:text-base sm:text-lg font-bold text-white mb-1 truncate">
                                    {partner.name}
                                  </h3>
                                  <div className="flex items-center gap-1.5 xs:gap-2 flex-wrap">
                                    <span className={`inline-flex items-center gap-1 px-2 xs:px-2.5 py-0.5 xs:py-1
                                      rounded-full
                                      text-[10px] xs:text-xs font-medium
                                      border
                                      ${categoryConfig.bg}
                                      ${categoryConfig.border}
                                      ${categoryConfig.text}`}
                                    >
                                      <CategoryIcon className="w-2.5 h-2.5 xs:w-3 xs:h-3" />
                                      {categoryConfig.label}
                                    </span>
                                    <span className={`px-2 xs:px-2.5 py-0.5 xs:py-1
                                      rounded-full
                                      text-[10px] xs:text-xs font-medium
                                      border
                                      ${statusColors[partner.status].bg}
                                      ${statusColors[partner.status].border}
                                      ${statusColors[partner.status].text}`}
                                    >
                                      {partner.status === 'active' ? 'Активен' : partner.status === 'inactive' ? 'Неактивен' : 'Модерация'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Description */}
                              {partner.description && (
                                <p className="text-[11px] xs:text-xs sm:text-sm text-gray-400 mb-3 xs:mb-4 line-clamp-2 leading-relaxed">
                                  {partner.description}
                                </p>
                              )}

                              {/* Stats */}
                              <div className="space-y-1.5 xs:space-y-2 mb-3 xs:mb-4">
                                <div className="flex items-center justify-between text-xs xs:text-sm">
                                  <span className="text-gray-400">Аудитория:</span>
                                  <span className="text-white font-semibold">
                                    {partner.followers >= 1000000
                                      ? `${(partner.followers / 1000000).toFixed(1)}M`
                                      : `${(partner.followers / 1000).toFixed(0)}K`}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs xs:text-sm">
                                  <span className="text-gray-400">Выручка:</span>
                                  <span className="text-green-400 font-semibold">
                                    {partner.revenue >= 1000000
                                      ? `${(partner.revenue / 1000000).toFixed(1)}M₽`
                                      : `${(partner.revenue / 1000).toFixed(0)}K₽`}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs xs:text-sm">
                                  <span className="text-gray-400">Комиссия:</span>
                                  <span className="text-cyan-400 font-semibold">{partner.commission}%</span>
                                </div>
                                {partner.rating && partner.rating > 0 && (
                                  <div className="flex items-center justify-between text-xs xs:text-sm">
                                    <span className="text-gray-400">Рейтинг:</span>
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-yellow-400 fill-yellow-400" />
                                      <span className="text-white font-semibold">{partner.rating}</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex gap-1.5 xs:gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedOverview(null);
                                    viewPartnerDetails(partner);
                                  }}
                                  className="flex-1 px-3 xs:px-4 py-2 xs:py-2.5
                                    rounded-lg xs:rounded-xl
                                    bg-purple-500/20 hover:bg-purple-500/30
                                    text-purple-400
                                    transition-all
                                    flex items-center justify-center gap-1.5 xs:gap-2
                                    text-[10px] xs:text-xs sm:text-sm font-medium"
                                >
                                  <Eye className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                                  <span>Подробнее</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setChatPartnerId(partner.id.toString());
                                    setChatPartnerName(partner.name);
                                    setChatPartnerAvatar(partner.logo);
                                    setSelectedOverview(null);
                                    toast.success('Открываем чат с партнером');
                                  }}
                                  className="p-2 xs:p-2.5
                                    rounded-lg xs:rounded-xl
                                    bg-blue-500/20 hover:bg-blue-500/30
                                    text-blue-400
                                    transition-all"
                                  title="Написать"
                                >
                                  <MessageSquare className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeletePartner(partner.id)}
                                  className="p-2 xs:p-2.5
                                    rounded-lg xs:rounded-xl
                                    bg-red-500/20 hover:bg-red-500/30
                                    text-red-400
                                    transition-all"
                                  title="Удалить"
                                >
                                  <Trash2 className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 xs:p-5 sm:p-6
                    border-t border-white/10
                    flex items-center justify-between
                    shrink-0">
                    <div className="text-xs xs:text-sm text-gray-400">
                      Отображается {overviewPartners.length} из {overviewPartners.length} партнеров
                    </div>
                    <button
                      onClick={() => setSelectedOverview(null)}
                      className="flex items-center justify-center gap-2
                        px-4 xs:px-5 sm:px-6 py-2 xs:py-2.5 sm:py-3
                        rounded-lg xs:rounded-xl
                        bg-white/10 hover:bg-white/20
                        text-white font-medium
                        text-xs xs:text-sm sm:text-base
                        transition-all active:scale-95"
                    >
                      <X className="w-4 h-4 xs:w-5 xs:h-5" />
                      <span>Закрыть</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* CATEGORY DETAILS MODAL */}
      <AnimatePresence>
        {selectedCategory && (() => {
          const categoryPartners = partners.filter(p => p.category === selectedCategory);
          const categoryConfig = getCategoryConfig(selectedCategory);
          const CategoryIcon = categoryConfig.icon;

          return (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCategory(null)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed
                  inset-2 xs:inset-4 sm:inset-6
                  lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2
                  lg:w-[95vw] lg:max-w-7xl
                  max-h-[94vh] sm:max-h-[92vh]
                  z-50"
              >
                <div className="h-full
                  backdrop-blur-2xl bg-gradient-to-br from-gray-900/95 to-black/95
                  rounded-xl sm:rounded-2xl
                  border border-white/10 shadow-2xl
                  flex flex-col overflow-hidden">

                  {/* Modal Header */}
                  <div className="flex items-center justify-between
                    p-4 xs:p-5 sm:p-6
                    border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3 xs:gap-4">
                      <div className={`p-3 xs:p-4 rounded-xl xs:rounded-2xl
                        ${categoryConfig.bg}
                        border ${categoryConfig.border}`}
                      >
                        <CategoryIcon className={`w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 ${categoryConfig.text}`} />
                      </div>
                      <div>
                        <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white mb-1">
                          {categoryConfig.label}
                        </h2>
                        <p className="text-xs xs:text-sm sm:text-base text-gray-400">
                          {categoryPartners.length} {categoryPartners.length === 1 ? 'партнер' : 'партнеров'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                    >
                      <X className="w-5 h-5 xs:w-6 xs:h-6 text-gray-400" />
                    </button>
                  </div>

                  {/* Stats Summary */}
                  <div className="p-4 xs:p-5 sm:p-6 border-b border-white/10 shrink-0">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 xs:gap-4">
                      {[
                        {
                          label: 'Всего партнеров',
                          value: categoryPartners.length,
                          icon: Briefcase,
                          color: 'from-blue-500 to-cyan-500'
                        },
                        {
                          label: 'Общая аудитория',
                          value: categoryPartners.reduce((sum, p) => sum + p.followers, 0) >= 1000000
                            ? `${(categoryPartners.reduce((sum, p) => sum + p.followers, 0) / 1000000).toFixed(1)}M`
                            : `${(categoryPartners.reduce((sum, p) => sum + p.followers, 0) / 1000).toFixed(0)}K`,
                          icon: Users,
                          color: 'from-purple-500 to-pink-500'
                        },
                        {
                          label: 'Общая выручка',
                          value: `${(categoryPartners.reduce((sum, p) => sum + p.revenue, 0) / 1000000).toFixed(1)}M₽`,
                          icon: DollarSign,
                          color: 'from-green-500 to-emerald-500'
                        },
                        {
                          label: 'Средний рейтинг',
                          value: categoryPartners.filter(p => p.rating).length > 0
                            ? (categoryPartners.reduce((sum, p) => sum + (p.rating || 0), 0) / categoryPartners.filter(p => p.rating).length).toFixed(1)
                            : 'N/A',
                          icon: Star,
                          color: 'from-yellow-500 to-orange-500'
                        },
                      ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                          <div key={i} className={`p-3 xs:p-4 sm:p-5
                            rounded-lg xs:rounded-xl
                            bg-gradient-to-br ${stat.color} bg-opacity-10
                            border border-white/10`}
                          >
                            <Icon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white mb-1.5 xs:mb-2" />
                            <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-white mb-0.5 xs:mb-1">
                              {stat.value}
                            </div>
                            <div className="text-[10px] xs:text-xs sm:text-sm text-gray-400">
                              {stat.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Partners List */}
                  <div className="flex-1 overflow-y-auto p-4 xs:p-5 sm:p-6">
                    {categoryPartners.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 xs:py-16 sm:py-20">
                        <CategoryIcon className={`w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 ${categoryConfig.text} opacity-50 mb-4`} />
                        <h3 className="text-base xs:text-lg sm:text-xl font-semibold text-white mb-2">
                          Партнеров не найдено
                        </h3>
                        <p className="text-xs xs:text-sm sm:text-base text-gray-400">
                          В категории "{categoryConfig.label}" пока нет партнеров
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 xs:gap-4 sm:gap-5">
                        {categoryPartners.map((partner, index) => (
                          <motion.div
                            key={partner.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="backdrop-blur-xl bg-white/5
                              rounded-lg xs:rounded-xl
                              border border-white/10
                              p-3 xs:p-4 sm:p-5
                              hover:border-cyan-500/30 transition-all group relative"
                          >
                            {/* Added By Badge */}
                            <div className="absolute top-2 xs:top-3 right-2 xs:right-3">
                              <span className={`px-2 py-0.5 xs:px-2.5 xs:py-1
                                rounded-full
                                text-[9px] xs:text-[10px] font-medium
                                ${partner.addedBy === 'admin'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-400/30'
                                  : 'bg-green-500/10 text-green-400 border border-green-400/30'
                                }`}
                              >
                                {partner.addedBy === 'admin' ? 'Админ' : 'Заявка'}
                              </span>
                            </div>

                            {/* Header */}
                            <div className="flex items-start gap-2 xs:gap-3 mb-3 xs:mb-4 pr-16">
                              <img
                                src={partner.logo}
                                alt={partner.name}
                                className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-lg xs:rounded-xl object-cover shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <h3 className="text-sm xs:text-base sm:text-lg font-bold text-white mb-1 truncate">
                                  {partner.name}
                                </h3>
                                <span className={`px-2 xs:px-2.5 py-0.5 xs:py-1
                                  rounded-full
                                  text-[10px] xs:text-xs font-medium
                                  border
                                  ${statusColors[partner.status].bg}
                                  ${statusColors[partner.status].border}
                                  ${statusColors[partner.status].text}`}
                                >
                                  {partner.status === 'active' ? 'Активен' : partner.status === 'inactive' ? 'Неактивен' : 'Модерация'}
                                </span>
                              </div>
                            </div>

                            {/* Description */}
                            {partner.description && (
                              <p className="text-[11px] xs:text-xs sm:text-sm text-gray-400 mb-3 xs:mb-4 line-clamp-2 leading-relaxed">
                                {partner.description}
                              </p>
                            )}

                            {/* Stats */}
                            <div className="space-y-1.5 xs:space-y-2 mb-3 xs:mb-4">
                              <div className="flex items-center justify-between text-xs xs:text-sm">
                                <span className="text-gray-400">Аудитория:</span>
                                <span className="text-white font-semibold">
                                  {partner.followers >= 1000000
                                    ? `${(partner.followers / 1000000).toFixed(1)}M`
                                    : `${(partner.followers / 1000).toFixed(0)}K`}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs xs:text-sm">
                                <span className="text-gray-400">Выручка:</span>
                                <span className="text-green-400 font-semibold">
                                  {partner.revenue >= 1000000
                                    ? `${(partner.revenue / 1000000).toFixed(1)}M₽`
                                    : `${(partner.revenue / 1000).toFixed(0)}K₽`}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs xs:text-sm">
                                <span className="text-gray-400">Комиссия:</span>
                                <span className="text-cyan-400 font-semibold">{partner.commission}%</span>
                              </div>
                              {partner.rating && partner.rating > 0 && (
                                <div className="flex items-center justify-between text-xs xs:text-sm">
                                  <span className="text-gray-400">Рейтинг:</span>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-yellow-400 fill-yellow-400" />
                                    <span className="text-white font-semibold">{partner.rating}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1.5 xs:gap-2">
                              <button
                                onClick={() => {
                                  setSelectedCategory(null);
                                  viewPartnerDetails(partner);
                                }}
                                className="flex-1 px-3 xs:px-4 py-2 xs:py-2.5
                                  rounded-lg xs:rounded-xl
                                  bg-purple-500/20 hover:bg-purple-500/30
                                  text-purple-400
                                  transition-all
                                  flex items-center justify-center gap-1.5 xs:gap-2
                                  text-[10px] xs:text-xs sm:text-sm font-medium"
                              >
                                <Eye className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                                <span>Подробнее</span>
                              </button>
                              <button
                                onClick={() => {
                                  setChatPartnerId(partner.id.toString());
                                  setChatPartnerName(partner.name);
                                  setChatPartnerAvatar(partner.logo);
                                  setSelectedCategory(null);
                                  toast.success('Открываем чат с партнером');
                                }}
                                className="p-2 xs:p-2.5
                                  rounded-lg xs:rounded-xl
                                  bg-blue-500/20 hover:bg-blue-500/30
                                  text-blue-400
                                  transition-all"
                                title="Написать"
                              >
                                <MessageSquare className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePartner(partner.id)}
                                className="p-2 xs:p-2.5
                                  rounded-lg xs:rounded-xl
                                  bg-red-500/20 hover:bg-red-500/30
                                  text-red-400
                                  transition-all"
                                title="Удалить"
                              >
                                <Trash2 className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 xs:p-5 sm:p-6
                    border-t border-white/10
                    flex items-center justify-between
                    shrink-0">
                    <div className="text-xs xs:text-sm text-gray-400">
                      Отображается {categoryPartners.length} из {categoryPartners.length} партнеров
                    </div>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="flex items-center justify-center gap-2
                        px-4 xs:px-5 sm:px-6 py-2 xs:py-2.5 sm:py-3
                        rounded-lg xs:rounded-xl
                        bg-white/10 hover:bg-white/20
                        text-white font-medium
                        text-xs xs:text-sm sm:text-base
                        transition-all active:scale-95"
                    >
                      <X className="w-4 h-4 xs:w-5 xs:h-5" />
                      <span>Закрыть</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* ADMIN CHAT */}
      <AdminChat
        initialUserId={chatPartnerId}
        initialUserName={chatPartnerName}
        initialUserAvatar={chatPartnerAvatar}
      />
    </div>
  );
}
