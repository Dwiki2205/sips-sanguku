// components/dashboard/BookingTrendChart.tsx
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';

interface BookingTrendChartProps {
  data: { month: string; count: number }[];
}

export default function BookingTrendChart({ data }: BookingTrendChartProps) {
  // Cari bulan dengan booking tertinggi untuk highlight
  const maxDataPoint = data.reduce((max, item) => item.count > (max?.count || 0) ? item : max, data[0] || null);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold text-gray-800">Trend Booking 6 Bulan Terakhir</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span>Jumlah Booking</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <AreaChart 
          data={data} 
          margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
        >
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
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
            interval="preserveStartEnd" // Pastikan label pertama & terakhir selalu muncul
          />

          <YAxis 
            tickLine={false}
            axisLine={false}
            tickMargin={16}
            tick={{ fontSize: 13, fill: '#6b7280' }}
            allowDecimals={false}
            domain={[0, 'auto']}
          />

          <Tooltip
            cursor={{ stroke: '#93c5fd', strokeWidth: 2 }}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
            }}
            labelStyle={{ color: '#1f2937', fontWeight: 'bold', marginBottom: '8px' }}
            formatter={(value: number) => [`${value} booking`, 'Jumlah']}
            labelFormatter={(label) => 
              new Date(label).toLocaleString('id-ID', { month: 'long', year: 'numeric' })
            }
          />

          <Area
            type="monotone"
            dataKey="count"
            stroke="#2563eb"
            strokeWidth={3.5}
            fillOpacity={1}
            fill="url(#colorGradient)"
            dot={false}
            activeDot={{
              r: 7,
              fill: '#fff',
              stroke: '#2563eb',
              strokeWidth: 3
            }}
            animationDuration={1400}
            animationEasing="ease-out"
            name="Jumlah Booking"
          />

          {/* Highlight titik tertinggi */}
          {maxDataPoint && (
            <ReferenceDot
              x={maxDataPoint.month}
              y={maxDataPoint.count}
              r={8}
              fill="#dc2626"
              stroke="#fff"
              strokeWidth={3}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      {/* Summary kecil di bawah chart */}
      {data.length > 0 && (
        <div className="mt-4 flex justify-between text-sm">
          <div className="text-gray-600">
            Total 6 bulan: <span className="font-bold text-gray-900">
              {data.reduce((sum, item) => sum + item.count, 0)} booking
            </span>
          </div>
          <div className="text-gray-600">
            Tertinggi:{' '}
            <span className="font-bold text-red-600">
              {maxDataPoint?.count} booking
            </span>{' '}
            ({new Date(maxDataPoint?.month || '').toLocaleString('id-ID', { month: 'long', year: 'numeric' })})
          </div>
        </div>
      )}
    </div>
  );
}