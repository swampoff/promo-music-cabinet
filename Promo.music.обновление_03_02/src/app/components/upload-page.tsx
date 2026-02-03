import { Upload, Music, Image as ImageIcon, FileAudio, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Загрузить трек</h1>
        <p className="text-gray-400">Поделитесь своей музыкой с миром</p>
      </div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative p-12 rounded-2xl backdrop-blur-xl border-2 border-dashed transition-all duration-300 ${
          dragActive
            ? 'bg-cyan-500/20 border-cyan-400'
            : uploaded
            ? 'bg-emerald-500/20 border-emerald-400'
            : 'bg-white/5 border-white/20 hover:border-cyan-400/50'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          setUploaded(true);
        }}
      >
        <div className="text-center">
          {uploaded ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <Check className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Файл загружен!</h3>
              <p className="text-gray-400 mb-6">Summer_Vibes_2024.mp3 (4.2 MB)</p>
              <button
                onClick={() => setUploaded(false)}
                className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
              >
                Загрузить другой файл
              </button>
            </motion.div>
          ) : (
            <>
              <motion.div
                animate={{ y: dragActive ? -10 : 0 }}
                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center"
              >
                <Upload className="w-10 h-10 text-cyan-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {dragActive ? 'Отпустите файл' : 'Перетащите файл сюда'}
              </h3>
              <p className="text-gray-400 mb-6">или нажмите для выбора</p>
              <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/20">
                Выбрать файл
              </button>
              <p className="text-gray-500 text-sm mt-4">Поддерживаемые форматы: MP3, WAV, FLAC (макс. 100 MB)</p>
            </>
          )}
        </div>
      </motion.div>

      {/* Track Details Form */}
      {uploaded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 space-y-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">Информация о треке</h3>

          {/* Title */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Название трека</label>
            <input
              type="text"
              placeholder="Summer Vibes"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
            />
          </div>

          {/* Genre & Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Жанр</label>
              <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400/50 transition-all duration-300">
                <option>Electronic</option>
                <option>Hip-Hop</option>
                <option>Pop</option>
                <option>Rock</option>
                <option>Jazz</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Год</label>
              <input
                type="number"
                placeholder="2024"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
              />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Обложка трека</label>
            <div className="p-6 rounded-xl border-2 border-dashed border-white/20 hover:border-cyan-400/50 transition-all duration-300 text-center cursor-pointer">
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Загрузить обложку (рекомендуется 1400x1400px)</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Описание</label>
            <textarea
              rows={4}
              placeholder="Расскажите о вашем треке..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/20">
              Опубликовать
            </button>
            <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all duration-300">
              Сохранить черновик
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}