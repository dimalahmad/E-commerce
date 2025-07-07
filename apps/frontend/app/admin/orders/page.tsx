"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Package, Clock, CheckCircle, Truck, Home } from 'lucide-react';
import Select from 'react-select';

interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    productName?: string;
  }>;
  shipping: {
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  payment: {
    method: string;
    status: string;
    proofUrl?: string;
  };
  status: string;
  total: number;
  shippingCost: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  username: string;
  email: string;
}

const ORDER_STATUSES = [
  { value: 'pesanan_dibuat', label: 'Pesanan Dibuat' },
  { value: 'menunggu_pembayaran', label: 'Menunggu Pembayaran' },
  { value: 'menunggu_konfirmasi_pembayaran', label: 'Menunggu Konfirmasi Pembayaran' },
  { value: 'pembayaran_diterima', label: 'Pembayaran Diterima' },
  { value: 'sedang_diproses', label: 'Sedang Diproses' },
  { value: 'dalam_pengiriman', label: 'Dalam Pengiriman' },
  { value: 'terkirim', label: 'Terkirim' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  pesanan_dibuat: {
    label: 'Pesanan Dibuat', color: 'text-gray-400', bgColor: 'bg-gray-400/20', icon: Package },
  menunggu_pembayaran: {
    label: 'Menunggu Pembayaran', color: 'text-yellow-400', bgColor: 'bg-yellow-400/20', icon: Clock },
  menunggu_konfirmasi_pembayaran: {
    label: 'Menunggu Konfirmasi Pembayaran', color: 'text-blue-400', bgColor: 'bg-blue-400/20', icon: Clock },
  pembayaran_diterima: {
    label: 'Pembayaran Diterima', color: 'text-blue-400', bgColor: 'bg-blue-400/20', icon: CheckCircle },
  sedang_diproses: {
    label: 'Sedang Diproses', color: 'text-orange-400', bgColor: 'bg-orange-400/20', icon: Package },
  dalam_pengiriman: {
    label: 'Dalam Pengiriman', color: 'text-purple-400', bgColor: 'bg-purple-400/20', icon: Truck },
  terkirim: {
    label: 'Terkirim', color: 'text-green-400', bgColor: 'bg-green-400/20', icon: CheckCircle },
  cancelled: {
    label: 'Dibatalkan', color: 'text-red-400', bgColor: 'bg-red-400/20', icon: Clock },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showItems, setShowItems] = useState<Order|null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, []);

  // Detect dark mode
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/orders');
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.username : 'Unknown User';
  };

  const getStatusIcon = (status: string) => {
    const conf = statusConfig[status];
    return conf ? <conf.icon className={`w-4 h-4 ${conf.color}`} /> : <Package className="w-4 h-4 text-gray-500" />;
  };

  const getStatusText = (status: string) => statusConfig[status]?.label || status;

  const getStatusColor = (status: string) => statusConfig[status]?.bgColor + ' ' + statusConfig[status]?.color || 'bg-gray-500/20 text-gray-300';

  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const filteredOrders = sortedOrders.filter(order => {
    const matchesSearch =
      (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUserName(order.userId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.items || []).some(item => (item.productName || '').toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / perPage) || 1;
  const paginatedOrders = filteredOrders.slice((page - 1) * perPage, page * perPage);

  useEffect(() => { setPage(1); }, [searchTerm, statusFilter, perPage]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: isDark ? '#181f2a' : '#fff',
      color: isDark ? '#fff' : '#222',
      borderColor: state.isFocused ? (isDark ? '#38bdf8' : '#2563eb') : (isDark ? '#334155' : '#d1d5db'),
      boxShadow: state.isFocused ? `0 0 0 2px ${isDark ? '#38bdf8' : '#2563eb'}` : undefined,
      minHeight: '40px',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? '#181f2a' : '#fff',
      color: isDark ? '#fff' : '#222',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? (isDark ? '#2563eb' : '#e0e7ff')
        : (isDark ? '#181f2a' : '#fff'),
      color: isDark ? '#fff' : '#222',
      cursor: 'pointer',
    }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? '#fff' : '#222',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: isDark ? '#fff' : '#222',
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: isDark ? '#334155' : '#d1d5db',
    }),
    input: (base) => ({
      ...base,
      color: isDark ? '#fff' : '#222',
    }),
  };

  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    ...ORDER_STATUSES.map(s => ({ value: s.value, label: s.label }))
  ];
  const perPageOptions = [
    { value: 10, label: '10 / halaman' },
    { value: 20, label: '20 / halaman' },
    { value: 50, label: '50 / halaman' },
  ];

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <p className="text-white/70 mt-2">Memuat order...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gradient mb-4">Kelola Order</h1>
      <p className="text-white/70 mb-6">Kelola semua pesanan pelanggan.</p>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="Cari order number atau nama pelanggan..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded px-3 py-2 text-gray-900 dark:text-white w-48"
        />
        <Select
          options={statusOptions}
          value={statusOptions.find(opt => opt.value === statusFilter)}
          onChange={opt => setStatusFilter(opt?.value || 'all')}
          styles={customSelectStyles}
          className="w-44 text-sm"
          classNamePrefix="react-select-dark"
          isSearchable={false}
        />
        <Select
          options={perPageOptions}
          value={perPageOptions.find(opt => opt.value === perPage)}
          onChange={opt => opt && setPerPage(opt.value)}
          styles={customSelectStyles}
          className="w-44 text-sm"
          classNamePrefix="react-select-dark"
          isSearchable={false}
        />
      </div>

      {/* Orders Table */}
      <div className="glass-card p-6 bg-white dark:bg-[#181f2a] border border-gray-200 dark:border-white/10 overflow-x-auto rounded-2xl shadow-lg">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs font-bold text-gray-700 dark:text-white/80 uppercase tracking-wider bg-gray-50 dark:bg-white/5">
              <th className="px-6 py-3">Order Number</th>
              <th className="px-6 py-3">Pelanggan</th>
              <th className="px-6 py-3">Item</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Tanggal</th>
              <th className="px-6 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-white/50">
                  Tidak ada order ditemukan
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">
                    {order.orderNumber || order.id}
                    <div className="text-sm text-gray-500 dark:text-white/50 font-normal">{order.items.length} item(s)</div>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                    {getUserName(order.userId)}
                    <div className="text-sm text-gray-500 dark:text-white/50 font-normal">{order.shipping.city}</div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="bg-gray-100 text-gray-700 hover:bg-gray-200 rounded px-2 py-1 text-xs font-semibold transition dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                      onClick={() => setShowItems(order)}
                    >
                      Lihat Item
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-4 py-1 rounded-full font-semibold text-sm ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                    {formatCurrency(order.total)}
                    <div className="text-sm text-gray-500 dark:text-white/50 font-normal">+ {formatCurrency(order.shippingCost)} ongkir</div>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white text-sm">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`/admin/orders/${order.id}`}
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-neon-blue dark:text-white dark:hover:bg-neon-blue/80 rounded px-3 py-1 font-semibold flex items-center gap-1 transition"
                    >
                      <Eye className="w-4 h-4" />
                      Detail
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="text-gray-700 dark:text-white/70 text-sm">
          Menampilkan {(page - 1) * perPage + 1} - {Math.min(page * perPage, filteredOrders.length)} dari {filteredOrders.length} order
        </div>
        <div className="flex gap-1">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="glass-button px-3 disabled:opacity-50">Prev</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`glass-button px-3 ${page === i + 1 ? 'bg-neon-blue text-white' : ''}`}>{i + 1}</button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="glass-button px-3 disabled:opacity-50">Next</button>
        </div>
      </div>
      {showItems && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setShowItems(null)}>
          <div className="bg-dark-900 rounded-lg p-6 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowItems(null)} className="absolute top-2 right-2 glass-button p-2 rounded-full">✕</button>
            <h2 className="text-xl font-semibold text-white mb-4">Daftar Item Order</h2>
            <ul className="space-y-2">
              {showItems.items.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center border-b border-white/10 py-2">
                  <span className="text-white font-medium">{item.productName}</span>
                  <span className="text-white/70 text-sm">Qty: {item.quantity}</span>
                  <span className="text-neon-blue font-semibold text-sm">{formatCurrency(item.price)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-center">
              <span>{formatCurrency(Number(showItems.total) - Number(showItems.shippingCost))}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 