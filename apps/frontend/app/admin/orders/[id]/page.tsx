"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, Home, User, MapPin, Phone, CreditCard, Calendar, Eye, X } from 'lucide-react';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import toast from 'react-hot-toast';

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
  paymentProof?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  images: string[];
}

const ORDER_STATUSES = [
  { value: 'pesanan_dibuat', label: 'Pesanan Dibuat' },
  { value: 'menunggu_pembayaran', label: 'Menunggu Pembayaran' },
  { value: 'menunggu_konfirmasi_pembayaran', label: 'Menunggu Konfirmasi Pembayaran' },
  { value: 'pembayaran_diterima', label: 'Pembayaran Diterima' },
  { value: 'sedang_diproses', label: 'Sedang Diproses' },
  { value: 'dalam_pengiriman', label: 'Dalam Pengiriman' },
  { value: 'terkirim', label: 'Terkirim' },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showProof, setShowProof] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchOrderDetail(params.id as string);
      fetchUsers();
      fetchProducts();
    }
  }, [params.id]);

  const fetchOrderDetail = async (orderId: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/orders/${orderId}`);
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const getUser = (userId: string) => {
    return users.find(u => u.id === userId) || null;
  };

  const getProduct = (productId: string) => {
    return products.find(p => p.id === productId) || null;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'menunggu_pembayaran':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'dibayar':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'dikirim':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'sampai':
        return <Home className="w-5 h-5 text-purple-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'menunggu_pembayaran':
        return 'Menunggu Pembayaran';
      case 'dibayar':
        return 'Dibayar';
      case 'dikirim':
        return 'Dikirim';
      case 'sampai':
        return 'Sampai';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'menunggu_pembayaran':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'dibayar':
        return 'bg-green-500/20 text-green-300';
      case 'dikirim':
        return 'bg-blue-500/20 text-blue-300';
      case 'sampai':
        return 'bg-purple-500/20 text-purple-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`http://localhost:4000/api/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchOrderDetail(order.id);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
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

  const normalizeOrderForInvoice = (order: any, user: any) => {
    return {
      ...order,
      user,
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
        name: user?.username || '-',
        phone: order.shipping?.phone || '-',
        address: order.shipping?.address || '-',
        city: order.shipping?.city || '-',
        province: order.shipping?.province || '',
        postal_code: order.shipping?.postalCode || '-',
      },
      subtotal: order.subtotal !== undefined ? order.subtotal : order.items.reduce((sum: number, i: any) => sum + (i.subtotal !== undefined ? i.subtotal : i.price * i.quantity), 0),
    };
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    const currentUser = getUser(order.userId);
    try {
      const normalized = normalizeOrderForInvoice(order, currentUser);
      await generateInvoicePDF(normalized);
    } catch (e) {
      alert('Gagal mengunduh invoice');
    }
  };

  const copyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(order.orderNumber || order.id);
      toast.success('Nomor order disalin!');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <p className="text-white/70 mt-2">Memuat detail order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-white/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Order tidak ditemukan</h3>
          <p className="text-white/50">Order yang Anda cari tidak ada</p>
        </div>
      </div>
    );
  }

  const currentUser = getUser(order.userId);
  const paymentProofUrl = order.paymentProof || order.payment?.proofUrl;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.back()}
            className="glass-button p-2 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Detail Order</h1>
            <p className="text-gray-600 dark:text-white/70 mt-1">Order #{order.orderNumber || order.id}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-4">
          <button
            onClick={copyOrderNumber}
            className="glass-button text-sm bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 flex items-center justify-center gap-2"
          >
            <span className="flex items-center justify-center"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v16m16-8H4" /></svg></span>
            <span>Salin No. Order</span>
          </button>
          <button
            onClick={handleDownloadInvoice}
            className="glass-button text-sm bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 text-white border border-blue-500 dark:border-blue-700 flex items-center justify-center gap-2"
          >
            <span className="flex items-center justify-center"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg></span>
            <span>Invoice</span>
          </button>
          {paymentProofUrl && (
            <button
              onClick={() => setShowProof(true)}
              className="glass-button text-sm bg-neon-blue hover:bg-neon-blue/80 text-white flex items-center justify-center gap-2"
            >
              <span className="flex items-center justify-center"><Eye className="w-4 h-4" /></span>
              <span>Lihat Bukti Pembayaran</span>
            </button>
          )}
        </div>
      </div>

      {/* Stepper Status Horizontal Interaktif */}
      <div className="w-full flex flex-col items-center mb-4">
        <div className="flex w-full max-w-3xl justify-between items-end relative">
          {ORDER_STATUSES.map((opt, idx) => {
            const currentIdx = ORDER_STATUSES.findIndex(s => s.value === order.status);
            const isActive = idx === currentIdx;
            const isCompleted = idx < currentIdx;
            const isNext = idx === currentIdx + 1;
            const isLast = idx === ORDER_STATUSES.length - 1;
            const icon = isCompleted ? <CheckCircle className="w-6 h-6" /> :
              idx === 0 ? <Package className="w-6 h-6" /> :
              idx === 1 ? <Clock className="w-6 h-6" /> :
              idx === 2 ? <Clock className="w-6 h-6" /> :
              idx === 3 ? <CheckCircle className="w-6 h-6" /> :
              idx === 4 ? <Truck className="w-6 h-6" /> :
              idx === 5 ? <Truck className="w-6 h-6" /> :
              idx === 6 ? <Home className="w-6 h-6" /> :
              <Package className="w-6 h-6" />;
            return (
              <div key={opt.value} className="flex-1 flex flex-col items-center relative">
                {/* Icon Step, interaktif jika next step */}
                <button
                  type="button"
                  disabled={!isNext || updating}
                  onClick={isNext ? () => updateOrderStatus(opt.value) : undefined}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 mb-1 transition-all
                    ${isActive ? 'bg-neon-blue border-neon-blue text-white shadow-lg scale-110' : ''}
                    ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-white dark:bg-[#232b3e] border-gray-300 dark:border-[#2d3650] text-gray-400 dark:text-gray-500' : ''}
                    ${isNext && !updating ? 'cursor-pointer hover:scale-110 hover:border-neon-blue/80 hover:bg-neon-blue/80 hover:text-white dark:hover:border-neon-blue/80 dark:hover:bg-neon-blue/80 dark:hover:text-white' : 'cursor-default'}
                    ${updating && isNext ? 'opacity-60' : ''}
                  `}
                  title={isNext ? 'Klik untuk update status' : ''}
                >
                  {updating && isNext ? (
                    <span className="animate-spin w-6 h-6 border-b-2 border-white rounded-full"></span>
                  ) : icon}
                </button>
                {/* Label Step */}
                <span className={`text-xs md:text-sm text-center font-medium mt-1
                  ${isActive ? 'text-neon-blue' : isCompleted ? 'text-green-500' : 'text-gray-400 dark:text-white/80'}`}>{opt.label}</span>
                {/* Garis penghubung */}
                {!isLast && (
                  <div className={`absolute top-5 left-1/2 w-full h-1 -z-10
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-500/40'}
                  `}
                    style={{ width: '100%', height: 3, left: '50%', right: '-50%', transform: 'translateX(20px)', zIndex: -1 }}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showProof && paymentProofUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowProof(false)}>
          <div className="bg-dark-900 rounded-lg p-6 max-w-lg w-full relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowProof(false)} className="absolute top-2 right-2 glass-button p-2 rounded-full"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-semibold text-white mb-4">Bukti Pembayaran</h2>
            <img src={paymentProofUrl} alt="Bukti Pembayaran" className="w-full rounded-lg border border-white/10" />
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 md:gap-6">
        {/* Left: Order Info */}
        <div className="space-y-3 md:space-y-4">
          {/* Order Items */}
          <div className="glass-card bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 shadow-md dark:shadow-lg rounded-lg p-4 md:p-5 mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Item Pesanan</h2>
            <div className="space-y-3">
              {order.items.map((item, index) => {
                const product = getProduct(item.productId);
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                      {product?.images?.[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-7 h-7 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white text-base">
                        {product?.name || `Product ${item.productId}`}
                      </h3>
                      <p className="text-sm text-gray-900 dark:text-white/80">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white text-base">{formatCurrency(item.price)}</p>
                      <p className="text-sm text-gray-900 dark:text-white/80">Total: {formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="glass-card bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 shadow-md dark:shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Informasi Pengiriman</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-neon-blue" />
                  <h3 className="font-medium text-gray-900 dark:text-white">Alamat Pengiriman</h3>
                </div>
                <div className="space-y-1 text-gray-900 dark:text-white/80">
                  <p className="font-medium">{order.shipping?.name || '-'}</p>
                  <p>{order.shipping?.email || '-'}</p>
                  <p>{order.shipping?.phone || '-'}</p>
                  <p>{order.shipping?.address || '-'}</p>
                  <p>{order.shipping?.city || '-'}{order.shipping?.province ? `, ${order.shipping.province}` : ''}</p>
                  <p>Kode Pos: {order.shipping?.postalCode || '-'}</p>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="w-5 h-5 text-neon-purple" />
                  <h3 className="font-medium text-gray-900 dark:text-white">Metode Pengiriman</h3>
                </div>
                <div className="space-y-1 text-gray-900 dark:text-white/80">
                  <p className="font-medium">{order.shipping?.courier?.toUpperCase() || '-'}</p>
                  <p>Layanan: {order.shipping?.service || '-'}</p>
                  <p>Estimasi: {order.shipping?.etd || '-'} hari</p>
                  <p className="font-semibold text-neon-blue">{formatCurrency(order.shipping?.cost || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="glass-card bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 shadow-md dark:shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Informasi Pembayaran</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-neon-green to-neon-blue rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{order.payment?.method || '-'}</p>
                <p className="text-gray-500 dark:text-white/60 capitalize">{order.payment?.type?.replace('_', ' ') || order.payment?.status || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-3 md:space-y-4">
          {/* Customer Information */}
          <div className="glass-card bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 shadow-md dark:shadow-lg rounded-lg p-4 md:p-5 mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informasi Pelanggan
            </h2>
            {currentUser ? (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-white/80 mb-1">Nama</label>
                  <p className="text-sm text-gray-900 dark:text-white">{currentUser.username}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-white mb-1">Email</label>
                  <p className="text-sm text-gray-900 dark:text-white">{currentUser.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Informasi pelanggan tidak tersedia</p>
            )}
          </div>

          {/* Order Summary */}
          <div className="glass-card bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 shadow-md dark:shadow-lg rounded-lg p-4 md:p-5 mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Ringkasan Order</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-white/80">Subtotal</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(order.total - order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-white/80">Ongkos Kirim</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(order.shippingCost)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold text-base">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="glass-card bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 shadow-md dark:shadow-lg rounded-lg p-4 md:p-5 mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 dark:text-white" />
              Timeline Order
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-base">Order Dibuat</p>
                  <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-base">Terakhir Diupdate</p>
                  <p className="text-xs text-gray-500">{formatDate(order.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 