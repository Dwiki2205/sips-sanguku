interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  description: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  description,
  trend 
}: StatsCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-2xl">{icon}</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-semibold text-gray-900">
                {value}
              </dd>
              <dt className="text-xs text-gray-500 mt-1">
                {description}
              </dt>
            </dl>
          </div>
        </div>
        {trend && (
          <div className={`mt-2 text-sm ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  );
}