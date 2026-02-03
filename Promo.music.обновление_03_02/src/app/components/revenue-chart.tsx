import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Пн', revenue: 420 },
  { day: 'Вт', revenue: 680 },
  { day: 'Ср', revenue: 920 },
  { day: 'Чт', revenue: 750 },
  { day: 'Пт', revenue: 1280 },
  { day: 'Сб', revenue: 1540 },
  { day: 'Вс', revenue: 1100 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="backdrop-blur-xl bg-black/80 border border-white/20 rounded-xl p-4 shadow-xl">
        <p className="text-white font-semibold mb-1">{payload[0].payload.day}</p>
        <p className="text-cyan-400 text-sm">₽{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export function RevenueChart() {
  return (
    <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
      <h2 className="text-xl font-bold text-white mb-6">Доход по месяцам</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="day" 
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="revenue" 
              fill="url(#colorRevenue)" 
              radius={[8, 8, 0, 0]}
            />
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.3}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}