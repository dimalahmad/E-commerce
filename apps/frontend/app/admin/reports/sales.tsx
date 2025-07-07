import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export default function SalesReport() {
  const [global, setGlobal] = useState<any>(null);
  const [periodic, setPeriodic] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/global').then(r => r.json()).then(setGlobal);
    fetch('/api/reports/periodic').then(r => r.json()).then(setPeriodic).finally(() => setLoading(false));
  }, []);

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    if (global) {
      const ws1 = XLSX.utils.json_to_sheet([{...global}]);
      XLSX.utils.book_append_sheet(wb, ws1, 'Global');
    }
    if (periodic) {
      const rows = Object.entries(periodic).map(([month, data]) => ({ month, ...data }));
      const ws2 = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws2, 'Periodik');
    }
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'laporan-penjualan.xlsx');
  };

  if (loading) return <div className="text-white">Memuat laporan...</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold text-gradient mb-4">Laporan Penjualan</h1>
      <button onClick={exportExcel} className="glass-button mb-4">Export Excel</button>
      <div className="glass-card p-6 border border-white/10 overflow-x-auto mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gradient">Laporan Global</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="text-white/80 border-b border-white/10">
              <th className="py-2">Total Qty</th>
              <th className="py-2">Total Penjualan</th>
              <th className="py-2">Total Laba</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2">{global?.totalQty}</td>
              <td className="py-2">Rp {global?.totalRevenue?.toLocaleString('id-ID')}</td>
              <td className="py-2">Rp {global?.totalProfit?.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="glass-card p-6 border border-white/10 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4 text-gradient">Laporan Periodik</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="text-white/80 border-b border-white/10">
              <th className="py-2">Bulan</th>
              <th className="py-2">Qty</th>
              <th className="py-2">Penjualan</th>
              <th className="py-2">Laba</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(periodic).map(([month, data]: any) => (
              <tr key={month} className="border-b border-white/5">
                <td className="py-2">{month}</td>
                <td className="py-2">{data.qty}</td>
                <td className="py-2">Rp {data.revenue.toLocaleString('id-ID')}</td>
                <td className="py-2">Rp {data.profit.toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 