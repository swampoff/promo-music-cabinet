/**
 * USER PROFILE CARD - Карточка профиля пользователя
 */

import { motion } from 'framer-motion';
import { User, Mail, Shield, Music2, MapPin, Calendar } from 'lucide-react';

interface UserProfileCardProps {
  role: 'artist' | 'admin';
}

const profiles = {
  artist: {
    name: 'DJ Maestro',
    username: '@djmaestro',
    email: 'artist@promo.fm',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artist',
    role: 'Артист',
    location: 'Москва, Россия',
    joinDate: 'Январь 2024',
    stats: {
      tracks: 42,
      followers: '12.5K',
      plays: '2.3M',
    },
  },
  admin: {
    name: 'Admin Manager',
    username: '@admin',
    email: 'admin@promo.fm',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    role: 'Администратор',
    location: 'Head Office',
    joinDate: 'Основатель',
    stats: {
      users: '2,453',
      pending: '48',
      resolved: '1,234',
    },
  },
};

export function UserProfileCard({ role }: UserProfileCardProps) {
  const profile = profiles[role];
  const Icon = role === 'artist' ? Music2 : Shield;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl p-6 ${
        role === 'artist'
          ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30'
          : 'bg-white border border-gray-200 shadow-sm'
      }`}
    >
      {/* Avatar & Name */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-16 h-16 rounded-full bg-gray-200"
          />
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
            role === 'artist'
              ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
              : 'bg-gradient-to-br from-purple-500 to-pink-500'
          }`}>
            <Icon className="w-3 h-3 text-white" />
          </div>
        </div>
        <div>
          <h3 className={`text-lg font-bold ${role === 'artist' ? 'text-white' : 'text-gray-900'}`}>
            {profile.name}
          </h3>
          <p className={`text-sm ${role === 'artist' ? 'text-gray-400' : 'text-gray-600'}`}>
            {profile.username}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <Mail className={`w-4 h-4 ${role === 'artist' ? 'text-cyan-400' : 'text-purple-600'}`} />
          <span className={`text-sm ${role === 'artist' ? 'text-gray-300' : 'text-gray-700'}`}>
            {profile.email}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <User className={`w-4 h-4 ${role === 'artist' ? 'text-cyan-400' : 'text-purple-600'}`} />
          <span className={`text-sm ${role === 'artist' ? 'text-gray-300' : 'text-gray-700'}`}>
            {profile.role}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className={`w-4 h-4 ${role === 'artist' ? 'text-cyan-400' : 'text-purple-600'}`} />
          <span className={`text-sm ${role === 'artist' ? 'text-gray-300' : 'text-gray-700'}`}>
            {profile.location}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className={`w-4 h-4 ${role === 'artist' ? 'text-cyan-400' : 'text-purple-600'}`} />
          <span className={`text-sm ${role === 'artist' ? 'text-gray-300' : 'text-gray-700'}`}>
            {profile.joinDate}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-3 gap-4 pt-4 border-t ${
        role === 'artist' ? 'border-white/10' : 'border-gray-200'
      }`}>
        {Object.entries(profile.stats).map(([key, value]) => (
          <div key={key} className="text-center">
            <p className={`text-lg font-bold ${role === 'artist' ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </p>
            <p className={`text-xs capitalize ${role === 'artist' ? 'text-gray-400' : 'text-gray-600'}`}>
              {key}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
