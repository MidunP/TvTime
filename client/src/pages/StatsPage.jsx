import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Flame, Play, Clock, CheckCircle, TrendingUp, Tv, Award, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#6c63ff', '#ff6b6b', '#4ade80', '#ffd700', '#60a5fa', '#a78bfa'];

function StatCard({ label, value, subtitle, icon: Icon, gradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card p-6 relative overflow-hidden ${gradient ? 'border-accent-violet/20' : ''}`}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-card opacity-50 pointer-events-none" />
      )}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-accent-violet/15 flex items-center justify-center">
            <Icon size={20} className="text-accent-violet" />
          </div>
        </div>
        <p className="text-3xl font-black text-white mb-0.5">{value}</p>
        <p className="text-sm font-semibold text-text-secondary">{label}</p>
        {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );
}

// GitHub-style heatmap
function WatchingHeatmap({ data }) {
  const weeks = [];
  const today = new Date();

  for (let w = 51; w >= 0; w--) {
    const week = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(date.getDate() - w * 7 - d);
      const key = date.toISOString().split('T')[0];
      week.push({ date: key, count: data?.[key] || 0 });
    }
    weeks.push(week);
  }

  const maxCount = Math.max(...Object.values(data || {}), 1);

  const getColor = (count) => {
    if (count === 0) return 'bg-bg-tertiary';
    const intensity = count / maxCount;
    if (intensity < 0.25) return 'bg-accent-violet/20';
    if (intensity < 0.5) return 'bg-accent-violet/40';
    if (intensity < 0.75) return 'bg-accent-violet/70';
    return 'bg-accent-violet';
  };

  return (
    <div>
      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
        <Calendar size={16} className="text-accent-violet" /> Watching Activity
      </h3>
      <div className="overflow-x-auto">
        <div className="flex gap-1" style={{ minWidth: 728 }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.count} episode${day.count !== 1 ? 's' : ''}`}
                  className={`w-3 h-3 rounded-sm transition-colors cursor-pointer hover:ring-1 hover:ring-accent-violet ${getColor(day.count)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
        <span>Less</span>
        <div className="flex gap-1">
          {['bg-bg-tertiary', 'bg-accent-violet/20', 'bg-accent-violet/40', 'bg-accent-violet/70', 'bg-accent-violet'].map((c) => (
            <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-strong rounded-xl px-3 py-2 text-xs border border-surface-border">
        <p className="text-white font-semibold">{label}</p>
        <p className="text-accent-violet">{payload[0].value} episodes</p>
      </div>
    );
  }
  return null;
};

export default function StatsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/stats').then((r) => r.data),
  });

  // Build bar chart data for last 7 days
  const getWeekData = () => {
    if (!stats?.heatmapData) return [];
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      days.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        episodes: stats.heatmapData[key] || 0,
      });
    }
    return days;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const weekData = getWeekData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Your Stats</h1>
        <p className="text-text-muted text-sm">All time watching statistics</p>
      </div>

      {/* Main stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Episodes Watched" value={stats?.totalEpisodes?.toLocaleString() || 0} icon={Play} gradient />
        <StatCard label="Hours Watched" value={`${stats?.hoursWatched?.toLocaleString() || 0}h`} subtitle="Keep going!" icon={Clock} />
        <StatCard label="Shows Completed" value={stats?.completedShows || 0} icon={CheckCircle} />
        <StatCard label="Shows Tracked" value={stats?.showsTracked || 0} icon={Tv} />
      </div>

      {/* Streak cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-6 text-center border-accent-coral/20">
          <div className="text-4xl mb-2">🔥</div>
          <p className="text-4xl font-black text-white">{stats?.currentStreak || 0}</p>
          <p className="text-sm text-text-muted mt-1">Current Streak (days)</p>
        </div>
        <div className="card p-6 text-center border-accent-gold/20">
          <div className="text-4xl mb-2">🏆</div>
          <p className="text-4xl font-black text-white">{stats?.longestStreak || 0}</p>
          <p className="text-sm text-text-muted mt-1">Longest Streak (days)</p>
        </div>
      </div>

      {/* This week bar chart */}
      <div className="card p-6">
        <h3 className="font-bold text-white mb-1 flex items-center gap-2">
          <TrendingUp size={16} className="text-accent-violet" /> This Week
        </h3>
        <p className="text-xs text-text-muted mb-5">{stats?.episodesThisWeek || 0} episodes in the last 7 days</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weekData} barSize={28}>
            <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="episodes" radius={[6, 6, 0, 0]}>
              {weekData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap */}
      {stats?.heatmapData && (
        <div className="card p-6">
          <WatchingHeatmap data={stats.heatmapData} />
        </div>
      )}
    </div>
  );
}
