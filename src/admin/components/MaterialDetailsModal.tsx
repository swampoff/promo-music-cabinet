/**
 * MATERIAL DETAILS MODAL - Детальный просмотр материала для питчинга
 * Включает аудио/видео плееры, обложки, файлы и историю рассылок
 * МАКСИМАЛЬНАЯ АДАПТИВНОСТЬ: 320px → 4K
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Play, Pause, Volume2, VolumeX, Download, Send,
  FileAudio, FileVideo, FileText, Users, Mail, TrendingUp, BarChart3, Music, Image as ImageIcon, FileIcon
} from 'lucide-react';
import type { PitchingItem, PitchingFile } from '@/contexts/DataContext';

interface MaterialDetailsModalProps {
  item: PitchingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDistribute: () => void;
}

export function MaterialDetailsModal({ item, isOpen, onClose, onDistribute }: MaterialDetailsModalProps) {
  // Audio Player State
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Video Player State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  // File Preview State
  const [previewFile, setPreviewFile] = useState<PitchingFile | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);

  // Reset state when modal closes or item changes
  useEffect(() => {
    if (!isOpen || !item) {
      setIsPlaying(false);
      setIsVideoPlaying(false);
      setCurrentTime(0);
      setVideoCurrentTime(0);
      setPreviewFile(null);
      setIsPreviewPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.currentTime = 0;
      }
    }
  }, [isOpen, item]);

  if (!item) return null;

  // Helper functions
  const getFileType = (file: PitchingFile): 'audio' | 'image' | 'video' | 'pdf' | 'other' => {
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type === 'application/pdf') return 'pdf';
    return 'other';
  };

  const getFileIcon = (file: PitchingFile) => {
    const type = getFileType(file);
    switch (type) {
      case 'audio': return FileAudio;
      case 'image': return ImageIcon;
      case 'video': return FileVideo;
      case 'pdf': return FileText;
      default: return FileIcon;
    }
  };

  // Audio Handlers
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    if (vol > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  // Video Handlers
  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (isVideoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsVideoPlaying(!isVideoPlaying);
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setVideoCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleVideoSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setVideoCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Preview Handlers
  const handleFileClick = (file: PitchingFile) => {
    const fileType = getFileType(file);
    
    // For audio files - use item's audioUrl if available
    if (fileType === 'audio') {
      if (item.audioUrl) {
        setPreviewFile({ ...file, url: item.audioUrl });
        setIsPreviewPlaying(false);
        setPreviewCurrentTime(0);
      } else {
        alert('Аудиофайл недоступен для предпросмотра');
      }
      return;
    }
    
    // For video files - use item's videoUrl if available
    if (fileType === 'video') {
      if (item.videoUrl) {
        setPreviewFile({ ...file, url: item.videoUrl });
        setIsPreviewPlaying(false);
        setPreviewCurrentTime(0);
      } else {
        alert('Видеофайл недоступен для предпросмотра');
      }
      return;
    }
    
    // For images - try to use coverImage or thumbnailImage
    if (fileType === 'image') {
      const imageUrl = item.coverImage || item.thumbnailImage || file.url;
      setPreviewFile({ ...file, url: imageUrl });
      return;
    }
    
    // For PDFs - open in new tab (these are mock, so show alert)
    if (fileType === 'pdf') {
      alert('PDF файл недоступен (демо-режим)');
      return;
    }
    
    // For other files - show alert
    alert('Файл недоступен для предпросмотра (демо-режим)');
  };

  const togglePreviewPlay = () => {
    if (!previewAudioRef.current) return;
    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
    } else {
      previewAudioRef.current.play();
    }
    setIsPreviewPlaying(!isPreviewPlaying);
  };

  const handlePreviewTimeUpdate = () => {
    if (previewAudioRef.current) {
      setPreviewCurrentTime(previewAudioRef.current.currentTime);
    }
  };

  const handlePreviewLoadedMetadata = () => {
    if (previewAudioRef.current) {
      setPreviewDuration(previewAudioRef.current.duration);
    }
  };

  const handlePreviewSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setPreviewCurrentTime(time);
    if (previewAudioRef.current) {
      previewAudioRef.current.currentTime = time;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Statistics
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal - Адаптивное позиционирование */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed 
              inset-2 xs:inset-3 sm:inset-4 md:inset-6 lg:inset-8
              xl:inset-auto xl:left-1/2 xl:top-1/2 xl:-translate-x-1/2 xl:-translate-y-1/2 
              xl:w-[95vw] xl:max-w-5xl 2xl:max-w-6xl
              max-h-[96vh] sm:max-h-[92vh] md:max-h-[90vh]
              z-50"
          >
            <div className="h-full backdrop-blur-2xl bg-gradient-to-br from-gray-900/95 to-black/95 
              rounded-xl sm:rounded-2xl 
              border border-white/10 shadow-2xl 
              flex flex-col overflow-hidden">
              
              {/* HEADER - Адаптивный */}
              <div className="flex items-start justify-between 
                p-3 xs:p-4 sm:p-5 md:p-6 lg:p-7
                border-b border-white/10 shrink-0">
                <div className="flex-1 min-w-0 pr-2">
                  <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl 
                    font-bold text-white mb-1 sm:mb-2 truncate">
                    {item.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 
                    text-[10px] xs:text-xs sm:text-sm md:text-base text-gray-400">
                    <span className="font-medium text-white truncate max-w-[150px] sm:max-w-none">
                      {item.artist}
                    </span>
                    {item.genre && (
                      <>
                        <span className="hidden xs:inline">•</span>
                        <span className="truncate">{item.genre}</span>
                      </>
                    )}
                    {item.duration && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span>{item.duration}</span>
                      </>
                    )}
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-1.5 xs:p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                >
                  <X className="w-4 h-4 xs:w-5 xs:h-5 md:w-6 md:h-6 text-gray-400" />
                </button>
              </div>

              {/* CONTENT - Адаптивный скролл */}
              <div className="flex-1 overflow-y-auto 
                p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8
                space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6">
                
                {/* COVER IMAGE - Адаптивный размер */}
                {item.coverImage && (
                  <div className="relative 
                    aspect-square 
                    max-w-[280px] xs:max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg
                    mx-auto 
                    rounded-lg xs:rounded-xl sm:rounded-2xl 
                    overflow-hidden 
                    bg-gradient-to-br from-purple-900/20 to-cyan-900/20 
                    border border-white/10 
                    shadow-xl">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end 
                      p-3 xs:p-4 sm:p-5 md:p-6">
                      <div className="text-white w-full">
                        <div className="text-[10px] xs:text-xs sm:text-sm uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1">
                          {item.contentType === 'track' && <Music className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4" />}
                          {item.contentType === 'video' && <FileVideo className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4" />}
                          {item.contentType === 'track' ? 'Трек' : item.contentType === 'video' ? 'Видео' : 'Материал'}
                        </div>
                        <div className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-bold truncate">
                          {item.title}
                        </div>
                        <div className="text-[10px] xs:text-xs sm:text-sm md:text-base text-gray-300 truncate">
                          {item.artist}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AUDIO PLAYER - Адаптивный */}
                {item.contentType === 'track' && item.audioUrl && (
                  <div className="p-3 xs:p-4 sm:p-5 md:p-6 lg:p-7
                    rounded-lg xs:rounded-xl sm:rounded-2xl
                    bg-gradient-to-br from-purple-500/10 to-cyan-500/10 
                    border border-purple-500/20 
                    space-y-3 xs:space-y-4 sm:space-y-5">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <FileAudio className="w-4 h-4 xs:w-5 xs:h-5 md:w-6 md:h-6 text-purple-400" />
                      <h3 className="text-xs xs:text-sm sm:text-base md:text-lg font-semibold text-white">
                        Аудио Плеер
                      </h3>
                    </div>

                    <audio
                      ref={audioRef}
                      src={item.audioUrl}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={() => setIsPlaying(false)}
                    />

                    {/* Play Button - Адаптивный */}
                    <button
                      onClick={togglePlay}
                      className="w-full 
                        h-12 xs:h-14 sm:h-16 md:h-18 lg:h-20
                        rounded-lg xs:rounded-xl 
                        bg-gradient-to-r from-purple-500 to-cyan-500 
                        hover:from-purple-600 hover:to-cyan-600 
                        flex items-center justify-center 
                        gap-2 sm:gap-3 
                        transition-all active:scale-95
                        shadow-lg hover:shadow-xl"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-white" />
                      ) : (
                        <Play className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-white ml-1" />
                      )}
                      <span className="text-white font-semibold 
                        text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl">
                        {isPlaying ? 'Пауза' : 'Воспроизвести'}
                      </span>
                    </button>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 sm:h-2 md:h-2.5 bg-white/10 rounded-lg appearance-none cursor-pointer 
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 sm:[&::-webkit-slider-thumb]:w-4 sm:[&::-webkit-slider-thumb]:h-4 md:[&::-webkit-slider-thumb]:w-5 md:[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-purple-500 [&::-webkit-slider-thumb]:to-cyan-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                          [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 sm:[&::-moz-range-thumb]:w-4 sm:[&::-moz-range-thumb]:h-4 md:[&::-moz-range-thumb]:w-5 md:[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-r [&::-moz-range-thumb]:from-purple-500 [&::-moz-range-thumb]:to-cyan-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
                      />
                      <div className="flex justify-between text-[10px] xs:text-xs sm:text-sm text-gray-400">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button 
                        onClick={toggleMute} 
                        className="p-1.5 xs:p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4 xs:w-5 xs:h-5 md:w-6 md:h-6 text-gray-400" />
                        ) : (
                          <Volume2 className="w-4 h-4 xs:w-5 xs:h-5 md:w-6 md:h-6 text-purple-400" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="flex-1 h-1.5 sm:h-2 bg-white/10 rounded-lg appearance-none cursor-pointer 
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 sm:[&::-webkit-slider-thumb]:w-3 sm:[&::-webkit-slider-thumb]:h-3 md:[&::-webkit-slider-thumb]:w-4 md:[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md
                          [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 sm:[&::-moz-range-thumb]:w-3 sm:[&::-moz-range-thumb]:h-3 md:[&::-moz-range-thumb]:w-4 md:[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-purple-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
                      />
                    </div>
                  </div>
                )}

                {/* VIDEO PLAYER - Адаптивный */}
                {item.contentType === 'video' && item.videoUrl && (
                  <div className="p-3 xs:p-4 sm:p-5 md:p-6
                    rounded-lg xs:rounded-xl sm:rounded-2xl 
                    bg-gradient-to-br from-pink-500/10 to-orange-500/10 
                    border border-pink-500/20 
                    space-y-3 xs:space-y-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <FileVideo className="w-4 h-4 xs:w-5 xs:h-5 md:w-6 md:h-6 text-pink-400" />
                      <h3 className="text-xs xs:text-sm sm:text-base md:text-lg font-semibold text-white">
                        Видео Плеер
                      </h3>
                    </div>

                    {/* Video Element */}
                    <div className="relative aspect-video rounded-lg xs:rounded-xl overflow-hidden bg-black shadow-xl">
                      <video
                        ref={videoRef}
                        src={item.videoUrl}
                        className="w-full h-full"
                        onTimeUpdate={handleVideoTimeUpdate}
                        onLoadedMetadata={handleVideoLoadedMetadata}
                        onEnded={() => setIsVideoPlaying(false)}
                        onClick={toggleVideoPlay}
                      />
                      {!isVideoPlaying && (
                        <button
                          onClick={toggleVideoPlay}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors group"
                        >
                          <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 
                            rounded-full bg-gradient-to-r from-pink-500 to-orange-500 
                            flex items-center justify-center 
                            group-hover:scale-110 transition-transform
                            shadow-2xl">
                            <Play className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white ml-1" />
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Video Controls */}
                    <div className="space-y-2 sm:space-y-3">
                      <button
                        onClick={toggleVideoPlay}
                        className="w-full 
                          py-2.5 xs:py-3 sm:py-3.5 md:py-4
                          px-3 xs:px-4 
                          rounded-lg xs:rounded-xl 
                          bg-gradient-to-r from-pink-500 to-orange-500 
                          hover:from-pink-600 hover:to-orange-600 
                          flex items-center justify-center 
                          gap-2 
                          transition-all active:scale-95
                          shadow-lg"
                      >
                        {isVideoPlaying ? (
                          <>
                            <Pause className="w-4 h-4 xs:w-5 xs:h-5 md:w-6 md:h-6 text-white" />
                            <span className="text-white font-semibold text-xs xs:text-sm sm:text-base md:text-lg">
                              Пауза
                            </span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 xs:w-5 xs:h-5 md:w-6 md:h-6 text-white ml-0.5" />
                            <span className="text-white font-semibold text-xs xs:text-sm sm:text-base md:text-lg">
                              Воспроизвести
                            </span>
                          </>
                        )}
                      </button>

                      <input
                        type="range"
                        min="0"
                        max={videoDuration || 0}
                        value={videoCurrentTime}
                        onChange={handleVideoSeek}
                        className="w-full h-1.5 sm:h-2 md:h-2.5 bg-white/10 rounded-lg appearance-none cursor-pointer 
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 sm:[&::-webkit-slider-thumb]:w-4 sm:[&::-webkit-slider-thumb]:h-4 md:[&::-webkit-slider-thumb]:w-5 md:[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-pink-500 [&::-webkit-slider-thumb]:to-orange-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                          [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 sm:[&::-moz-range-thumb]:w-4 sm:[&::-moz-range-thumb]:h-4 md:[&::-moz-range-thumb]:w-5 md:[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-r [&::-moz-range-thumb]:from-pink-500 [&::-moz-range-thumb]:to-orange-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
                      />
                      <div className="flex justify-between text-[10px] xs:text-xs sm:text-sm text-gray-400">
                        <span>{formatTime(videoCurrentTime)}</span>
                        <span>{formatTime(videoDuration)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description - Адаптивный */}
                {item.description && (
                  <div className="p-3 xs:p-4 sm:p-5 
                    rounded-lg xs:rounded-xl 
                    bg-white/5 border border-white/10">
                    <h3 className="text-xs xs:text-sm sm:text-base font-semibold text-white mb-2">
                      Описание
                    </h3>
                    <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                )}

                {/* FILES - Адаптивный */}
                <div className="p-3 xs:p-4 sm:p-5 
                  rounded-lg xs:rounded-xl 
                  bg-white/5 border border-white/10">
                  <h3 className="text-xs xs:text-sm sm:text-base font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
                    <Download className="w-3 h-3 xs:w-4 xs:h-4 md:w-5 md:h-5 text-cyan-400" />
                    Файлы ({item.files.length})
                  </h3>
                  <div className="space-y-2">
                    {item.files.map(file => {
                      const Icon = getFileIcon(file);
                      return (
                        <div key={file.id} className="flex items-center gap-1.5 xs:gap-2">
                          <button
                            onClick={() => handleFileClick(file)}
                            className="flex-1 flex items-center gap-2 sm:gap-3 
                              p-2 xs:p-2.5 sm:p-3 
                              rounded-lg 
                              bg-white/5 hover:bg-white/10 
                              transition-colors active:scale-95 text-left"
                          >
                            <Icon className="w-3 h-3 xs:w-4 xs:h-4 md:w-5 md:h-5 text-cyan-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] xs:text-xs sm:text-sm md:text-base text-white truncate">
                                {file.name}
                              </div>
                              <div className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                          </button>
                          <button
                            onClick={() => handleDownload(file.url, file.name)}
                            className="p-2 xs:p-2.5 sm:p-3 
                              rounded-lg 
                              bg-white/5 hover:bg-cyan-500/20 
                              transition-colors active:scale-95
                              shrink-0"
                          >
                            <Download className="w-3 h-3 xs:w-4 xs:h-4 md:w-5 md:h-5 text-cyan-400" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* FILE PREVIEW - Адаптивный */}
                {previewFile && (
                  <div className="p-3 xs:p-4 sm:p-5 
                    rounded-lg xs:rounded-xl 
                    bg-gradient-to-br from-cyan-500/10 to-blue-500/10 
                    border border-cyan-500/20 
                    space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        {(() => {
                          const Icon = getFileIcon(previewFile);
                          return <Icon className="w-4 h-4 xs:w-5 xs:h-5 text-cyan-400 shrink-0" />;
                        })()}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs xs:text-sm sm:text-base font-semibold text-white">
                            Предпросмотр
                          </h3>
                          <p className="text-[10px] xs:text-xs text-gray-400 truncate">
                            {previewFile.name}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setPreviewFile(null)}
                        className="p-1.5 xs:p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                      >
                        <X className="w-3 h-3 xs:w-4 xs:h-4 text-gray-400" />
                      </button>
                    </div>

                    {/* Audio Preview */}
                    {getFileType(previewFile) === 'audio' && (
                      <>
                        <audio
                          ref={previewAudioRef}
                          src={previewFile.url}
                          onTimeUpdate={handlePreviewTimeUpdate}
                          onLoadedMetadata={handlePreviewLoadedMetadata}
                          onEnded={() => setIsPreviewPlaying(false)}
                        />
                        <button
                          onClick={togglePreviewPlay}
                          className="w-full 
                            py-2.5 xs:py-3 sm:py-3.5
                            px-3 xs:px-4 
                            rounded-lg 
                            bg-gradient-to-r from-cyan-500 to-blue-500 
                            hover:from-cyan-600 hover:to-blue-600 
                            flex items-center justify-center 
                            gap-2 
                            transition-all active:scale-95"
                        >
                          {isPreviewPlaying ? (
                            <>
                              <Pause className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
                              <span className="text-white font-semibold text-xs xs:text-sm sm:text-base">
                                Пауза
                              </span>
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 xs:w-5 xs:h-5 text-white ml-0.5" />
                              <span className="text-white font-semibold text-xs xs:text-sm sm:text-base">
                                Воспроизвести
                              </span>
                            </>
                          )}
                        </button>
                        <div className="space-y-1.5 sm:space-y-2">
                          <input
                            type="range"
                            min="0"
                            max={previewDuration || 0}
                            value={previewCurrentTime}
                            onChange={handlePreviewSeek}
                            className="w-full h-1.5 sm:h-2 bg-white/10 rounded-lg appearance-none cursor-pointer 
                              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 sm:[&::-webkit-slider-thumb]:w-4 sm:[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                              [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 sm:[&::-moz-range-thumb]:w-4 sm:[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
                          />
                          <div className="flex justify-between text-[10px] xs:text-xs sm:text-sm text-gray-400">
                            <span>{formatTime(previewCurrentTime)}</span>
                            <span>{formatTime(previewDuration)}</span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Image Preview */}
                    {getFileType(previewFile) === 'image' && (
                      <div className="rounded-lg overflow-hidden">
                        <img src={previewFile.url} alt={previewFile.name} className="w-full h-auto" />
                      </div>
                    )}

                    {/* Video Preview */}
                    {getFileType(previewFile) === 'video' && (
                      <div className="rounded-lg overflow-hidden">
                        <video src={previewFile.url} controls className="w-full h-auto" />
                      </div>
                    )}
                  </div>
                )}

                {/* STATISTICS - Адаптивная сетка */}
                {item.distributions.length > 0 && (
                  <div>
                    <h3 className="text-xs xs:text-sm sm:text-base md:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                      <BarChart3 className="w-3 h-3 xs:w-4 xs:h-4 md:w-5 md:h-5 text-cyan-400" />
                      Статистика рассылок
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                      {[
                        { label: 'Рассылок', value: item.totalSent, icon: Send, color: 'from-blue-500 to-cyan-500' },
                        { label: 'Получателей', value: totalRecipients, icon: Users, color: 'from-purple-500 to-pink-500' },
                        { label: 'Open Rate', value: `${avgOpenRate.toFixed(0)}%`, icon: Mail, color: 'from-green-500 to-emerald-500' },
                        { label: 'Click Rate', value: `${avgClickRate.toFixed(0)}%`, icon: TrendingUp, color: 'from-orange-500 to-red-500' },
                      ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                          <div key={i} className={`p-2.5 xs:p-3 sm:p-4 md:p-5 lg:p-6
                            rounded-lg xs:rounded-xl 
                            bg-gradient-to-br ${stat.color} bg-opacity-10 
                            border border-white/10`}>
                            <Icon className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white mb-1.5 sm:mb-2" />
                            <div className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-0.5 sm:mb-1">
                              {stat.value}
                            </div>
                            <div className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm text-gray-400">
                              {stat.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* DISTRIBUTION HISTORY */}
                    <h4 className="text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">
                      История рассылок
                    </h4>
                    <div className="space-y-2 sm:space-y-3">
                      {item.distributions.map((dist) => (
                        <div key={dist.id} className="p-3 xs:p-4 sm:p-5 
                          rounded-lg xs:rounded-xl 
                          bg-white/5 border border-white/10">
                          <div className="flex items-start justify-between gap-3 sm:gap-4 mb-2 sm:mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs xs:text-sm sm:text-base font-medium text-white mb-1 truncate">
                                {dist.baseName}
                              </div>
                              <div className="text-[10px] xs:text-xs sm:text-sm text-gray-400">
                                {new Date(dist.sentDate).toLocaleString('ru-RU')}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-cyan-400">
                                {dist.recipientsCount}
                              </div>
                              <div className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500">
                                получателей
                              </div>
                            </div>
                          </div>

                          {dist.comment && (
                            <div className="p-2 xs:p-2.5 sm:p-3 rounded-lg bg-white/5 mb-2 sm:mb-3">
                              <div className="text-[10px] xs:text-xs text-gray-400 mb-1">Комментарий:</div>
                              <div className="text-[10px] xs:text-xs sm:text-sm text-gray-300 leading-relaxed">
                                {dist.comment}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-3 gap-1.5 xs:gap-2 sm:gap-3">
                            <div className="text-center p-1.5 xs:p-2 sm:p-2.5 rounded-lg bg-blue-500/10">
                              <div className="text-[9px] xs:text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">
                                Файлов
                              </div>
                              <div className="text-xs xs:text-sm sm:text-base md:text-lg font-bold text-blue-400">
                                {dist.filesCount}
                              </div>
                            </div>
                            <div className="text-center p-1.5 xs:p-2 sm:p-2.5 rounded-lg bg-green-500/10">
                              <div className="text-[9px] xs:text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">
                                Open Rate
                              </div>
                              <div className="text-xs xs:text-sm sm:text-base md:text-lg font-bold text-green-400">
                                {dist.openRate}%
                              </div>
                            </div>
                            <div className="text-center p-1.5 xs:p-2 sm:p-2.5 rounded-lg bg-orange-500/10">
                              <div className="text-[9px] xs:text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">
                                Click Rate
                              </div>
                              <div className="text-xs xs:text-sm sm:text-base md:text-lg font-bold text-orange-400">
                                {dist.clickRate}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* FOOTER - Адаптивный */}
              <div className="p-3 xs:p-4 sm:p-5 md:p-6 
                border-t border-white/10 
                flex gap-2 xs:gap-3 
                shrink-0">
                <button
                  onClick={() => {
                    onClose();
                    onDistribute();
                  }}
                  className="flex-1 
                    px-3 xs:px-4 sm:px-5 md:px-6 
                    py-2.5 xs:py-3 sm:py-3.5 md:py-4
                    rounded-lg xs:rounded-xl 
                    bg-gradient-to-r from-blue-500 to-cyan-500 
                    hover:from-blue-600 hover:to-cyan-600 
                    text-white font-medium 
                    transition-all active:scale-95 
                    flex items-center justify-center 
                    gap-1.5 xs:gap-2
                    shadow-lg hover:shadow-xl
                    text-xs xs:text-sm sm:text-base md:text-lg"
                >
                  <Send className="w-3 h-3 xs:w-4 xs:h-4 md:w-5 md:h-5" />
                  <span className="hidden xs:inline">Создать рассылку</span>
                  <span className="xs:hidden">Рассылка</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-3 xs:px-4 sm:px-5 md:px-6 
                    py-2.5 xs:py-3 sm:py-3.5 md:py-4
                    rounded-lg xs:rounded-xl 
                    bg-white/10 hover:bg-white/20 
                    text-white font-medium 
                    transition-all active:scale-95
                    text-xs xs:text-sm sm:text-base md:text-lg"
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
