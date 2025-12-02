// components/dashboard/MembershipPieChart.tsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  silver: '#94a3b8',
  gold: '#facc15',
  platinum: '#c084fc'
};

interface MembershipPieChartProps {
  data: { tier: string; count: number }[];
}

export default function MembershipPieChart({ data }: MembershipPieChartProps) {
  // Pastikan 3 tier selalu muncul
  const tiers = ["Silver", "Gold", "Platinum"];

  const normalizedData = tiers.map(tier => {
    const found = data.find(d => d.tier?.toLowerCase() === tier.toLowerCase());
    return {
      tier,
      count: found ? found.count : 0
    };
  });

  const total = normalizedData.reduce((sum, item) => sum + item.count, 0);

  const customLabel = (props: any) => {
    const { value, percent, cx, cy, midAngle, innerRadius, outerRadius } = props;

    if ((percent ?? 0) < 0.05) return null;

    const percentage = ((percent ?? 0) * 100).toFixed(1);
    const radius = innerRadius + (outerRadius - innerRadius) * 0.58;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="#000"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="14px"
        fontWeight="bold"
        className="drop-shadow-lg"
      >
        {value} ({percentage}%)
      </text>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-5">Distribusi Tier Membership (Active Only)</h3>

      <ResponsiveContainer width="100%" height={340}>
        <PieChart margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
          <Pie
            data={normalizedData}
            dataKey="count"
            nameKey="tier"
            cx="50%"
            cy="50%"
            outerRadius={120}
            innerRadius={78}
            cornerRadius={12}
            paddingAngle={3}
            animationDuration={1000}
            animationEasing="ease-out"
            labelLine={false}
            label={customLabel}
          >
            {normalizedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.tier.toLowerCase() === "silver"
                    ? COLORS.silver
                    : entry.tier.toLowerCase() === "gold"
                    ? COLORS.gold
                    : COLORS.platinum
                }
                stroke="#fff"
                strokeWidth={3}
              />
            ))}
          </Pie>

          {/* Total di tengah donut */}
          <text
            x="50%"
            y="47%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="28px"
            fontWeight="bold"
            fill="#1e293b"
          >
            {total}
          </text>
          <text
            x="50%"
            y="55%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14px"
            fill="#64748b"
          >
            Active Members
          </text>

          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}
            labelStyle={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '6px' }}
            formatter={(value: number, name: string) => [
              `${value} member (${total === 0 ? "0" : ((value / total) * 100).toFixed(1)}%)`,
              name
            ]}
          />

          <Legend
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: '30px' }}
            iconType="circle"
            iconSize={12}
            formatter={(value) => <span className="text-sm font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
