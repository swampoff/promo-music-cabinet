import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { day: 'Пн', listens: 400, unique: 240 },
  { day: 'Вт', listens: 850, unique: 320 },
  { day: 'Ср', listens: 750, unique: 280 },
  { day: 'Чт', listens: 1500, unique: 480 },
  { day: 'Пт', listens: 900, unique: 350 },
  { day: 'Сб', listens: 1150, unique: 420 },
  { day: 'Вс', listens: 650, unique: 290 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="backdrop-blur-xl bg-black/80 border border-white/20 rounded-xl p-4 shadow-xl">
        <p className="text-white font-semibold mb-2">{payload[0].payload.day}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function WeeklyChart() {
  return (
    <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
      <h2 className="text-xl font-bold text-white mb-6">Прослушивания за неделю</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            <Legend 
              wrapperStyle={{ color: '#fff' }}
              iconType="circle"
            />
            <Line 
              type="monotone" 
              dataKey="listens" 
              stroke="#06b6d4" 
              strokeWidth={3}
              dot={{ fill: '#06b6d4', r: 5 }}
              activeDot={{ r: 7, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
              name="Прослушивания"
            />
            <Line 
              type="monotone" 
              dataKey="unique" 
              stroke="#a855f7" 
              strokeWidth={3}
              dot={{ fill: '#a855f7', r: 5 }}
              activeDot={{ r: 7, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }}
              name="Уникальные"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}