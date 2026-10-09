import React, { useEffect, useState } from 'react';

export default function ReportsTable({ token }) {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [username, setUsername] = useState('User');
  
  const [showModal, setShowModal] = useState(false);
  const [newTx, setNewTx] = useState({
    customer_name: '',
    category: 'SaaS',
    amount: '',
    status: 'Completed',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    // Decode token to get current logged-in username
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
  }, [token]);

  const fetchTransactions = () => {
    const queryParams = new URLSearchParams({ search, category }).toString();
    fetch(`http://localhost:8000/api/transactions?${queryParams}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, category, token]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newTx,
          amount: parseFloat(newTx.amount)
        })
      });

      if (res.ok) {
        setShowModal(false);
        setNewTx({
          customer_name: '',
          category: 'SaaS',
          amount: '',
          status: 'Completed',
          transaction_date: new Date().toISOString().split('T')[0]
        });
        fetchTransactions();
      } else {
        alert('Failed to add transaction');
      }
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner for Reports Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800"> Welcome Back, {username}! 👋</h2>
          
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-4">
        {/* Search, Filter and Add Record Button */}
        <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-2/3">
            <input 
              type="text" 
              placeholder="Search customer or status..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-gray-700"
            >
              <option value="All">All Categories</option>
              <option value="SaaS">SaaS</option>
              <option value="Cloud">Cloud</option>
              <option value="Support">Support</option>
              <option value="Finance">Finance</option>
              <option value="Analytics">Analytics</option>
            </select>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700 transition w-full md:w-auto shadow-sm"
          >
            + Add New Record
          </button>
        </div>

        {/* Modal for Adding New Transaction */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
              <h3 className="text-lg font-bold text-gray-800">Add New Transaction Record</h3>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Customer Name</label>
                  <input 
                    type="text" 
                    required
                    value={newTx.customer_name}
                    onChange={(e) => setNewTx({...newTx, customer_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                  <select 
                    value={newTx.category}
                    onChange={(e) => setNewTx({...newTx, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  >
                    <option value="SaaS">SaaS</option>
                    <option value="Cloud">Cloud</option>
                    <option value="Support">Support</option>
                    <option value="Finance">Finance</option>
                    <option value="Analytics">Analytics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Amount ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={newTx.amount}
                    onChange={(e) => setNewTx({...newTx, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. 500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <select 
                    value={newTx.status}
                    onChange={(e) => setNewTx({...newTx, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    value={newTx.transaction_date}
                    onChange={(e) => setNewTx({...newTx, transaction_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700 shadow-sm"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transactions Table with Clean Typography */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length > 0 ? transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-400">{tx.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{tx.customer_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">{tx.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-gray-900">${tx.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${tx.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-500">{tx.transaction_date}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm font-medium text-gray-400">No records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}