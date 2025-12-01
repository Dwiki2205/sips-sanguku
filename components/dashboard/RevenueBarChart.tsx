// components/dashboard/RevenueBarChart.tsx
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  ReferenceArea
} from 'recharts';

interface RevenueBarChartProps {
  data: { month: string; revenue: number }[];
}

export default function RevenueBarChart({ data }: RevenueBarChartProps) {
  // Total pendapatan & bulan tertinggi
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const maxDataPoint = data.reduce((max, item) => item.revenue > (max?.revenue || 0) ? item : max, data[0] || null);

  // Warna bar: hijau tua untuk normal, hijau terang untuk tertinggi
  const getBarColor = (entry: any) => {
    return entry.month === maxDataPoint?.month ? '#16a34a' : '#22c55e';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold text-gray-800">Pendapatan 3 Bulan Terakhir</h3>
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 bg-green-600 rounded"></div>
          <span>Pendapatan Bulanan</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 30 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.6}/>
            </linearGradient>
          </defs>

          <CartesianGrid 
            strokeDasharray="4 4" 
            stroke="#f3f4f6" 
            vertical={false} 
          />

          <XAxis 
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={16}
            tick={{ fontSize: 13, fill: '#6b7280' }}
            tickFormatter={(value) => 
              new Date(value).toLocaleString('id-ID', { month: 'short', year: '2-digit' })
            }
            interval="preserveStartEnd"
          />

          <YAxis 
            tickLine={false}
            axisLine={false}
            tickMargin={16}
            tick={{ fontSize: 13, fill: '#6b7280' }}
            tickFormatter={(value) => `Rp ${(value / 1_000_000).toFixed(1)}Jt`}
            domain={[0, 'auto']}
          />

          <Tooltip
            cursor={{ fill: '#dcfce7', opacity: 0.5 }}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
            }}
            labelStyle={{ color: '#1f2937', fontWeight: 'bold', marginBottom: '8px' }}
            formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
            labelFormatter={(label) => 
              new Date(label).toLocaleString('id-ID', { month: 'long', year: 'numeric' })
            }
          />

          <Bar
            dataKey="revenue"
            radius={[12, 12, 0, 0]}
            barSize={60}
            animationDuration={1200}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
            ))}
          </Bar>

          {/* Label nilai di atas bar */}
          {data.map((entry) => (
            <text
              key={entry.month}
              x={entry.month}
              y={entry.revenue}
              dy={-12}
              textAnchor="middle"
              fontSize={13}
              fontWeight="bold"
              fill="#1f2937"
            >
              Rp {entry.revenue.toLocaleString('id-ID')}
            </text>
          ))}

          {/* Highlight bar tertinggi dengan background area */}
          {maxDataPoint && (
            <ReferenceArea
              x1={maxDataPoint.month}
              x2={maxDataPoint.month}
              y1={0}
              y2={maxDataPoint.revenue * 1.05}
              fill="#16a34a"
              opacity={0.15}
            />
          )}
        </BarChart>
      </ResponsiveContainer>

      {/* Summary di bawah chart */}
      <div className="mt-5 flex justify-between text-sm">
        <div className="text-gray-600">
          Total Pendapatan:{' '}
          <span className="font-bold text-xl text-green-600">
            Rp {totalRevenue.toLocaleString('id-ID')}
          </span>
        </div>
        {maxDataPoint && (
          <div className="text-gray-600">
            Tertinggi:{' '}
            <span className="font-bold text-green-700">
              Rp {maxDataPoint.revenue.toLocaleString('id-ID')}
            </span>{' '}
            <span className="text-gray-500">
              ({new Date(maxDataPoint.month).toLocaleString('id-ID', { month: 'long', year: 'numeric' })})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}