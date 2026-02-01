import { Eye, EyeOff, Music2, Video, Calendar, Newspaper, Plus, Trash2, Edit2, Check, X, AlertCircle, Sparkles, TrendingUp, Heart, Play, Users, MessageCircle, Coins, ChevronDown, ChevronUp, Share2, Pause, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { PublicConcertsWidget } from '@/app/components/public-concerts-widget';

interface Track {
  id: number;
  title: string;
  duration: string;
  plays: string;
  likes: number;
  cover: string;
  status: 'moderated' | 'pending';
}

interface VideoItem {
  id: number;
  title: string;
  views: string;
  duration: string;
  thumbnail: string;
  status: 'moderated' | 'pending';
}

interface Concert {
  id: number;
  city: string;
  venue: string;
  date: string;
  price: string;
  status: 'available' | 'sold-out';
}

interface News {
  id: number;
  title: string;
  content: string;
  date: string;
  image: string;
  status: 'moderated' | 'pending' | 'draft';
}

interface PublicContentManagerProps {
  isEditing: boolean;
}

export function PublicContentManager({ isEditing }: PublicContentManagerProps) {
  // Все модерированные треки артиста (из раздела "Треки")
  const [allTracks] = useState<Track[]>([
    { id: 1, title: 'Neon Dreams', duration: '3:45', plays: '125K', likes: 2400, cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400', status: 'moderated' },
    { id: 2, title: 'Electric Soul', duration: '4:12', plays: '98K', likes: 1850, cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', status: 'moderated' },
    { id: 3, title: 'Midnight Vibes', duration: '3:28', plays: '156K', likes: 3200, cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', status: 'moderated' },
    { id: 4, title: 'Urban Pulse', duration: '3:55', plays: '87K', likes: 1650, cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400', status: 'moderated' },
    { id: 5, title: 'Digital Rain', duration: '4:20', plays: '72K', likes: 1320, cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400', status: 'moderated' },
  ]);

  // Выбранные треки для публичного профиля
  const [selectedTracks, setSelectedTracks] = useState<number[]>([1, 2, 3, 4]);
  
  // Модерированные клипы
  const [allVideos] = useState<VideoItem[]>([
    { id: 1, title: 'Neon Dreams - Official Video', views: '245K', duration: '3:45', thumbnail: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=600', status: 'moderated' },
    { id: 2, title: 'Electric Soul Live Session', views: '189K', duration: '4:52', thumbnail: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600', status: 'moderated' },
    { id: 3, title: 'Behind The Scenes', views: '92K', duration: '12:30', thumbnail: 'https://images.unsplash.com/photo-1574068468668-a05a11f871da?w=600', status: 'moderated' },
    { id: 4, title: 'Studio Session', views: '156K', duration: '8:15', thumbnail: 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b0?w=600', status: 'moderated' },
  ]);

  const [selectedVideos, setSelectedVideos] = useState<number[]>([1, 2, 3]);

  // Концерты
  const [concerts, setConcerts] = useState<Concert[]>([]);

  // Новости
  const [news, setNews] = useState<News[]>([
    { id: 1, title: 'Новый альбом выйдет в апреле!', content: 'Рады объявить о выходе нового альбома...', date: '2 дня назад', image: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=400', status: 'moderated' },
    { id: 2, title: 'Тур по России - объявлены даты', content: 'Начинаем тур по городам России...', date: '5 дней назад', image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400', status: 'moderated' },
    { id: 3, title: 'Коллаборация с мировым артистом', content: 'Готовим нечто особенное...', date: '1 неделю назад', image: 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b0?w=400', status: 'moderated' },
  ]);

  // Модальные окна
  const [showTrackSelector, setShowTrackSelector] = useState(false);
  const [showVideoSelector, setShowVideoSelector] = useState(false);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [showConcertForm, setShowConcertForm] = useState(false);

  // Плеер состояния
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likedTracks, setLikedTracks] = useState<Set<number>>(new Set());
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [shareTrack, setShareTrack] = useState<number | null>(null);

  // Форма концерта
  const [concertForm, setConcertForm] = useState({
    city: '',
    venue: '',
    date: '',
    price: '',
  });

  // Форма новости
  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    image: '',
  });

  const toggleTrackSelection = (trackId: number) => {
    setSelectedTracks(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const toggleVideoSelection = (videoId: number) => {
    setSelectedVideos(prev =>
      prev.includes(videoId)
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const handleAddConcert = () => {
    if (!concertForm.city || !concertForm.venue || !concertForm.date || !concertForm.price) {
      alert('Заполните все поля');
      return;
    }

    const newConcert: Concert = {
      id: Date.now(),
      city: concertForm.city,
      venue: concertForm.venue,
      date: concertForm.date,
      price: concertForm.price,
      status: 'available',
    };

    setConcerts(prev => [...prev, newConcert]);
    setConcertForm({ city: '', venue: '', date: '', price: '' });
    setShowConcertForm(false);
  };

  const handleAddNews = () => {
    if (!newsForm.title || !newsForm.content) {
      alert('Заполните заголовок и текст новости');
      return;
    }

    const newNews: News = {
      id: Date.now(),
      title: newsForm.title,
      content: newsForm.content,
      date: 'Только что',
      image: newsForm.image || 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=400',
      status: 'pending', // Отправляется на модерацию
    };

    setNews(prev => [newNews, ...prev]);
    setNewsForm({ title: '', content: '', image: '' });
    setShowNewsForm(false);
  };

  const handlePlayPause = (trackId: number) => {
    if (currentTrack === trackId && isPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentTrack(trackId);
      setIsPlaying(true);
    }
  };

  const handleLike = (trackId: number) => {
    setLikedTracks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });
  };

  const handleShare = (trackId: number) => {
    setShareTrack(trackId);
    setTimeout(() => setShareTrack(null), 2000);
  };

  const displayedTracks = allTracks.filter(track => selectedTracks.includes(track.id));
  const displayedVideos = allVideos.filter(video => selectedVideos.includes(video.id));

  return (
    <>
      {/* TRACKS SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music2 className="w-6 h-6 text-cyan-400" />
            <h2 className="text-3xl font-bold text-white">Треки</h2>
          </div>
          <div className="flex items-center gap-3">
            {isEditing && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTrackSelector(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg shadow-cyan-500/15"
              >
                <Plus className="w-5 h-5" />
                Выбрать треки
              </motion.button>
            )}
            <div className="text-gray-400 text-sm">{displayedTracks.length} треков</div>
          </div>
        </div>

        {displayedTracks.length === 0 && isEditing ? (
          <div className="p-12 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 border-dashed text-center">
            <Music2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg mb-4">Выберите треки для публичного профиля</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTrackSelector(true)}
              className="px-6 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-semibold transition-all duration-300"
            >
              Выбрать треки
            </motion.button>
          </div>
        ) : (
          <div className="grid gap-4">
            {displayedTracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.75 + index * 0.05 }}
                className="group p-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  {/* Cover & Play Button */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden">
                      <ImageWithFallback
                        src={track.cover}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {!isEditing && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handlePlayPause(track.id)}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                      >
                        {currentTrack === track.id && isPlaying ? (
                          <Pause className="w-6 h-6 text-white" fill="white" />
                        ) : (
                          <Play className="w-6 h-6 text-white" fill="white" />
                        )}
                      </motion.button>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg mb-1">{track.title}</h3>
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                      <span>{track.duration}</span>
                      <span>•</span>
                      <span>{track.plays} прослушиваний</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditing ? (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleTrackSelection(track.id)}
                      className="p-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all duration-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {/* Like Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleLike(track.id)}
                        className={`p-3 rounded-xl backdrop-blur-md transition-all duration-300 ${
                          likedTracks.has(track.id)
                            ? 'bg-pink-500/20 text-pink-400'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-pink-400'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${likedTracks.has(track.id) ? 'fill-current' : ''}`} />
                      </motion.button>

                      {/* Share Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleShare(track.id)}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-cyan-400 backdrop-blur-md transition-all duration-300 relative"
                      >
                        <Share2 className="w-5 h-5" />
                        {shareTrack === track.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap"
                          >
                            Ссылка скопирована!
                          </motion.div>
                        )}
                      </motion.button>

                      {/* Donate Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowDonateModal(true)}
                        className="p-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 text-yellow-400 border border-yellow-400/30 backdrop-blur-md transition-all duration-300"
                      >
                        <Coins className="w-5 h-5" />
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Now Playing Progress Bar */}
                {currentTrack === track.id && isPlaying && !isEditing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs text-gray-400">1:23</span>
                      </div>
                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: '0%' }}
                          animate={{ width: '45%' }}
                          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                        />
                      </div>
                      <span className="text-xs text-gray-400">{track.duration}</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* VIDEOS SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6 text-purple-400" />
            <h2 className="text-3xl font-bold text-white">Видео</h2>
          </div>
          <div className="flex items-center gap-3">
            {isEditing && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowVideoSelector(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg shadow-purple-500/15"
              >
                <Plus className="w-5 h-5" />
                Выбрать видео
              </motion.button>
            )}
            <div className="text-gray-400 text-sm">{displayedVideos.length} видео</div>
          </div>
        </div>

        {displayedVideos.length === 0 && isEditing ? (
          <div className="p-12 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 border-dashed text-center">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg mb-4">Выберите видео для публичного профиля</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowVideoSelector(true)}
              className="px-6 py-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 font-semibold transition-all duration-300"
            >
              Выбрать видео
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayedVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.95 + index * 0.05 }}
                whileHover={{ scale: isEditing ? 1 : 1.02 }}
                className="group cursor-pointer rounded-2xl overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 hover:border-purple-400/50 transition-all duration-300 relative"
              >
                <div className="relative aspect-video">
                  <ImageWithFallback
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                  {isEditing ? (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleVideoSelection(video.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300 shadow-lg"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </motion.button>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/50"
                      >
                        <Play className="w-8 h-8 text-white ml-1" fill="white" />
                      </motion.div>
                    </div>
                  )}

                  {/* Duration Badge */}
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-lg text-white text-xs font-semibold">
                    {video.duration}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-white font-semibold mb-2 line-clamp-2">{video.title}</h3>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Eye className="w-4 h-4" />
                    <span>{video.views} просмотров</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* CONCERTS SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-green-400" />
            <h2 className="text-3xl font-bold text-white">Концерты</h2>
          </div>
        </div>

        {/* Новый виджет с реальными данными из API */}
        <PublicConcertsWidget isEditing={isEditing} limit={6} />
      </motion.div>

      {/* NEWS SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Newspaper className="w-6 h-6 text-orange-400" />
            <h2 className="text-3xl font-bold text-white">Новости</h2>
          </div>
          <div className="flex items-center gap-3">
            {isEditing && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewsForm(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg shadow-orange-500/15"
              >
                <Plus className="w-5 h-5" />
                Добавить новость
              </motion.button>
            )}
            <div className="text-gray-400 text-sm">{news.filter(n => n.status === 'moderated').length} новостей</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.filter(n => n.status === 'moderated').map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.35 + index * 0.05 }}
              whileHover={{ scale: isEditing ? 1 : 1.02 }}
              className="group cursor-pointer rounded-2xl overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 hover:border-orange-400/50 transition-all duration-300 relative"
            >
              <div className="relative aspect-video">
                <ImageWithFallback
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                {isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setNews(news.filter(n => n.id !== item.id))}
                    className="absolute top-3 right-3 p-2 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300 shadow-lg"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </motion.button>
                )}

                {/* Date Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-orange-500/90 backdrop-blur-sm rounded-lg text-white text-xs font-semibold">
                  {item.date}
                </div>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg line-clamp-2 group-hover:text-orange-400 transition-colors duration-300">
                    {item.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Новости на модерации */}
        {isEditing && news.some(n => n.status === 'pending') && (
          <div className="p-6 rounded-2xl backdrop-blur-xl bg-yellow-500/10 border border-yellow-400/30">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">На модерации</h3>
            </div>
            <div className="grid gap-3">
              {news.filter(n => n.status === 'pending').map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <h4 className="text-white font-semibold">{item.title}</h4>
                    <p className="text-gray-400 text-sm">{item.date}</p>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 text-sm font-semibold">
                    Модерация
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* TRACK SELECTOR MODAL */}
      <AnimatePresence>
        {showTrackSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowTrackSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[80vh] overflow-y-auto p-8 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Выберите треки для профиля</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowTrackSelector(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300"
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>

              <div className="grid gap-3">
                {allTracks.filter(t => t.status === 'moderated').map(track => (
                  <motion.div
                    key={track.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => toggleTrackSelection(track.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                      selectedTracks.includes(track.id)
                        ? 'bg-cyan-500/20 border border-cyan-400/50'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden">
                        <ImageWithFallback
                          src={track.cover}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{track.title}</h4>
                        <p className="text-gray-400 text-sm">{track.duration}</p>
                      </div>
                      {selectedTracks.includes(track.id) && (
                        <Check className="w-6 h-6 text-cyan-400" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTrackSelector(false)}
                className="w-full mt-6 px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold transition-all duration-300"
              >
                Готово ({selectedTracks.length} выбрано)
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIDEO SELECTOR MODAL */}
      <AnimatePresence>
        {showVideoSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowVideoSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[80vh] overflow-y-auto p-8 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Выберите видео для профиля</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowVideoSelector(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300"
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {allVideos.filter(v => v.status === 'moderated').map(video => (
                  <motion.div
                    key={video.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => toggleVideoSelection(video.id)}
                    className={`rounded-xl cursor-pointer overflow-hidden transition-all duration-300 ${
                      selectedVideos.includes(video.id)
                        ? 'ring-2 ring-purple-400'
                        : ''
                    }`}
                  >
                    <div className="relative aspect-video">
                      <ImageWithFallback
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      {selectedVideos.includes(video.id) && (
                        <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                          <Check className="w-12 h-12 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-white/5">
                      <h4 className="text-white font-semibold text-sm line-clamp-1">{video.title}</h4>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowVideoSelector(false)}
                className="w-full mt-6 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold transition-all duration-300"
              >
                Готово ({selectedVideos.length} выбрано)
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONCERT FORM MODAL */}
      <AnimatePresence>
        {showConcertForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowConcertForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-8 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Добавить концерт</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowConcertForm(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300"
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2 font-semibold">Город</label>
                  <input
                    type="text"
                    value={concertForm.city}
                    onChange={(e) => setConcertForm({ ...concertForm, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-green-400/50 transition-all duration-300"
                    placeholder="Москва"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2 font-semibold">Место проведения</label>
                  <input
                    type="text"
                    value={concertForm.venue}
                    onChange={(e) => setConcertForm({ ...concertForm, venue: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-green-400/50 transition-all duration-300"
                    placeholder="Stadium Live"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2 font-semibold">Дата</label>
                  <input
                    type="text"
                    value={concertForm.date}
                    onChange={(e) => setConcertForm({ ...concertForm, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-green-400/50 transition-all duration-300"
                    placeholder="15 марта 2026"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2 font-semibold">Цена</label>
                  <input
                    type="text"
                    value={concertForm.price}
                    onChange={(e) => setConcertForm({ ...concertForm, price: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-green-400/50 transition-all duration-300"
                    placeholder="от 2500₽"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddConcert}
                className="w-full mt-6 px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold transition-all duration-300"
              >
                Добавить концерт
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEWS FORM MODAL */}
      <AnimatePresence>
        {showNewsForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowNewsForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-8 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-400/30 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                    <Newspaper className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Добавить новость</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowNewsForm(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300"
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2 font-semibold">Заголовок</label>
                  <input
                    type="text"
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/50 transition-all duration-300"
                    placeholder="Заголовок новости"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2 font-semibold">Текст</label>
                  <textarea
                    rows={5}
                    value={newsForm.content}
                    onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/50 transition-all duration-300 resize-none"
                    placeholder="Текст новости..."
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2 font-semibold">URL изображения (опционально)</label>
                  <input
                    type="url"
                    value={newsForm.image}
                    onChange={(e) => setNewsForm({ ...newsForm, image: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/50 transition-all duration-300"
                    placeholder="https://..."
                  />
                </div>

                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-400/30">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-yellow-200 text-sm">
                      Новость будет отправлена на модерацию и появится в публичном профиле после одобрения
                    </p>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddNews}
                className="w-full mt-6 px-6 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold transition-all duration-300"
              >
                Отправить на модерацию
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DONATE MODAL */}
      <AnimatePresence>
        {showDonateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowDonateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-8 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 border border-yellow-400/30 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Поддержать артиста</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowDonateModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300"
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-gray-300">Выберите сумму доната:</p>
                <div className="grid grid-cols-3 gap-3">
                  {[100, 250, 500, 1000, 2500, 5000].map((amount) => (
                    <motion.button
                      key={amount}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-3 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-yellow-500/20 hover:to-orange-500/20 border border-white/10 hover:border-yellow-400/50 text-white font-semibold transition-all duration-300"
                    >
                      {amount}₽
                    </motion.button>
                  ))}
                </div>

                <input
                  type="number"
                  placeholder="Другая сумма"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400/50 transition-all duration-300"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-yellow-500/15"
              >
                Отправить донат
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}