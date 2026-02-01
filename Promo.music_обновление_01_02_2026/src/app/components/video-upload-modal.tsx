import { X, Upload, Video, Image as ImageIcon, Check, AlertCircle, Loader2, Film, Link as LinkIcon, Youtube, Play, ExternalLink, Info, Sparkles, ChevronDown, FileVideo, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef } from 'react';
import { getVideoInfo, isValidVideoUrl } from '@/utils/video-utils';

type VideoSource = 'file' | 'link';

const categories = [
  'Музыкальный клип', 'Лирик-видео', 'Live выступление', 'Behind the scenes',
  'Интервью', 'Vlog', 'Короткое видео', 'Другое'
];

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: {
    title: string;
    category: string;
    description: string;
    tags: string;
    thumbnail: string | null;
    videoFileName: string | null;
    videoUrl: string;
    videoSource: VideoSource;
  }, isDraft: boolean) => Promise<void>;
}

export function VideoUploadModal({ isOpen, onClose, onUpload }: VideoUploadModalProps) {
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: '',
    description: '',
    tags: '',
    artist: '',
    genre: '',
    releaseDate: '',
    director: '',
    lightingDirector: '',
    scriptwriter: '',
    sfxArtist: '',
    cinematographer: '',
    editor: '',
    producer: '',
    // Авторские и смежные права
    videoCopyrightHolder: '',
    musicCopyrightHolder: '',
    licenseType: 'all-rights-reserved',
  });

  const [videoSource, setVideoSource] = useState<VideoSource>('file');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Обработка загрузки превью
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Размер изображения не должен превышать 5МБ');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Обработка загрузки видео
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Пожалуйста, выберите видео файл');
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      alert('Размер видео не должен превышать 500МБ');
      return;
    }

    setVideoFileName(file.name);
  };

  // Обработка изменения URL видео
  const handleVideoUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setVideoUrl(url);
    
    // Очищаем ошибку при начале ввода
    if (validationErrors.video) {
      setValidationErrors(prev => {
        const { video, ...rest } = prev;
        return rest;
      });
    }
    
    // Если URL валидный, загружаем превью
    if (url && isValidVideoUrl(url)) {
      setIsLoadingThumbnail(true);
      
      try {
        const videoInfo = getVideoInfo(url);
        
        if (videoInfo) {
          // Загружаем превью
          setThumbnailPreview(videoInfo.thumbnailUrl);
          
          // Очищаем ошибку превью
          if (validationErrors.thumbnail) {
            setValidationErrors(prev => {
              const { thumbnail, ...rest } = prev;
              return rest;
            });
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки превью:', error);
      } finally {
        setIsLoadingThumbnail(false);
      }
    }
  };

  // Определение текущей платформы видео
  const getCurrentPlatform = () => {
    if (!videoUrl || !isValidVideoUrl(videoUrl)) return null;
    const videoInfo = getVideoInfo(videoUrl);
    return videoInfo?.platform || null;
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!uploadForm.title.trim()) {
      errors.title = 'Введите название видео';
    }
    if (!uploadForm.category) {
      errors.category = 'Выберите категорию';
    }
    if (!thumbnailPreview) {
      errors.thumbnail = 'Загрузите превью';
    }
    if (!videoFileName && videoSource === 'file') {
      errors.video = 'Загрузите видео файл';
    }
    if (!videoUrl && videoSource === 'link') {
      errors.video = 'Введите ссылку на видео';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Загрузка видео
  const handleUploadVideo = async (isDraft: boolean = false) => {
    if (!validateForm() && !isDraft) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Симуляция загрузки
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setUploadProgress(i);
    }

    await onUpload({
      ...uploadForm,
      thumbnail: thumbnailPreview,
      videoFileName,
      videoUrl,
      videoSource,
    }, isDraft);

    setIsUploading(false);
    
    // Сброс формы
    setUploadForm({
      title: '',
      category: '',
      description: '',
      tags: '',
      artist: '',
      genre: '',
      releaseDate: '',
      director: '',
      lightingDirector: '',
      scriptwriter: '',
      sfxArtist: '',
      cinematographer: '',
      editor: '',
      producer: '',
      // Авторские и смежные права
      videoCopyrightHolder: '',
      musicCopyrightHolder: '',
      licenseType: 'all-rights-reserved',
    });
    setThumbnailPreview(null);
    setVideoFileName(null);
    setVideoUrl('');
    setUploadProgress(0);
    setValidationErrors({});
    setVideoSource('file');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl md:rounded-3xl backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 shadow-2xl overflow-hidden"
        >
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                <Upload className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">Загрузить видео</h3>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 flex-shrink-0"
            >
              <X className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </motion.button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="space-y-5 md:space-y-6">
              {/* Source Selector Tabs */}
              <div className="flex gap-2 md:gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setVideoSource('file');
                    setVideoUrl('');
                    setValidationErrors({});
                  }}
                  className={`flex-1 px-4 py-3 md:py-4 rounded-xl font-semibold transition-all duration-300 flex flex-col items-center gap-2 ${
                    videoSource === 'file'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <Upload className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-sm md:text-base">Загрузить файл</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setVideoSource('link');
                    setVideoFileName(null);
                    setValidationErrors({});
                  }}
                  className={`flex-1 px-4 py-3 md:py-4 rounded-xl font-semibold transition-all duration-300 flex flex-col items-center gap-2 ${
                    videoSource === 'link'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <LinkIcon className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-sm md:text-base">Ссылка на видео</span>
                </motion.button>
              </div>

              {/* Video Source Input */}
              {videoSource === 'file' ? (
                <div>
                  <label className="block text-gray-300 text-sm md:text-base mb-3 font-semibold">
                    Видео файл *
                  </label>
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className={`relative p-4 md:p-6 rounded-xl border-2 border-dashed ${
                      validationErrors.video ? 'border-red-400' : 'border-white/20'
                    } hover:border-purple-400/50 transition-all duration-300 cursor-pointer`}
                  >
                    {videoFileName ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <VideoIcon className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-semibold truncate text-sm md:text-base">{videoFileName}</div>
                          <div className="text-gray-400 text-xs md:text-sm">Нажмите для замены</div>
                        </div>
                        <Check className="w-5 h-5 md:w-6 md:h-6 text-green-400 flex-shrink-0" />
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">
                        <VideoIcon className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2" />
                        <div className="font-semibold mb-1 text-sm md:text-base">Загрузите видео файл</div>
                        <div className="text-xs md:text-sm">MP4, MOV, AVI до 500МБ</div>
                      </div>
                    )}
                  </div>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  {validationErrors.video && (
                    <div className="flex items-center gap-1 mt-2 text-red-400 text-xs md:text-sm">
                      <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                      {validationErrors.video}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-gray-300 text-sm md:text-base mb-3 font-semibold">
                    Ссылка на YouTube или RuTube *
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={handleVideoUrlChange}
                      placeholder="https://www.youtube.com/watch?v=... или https://rutube.ru/video/..."
                      className={`w-full px-4 py-3 pl-11 md:pl-12 rounded-xl bg-white/5 border ${
                        validationErrors.video ? 'border-red-400' : 'border-white/10'
                      } text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base`}
                    />
                    {isLoadingThumbnail ? (
                      <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 animate-spin" />
                    ) : (
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Platform indicator */}
                  {videoUrl && isValidVideoUrl(videoUrl) && !isLoadingThumbnail && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-center gap-2 text-xs md:text-sm"
                    >
                      <Check className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
                      <span className="text-green-400 font-semibold">
                        {getCurrentPlatform() === 'youtube' && (
                          <span className="flex items-center gap-1">
                            <Youtube className="w-4 h-4" />
                            YouTube видео обнаружено
                          </span>
                        )}
                        {getCurrentPlatform() === 'rutube' && 'RuTube видео обнаружено'}
                      </span>
                    </motion.div>
                  )}
                  
                  {videoUrl && !isValidVideoUrl(videoUrl) && !isLoadingThumbnail && (
                    <div className="flex items-center gap-1 mt-2 text-yellow-400 text-xs md:text-sm">
                      <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                      <span>Введите корректную ссылку на YouTube или RuTube</span>
                    </div>
                  )}

                  {validationErrors.video && (
                    <div className="flex items-center gap-1 mt-2 text-red-400 text-xs md:text-sm">
                      <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                      {validationErrors.video}
                    </div>
                  )}
                </div>
              )}

              {/* Thumbnail Upload/Preview */}
              <div>
                <label className="block text-gray-300 text-sm md:text-base mb-3 font-semibold">
                  Превью видео {videoSource === 'link' && thumbnailPreview ? '(автоматически)' : '*'}
                </label>
                <div
                  onClick={() => videoSource === 'file' && thumbnailInputRef.current?.click()}
                  className={`relative w-full h-40 md:h-48 rounded-xl border-2 border-dashed ${
                    validationErrors.thumbnail ? 'border-red-400' : 'border-white/20'
                  } hover:border-purple-400/50 transition-all duration-300 ${
                    videoSource === 'file' ? 'cursor-pointer' : ''
                  } overflow-hidden group`}
                >
                  {thumbnailPreview ? (
                    <>
                      <img src={thumbnailPreview} alt="Превью" className="w-full h-full object-cover" />
                      {videoSource === 'file' && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                          <div className="text-white text-center">
                            <ImageIcon className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2" />
                            <div className="font-semibold text-sm md:text-base">Изменить превью</div>
                          </div>
                        </div>
                      )}
                      {videoSource === 'link' && (
                        <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-green-500/20 border border-green-400/30 backdrop-blur-sm">
                          <span className="text-green-400 text-xs font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Автоматически
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-purple-400 transition-colors">
                      {isLoadingThumbnail ? (
                        <>
                          <Loader2 className="w-10 h-10 md:w-12 md:h-12 mb-3 animate-spin" />
                          <div className="font-semibold text-sm md:text-base">Загрузка превью...</div>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-10 h-10 md:w-12 md:h-12 mb-3" />
                          <div className="font-semibold mb-1 text-sm md:text-base">
                            {videoSource === 'file' ? 'Загрузите превью' : 'Превью загрузится автоматически'}
                          </div>
                          <div className="text-xs md:text-sm">PNG, JPG до 5МБ</div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {videoSource === 'file' && (
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />
                )}
                {validationErrors.thumbnail && (
                  <div className="flex items-center gap-1 mt-2 text-red-400 text-xs md:text-sm">
                    <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                    {validationErrors.thumbnail}
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                    Название видео *
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                      validationErrors.title ? 'border-red-400' : 'border-white/10'
                    } text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base`}
                    placeholder="Название видео"
                  />
                  {validationErrors.title && (
                    <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.title}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                    Категория *
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                      validationErrors.category ? 'border-red-400' : 'border-white/10'
                    } text-white focus:outline-none focus:border-purple-400/50 transition-all duration-300 cursor-pointer text-sm md:text-base`}
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {validationErrors.category && (
                    <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.category}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                    Описание
                  </label>
                  <textarea
                    rows={3}
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 resize-none text-sm md:text-base"
                    placeholder="Расскажите о видео..."
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                    Теги (через запятую)
                  </label>
                  <input
                    type="text"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base"
                    placeholder="musicvideo, official, 2026"
                  />
                </div>

                {/* Разделитель */}
                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-white font-bold text-base md:text-lg mb-4">Информация о видео</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                        Исполнитель *
                      </label>
                      <input
                        type="text"
                        value={uploadForm.artist}
                        onChange={(e) => setUploadForm({ ...uploadForm, artist: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base"
                        placeholder="Имя исполнителя"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                        Жанр *
                      </label>
                      <input
                        type="text"
                        value={uploadForm.genre}
                        onChange={(e) => setUploadForm({ ...uploadForm, genre: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base"
                        placeholder="Synthwave / Electronic"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                        Дата релиза *
                      </label>
                      <input
                        type="date"
                        value={uploadForm.releaseDate}
                        onChange={(e) => setUploadForm({ ...uploadForm, releaseDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Создатели */}
                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-white font-bold text-base md:text-lg mb-4">Создатели</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                        Режиссер *
                      </label>
                      <input
                        type="text"
                        value={uploadForm.director}
                        onChange={(e) => setUploadForm({ ...uploadForm, director: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base"
                        placeholder="Имя режиссера"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                        Оператор
                      </label>
                      <input
                        type="text"
                        value={uploadForm.cinematographer}
                        onChange={(e) => setUploadForm({ ...uploadForm, cinematographer: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base"
                        placeholder="Имя оператора"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                        Монтажер
                      </label>
                      <input
                        type="text"
                        value={uploadForm.editor}
                        onChange={(e) => setUploadForm({ ...uploadForm, editor: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base"
                        placeholder="Имя монтажера"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                        Продюсер
                      </label>
                      <input
                        type="text"
                        value={uploadForm.producer}
                        onChange={(e) => setUploadForm({ ...uploadForm, producer: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base"
                        placeholder="Имя продюсера"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                        Художник по свету
                      </label>
                      <input
                        type="text"
                        value={uploadForm.lightingDirector}
                        onChange={(e) => setUploadForm({ ...uploadForm, lightingDirector: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base"
                        placeholder="Имя художника по свету"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                        Сценарист
                      </label>
                      <input
                        type="text"
                        value={uploadForm.scriptwriter}
                        onChange={(e) => setUploadForm({ ...uploadForm, scriptwriter: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base"
                        placeholder="Имя сценариста"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                        SFX Artist
                      </label>
                      <input
                        type="text"
                        value={uploadForm.sfxArtist}
                        onChange={(e) => setUploadForm({ ...uploadForm, sfxArtist: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base"
                        placeholder="Имя SFX Artist"
                      />
                    </div>
                  </div>
                </div>

                {/* Авторские и смежные права */}
                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-white font-bold text-base md:text-lg mb-4">Авторские и смежные права</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                        Авторские права на видео (©)
                      </label>
                      <input
                        type="text"
                        value={uploadForm.videoCopyrightHolder}
                        onChange={(e) => setUploadForm({ ...uploadForm, videoCopyrightHolder: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base"
                        placeholder="© 2026 Название компании или имя автора"
                      />
                      <p className="text-xs text-gray-400 mt-1">Владелец авторских прав на видеоконтент</p>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                        Авторские права на музыку (℗)
                      </label>
                      <input
                        type="text"
                        value={uploadForm.musicCopyrightHolder}
                        onChange={(e) => setUploadForm({ ...uploadForm, musicCopyrightHolder: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-all duration-300 text-sm md:text-base"
                        placeholder="℗ 2026 Название лейбла или исполнителя"
                      />
                      <p className="text-xs text-gray-400 mt-1">Владелец прав на звукозапись и музыку</p>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm md:text-base mb-2 font-semibold">
                        Тип лицензии
                      </label>
                      <select
                        value={uploadForm.licenseType}
                        onChange={(e) => setUploadForm({ ...uploadForm, licenseType: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400/50 transition-all duration-300 cursor-pointer text-sm md:text-base"
                      >
                        <option value="all-rights-reserved">Все права защищены (All Rights Reserved)</option>
                        <option value="cc-by">Creative Commons BY (Атрибуция)</option>
                        <option value="cc-by-sa">Creative Commons BY-SA (Атрибуция-СохранениеУсловий)</option>
                        <option value="cc-by-nd">Creative Commons BY-ND (Атрибуция-БезПроизводных)</option>
                        <option value="cc-by-nc">Creative Commons BY-NC (Атрибуция-Некоммерческая)</option>
                        <option value="cc-by-nc-sa">Creative Commons BY-NC-SA</option>
                        <option value="cc-by-nc-nd">Creative Commons BY-NC-ND</option>
                        <option value="public-domain">Общественное достояние (Public Domain)</option>
                        <option value="youtube-standard">YouTube Стандартная лицензия</option>
                      </select>
                      <p className="text-xs text-gray-400 mt-1">Определяет условия использования вашего видео</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-purple-500/10 border border-purple-400/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-400 font-semibold text-sm md:text-base">Загрузка...</span>
                    <span className="text-white font-semibold text-sm md:text-base">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-500"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 p-4 md:p-6 border-t border-white/10 bg-white/5 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleUploadVideo(false)}
              disabled={isUploading}
              className="flex-1 px-4 md:px-6 py-3 md:py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-purple-500/15 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  Загрузка...
                </span>
              ) : (
                'Отправить на модерацию'
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleUploadVideo(true)}
              disabled={isUploading}
              className="px-4 md:px-6 py-3 md:py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-300 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base whitespace-nowrap"
            >
              Сохранить черновик
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}