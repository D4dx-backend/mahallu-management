import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiHome, FiInbox, FiDollarSign } from 'react-icons/fi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import StatCard from '@/components/ui/StatCard';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { dashboardService, DashboardStats } from '@/services/dashboardService';
import { ROUTES } from '@/constants/routes';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

// Dummy data for area chart
const AREA_DATA = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 500 },
  { name: 'Thu', value: 280 },
  { name: 'Fri', value: 590 },
  { name: 'Sat', value: 320 },
  { name: 'Sun', value: 450 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard statistics');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats
    ? [
        {
          title: 'Total Users',
          value: stats.users.total.toString(),
          icon: <FiUsers className="h-5 w-5" />,
          onClick: () => navigate(ROUTES.USERS.MAHALL),
        },
        {
          title: 'Total Families',
          value: stats.families.total.toString(),
          icon: <FiHome className="h-5 w-5" />,
          onClick: () => navigate(ROUTES.FAMILIES.LIST),
        },
        {
          title: 'Total Revenue',
          value: '₹ 12,500', // Dummy value as revenue might not be in stats
          icon: <FiDollarSign className="h-5 w-5" />,
          trend: { value: 12.5, isPositive: true },
        },
        {
          title: 'Institutes',
          value: '0',
          icon: <FiInbox className="h-5 w-5" />,
        },
      ]
    : [];

  const genderData = stats
    ? [
        { name: 'Male', value: stats.members.male },
        { name: 'Female', value: stats.members.female },
      ]
    : [];

  const familyStatusData = stats
    ? [
        { name: 'Approved', value: stats.families.approved },
        { name: 'Pending', value: stats.families.pending },
        { name: 'Unapproved', value: stats.families.unapproved },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <p className="text-red-600 dark:text-red-400 mb-4 text-lg">{error}</p>
        <button
          onClick={fetchStats}
          className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Dashboard
        </h1>
        <div className="hidden sm:block">
            {/* Action buttons could go here */}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <Card className="lg:col-span-2 h-full">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Attendance Timeline
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Weekly overview</p>
                </div>
            </div>
            <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={AREA_DATA}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#fff', 
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>

        {/* Latest Registrations / List */}
        <Card className="h-full">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Latest Registrations
                </h2>
                 <p className="text-sm text-gray-500 dark:text-gray-400">Recent family entries</p>
            </div>
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
                        <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                            {String.fromCharCode(64 + i)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                Family Name {i}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {i * 2} days ago
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
      </div>

      {/* Secondary Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="h-full">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Gender Distribution
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Overview of member demographics</p>
          </div>
          {genderData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              No data available
            </div>
          )}
        </Card>
        <Card className="h-full">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Family Status
            </h2>
             <p className="text-sm text-gray-500 dark:text-gray-400">Registration status overview</p>
          </div>
          {familyStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={familyStatusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              No data available
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

