import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Dashboard({ token }) {
  const [kpi, setKpi] = useState({ total_revenue: 0, active_users: 0, total_orders: 0 });
  const [chartData, setChartData] = useState([]);
  const [username, setUsername] = useState('User');

  useEffect(() => {
    // Decoding token to get the logged-in username simply
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload);
      if (decoded && decoded.sub) {
        setUsername(decoded.sub);
      }
    } catch (err) {
      console.error('Error decoding token:', err);
    }

    // Fetching dashboard KPI and chart data from backend
    fetch('http://localhost:8000/api/kpi', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setKpi(data.kpi);
        setChartData(data.chartData);
      })
      .catch(err => console.error('Error fetching dashboard data:', err));
  }, [token]);

  return (
    <div className="space-y-6">
      {/* Simple Welcome Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Welcome Back, {username}! 👋</h2>
          
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Total Revenue</span>
            <span className="text-xl">💰</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">${kpi.total_revenue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Active Users</span>
            <span className="text-xl">👥</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{kpi.active_users}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Total Orders</span>
            <span className="text-xl">📦</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{kpi.total_orders}</p>
        </div>
      </div>

      {/* Revenue Trend Line Chart with Smooth Curves */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Trend Over Time</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#4f46e5" 
                strokeWidth={3} 
                dot={{ r: 5, fill: '#4f46e5' }} 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}