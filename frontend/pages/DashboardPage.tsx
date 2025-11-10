import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import { DownloadIcon, TrashIcon } from '../components/Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../App';
import { fetchSessions as apiFetchSessions, deleteSession as apiDeleteSession } from '../lib/api';

type DashboardSession = {
  id: number;
  name: string;
  timestamp: string;
  model_used: string;
  source: string;
  total_vehicles: number;
  car: number;
  van: number;
  truck: number;
  bus: number;
  avg_fps: number;
};

const StatCard: React.FC<{ title: string; value: string | number; icon?: React.ReactNode }> = ({ title, value, icon }) => (
  <Card className="flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    {icon && <div className="text-primary-500">{icon}</div>}
  </Card>
);

const DashboardPage: React.FC = () => {
  const [sessions, setSessions] = useState<DashboardSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { theme } = useTheme();

  // fetch from backend
  useEffect(() => {
    apiFetchSessions()
      .then((data) => setSessions(data.sessions || []))
      .catch((err) => {
        console.error('Failed to fetch sessions:', err);
        setSessions([]);
      });
  }, []);

  // search
  const filtered = useMemo(() => {
    if (!searchTerm) return sessions;
    const q = searchTerm.toLowerCase();
    return sessions.filter((s) =>
      (s.model_used || '').toLowerCase().includes(q) ||
      (s.timestamp || '').toLowerCase().includes(q) ||
      (s.source || '').toLowerCase().includes(q)
    );
  }, [sessions, searchTerm]);

  // stats / totals
  const totalVehiclesAll = filtered.reduce((sum, s) => sum + (s.total_vehicles || 0), 0);
  const mostUsedModel = useMemo(() => {
    if (sessions.length === 0) return 'N/A';
    const counts: Record<string, number> = {};
    sessions.forEach((s) => {
      counts[s.model_used] = (counts[s.model_used] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
  }, [sessions]);

  // chart: latest session only
  const latest = filtered[0];
  const chartData = latest
    ? [
        { type: 'Car', count: latest.car || 0 },
        { type: 'Van', count: latest.van || 0 },
        { type: 'Truck', count: latest.truck || 0 },
        { type: 'Bus', count: latest.bus || 0 },
      ]
    : [];

  // export helpers
  const getFormattedDate = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const handleExportJSON = () => {
    if (sessions.length === 0) return alert('No data to export.');
    const dataStr = JSON.stringify(sessions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sessions-export-${getFormattedDate()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (sessions.length === 0) return alert('No data to export.');
    const headers = [
      'id',
      'timestamp',
      'model_used',
      'avg_fps',
      'total_vehicles',
      'breakdown',
      'source',
    ];
    const rows = sessions.map((s) => {
      const breakdown = `Car ${s.car || 0}, Van ${s.van || 0}, Truck ${s.truck || 0}, Bus ${s.bus || 0}`;
      const safeSource = `"${(s.source || '').replace(/"/g, '""')}"`;
      return [
        s.id,
        s.timestamp,
        s.model_used,
        typeof s.avg_fps === 'number' ? s.avg_fps.toFixed(1) : '',
        s.total_vehicles,
        `"${breakdown}"`,
        safeSource,
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sessions-export-${getFormattedDate()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteSession = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) return;
    try {
      await apiDeleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.error(e);
      alert('There was an error deleting the session.');
    }
  };

  // theme colors for Recharts
  const themeColors = {
    light: { text: '#374151', grid: '#e5e7eb', tooltipBg: 'rgba(255, 255, 255, 0.9)', tooltipBorder: '#d1d5db' },
    dark: { text: '#d1d5db', grid: '#374151', tooltipBg: 'rgba(31, 41, 55, 0.9)', tooltipBorder: '#4b5563' },
  };
  const currentThemeColors = theme === 'dark' ? themeColors.dark : themeColors.light;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Sessions" value={sessions.length} />
        <StatCard title="Total Vehicles Detected" value={totalVehiclesAll.toLocaleString()} />
        <StatCard title="Most Used Model" value={mostUsedModel} />
        <StatCard title="Avg. Session Duration" value="—" />
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="w-full sm:w-1/2 lg:w-1/3">
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 py-2 border-gray-300 dark:border-gray-600 bg-slate-50 dark:bg-dark-bg rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleExportJSON}
              className="flex items-center space-x-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-dark-card"
            >
              <DownloadIcon /><span>Export JSON</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-white dark:focus:ring-offset-dark-card"
            >
              <DownloadIcon /><span>Export CSV</span>
            </button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-bold mb-4">Saved Sessions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs font-semibold text-gray-700 uppercase bg-slate-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Model</th>
                    <th className="px-6 py-3">Avg FPS (Processed)</th>
                    <th className="px-6 py-3">Total Vehicles</th>
                    <th className="px-6 py-3">Vehicle Count</th>
                    <th className="px-6 py-3">Source</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((s, idx) => {
                      const breakdown = `Car ${s.car || 0}, Van ${s.van || 0}, Truck ${s.truck || 0}, Bus ${s.bus || 0}`;
                      return (
                        <tr
                          key={s.id}
                          className={`border-b border-light-border dark:border-dark-border ${idx % 2 === 0 ? 'bg-white dark:bg-dark-card' : 'bg-slate-100 dark:bg-dark-border'} hover:bg-slate-200 dark:hover:bg-gray-700`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">{s.timestamp}</td>
                          <td className="px-6 py-4">{s.model_used}</td>
                          <td className="px-6 py-4">{typeof s.avg_fps === 'number' ? s.avg_fps.toFixed(1) : '—'}</td>
                          <td className="px-6 py-4">{(s.total_vehicles || 0).toLocaleString()}</td>
                          <td className="px-6 py-4">{breakdown}</td>
                          <td className="px-6 py-4">{s.source}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteSession(s.id)}
                              className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                              aria-label={`Delete session ${s.id}`}
                            >
                              <TrashIcon size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-gray-500">No sessions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Chart */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-bold mb-4">Vehicle Types (Latest Session)</h2>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={currentThemeColors.grid} />
                  <XAxis dataKey="type" tick={{ fill: currentThemeColors.text }} fontSize={12} />
                  <YAxis tick={{ fill: currentThemeColors.text }} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: currentThemeColors.tooltipBg,
                      borderColor: currentThemeColors.tooltipBorder,
                      color: currentThemeColors.text,
                    }}
                    cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
