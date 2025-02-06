import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell
} from 'recharts';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const AnalyticsDashboard = () => {
  const { code } = useParams();
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/analytics/${code}`);
        setAnalyticsData(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchData();
  }, [code]);

  if (!analyticsData) return <div>Loading...</div>;

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-gray-900 to-gray-800">
      <h2 className="text-2xl font-bold text-white">Estatísticas para: {code}</h2>
      
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Total de Cliques</h3>
        <p className="text-4xl font-bold text-blue-400">{analyticsData.totalClicks}</p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Cliques por Dia</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData.dailyClicks}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                itemStyle={{ color: '#E5E7EB' }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Fontes de Tráfego</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analyticsData.referrers}
                dataKey="count"
                nameKey="referrer"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {analyticsData.referrers.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={['#3B82F6', '#6366F1', '#10B981'][index % 3]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;