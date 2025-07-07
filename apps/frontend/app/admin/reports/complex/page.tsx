'use client';
import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { productApi, userApi } from '@/lib/adminApi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TABS = [
  { key: 'global', label: 'Global' },
  { key: 'periodic', label: 'Periodik' },
  { key: 'detail', label: 'Detail Order' },
  { key: 'topProducts', label: 'Produk Terlaris' },
  { key: 'topUsers', label: 'User Terbanyak' },
  { key: 'statusStats', label: 'Status Order' },
];

const ORDER_STATUSES = [
  '', 'dibayar', 'pembayaran_diterima', 'terkirim', 'menunggu_pembayaran', 'pesanan_dibuat', 'cancelled'
];

export default function ComplexReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('global');
  const [showExport, setShowExport] = useState(false);
  const [filter, setFilter] = useState({ start: '', end: '', status: '', user: '', product: '' });
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    userApi.getAll().then(res => setUsers(res.data));
    productApi.getAll().then(res => setProducts(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.start) params.append('start', filter.start);
    if (filter.end) params.append('end', filter.end);
    if (filter.status) params.append('status', filter.status);
    if (filter.user) params.append('user', filter.user);
    if (filter.product) params.append('product', filter.product);
    fetch('/api/reports/complex?' + params.toString())
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [filter]);

  const exportExcel = () => {
    if (!data) return;
    let rows = [];
    let sheetName = tab;
    if (tab === 'global') rows = [data.global];
    if (tab === 'periodic') rows = Object.entries(data.periodic).map(([period, d]: any) => ({ period, ...d }));
    if (tab === 'detail') rows = data.detail;
    if (tab === 'topProducts') rows = data.topProducts;
    if (tab === 'topUsers') rows = data.topUsers;
    if (tab === 'statusStats') rows = data.statusStats;
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `laporan-${sheetName}.xlsx`);
  };

  const exportPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    let head = [];
    let body = [];
    if (tab === 'global') {
      head = [['Total Order', 'Total Item', 'Total Revenue', 'Total Profit', 'Avg Order', 'Avg Profit']];
      body = [[data.global.totalOrder, data.global.totalItem, data.global.totalRevenue, data.global.totalProfit, data.global.avgOrderValue, data.global.avgProfitPerOrder]];
    }
    if (tab === 'periodic') {
      head = [['Periode', 'Order', 'Item', 'Revenue', 'Profit']];
      body = Object.entries(data.periodic).map(([period, d]: any) => [period, d.order, d.item, d.revenue, d.profit]);
    }
    if (tab === 'detail') {
      head = [['Order #', 'Tanggal', 'User', 'Status', 'Total', 'Laba']];
      body = data.detail.map((d: any) => [d.orderNumber, d.date, d.user, d.status, d.total, d.profit]);
    }
    if (tab === 'topProducts') {
      head = [['Produk', 'Terjual', 'Revenue', 'Laba']];
      body = data.topProducts.map((d: any) => [d.name, d.sold, d.revenue, d.profit]);
    }
    if (tab === 'topUsers') {
      head = [['User', 'Order', 'Total Belanja']];
      body = data.topUsers.map((d: any) => [d.userId, d.orderCount, d.totalSpent]);
    }
    if (tab === 'statusStats') {
      head = [['Status', 'Jumlah']];
      body = data.statusStats.map((d: any) => [d.status, d.count]);
    }
    doc.text(`Laporan ${TABS.find(t => t.key === tab)?.label}`, 14, 16);
    doc.autoTable({ startY: 22, head, body });
    doc.save(`laporan-${tab}.pdf`);
  };

  if (loading || !data) return <div className="text-white">Memuat laporan...</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold text-gradient mb-4">Laporan Super Lengkap</h1>
      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <div>
          <label className="block text-white/80 mb-1">Tanggal Mulai</label>
          <input type="date" value={filter.start} onChange={e => setFilter(f => ({ ...f, start: e.target.value }))} className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white" />
        </div>
        <div>
          <label className="block text-white/80 mb-1">Tanggal Akhir</label>
          <input type="date" value={filter.end} onChange={e => setFilter(f => ({ ...f, end: e.target.value }))} className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white" />
        </div>
        <div>
          <label className="block text-white/80 mb-1">Status</label>
          <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white">
            <option value="">Semua</option>
            {ORDER_STATUSES.filter(s => s).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-white/80 mb-1">User</label>
          <select value={filter.user} onChange={e => setFilter(f => ({ ...f, user: e.target.value }))} className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white">
            <option value="">Semua</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.username || u.email || u.id}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-white/80 mb-1">Produk</label>
          <select value={filter.product} onChange={e => setFilter(f => ({ ...f, product: e.target.value }))} className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white">
            <option value="">Semua</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>
      {/* Tabs & Export */}
      <div className="flex gap-2 mb-4">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded ${tab === t.key ? 'bg-neon-blue text-white' : 'bg-white/10 text-white/70'}`}>{t.label}</button>
        ))}
        <div className="relative">
          <button onClick={() => setShowExport(!showExport)} className="glass-button ml-2">Export</button>
          {showExport && (
            <div className="absolute z-10 bg-dark-900 border border-white/10 rounded shadow-lg mt-2">
              <button onClick={() => { exportExcel(); setShowExport(false); }} className="block w-full px-4 py-2 hover:bg-neon-blue/10 text-left">Export Excel</button>
              <button onClick={() => { exportPDF(); setShowExport(false); }} className="block w-full px-4 py-2 hover:bg-neon-blue/10 text-left">Export PDF</button>
            </div>
          )}
        </div>
      </div>
      {/* Tabel per tab */}
      {tab === 'global' && data.global && (
        <>
          <div className="glass-card p-6 border border-white/10 overflow-x-auto mb-8">
            <table className="w-full text-left">
              <thead>
                <tr className="text-white/80 border-b border-white/10">
                  <th>Total Order</th><th>Total Item</th><th>Total Revenue</th><th>Total Profit</th><th>Avg Order</th><th>Avg Profit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{data.global.totalOrder}</td>
                  <td>{data.global.totalItem}</td>
                  <td>Rp {data.global.totalRevenue.toLocaleString('id-ID')}</td>
                  <td>Rp {data.global.totalProfit.toLocaleString('id-ID')}</td>
                  <td>Rp {data.global.avgOrderValue.toLocaleString('id-ID')}</td>
                  <td>Rp {data.global.avgProfitPerOrder.toLocaleString('id-ID')}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Grafik tren penjualan & laba per bulan */}
          {data.periodic && Object.keys(data.periodic).length > 0 && (
            <div className="glass-card p-6 border border-white/10 mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gradient">Grafik Penjualan & Laba (Bulanan)</h2>
              <Line
                data={{
                  labels: Object.keys(data.periodic),
                  datasets: [
                    {
                      label: 'Revenue',
                      data: Object.values(data.periodic).map((d: any) => d.revenue),
                      borderColor: 'rgba(0, 200, 255, 1)',
                      backgroundColor: 'rgba(0, 200, 255, 0.2)',
                      tension: 0.3,
                    },
                    {
                      label: 'Profit',
                      data: Object.values(data.periodic).map((d: any) => d.profit),
                      borderColor: 'rgba(0, 255, 100, 1)',
                      backgroundColor: 'rgba(0, 255, 100, 0.2)',
                      tension: 0.3,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' as const },
                    title: { display: false },
                  },
                }}
                height={80}
              />
            </div>
          )}
        </>
      )}
      {tab === 'periodic' && data.periodic && Object.keys(data.periodic).length > 0 && (
        <>
          <div className="glass-card p-6 border border-white/10 overflow-x-auto mb-8">
            <table className="w-full text-left">
              <thead>
                <tr className="text-white/80 border-b border-white/10">
                  <th>Periode</th><th>Order</th><th>Item</th><th>Revenue</th><th>Profit</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.periodic).map(([period, d]: any) => (
                  <tr key={period}>
                    <td>{period}</td>
                    <td>{d.order}</td>
                    <td>{d.item}</td>
                    <td>Rp {d.revenue.toLocaleString('id-ID')}</td>
                    <td>Rp {d.profit.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Grafik tren periodik */}
          <div className="glass-card p-6 border border-white/10 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gradient">Grafik Penjualan & Laba (Bulanan)</h2>
            <Line
              data={{
                labels: Object.keys(data.periodic),
                datasets: [
                  {
                    label: 'Revenue',
                    data: Object.values(data.periodic).map((d: any) => d.revenue),
                    borderColor: 'rgba(0, 200, 255, 1)',
                    backgroundColor: 'rgba(0, 200, 255, 0.2)',
                    tension: 0.3,
                  },
                  {
                    label: 'Profit',
                    data: Object.values(data.periodic).map((d: any) => d.profit),
                    borderColor: 'rgba(0, 255, 100, 1)',
                    backgroundColor: 'rgba(0, 255, 100, 0.2)',
                    tension: 0.3,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' as const },
                  title: { display: false },
                },
              }}
              height={80}
            />
          </div>
        </>
      )}
      {tab === 'detail' && data.detail && data.detail.length > 0 && (
        <div className="glass-card p-6 border border-white/10 overflow-x-auto mb-8">
          <table className="w-full text-left">
            <thead>
              <tr className="text-white/80 border-b border-white/10">
                <th>Order #</th><th>Tanggal</th><th>User</th><th>Status</th><th>Total</th><th>Laba</th>
              </tr>
            </thead>
            <tbody>
              {data.detail.map((d: any, i: number) => (
                <tr key={i}>
                  <td>{d.orderNumber}</td>
                  <td>{d.date}</td>
                  <td>{d.user}</td>
                  <td>{d.status}</td>
                  <td>Rp {d.total.toLocaleString('id-ID')}</td>
                  <td>Rp {d.profit.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'topProducts' && data.topProducts && data.topProducts.length > 0 && (
        <div className="glass-card p-6 border border-white/10 overflow-x-auto mb-8">
          <table className="w-full text-left">
            <thead>
              <tr className="text-white/80 border-b border-white/10">
                <th>Produk</th><th>Terjual</th><th>Revenue</th><th>Laba</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((d: any, i: number) => (
                <tr key={i}>
                  <td>{d.name}</td>
                  <td>{d.sold}</td>
                  <td>Rp {d.revenue.toLocaleString('id-ID')}</td>
                  <td>Rp {d.profit.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'topUsers' && data.topUsers && data.topUsers.length > 0 && (
        <div className="glass-card p-6 border border-white/10 overflow-x-auto mb-8">
          <table className="w-full text-left">
            <thead>
              <tr className="text-white/80 border-b border-white/10">
                <th>User</th><th>Order</th><th>Total Belanja</th>
              </tr>
            </thead>
            <tbody>
              {data.topUsers.map((d: any, i: number) => (
                <tr key={i}>
                  <td>{d.userId}</td>
                  <td>{d.orderCount}</td>
                  <td>Rp {d.totalSpent.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'statusStats' && data.statusStats && data.statusStats.length > 0 && (
        <div className="glass-card p-6 border border-white/10 overflow-x-auto mb-8">
          <table className="w-full text-left">
            <thead>
              <tr className="text-white/80 border-b border-white/10">
                <th>Status</th><th>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {data.statusStats.map((d: any, i: number) => (
                <tr key={i}>
                  <td>{d.status}</td>
                  <td>{d.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 