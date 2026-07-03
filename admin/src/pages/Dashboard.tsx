// packages/admin/src/pages/Dashboard.tsx
// Premium dashboard page — Light Theme with real Firestore data

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Clock,
  ArrowUpRight,
  TrendingDown,
  DollarSign,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { getDashboardStats, getDashboardAnalytics } from '../services/adminService';
import { formatCurrency } from '@bazaarbasket/shared';

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const data = await getDashboardStats();
      localStorage.setItem('bb_dashboard_stats', JSON.stringify(data));
      return data;
    },
    initialData: () => {
      try {
        const cached = localStorage.getItem('bb_dashboard_stats');
        return cached ? JSON.parse(cached) : undefined;
      } catch (e) {
        return undefined;
      }
    },
    refetchInterval: 30000,
  });

  const { data: analytics } = useQuery({
    queryKey: ['dashboardAnalytics'],
    queryFn: getDashboardAnalytics,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 60000,
  });

  const isLoading = statsLoading && !stats;

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-100 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-100 rounded-2xl"></div>
          <div className="h-96 bg-gray-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl max-w-md mx-auto">
          Failed to load dashboard analytics. Ensure Firebase services are running.
        </div>
      </div>
    );
  }

  const revenueTrendData = analytics?.revenueTrend || [];
  const topProductsData = analytics?.topProducts || [];
  const statusDistributionData = analytics?.statusDistribution || [];
  const totalRevenue = analytics?.totalRevenue || 0;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome & Time Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time analytics for your Kirana business.
          </p>
        </div>
        <div className="text-sm bg-gray-50 border border-border px-4 py-2 rounded-xl text-muted-foreground font-medium">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-sm font-semibold text-muted-foreground">Revenue (7 days)</span>
              <h3 className="text-2xl font-bold">{formatCurrency(totalRevenue)}</h3>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <ArrowUpRight size={14} />
            <span>Last 7 days</span>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-sm font-semibold text-muted-foreground">Total Orders</span>
              <h3 className="text-2xl font-bold">{stats?.totalOrders}</h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600">
            <ArrowUpRight size={14} />
            <span>All time</span>
          </div>
        </div>

        {/* Pending Orders Card */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-sm font-semibold text-muted-foreground">Pending Orders</span>
              <h3 className="text-2xl font-bold">{stats?.pendingOrders}</h3>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-600">
            {stats && stats.pendingOrders > 10 ? (
              <>
                <TrendingUp size={14} />
                <span>Action Required</span>
              </>
            ) : (
              <>
                <TrendingDown size={14} />
                <span>Stable queue</span>
              </>
            )}
          </div>
        </div>

        {/* Total Users Card */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-sm font-semibold text-muted-foreground">Active Customers</span>
              <h3 className="text-2xl font-bold">{stats?.totalUsers}</h3>
            </div>
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600">
            <ArrowUpRight size={14} />
            <span>All time</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-lg font-bold">Revenue Trend</h4>
              <p className="text-xs text-muted-foreground">Weekly gross sales performance</p>
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-100">
              <TrendingUp size={12} />
              Last 7 Days
            </span>
          </div>
          <div className="h-80 w-full">
            {revenueTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip
                    contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                    itemStyle={{ color: '#10b981' }}
                    formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No order data yet. Revenue chart will populate as orders come in.
              </div>
            )}
          </div>
        </div>

        {/* Order Status Distribution Donut Chart */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="mb-6">
            <h4 className="text-lg font-bold">Order Breakdown</h4>
            <p className="text-xs text-muted-foreground">Status ratio of order execution</p>
          </div>
          <div className="h-64 w-full relative flex items-center justify-center">
            {statusDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    itemStyle={{ color: '#1e293b' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{stats?.totalOrders}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Total Orders</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {statusDistributionData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-medium text-muted-foreground truncate">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products Chart */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="mb-6">
          <h4 className="text-lg font-bold">Top Selling Products</h4>
          <p className="text-xs text-muted-foreground">Highest performing stock items</p>
        </div>
        <div className="h-80 w-full">
          {topProductsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={130} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  formatter={(val: number) => [val, 'Units Sold']}
                />
                <Bar dataKey="sales" radius={[0, 8, 8, 0]} barSize={16}>
                  {topProductsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No product sales data yet. Chart will populate as orders come in.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
