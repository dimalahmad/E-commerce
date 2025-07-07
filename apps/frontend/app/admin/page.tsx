'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign,
  BarChart3,
  FileText,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  Boxes,
  Tag
} from 'lucide-react'
import { dashboardApi, orderApi, productApi, categoryApi, userApi } from '@/lib/adminApi'
import { DashboardData, DashboardOrder } from '@/types'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import Select from 'react-select'

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [stats, setStats] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<DashboardOrder[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)
  const pdfRef = useRef<HTMLDivElement>(null)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [isDark, setIsDark] = useState(false)

  // Fungsi untuk konversi selectedPeriod ke start & end date
  const getPeriodRange = (period: string) => {
    if (period === 'all') return null;
    const now = new Date()
    let start: Date
    if (period === '7d') start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    else if (period === '30d') start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    else if (period === '90d') start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    else if (period === '1y') start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    else start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return {
      start: start.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0],
    }
  }

  // Detect dark mode
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

  const periodOptions = [
    { value: 'all', label: 'Semua' },
    { value: '7d', label: '7 Hari Terakhir' },
    { value: '30d', label: '30 Hari Terakhir' },
    { value: '90d', label: '90 Hari Terakhir' },
    { value: '1y', label: '1 Tahun Terakhir' },
  ];

  useEffect(() => {
    setLoading(true)
    setError('')
    const range = getPeriodRange(selectedPeriod)
    const params = range ? { start: range.start, end: range.end } : {}
    Promise.all([
      productApi.getAll(),
      categoryApi.getAll(),
      userApi.getAll(),
      orderApi.getAll(),
      dashboardApi.getComplex(params),
    ])
      .then(([prodRes, catRes, userRes, orderRes, reportRes]) => {
        setProducts(prodRes.data)
        setCategories(catRes.data)
        setUsers(userRes.data)
        // Filter order by periode
        let filteredOrders = orderRes.data
        if (range) {
          filteredOrders = filteredOrders.filter((o: any) => {
            const d = new Date(o.createdAt)
            return d >= new Date(range.start) && d <= new Date(range.end)
          })
        }
        setOrders(filteredOrders)
        const data: DashboardData = reportRes.data
        // Stats
        setStats([
  {
    label: 'Total Produk',
            value: prodRes.data.length,
    icon: Boxes,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    label: 'Kategori',
            value: catRes.data.length,
    icon: Tag,
    color: 'from-purple-500 to-pink-500',
  },
  {
    label: 'User/Konsumen',
            value: userRes.data.length,
    icon: Users,
    color: 'from-green-500 to-teal-500',
  },
  {
    label: 'Penjualan',
            value: filteredOrders.length,
    icon: BarChart3,
    color: 'from-yellow-400 to-orange-500',
  },
  {
    label: 'Keuntungan',
            value: 'Rp ' + (data?.global?.totalProfit || 0).toLocaleString('id-ID'),
    icon: DollarSign,
    color: 'from-pink-500 to-rose-500',
  },
        ])
        // Pesanan terbaru
        setRecentOrders(
          filteredOrders
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            .map((order: any) => ({
              id: order.orderNumber || order.id,
              orderNumber: order.orderNumber || order.id,
              customer: users.find(u => u.id === order.userId)?.username || order.userId || '-',
              product: order.items && order.items[0] ? products.find(p => p.id === order.items[0].productId)?.name || order.items[0].productId : '-',
              amount: order.total,
              status: order.status,
              date: order.createdAt ? order.createdAt.split('T')[0] : '-',
            }))
        )
        // Produk terlaris dari laporan
        setTopProducts(
          (data.topProducts || []).slice(0, 5).map((p, i) => ({
            name: p.name,
            sales: p.sold,
            revenue: p.revenue,
            growth: '',
          }))
        )
      })
      .catch((e) => setError('Gagal memuat data dashboard: ' + e.message))
      .finally(() => setLoading(false))
  }, [selectedPeriod])

  // Export PDF
  const handleExportPDF = async () => {
    if (!pdfRef.current) return
    setExporting(true)
    try {
      pdfRef.current.style.display = 'block'
      pdfRef.current.style.position = 'absolute'
      pdfRef.current.style.left = '-9999px'
      pdfRef.current.style.top = '0'
      await new Promise(res => setTimeout(res, 100))
      const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true, backgroundColor: '#fff' })
      pdfRef.current.style.display = 'none'
      pdfRef.current.style.position = 'static'
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const imgWidth = pdfWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 10
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= (pdf.internal.pageSize.getHeight() - 20)
      while (heightLeft > 0) {
        pdf.addPage()
        position = 10 - heightLeft
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
        heightLeft -= (pdf.internal.pageSize.getHeight() - 20)
      }
      pdf.save(`dashboard-blangkis-${selectedPeriod}.pdf`)
    } catch (e) {
      alert('Gagal export PDF: ' + (e as any).message)
    } finally {
      setExporting(false)
    }
  }

  if (loading) return <div className="text-white p-8">Memuat dashboard...</div>
  if (error) return <div className="text-red-500 p-8">{error}</div>

  return (
    <div className="min-h-screen pt-16 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="bg-white dark:bg-gradient-to-r dark:from-dark-900 dark:to-dark-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl font-bold text-gradient">Dashboard Admin</h1>
              <p className="text-white/70 mt-1">Selamat datang di panel admin Blangkis</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Select
                options={periodOptions}
                value={periodOptions.find(opt => opt.value === selectedPeriod)}
                onChange={opt => setSelectedPeriod(opt?.value || 'all')}
                styles={customSelectStyles}
                className="w-44 text-sm"
                classNamePrefix="react-select-dark"
                isSearchable={false}
              />
              <button
                className="futuristic-button flex items-center gap-2"
                onClick={handleExportPDF}
                disabled={exporting}
              >
                <Download className="w-4 h-4" />
                <span>Export Laporan</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`glass-card p-6 flex flex-col items-center text-center shadow-neon border border-white/10 bg-gradient-to-br ${stat.color}`}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-white/10">
                <stat.icon className="w-7 h-7 text-gray-900 dark:text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-white/80 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 border dark:bg-dark-800 bg-white dark:text-white text-gray-900 dark:border-white/10 border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pesanan Terbaru</h2>
            </div>

            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={order.id} className="flex items-center justify-between p-4 glass rounded-lg bg-gray-100 dark:bg-dark-700">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">#{order.id}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-400/20 text-yellow-400' :
                        order.status === 'processing' ? 'bg-blue-400/20 text-blue-400' :
                        order.status === 'shipped' ? 'bg-purple-400/20 text-purple-400' :
                        'bg-green-400/20 text-green-400'
                      }`}>
                        {order.status === 'pending' ? 'Menunggu' :
                         order.status === 'processing' ? 'Diproses' :
                         order.status === 'shipped' ? 'Dikirim' : 'Diterima'}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-white/80 text-sm">{order.customer}</p>
                    <p className="text-gray-500 dark:text-white/60 text-xs">{order.product}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 dark:text-white font-medium">Rp {order.amount.toLocaleString()}</p>
                    <p className="text-gray-500 dark:text-white/60 text-xs">{order.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6 border dark:bg-dark-800 bg-white dark:text-white text-gray-900 dark:border-white/10 border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Produk Terlaris</h2>
            </div>

            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-4 glass rounded-lg bg-gray-100 dark:bg-dark-700">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-base md:text-lg font-medium text-gray-900 dark:text-white">{product.name}</p>
                      <p className="text-gray-700 dark:text-white/80 text-sm">{product.sales} terjual</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 dark:text-white font-medium">Rp {product.revenue.toLocaleString()}</p>
                    <p className="text-green-400 text-sm">{product.growth}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Ref for PDF export */}
      <div ref={pdfRef} style={{ display: 'none', width: 800, background: '#fff', color: '#000', padding: 40, fontFamily: 'Arial, sans-serif', position: 'relative', minHeight: '100vh' }}>
        {/* Watermark */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', fontSize: 120, color: '#f0f0f0', zIndex: 1, pointerEvents: 'none', opacity: 0.1 }}>BLANGKIS</div>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 30, borderBottom: '2px solid #333', paddingBottom: 20, position: 'relative', zIndex: 2 }}>
          <div style={{ backgroundColor: '#1e293b', color: 'white', padding: 20, borderRadius: 8, marginBottom: 20 }}>
            <h1 style={{ fontSize: 32, fontWeight: 'bold', margin: 0, color: 'white' }}>📊 BLANGKIS STORE</h1>
            <p style={{ fontSize: 14, margin: '10px 0 0 0', color: '#cbd5e1' }}>Dashboard Laporan</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 15, borderRadius: 8, border: '1px solid #e9ecef' }}>
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: 0, color: '#333' }}>RINGKASAN DASHBOARD</h2>
              <p style={{ fontSize: 14, margin: '5px 0 0 0', color: '#666' }}>Periode: {selectedPeriod === 'all' ? 'Semua' : (() => { const r = getPeriodRange(selectedPeriod); return r ? `${r.start} - ${r.end}` : 'Semua'; })()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 14, margin: 0, color: '#666' }}>Tanggal Laporan</p>
              <p style={{ fontSize: 16, fontWeight: 'bold', margin: '5px 0 0 0', color: '#333' }}>{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>
        {/* Stats Table */}
        <div style={{ marginBottom: 30, position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333', borderBottom: '1px solid #ddd', paddingBottom: 10 }}>Statistik Utama</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: 14, fontWeight: 'bold' }}>Metrik</th>
                <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: 14, fontWeight: 'bold' }}>Nilai</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat: any) => (
                <tr key={stat.label} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 12, fontSize: 14 }}>{stat.label}</td>
                  <td style={{ padding: 12, textAlign: 'right', fontSize: 14, fontWeight: 'bold' }}>{stat.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Recent Orders Table */}
        <div style={{ marginBottom: 30, position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333', borderBottom: '1px solid #ddd', paddingBottom: 10 }}>Pesanan Terbaru</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: 14, fontWeight: 'bold' }}>Order</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: 14, fontWeight: 'bold' }}>Pelanggan</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: 14, fontWeight: 'bold' }}>Produk</th>
                <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: 14, fontWeight: 'bold' }}>Total</th>
                <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: 14, fontWeight: 'bold' }}>Status</th>
                <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: 14, fontWeight: 'bold' }}>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order: any) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 12, fontSize: 14 }}>{order.orderNumber}</td>
                  <td style={{ padding: 12, fontSize: 14 }}>{order.customer}</td>
                  <td style={{ padding: 12, fontSize: 14 }}>{order.product}</td>
                  <td style={{ padding: 12, textAlign: 'right', fontSize: 14, fontWeight: 'bold' }}>Rp {order.amount?.toLocaleString('id-ID')}</td>
                  <td style={{ padding: 12, textAlign: 'center', fontSize: 14 }}>{order.status}</td>
                  <td style={{ padding: 12, textAlign: 'center', fontSize: 14 }}>{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Top Products Table */}
        <div style={{ marginBottom: 30, position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333', borderBottom: '1px solid #ddd', paddingBottom: 10 }}>Produk Terlaris</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: 14, fontWeight: 'bold' }}>Produk</th>
                <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: 14, fontWeight: 'bold' }}>Terjual</th>
                <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: 14, fontWeight: 'bold' }}>Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p: any) => (
                <tr key={p.name} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 12, fontSize: 14 }}>{p.name}</td>
                  <td style={{ padding: 12, textAlign: 'right', fontSize: 14 }}>{p.sales}</td>
                  <td style={{ padding: 12, textAlign: 'right', fontSize: 14, fontWeight: 'bold' }}>Rp {p.revenue?.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 40, paddingTop: 20, borderTop: '2px solid #e2e8f0', color: '#64748b', fontSize: 12 }}>
          Laporan dashboard Blangkis Store. Dicetak otomatis oleh sistem.
        </div>
      </div>
    </div>
  )
} 
 
 
 
 
 
 
 