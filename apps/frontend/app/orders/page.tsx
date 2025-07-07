"use client";
import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Package, Truck, CheckCircle, Clock, Eye, Download, Upload } from 'lucide-react';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import toast from 'react-hot-toast';

const statusConfig = {
  pesanan_dibuat: {
    label: 'Pesanan Dibuat', color: 'text-gray-400', bgColor: 'bg-gray-400/20', icon: Package },
  menunggu_pembayaran: {
    label: 'Menunggu Pembayaran', color: 'text-yellow-400', bgColor: 'bg-yellow-400/20', icon: Clock },
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
  const { user } = useAuthStore();
  console.log('USER DI STORE:', user);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [loadingInvoice, setLoadingInvoice] = useState<{[orderId: string]: boolean}>({});

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const allOrders = await apiClient.getOrders();
        console.log('ALL ORDERS:', allOrders);
        console.log('USER ID:', user.id);
        const userOrders = allOrders.filter((order: any) => String(order.userId) === String(user.id));
        console.log('USER ORDERS:', userOrders);
        setOrders(userOrders);
      } catch (err) {
        setOrders([]);
        setError("Gagal mengambil data order. Cek koneksi ke backend!");
        console.error('ERROR FETCH ORDERS:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  // Urutkan order dari terbaru
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders]);

  // Filter dan search
  const filteredOrders = useMemo(() => {
    return sortedOrders.filter(order => {
      const matchSearch =
        order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        order.items.some((item: any) => (item.productName || item.product?.name || item.name || "").toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter ? order.status === statusFilter : true;
      return matchSearch && matchStatus;
    });
  }, [sortedOrders, search, statusFilter]);

  const normalizeOrderForInvoice = (order: any) => {
    return {
      ...order,
      items: order.items.map((item: any) => ({
        ...item,
        product: item.product || { name: item.productName || '-', description: item.productDescription || '-' },
        subtotal: item.subtotal !== undefined ? item.subtotal : item.price * item.quantity,
      })),
      paymentMethod: order.paymentMethod || {
        name: order.payment?.method || '-',
        type: order.payment?.type || order.payment?.status || '-',
      },
      shippingMethod: order.shippingMethod || {
        courier: order.shipping?.courier || '-',
        service: order.shipping?.service || '-',
        etd: order.shipping?.etd || '-',
      },
      shippingAddress: order.shippingAddress || {
        name: order.shipping?.name || '-',
        phone: order.shipping?.phone || '-',
        address: order.shipping?.address || '-',
        city: order.shipping?.city || '-',
        province: order.shipping?.province || '',
        postal_code: order.shipping?.postalCode || '-',
      },
      subtotal: order.subtotal !== undefined ? order.subtotal : order.items.reduce((sum: number, i: any) => sum + (i.subtotal !== undefined ? i.subtotal : i.price * i.quantity), 0),
    };
  };

  const handleDownloadInvoice = async (order: any) => {
    setLoadingInvoice(prev => ({ ...prev, [order.id]: true }));
    try {
      const normalized = normalizeOrderForInvoice(order);
      await generateInvoicePDF(normalized);
      toast.success('Invoice berhasil diunduh!');
    } catch (e) {
      toast.error('Gagal mengunduh invoice');
    } finally {
      setLoadingInvoice(prev => ({ ...prev, [order.id]: false }));
    }
  };

  if (!user) {
    return <div className="text-center py-16 text-white">Silakan login untuk melihat riwayat pesanan Anda.</div>;
  }

  return (
    <div className="min-h-screen pt-16 bg-white dark:bg-dark-900 text-gray-900 dark:text-white transition-colors duration-500">
      <div className="bg-gradient-to-r from-white to-gray-100 dark:from-dark-900 dark:to-dark-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Pesanan Saya</h1>
            <p className="text-gray-600 dark:text-white/70 mt-1">{filteredOrders.length} pesanan ditemukan</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <input
              type="text"
              placeholder="Cari order, produk..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="glass-input px-3 py-2 text-sm w-48 bg-white dark:bg-dark-800 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20"
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="glass-input px-3 py-2 text-sm bg-white dark:bg-dark-800 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20"
            >
              <option value="">Semua Status</option>
              <option value="pesanan_dibuat">Pesanan Dibuat</option>
              <option value="menunggu_pembayaran">Menunggu Pembayaran</option>
              <option value="menunggu_konfirmasi_pembayaran">Menunggu Konfirmasi Pembayaran</option>
              <option value="pembayaran_diterima">Pembayaran Diterima</option>
              <option value="sedang_diproses">Sedang Diproses</option>
              <option value="dalam_pengiriman">Dalam Pengiriman</option>
              <option value="terkirim">Terkirim</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="text-center py-4 text-red-400 font-bold">{error}</div>
        )}
        {loading ? (
          <div className="text-center py-8 text-gray-600 dark:text-white/70">Memuat pesanan...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-400 dark:text-white/50 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Belum Ada Pesanan</h2>
            <p className="text-gray-500 dark:text-white/60 mb-8">Anda belum memiliki pesanan apapun</p>
            <Link href="/products" className="futuristic-button">Mulai Belanja</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => {
              const status = statusConfig[order.status] || { label: order.status, color: 'text-gray-400', bgColor: 'bg-gray-400/20', icon: Package };
              const StatusIcon = status.icon;
              return (
                <div key={order.id} className="glass-card bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 shadow-md dark:shadow-lg flex flex-col md:flex-row gap-4 p-6 md:items-center md:justify-between">
                  {/* Kolom Gambar */}
                  <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-dark-700 rounded-lg">
                    {order.items[0]?.product?.image ? (
                      <img src={order.items[0].product.image} alt={order.items[0].product.name || order.items[0].productName} className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <span className="text-2xl">🎭</span>
                    )}
                  </div>
                  {/* Kolom Info Order & Item */}
                  <div className="flex-1 flex flex-col md:flex-row md:items-center md:gap-8">
                    <div className="flex-1 min-w-[200px] mb-4 md:mb-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Order #{order.orderNumber || order.id}</h3>
                      <p className="text-gray-500 dark:text-white/60 text-sm mb-2">{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-white/60">Total Items</p>
                          <p className="text-gray-900 dark:text-white font-semibold">{order.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)} item</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-white/60">Total Pembayaran</p>
                          <p className="text-neon-blue font-bold">{formatPrice(order.total)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-white/60">Status Pembayaran</p>
                          <p className="text-gray-900 dark:text-white font-semibold">{order.payment?.status || '-'}</p>
                        </div>
                      </div>
                    </div>
                    {/* Kolom Produk */}
                    <div className="flex-1 min-w-[180px] mb-4 md:mb-0">
                      <p className="text-gray-500 dark:text-white/60 text-sm mb-2">Produk:</p>
                      <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item: any, idx: number) => (
                          <span key={idx} className="text-gray-900 dark:text-white/80 text-sm">
                            {(item.product?.name || item.productName || item.name) + ' (' + item.quantity + ')'}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-gray-500 dark:text-white/60 text-sm">+{order.items.length - 3} produk lainnya</span>
                        )}
                      </div>
                    </div>
                    {/* Kolom Status */}
                    <div className="flex flex-col items-start md:items-center justify-center min-w-[140px] mb-4 md:mb-0">
                      <div className={`flex items-center px-3 py-1 rounded-full ${status.bgColor} border border-gray-200 dark:border-white/10 mb-2`}>
                        <StatusIcon className={`w-4 h-4 mr-2 ${status.color}`} />
                        <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                      </div>
                    </div>
                  </div>
                  {/* Kolom Aksi */}
                  <div className="flex flex-col gap-2 items-stretch md:items-end min-w-[120px]">
                    <Link href={`/orders/${order.id}`} className="glass-button text-sm bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 w-full md:w-auto flex flex-col items-center justify-center gap-1 py-3">
                      <Eye className="w-5 h-5 mb-1" />
                      <span>Detail</span>
                    </Link>
                    <button
                      className={`glass-button text-sm w-full md:w-auto flex flex-col items-center justify-center gap-1 py-3 font-semibold border ${loadingInvoice[order.id] ? 'bg-blue-300 dark:bg-blue-900 text-white cursor-wait' : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 text-white border-blue-500 dark:border-blue-700'}`}
                      onClick={() => handleDownloadInvoice(order)}
                      disabled={loadingInvoice[order.id]}
                      type="button"
                    >
                      <Download className="w-5 h-5 mb-1" />
                      <span>{loadingInvoice[order.id] ? 'Mengunduh...' : 'Invoice'}</span>
                    </button>
                    {order.status === 'menunggu_pembayaran' && (
                      <Link href={`/orders/${order.id}`} className="glass-button text-sm bg-neon-blue hover:bg-neon-blue/80 text-white w-full md:w-auto flex flex-col items-center justify-center gap-1 py-3">
                        <Upload className="w-5 h-5 mb-1" />
                        <span>Upload Bukti</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 