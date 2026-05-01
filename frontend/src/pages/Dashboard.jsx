import { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { FolderKanban, IndianRupee, Clock, CheckCircle } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="glass rounded-xl p-6 flex items-center justify-between card-hover border border-white/50 dark:border-gray-700/50">
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mt-2">{value}</h3>
    </div>
    <div className={`p-4 rounded-xl shadow-lg ${colorClass} bg-gradient-to-br`}>
      <Icon size={28} className="text-white" />
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/projects/dashboard');
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-center py-10 dark:text-white">Loading dashboard...</div>;
  if (!stats) return <div className="text-center py-10 text-red-500">Failed to load dashboard data.</div>;

  const pieData = {
    labels: ['Create Project', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [
          stats.statusBreakdown['Create Project'], 
          stats.statusBreakdown['In Progress'], 
          stats.statusBreakdown['Completed']
        ],
        backgroundColor: ['#6366f1', '#f59e0b', '#10b981'],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: stats.monthlyRevenue.map(m => m.name).reverse(),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: stats.monthlyRevenue.map(m => m.value).reverse(),
        backgroundColor: '#4f46e5',
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white flex items-center">
          <span className="text-gradient pr-2">Dashboard</span> Overview
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Projects" 
          value={stats.totalProjects} 
          icon={FolderKanban} 
          colorClass="from-indigo-500 to-purple-600" 
        />
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString()}`} 
          icon={IndianRupee} 
          colorClass="from-emerald-400 to-teal-500" 
        />
        <StatCard 
          title="In Progress" 
          value={stats.statusBreakdown['In Progress']} 
          icon={Clock} 
          colorClass="from-amber-400 to-orange-500" 
        />
        <StatCard 
          title="Completed" 
          value={stats.statusBreakdown['Completed']} 
          icon={CheckCircle} 
          colorClass="from-blue-400 to-cyan-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="lg:col-span-2 glass rounded-xl p-6 border border-white/50 dark:border-gray-700/50">
          <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-6">Monthly Revenue</h2>
          <div className="h-72">
            <Bar 
              data={barData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: 'rgba(156, 163, 175, 0.1)' } },
                  x: { grid: { display: false } }
                }
              }} 
            />
          </div>
        </div>

        <div className="glass rounded-xl p-6 border border-white/50 dark:border-gray-700/50">
          <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-6">Project Status</h2>
          <div className="h-72 flex justify-center items-center">
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
