'use client';
import { useEffect, useState, useRef } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import { productApi, userApi } from '@/lib/adminApi';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import toast from 'react-hot-toast';
import Select from 'react-select';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const TABS = [
  { key: 'global', label: 'Global' },
  { key: 'periodic', label: 'Periodik' },
  { key: 'penjualan', label: 'Penjualan' },
  { key: 'pendapatan', label: 'Pendapatan' },
  { key: 'detail', label: 'Detail Order' },
  { key: 'topProducts', label: 'Produk Terlaris' },
  { key: 'topUsers', label: 'User Terbanyak' },
  { key: 'statusStats', label: 'Status Order' },
];

const ORDER_STATUSES = [
  '', 'dibayar', 'pembayaran_diterima', 'terkirim', 'menunggu_pembayaran', 'pesanan_dibuat', 'cancelled'
];

type AnyRow = Record<string, any>;

export default function SalesReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('global');
  const [showExport, setShowExport] = useState(false);
  const [filter, setFilter] = useState({ start: '', end: '', status: '', user: '', product: '', search: '', perPage: 10 });
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    userApi.getAll().then(res => setUsers(res.data));
    productApi.getAll().then(res => setProducts(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (filter.start) params.append('start', filter.start);
    if (filter.end) params.append('end', filter.end);
    if (filter.status) params.append('status', filter.status);
    if (filter.user) params.append('user', filter.user);
    if (filter.product) params.append('product', filter.product);
    fetch('http://localhost:4000/api/reports/complex?' + params.toString())
      .then(r => {
        if (!r.ok) throw new Error('Gagal fetch laporan');
        return r.json();
      })
      .then(setData)
      .catch(e => { setError(e.message); setData(null); })
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const customSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: isDark ? '#181f2a' : '#fff',
      color: isDark ? '#fff' : '#222',
      borderColor: state.isFocused ? (isDark ? '#38bdf8' : '#2563eb') : (isDark ? '#334155' : '#d1d5db'),
      boxShadow: state.isFocused ? `0 0 0 2px ${isDark ? '#38bdf8' : '#2563eb'}` : undefined,
      minHeight: '40px',
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: isDark ? '#181f2a' : '#fff',
      color: isDark ? '#fff' : '#222',
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused
        ? (isDark ? '#2563eb' : '#e0e7ff')
        : (isDark ? '#181f2a' : '#fff'),
      color: isDark ? '#fff' : '#222',
      cursor: 'pointer',
    }),
    singleValue: (base: any) => ({
      ...base,
      color: isDark ? '#fff' : '#222',
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
      color: isDark ? '#fff' : '#222',
    }),
    indicatorSeparator: (base: any) => ({
      ...base,
      backgroundColor: isDark ? '#334155' : '#d1d5db',
    }),
    input: (base: any) => ({
      ...base,
      color: isDark ? '#fff' : '#222',
    }),
  };

  const perPageOptions = [
    { value: 10, label: '10 / halaman' },
    { value: 20, label: '20 / halaman' },
    { value: 50, label: '50 / halaman' },
  ];

  const exportExcel = () => {
    if (!data) return;
    let rows: AnyRow[] = [];
    let sheetName = tab;
    if (tab === 'global') rows = [data.global];
    if (tab === 'periodic') rows = Object.entries(data.periodic).map(([period, d]: any) => ({ period, ...d }));
    if (tab === 'penjualan') {
      rows = Object.entries(data.periodic).map(([period, d]: any) => ({ 
        periode: period, 
        totalOrder: d.order, 
        totalItem: d.item, 
        totalRevenue: d.revenue, 
        rataRataOrder: d.revenue / d.order 
      }));
      rows.push({
        periode: 'Total',
        totalOrder: data.global.totalOrder,
        totalItem: data.global.totalItem,
        totalRevenue: data.global.totalRevenue,
        rataRataOrder: data.global.avgOrderValue
      });
    }
    if (tab === 'pendapatan') {
      rows = Object.entries(data.periodic).map(([period, d]: any) => ({ 
        periode: period, 
        totalIncome: d.income, 
        totalProfit: d.profit, 
        marginProfit: ((d.profit / d.income) * 100).toFixed(2) + '%',
        rataRataProfitPerOrder: d.profit / d.order 
      }));
      rows.push({
        periode: 'Total',
        totalIncome: data.global.totalIncome,
        totalProfit: data.global.totalProfit,
        marginProfit: ((data.global.totalProfit / data.global.totalIncome) * 100).toFixed(2) + '%',
        rataRataProfitPerOrder: data.global.avgProfitPerOrder
      });
    }
    if (tab === 'detail') rows = data.detail;
    if (tab === 'topProducts') rows = data.topProducts;
    if (tab === 'topUsers') rows = data.topUsers;
    if (tab === 'statusStats') rows = data.statusStats;
    const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: false });
    // Tambahkan header style
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) {
        cell.s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '0070C0' } },
          alignment: { horizontal: 'center' }
        };
      }
    }
    // Auto width
    const colWidths = Object.keys(rows[0] || {}).map(key => ({ wch: Math.max(key.length, ...rows.map(r => (r[key] ? r[key].toString().length : 0))) + 2 }));
    ws['!cols'] = colWidths;
    // Freeze header
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };
    // Tambahkan judul di atas
    XLSX.utils.sheet_add_aoa(ws, [[`Laporan ${TABS.find(t => t.key === tab)?.label || tab} - Blangkis Store`]], { origin: 'A1' });
    // Geser data ke bawah 1 baris
    XLSX.utils.sheet_add_json(ws, rows, { origin: 'A3', skipHeader: false });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `laporan-${sheetName}.xlsx`);
  };

  const exportToPDF = async () => {
    if (!data || !pdfRef.current) return;
    
    setExporting(true);
    try {
      // Temporarily show the PDF container for rendering
      const pdfElement = pdfRef.current;
      pdfElement.style.display = 'block';
      pdfElement.style.position = 'absolute';
      pdfElement.style.left = '-9999px';
      pdfElement.style.top = '0';
      
      // Wait a bit for the content to render
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(pdfElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: pdfElement.scrollHeight,
        logging: false,
        removeContainer: false
      });

      // Hide the PDF container again
      pdfElement.style.display = 'none';
      pdfElement.style.position = 'static';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10; // 10mm top margin

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);
      }

      // Save the PDF with a descriptive filename
      const fileName = `laporan-${tab}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      // Show success message
      toast.success('PDF berhasil diekspor!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Gagal mengekspor PDF. Silakan coba lagi.');
      
      // Make sure to hide the PDF container even if there's an error
      if (pdfRef.current) {
        pdfRef.current.style.display = 'none';
        pdfRef.current.style.position = 'static';
      }
    } finally {
      setExporting(false);
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? (user.username || user.email || user.id) : userId;
  };

  if (loading) return <div className="text-white">Memuat laporan...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!data) return <div className="text-yellow-500">Tidak ada data laporan.<br/><pre>{JSON.stringify(data, null, 2)}</pre></div>;

  // Grafik data global & periodik di atas (didefinisikan setelah data ada)
  const globalChartData = {
    labels: ['Total Order', 'Total Item', 'Total Revenue', 'Total Income', 'Total Profit', 'Avg Order', 'Avg Profit'],
    datasets: [
      {
        label: 'Nilai',
        data: [
          data.global.totalOrder,
          data.global.totalItem,
          data.global.totalRevenue,
          data.global.totalIncome,
          data.global.totalProfit,
          data.global.avgOrderValue,
          data.global.avgProfitPerOrder
        ],
        backgroundColor: [
          '#00c8ff', '#00ff64', '#ffb300', '#ff6f00', '#ff005c', '#6f00ff', '#00bfff'
        ],
      },
    ],
  } as import('chart.js').ChartData<'bar', any[], string>;
  const periodLabels = Object.keys(data.periodic);
  const periodOrder = periodLabels.map(k => data.periodic[k].order);
  const periodRevenue = periodLabels.map(k => data.periodic[k].revenue);
  const periodIncome = periodLabels.map(k => data.periodic[k].income);
  const periodProfit = periodLabels.map(k => data.periodic[k].profit);
  const periodChartData = {
    labels: periodLabels,
    datasets: [
      {
        label: 'Order',
        data: periodOrder,
        borderColor: '#00c8ff',
        backgroundColor: 'rgba(0,200,255,0.2)',
        type: 'line',
        yAxisID: 'y',
      },
      {
        label: 'Revenue',
        data: periodRevenue,
        borderColor: '#ffb300',
        backgroundColor: 'rgba(255,179,0,0.2)',
        type: 'bar',
        yAxisID: 'y1',
      },
      {
        label: 'Income',
        data: periodIncome,
        borderColor: '#00ff64',
        backgroundColor: 'rgba(0,255,100,0.2)',
        type: 'bar',
        yAxisID: 'y1',
      },
      {
        label: 'Profit',
        data: periodProfit,
        borderColor: '#ff005c',
        backgroundColor: 'rgba(255,0,92,0.2)',
        type: 'bar',
        yAxisID: 'y1',
      },
    ],
  } as import('chart.js').ChartData<'bar', any[], string>;

  return (
    <div className="relative bg-white dark:bg-[#181f2a] rounded-2xl shadow-lg p-4 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-gradient mb-4">Laporan Penjualan</h1>
      {/* Tombol Export FAB di kanan atas, sticky dan menarik */}
      <div className="fixed top-24 right-8 z-30">
        <div className="relative group">
          <button
            onClick={() => setShowExport(!showExport)}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-blue to-blue-600 shadow-xl flex items-center justify-center text-white text-2xl hover:scale-110 transition-transform duration-150 border-4 border-white dark:border-dark-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Export"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5v-9m0 9l-3-3m3 3l3-3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">Export Laporan</span>
          {showExport && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-dark-900 border border-white/10 rounded shadow-lg z-40 overflow-hidden animate-fade-in">
              <button onClick={() => { exportExcel(); setShowExport(false); }} className="block w-full px-4 py-2 hover:bg-blue-100 dark:hover:bg-neon-blue/10 text-left text-dark-900 dark:text-white">Export Excel</button>
              <button 
                onClick={() => { exportToPDF(); setShowExport(false); }} 
                disabled={exporting}
                className={`block w-full px-4 py-2 hover:bg-blue-100 dark:hover:bg-neon-blue/10 text-left text-dark-900 dark:text-white ${exporting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {exporting ? 'Mengekspor PDF...' : 'Export PDF'}
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <div>
          <label className="block text-gray-700 dark:text-white/80 mb-1">Tanggal Mulai</label>
          <input type="date" value={filter.start} onChange={e => setFilter(f => ({ ...f, start: e.target.value }))} className="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-900 dark:bg-white/10 dark:border-white/20 dark:text-white" />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-white/80 mb-1">Tanggal Akhir</label>
          <input type="date" value={filter.end} onChange={e => setFilter(f => ({ ...f, end: e.target.value }))} className="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-900 dark:bg-white/10 dark:border-white/20 dark:text-white" />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-white/80 mb-1">Status</label>
          <Select
            options={[{ value: '', label: 'Semua Status' }, ...ORDER_STATUSES.filter(s => s).map(s => ({ value: s, label: s }))]}
            value={{ value: filter.status, label: filter.status || 'Semua Status' }}
            onChange={opt => setFilter(f => ({ ...f, status: opt?.value || '' }))}
            styles={customSelectStyles}
            className="w-44 text-sm"
            classNamePrefix="react-select-dark"
            isSearchable={false}
          />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-white/80 mb-1">User</label>
          <Select
            options={[{ value: '', label: 'Semua User' }, ...users.map(u => ({ value: u.id, label: u.username || u.email || u.id }))]}
            value={{ value: filter.user, label: users.find(u => u.id === filter.user)?.username || users.find(u => u.id === filter.user)?.email || 'Semua User' }}
            onChange={opt => setFilter(f => ({ ...f, user: opt?.value || '' }))}
            styles={customSelectStyles}
            className="w-44 text-sm"
            classNamePrefix="react-select-dark"
            isSearchable={true}
          />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-white/80 mb-1">Produk</label>
          <Select
            options={[{ value: '', label: 'Semua Produk' }, ...products.map(p => ({ value: p.id, label: p.name }))]}
            value={{ value: filter.product, label: products.find(p => p.id === filter.product)?.name || 'Semua Produk' }}
            onChange={opt => setFilter(f => ({ ...f, product: opt?.value || '' }))}
            styles={customSelectStyles}
            className="w-44 text-sm"
            classNamePrefix="react-select-dark"
            isSearchable={true}
          />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-white/80 mb-1">Per Halaman</label>
          <Select
            options={perPageOptions}
            value={perPageOptions.find(opt => opt.value === (filter.perPage || 10))}
            onChange={opt => setFilter(f => ({ ...f, perPage: opt?.value || 10 }))}
            styles={customSelectStyles}
            className="w-44 text-sm"
            classNamePrefix="react-select-dark"
            isSearchable={false}
          />
        </div>
      </div>
      {/* Tabs & Export */}
      <div className="flex gap-2 mb-4">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded font-semibold transition-colors duration-150
              ${tab === t.key
                ? 'bg-neon-blue text-white shadow'
                : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/70'}
            `}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Grafik Global - hanya tampil di tab Global */}
      {tab === 'global' && (
      <div className="glass-card p-6 border border-white/10 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gradient">Ringkasan Global (Grafik)</h2>
        <Bar data={globalChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} height={80} />
      </div>
      )}
      
      {/* Grafik Periodik - hanya tampil di tab Periodik */}
      {tab === 'periodic' && (
      <div className="glass-card p-6 border border-white/10 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gradient">Grafik Penjualan, Pendapatan & Laba (Bulanan)</h2>
        <Bar data={periodChartData} options={{
          responsive: true,
          plugins: { legend: { position: 'top' }, title: { display: false } },
          scales: { y: { beginAtZero: true, position: 'left', title: { display: true, text: 'Order' } }, y1: { beginAtZero: true, position: 'right', title: { display: true, text: 'Nominal (Rp)' }, grid: { drawOnChartArea: false } } }
        }} height={100} />
      </div>
      )}
      
      {/* Tabel Global - hanya tampil di tab Global */}
      {tab === 'global' && (
      <div className="glass-card p-6 border border-white/10 overflow-x-auto mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gradient">Ringkasan Global (Tabel)</h2>
        <table className="w-full text-left">
          <thead>
              <tr className="text-xs font-bold text-gray-700 dark:text-white/80 uppercase tracking-wider bg-gray-50 dark:bg-white/5">
              <th>Total Order</th><th>Total Item</th><th>Total Revenue</th><th>Total Income</th><th>Total Profit</th><th>Avg Order</th><th>Avg Profit</th>
            </tr>
          </thead>
          <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/10 transition">
                <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">{data.global.totalOrder}</td>
                <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">{data.global.totalItem}</td>
                <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">Rp {data.global.totalRevenue.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">Rp {data.global.totalIncome.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">Rp {data.global.totalProfit.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">Rp {data.global.avgOrderValue.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">Rp {data.global.avgProfitPerOrder.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>
      </div>
      )}
      
      {/* Tabel Periodik - hanya tampil di tab Periodik */}
      {tab === 'periodic' && (
      <div className="glass-card p-6 border border-white/10 overflow-x-auto mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gradient">Ringkasan Periodik (Tabel)</h2>
        <table className="w-full text-left">
          <thead>
              <tr className="text-xs font-bold text-gray-700 dark:text-white/80 uppercase tracking-wider bg-gray-50 dark:bg-white/5">
              <th>Periode</th><th>Order</th><th>Item</th><th>Revenue</th><th>Income</th><th>Profit</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.periodic).map(([period, d]: any) => (
                <tr key={period} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/10 transition">
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">{period}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">{d.order}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">{d.item}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">Rp {d.revenue.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">Rp {d.income.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">Rp {d.profit.toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      
      {/* Tabel Penjualan - hanya tampil di tab Penjualan */}
      {tab === 'penjualan' && (
        <div className="glass-card p-6 border border-white/10 overflow-x-auto mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gradient">Laporan Penjualan</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-gray-700 dark:text-white/80 uppercase tracking-wider bg-gray-50 dark:bg-white/5">
                <th>Periode</th><th>Total Order</th><th>Total Item</th><th>Total Revenue</th><th>Rata-rata Order</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.periodic).map(([period, d]: any) => (
                <tr key={period} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/10 transition">
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">{period}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">{d.order}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">{d.item}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">Rp {d.revenue.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">Rp {(d.revenue / d.order).toLocaleString('id-ID')}</td>
                </tr>
              ))}
              <tr className="border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-white/10 font-bold">
                <td className="px-6 py-4 text-gray-900 dark:text-white font-bold">Total</td>
                <td className="px-6 py-4 text-gray-900 dark:text-white font-bold">{data.global.totalOrder}</td>
                <td className="px-6 py-4 text-gray-900 dark:text-white font-bold">{data.global.totalItem}</td>
                <td className="px-6 py-4 text-gray-900 dark:text-white font-bold">Rp {data.global.totalRevenue.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-gray-900 dark:text-white font-bold">Rp {data.global.avgOrderValue.toLocaleString('id-ID')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      
      {/* Tabel Pendapatan - hanya tampil di tab Pendapatan */}
      {tab === 'pendapatan' && (
        <div className="glass-card p-6 border border-white/10 overflow-x-auto mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gradient">Laporan Pendapatan</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-gray-700 dark:text-white/80 uppercase tracking-wider bg-gray-50 dark:bg-white/5">
                <th>Periode</th><th>Total Income</th><th>Total Profit</th><th>Margin Profit (%)</th><th>Rata-rata Profit per Order</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.periodic).map(([period, d]: any) => (
                <tr key={period} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/10 transition">
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">{period}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">Rp {d.income.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">Rp {d.profit.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">{((d.profit / d.income) * 100).toFixed(2)}%</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">Rp {(d.profit / d.order).toLocaleString('id-ID')}</td>
                </tr>
              ))}
              <tr className="border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-white/10 font-bold">
                <td className="px-6 py-4 text-gray-900 dark:text-white font-bold">Total</td>
                <td className="px-6 py-4 text-gray-900 dark:text-white font-bold">Rp {data.global.totalIncome.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-gray-900 dark:text-white font-bold">Rp {data.global.totalProfit.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">{((data.global.totalProfit / data.global.totalIncome) * 100).toFixed(2)}%</td>
                <td className="px-6 py-4 text-gray-900 dark:text-white font-bold">Rp {data.global.avgProfitPerOrder.toLocaleString('id-ID')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {tab === 'detail' && data.detail && data.detail.length > 0 && (
        <div className="glass-card p-6 border border-white/10 overflow-x-auto mb-8">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-gray-700 dark:text-white/80 uppercase tracking-wider bg-gray-50 dark:bg-white/5">
                <th>Order #</th><th>Tanggal</th><th>User</th><th>Status</th><th>Total</th><th>Laba</th>
              </tr>
            </thead>
            <tbody>
              {data.detail.map((d: any, i: number) => (
                <tr key={i} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/10 transition">
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">{d.orderNumber}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">{d.date}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">{d.user}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">{d.status}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">Rp {d.total.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">Rp {d.profit.toLocaleString('id-ID')}</td>
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
              <tr className="text-xs font-bold text-gray-700 dark:text-white/80 uppercase tracking-wider bg-gray-50 dark:bg-white/5">
                <th>Produk</th><th>Terjual</th><th>Revenue</th><th>Laba</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((d: any, i: number) => (
                <tr key={i} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/10 transition">
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">{d.name}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">{d.sold}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">Rp {d.revenue.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">Rp {d.profit.toLocaleString('id-ID')}</td>
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
              <tr className="text-xs font-bold text-gray-700 dark:text-white/80 uppercase tracking-wider bg-gray-50 dark:bg-white/5">
                <th>User</th><th>Order</th><th>Total Belanja</th>
              </tr>
            </thead>
            <tbody>
              {data.topUsers.map((d: any, i: number) => (
                <tr key={i} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/10 transition">
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">{getUserName(d.userId)}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">{d.orderCount}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">Rp {d.totalSpent.toLocaleString('id-ID')}</td>
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
              <tr className="text-xs font-bold text-gray-700 dark:text-white/80 uppercase tracking-wider bg-gray-50 dark:bg-white/5">
                <th>Status</th><th>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {data.statusStats.map((d: any, i: number) => (
                <tr key={i} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/10 transition">
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">{d.status}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">{d.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PDF Export Container - Hidden but used for PDF generation */}
      <div 
        ref={pdfRef} 
        className="hidden"
        style={{
          width: '800px',
          backgroundColor: '#ffffff',
          color: '#000000',
          padding: '40px',
          fontFamily: 'Arial, sans-serif',
          position: 'relative',
          minHeight: '100vh'
        }}
      >
        {/* Watermark */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-45deg)',
          fontSize: '120px',
          color: '#f0f0f0',
          zIndex: 1,
          pointerEvents: 'none',
          opacity: 0.1
        }}>
          BLANGKIS
        </div>

        {/* PDF Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '20px', position: 'relative', zIndex: 2 }}>
          <div style={{ 
            backgroundColor: '#1e293b', 
            color: 'white', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '20px' 
          }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0', color: 'white' }}>📊 BLANGKIS STORE</h1>
            <p style={{ fontSize: '14px', margin: '10px 0 0 0', color: '#cbd5e1' }}>Laporan Penjualan & Analisis</p>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#333' }}>LAPORAN {TABS.find(t => t.key === tab)?.label?.toUpperCase()}</h2>
              <p style={{ fontSize: '14px', margin: '5px 0 0 0', color: '#666' }}>Periode: {filter.start && filter.end ? `${filter.start} - ${filter.end}` : 'Semua Periode'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '14px', margin: '0', color: '#666' }}>Tanggal Laporan</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '5px 0 0 0', color: '#333' }}>
                {new Date().toLocaleDateString('id-ID', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* PDF Content based on selected tab */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          {tab === 'global' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                Ringkasan Global
              </h2>
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Metrik</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Nilai</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', fontSize: '14px' }}>Total Order</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>{data.global.totalOrder}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', fontSize: '14px' }}>Total Item</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>{data.global.totalItem}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', fontSize: '14px' }}>Total Revenue</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>Rp {data.global.totalRevenue.toLocaleString('id-ID')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', fontSize: '14px' }}>Total Income</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>Rp {data.global.totalIncome.toLocaleString('id-ID')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', fontSize: '14px' }}>Total Profit</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>Rp {data.global.totalProfit.toLocaleString('id-ID')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', fontSize: '14px' }}>Rata-rata Order</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>Rp {data.global.avgOrderValue.toLocaleString('id-ID')}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', fontSize: '14px' }}>Rata-rata Profit per Order</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>Rp {data.global.avgProfitPerOrder.toLocaleString('id-ID')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'periodic' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                Ringkasan Periodik
              </h2>
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Periode</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Order</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Item</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Revenue</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Income</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.periodic).map(([period, d]: any) => (
                      <tr key={period} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{period}</td>
                        <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>{d.order}</td>
                        <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>{d.item}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Rp {d.revenue.toLocaleString('id-ID')}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Rp {d.income.toLocaleString('id-ID')}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Rp {d.profit.toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'penjualan' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                Laporan Penjualan
              </h2>
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Periode</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Total Order</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Total Item</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Total Revenue</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Rata-rata Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.periodic).map(([period, d]: any) => (
                      <tr key={period} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{period}</td>
                        <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>{d.order}</td>
                        <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>{d.item}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Rp {d.revenue.toLocaleString('id-ID')}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Rp {(d.revenue / d.order).toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                    <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                      <td style={{ padding: '12px', fontSize: '14px' }}>Total</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>{data.global.totalOrder}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>{data.global.totalItem}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Rp {data.global.totalRevenue.toLocaleString('id-ID')}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Rp {data.global.avgOrderValue.toLocaleString('id-ID')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'pendapatan' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                Laporan Pendapatan
              </h2>
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Periode</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Total Income</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Total Profit</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Margin Profit (%)</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Rata-rata Profit per Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.periodic).map(([period, d]: any) => (
                      <tr key={period} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{period}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Rp {d.income.toLocaleString('id-ID')}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Rp {d.profit.toLocaleString('id-ID')}</td>
                        <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>{((d.profit / d.income) * 100).toFixed(2)}%</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Rp {(d.profit / d.order).toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                    <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                      <td style={{ padding: '12px', fontSize: '14px' }}>Total</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Rp {data.global.totalIncome.toLocaleString('id-ID')}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Rp {data.global.totalProfit.toLocaleString('id-ID')}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>{((data.global.totalProfit / data.global.totalIncome) * 100).toFixed(2)}%</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Rp {data.global.avgProfitPerOrder.toLocaleString('id-ID')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'detail' && data.detail && data.detail.length > 0 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                Detail Order
              </h2>
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Order #</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Tanggal</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>User</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Total</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Laba</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.detail.map((d: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{d.orderNumber}</td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{d.date}</td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{d.user}</td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{d.status}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Rp {d.total.toLocaleString('id-ID')}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Rp {d.profit.toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'topProducts' && data.topProducts && data.topProducts.length > 0 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                Produk Terlaris
              </h2>
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Produk</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Terjual</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Revenue</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Laba</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((d: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{d.name}</td>
                        <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>{d.sold}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Rp {d.revenue.toLocaleString('id-ID')}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Rp {d.profit.toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'topUsers' && data.topUsers && data.topUsers.length > 0 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                User Terbanyak
              </h2>
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>User</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Order</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Total Belanja</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topUsers.map((d: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{getUserName(d.userId)}</td>
                        <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>{d.orderCount}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Rp {d.totalSpent.toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'statusStats' && data.statusStats && data.statusStats.length > 0 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                Status Order
              </h2>
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold' }}>Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.statusStats.map((d: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{d.status}</td>
                        <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>{d.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* PDF Footer */}
        <div style={{ 
          marginTop: '40px', 
          borderTop: '1px solid #ddd', 
          paddingTop: '20px',
          position: 'relative', 
          zIndex: 2 
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            gap: '20px', 
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#333' }}>Informasi Kontak</h4>
              <p style={{ margin: '5px 0', fontSize: '12px' }}>📧 support@blangkis.com</p>
              <p style={{ margin: '5px 0', fontSize: '12px' }}>📞 +62 21 1234 5678</p>
              <p style={{ margin: '5px 0', fontSize: '12px' }}>🌐 www.blangkis.com</p>
            </div>
          </div>
          <div style={{ 
            borderTop: '1px solid #ddd', 
            paddingTop: '15px',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0', fontSize: '12px' }}>Dokumen ini dibuat secara otomatis pada {new Date().toLocaleDateString('id-ID', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>© 2024 Blangkis Store. Semua hak dilindungi.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 