import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ReportsTable from './components/ReportsTable';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'signup'
  const [currentTab, setCurrentTab] = useState('dashboard');

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  if (!token) {
    return currentView === 'login' ? (
      <Login setToken={setToken} switchView={() => setCurrentView('signup')} />
    ) : (
      <Signup switchView={() => setCurrentView('login')} />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* App லெவலில் உள்ள ஒரே ஒரு மெயின் நேவிகேஷன் பார் */}
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">EDABIP Analytics Dashboard</h1>
        <div className="space-x-4 flex items-center">
          <button 
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3 py-2 rounded font-medium ${currentTab === 'dashboard' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentTab('reports')}
            className={`px-3 py-2 rounded font-medium ${currentTab === 'reports' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Reports / Table
          </button>
          <button 
            onClick={() => setToken('')}
            className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {currentTab === 'dashboard' ? <Dashboard token={token} /> : <ReportsTable token={token} />}
      </main>
    </div>
  );
}