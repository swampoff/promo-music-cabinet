import { DollarSign, Users, Gift } from 'lucide-react';

const totalStats = [
  {
    label: 'Всего получено',
    value: '₽12,450',
    gradient: 'from-emerald-500 to-green-600',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    label: 'Этот месяц',
    value: '₽3,280',
    gradient: 'from-cyan-500 to-blue-600',
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-400',
  },
  {
    label: 'Спонсоров',
    value: '47',
    gradient: 'from-pink-500 to-purple-600',
    iconBg: 'bg-pink-500/20',
    iconColor: 'text-pink-400',
  },
];

const donations = [
  {
    name: 'Иван П.',
    message: 'Отличная музыка! 🎵',
    amount: '₽500',
    avatar: '1',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Мария С.',
    message: 'Спасибо за творчество!',
    amount: '₽1000',
    avatar: '2',
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Дмитрий К.',
    message: 'Продолжайте в том же духе',
    amount: '₽250',
    avatar: '3',
    color: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Анна Л.',
    message: 'Ждём новых треков!',
    amount: '₽750',
    avatar: '4',
    color: 'from-orange-500 to-red-500',
  },
];

export function DonationsList() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {totalStats.map((stat, index) => (
          <div
            key={index}
            className="group relative p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-xl overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
            
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center backdrop-blur-sm mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {index === 0 && <DollarSign className={`w-6 h-6 ${stat.iconColor}`} />}
                {index === 1 && <Gift className={`w-6 h-6 ${stat.iconColor}`} />}
                {index === 2 && <Users className={`w-6 h-6 ${stat.iconColor}`} />}
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Donations List */}
      <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
        <h2 className="text-xl font-bold text-white mb-6">Последние донаты</h2>
        
        <div className="space-y-4">
          {donations.map((donation, index) => (
            <div
              key={index}
              className="group p-4 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${donation.color} flex items-center justify-center text-white font-bold shadow-lg`}>
                  {donation.name.charAt(0)}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold mb-1">{donation.name}</div>
                  <div className="text-gray-400 text-sm truncate">{donation.message}</div>
                </div>
              </div>

              {/* Amount */}
              <div className="text-emerald-400 font-bold text-lg ml-4">
                +{donation.amount}
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <button className="w-full mt-6 px-6 py-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold transition-all duration-300 hover:scale-[1.02]">
          Посмотреть все донаты
        </button>
      </div>
    </div>
  );
}