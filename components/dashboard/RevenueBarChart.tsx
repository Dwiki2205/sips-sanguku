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
  ReferenceArea,
  LabelList
} from 'recharts';

interface RevenueBarChartProps {
  data: { month: string; revenue: number }[];
}

// Format RB / JT otomatis
const formatShortCurrency = (value: number) => {
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)} Jt`;
  }
  if (value >= 1_000) {
    return `Rp ${(value / 1_000).toFixed(0)} Rb`;
  }
  return `Rp ${value}`;
};

export default function RevenueBarChart({ data }: RevenueBarChartProps) {

  // Ambil 3 bulan terakhir (sorting berdasarkan tanggal)
  const lastThreeMonthsData = [...data]
    .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())
    .slice(0, 3)
    .reverse();

  if (lastThreeMonthsData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-5">
          Pendapatan 3 Bulan Terakhir
        </h3>
        <div className="h-[340px] flex items-center justify-center text-gray-500">
          Tidak ada data pendapatan untuk 3 bulan terakhir
        </div>
      </div>
    );
  }

  // Total pendapatan
  const totalRevenue = lastThreeMonthsData.reduce(
    (sum, item) => sum + item.revenue,
    0
  );

  // Data tertinggi
  const maxDataPoint = lastThreeMonthsData.reduce((max, item) =>
    item.revenue > max.revenue ? item : max
  );

  // Warna bar
  const getBarColor = (entry: any) =>
    entry.month === maxDataPoint.month ? '#16a34a' : '#22c55e';

  // Format bulan singkat
  const formatMonthLabel = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${monthNames[parseInt(month) - 1]} ${year.slice(2)}`;
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
        <BarChart 
          data={lastThreeMonthsData}
          margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.6} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />

          <XAxis 
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={16}
            tick={{ fontSize: 13, fill: '#6b7280' }}
            tickFormatter={formatMonthLabel}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={16}
            tick={{ fontSize: 13, fill: '#6b7280' }}
            tickFormatter={(v) => formatShortCurrency(v)}
            domain={[0, 'auto']}
          />

          <Tooltip
            cursor={{ fill: '#dcfce7', opacity: 0.5 }}
            contentStyle={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
            }}
            formatter={(value: number) => [
              `Rp ${value.toLocaleString('id-ID')}`,
              'Pendapatan'
            ]}
            labelFormatter={(label) => {
              const [year, month] = label.split('-');
              const monthNames = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
              ];
              return `${monthNames[parseInt(month) - 1]} ${year}`;
            }}
          />

          <Bar
            dataKey="revenue"
            radius={[12, 12, 0, 0]}
            barSize={60}
            animationDuration={1200}
            animationEasing="ease-out"
          >
            {lastThreeMonthsData.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry)} />
            ))}

            {/* FIX TypeScript — formatter menerima any */}
            <LabelList
              dataKey="revenue"
              position="top"
              formatter={(value) => formatShortCurrency(Number(value))}
              style={{
                fontSize: 13,
                fontWeight: 'bold',
                fill: '#1f2937'
              }}
            />
          </Bar>

          <ReferenceArea
            x1={maxDataPoint.month}
            x2={maxDataPoint.month}
            y1={0}
            y2={maxDataPoint.revenue * 1.05}
            fill="#16a34a"
            opacity={0.15}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary bawah chart */}
      <div className="mt-5 flex justify-between text-sm">
        <div className="text-gray-600">
          Total Pendapatan 3 Bulan:{' '}
          <span className="font-bold text-xl text-green-600">
            Rp {totalRevenue.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="text-gray-600">
          Tertinggi:{' '}
          <span className="font-bold text-green-700">
            Rp {maxDataPoint.revenue.toLocaleString('id-ID')}
          </span>{' '}
          <span className="text-gray-500">
            ({formatMonthLabel(maxDataPoint.month)})
          </span>
        </div>
      </div>
    </div>
  );
}
