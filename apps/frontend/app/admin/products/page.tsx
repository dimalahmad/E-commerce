"use client";

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { productApi, categoryApi } from '@/lib/adminApi';
import Select from 'react-select';

interface Product {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images?: string[];
  categoryId: string;
  stock: number;
  isNew?: boolean;
  isActive: boolean;
  specifications?: Record<string, string>;
  features?: string[];
  rating?: number;
  reviews?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Category {
  id: string;
  name: string;
}

const statusOptions = [
  { value: '', label: 'Semua Status' },
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Nonaktif' },
];

const productTypeOptions = [
  { value: '', label: 'Semua Produk' },
  { value: 'new', label: 'Produk Baru' },
  { value: 'old', label: 'Produk Lama' },
];

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    longDescription: '',
    price: '',
    originalPrice: '',
    discount: '',
    categoryId: '',
    stock: '',
    isNew: false,
    isActive: true,
    images: [] as string[],
    specifications: {} as Record<string, string>,
    features: [] as string[]
  });
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const perPageOptions = [
    { value: 10, label: '10 / halaman' },
    { value: 20, label: '20 / halaman' },
    { value: 50, label: '50 / halaman' },
  ];

  // Detect dark mode
  const [isDark, setIsDark] = useState(false);
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

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productApi.getAll();
      setProducts(response.data);
    } catch (error: any) {
      toast.error('Gagal memuat produk');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data);
      } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Filtering logic
  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !filterCategory || p.categoryId === filterCategory;
    const matchStatus = !filterStatus || (filterStatus === 'active' ? p.isActive : !p.isActive);
    const matchType = !filterType || (filterType === 'new' ? p.isNew : filterType === 'old' ? !p.isNew : true);
    return matchSearch && matchCategory && matchStatus && matchType;
  });
  const totalPages = Math.ceil(filteredProducts.length / perPage) || 1;
  const paginatedProducts = filteredProducts.slice((page - 1) * perPage, page * perPage);
  useEffect(() => { setPage(1); }, [search, filterCategory, filterStatus, filterType, perPage]);

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await productApi.delete(Number(id));
        toast.success('Produk berhasil dihapus');
        fetchProducts();
      } catch (error: any) {
        toast.error(error?.response?.data?.error || 'Gagal menghapus produk');
      console.error(error);
      }
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      longDescription: '',
      price: '',
      originalPrice: '',
      discount: '',
      categoryId: '',
      stock: '',
      isNew: false,
      isActive: true,
      images: [],
      specifications: {},
      features: []
    });
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      longDescription: product.longDescription || '',
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      discount: product.discount?.toString() || '',
      categoryId: product.categoryId,
      stock: product.stock.toString(),
      isNew: product.isNew || false,
      isActive: product.isActive,
      images: product.images || [],
      specifications: product.specifications || {},
      features: product.features || []
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.stock || !formData.categoryId) {
      toast.error('Nama, harga, stok, dan kategori wajib diisi');
      return;
    }
    
    // Validasi nama produk tidak boleh duplikat
    const trimmedName = formData.name.trim();
    const existingProduct = products.find(p => 
      p.name.toLowerCase() === trimmedName.toLowerCase() && 
      (!editingProduct || p.id !== editingProduct.id)
    );
    
    if (existingProduct) {
      toast.error('Produk dengan nama ini sudah ada!');
      return;
    }
    
    const payload = {
      name: trimmedName,
      description: formData.description,
      longDescription: formData.longDescription,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      discount: formData.discount ? Number(formData.discount) : undefined,
      categoryId: formData.categoryId,
      stock: Number(formData.stock),
      isNew: formData.isNew,
      isActive: formData.isActive,
      images: formData.images,
      specifications: formData.specifications,
      features: formData.features
    };

    try {
      if (editingProduct) {
        await productApi.update(Number(editingProduct.id), payload);
        toast.success('Produk berhasil diperbarui');
      } else {
        await productApi.create(payload);
        toast.success('Produk berhasil ditambahkan');
      }
      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        longDescription: '',
        price: '',
        originalPrice: '',
        discount: '',
        categoryId: '',
        stock: '',
        isNew: false,
        isActive: true,
        images: [],
        specifications: {},
        features: []
      });
      fetchProducts();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Gagal menyimpan produk');
      console.error(error);
    }
  };

  // UI
  return (
    <div>
      <h1 className="text-2xl font-bold text-gradient mb-4 dark:text-gradient">Kelola Produk</h1>
      <p className="text-gray-700 dark:text-white/70 mb-6">Tambah, edit, atau hapus produk blangkon.</p>
      <button className="futuristic-button mb-6" onClick={openAddModal}>+ Tambah Produk</button>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded px-3 py-2 text-gray-900 dark:text-white w-48"
        />
        <Select
          options={[{ value: '', label: 'Semua Kategori' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
          value={[{ value: '', label: 'Semua Kategori' }, ...categories.map(c => ({ value: c.id, label: c.name }))].find(opt => opt.value === filterCategory)}
          onChange={opt => setFilterCategory(opt?.value || '')}
          styles={customSelectStyles}
          className="w-44 text-sm"
          classNamePrefix="react-select-dark"
          isSearchable={false}
        />
        <Select
          options={statusOptions}
          value={statusOptions.find(opt => opt.value === filterStatus)}
          onChange={opt => setFilterStatus(opt?.value || '')}
          styles={customSelectStyles}
          className="w-44 text-sm"
          classNamePrefix="react-select-dark"
          isSearchable={false}
        />
        <Select
          options={productTypeOptions}
          value={productTypeOptions.find(opt => opt.value === filterType)}
          onChange={opt => setFilterType(opt?.value || '')}
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
      <div className="glass-card p-6 border border-gray-200 dark:border-white/10 overflow-x-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 dark:border-white mx-auto"></div>
            <p className="text-gray-700 dark:text-white/70 mt-2">Memuat produk...</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-700 dark:text-white/80 border-b border-gray-200 dark:border-white/10">
                <th className="py-2">Nama Produk</th>
                <th className="py-2">Kategori</th>
                <th className="py-2">Modal</th>
                <th className="py-2">Harga Jual</th>
                <th className="py-2">Diskon</th>
                <th className="py-2">Keuntungan</th>
                <th className="py-2">Stok</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400 dark:text-white/50">
                    Tidak ada produk ditemukan
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const category = categories.find(c => c.id === product.categoryId)?.name || '-';
                  const hasDiscount = typeof product.discount === 'number' && product.discount > 0;
                  const sellingPrice = product.price; // Harga jual asli (yang disimpan di database)
                  const displayedPrice = hasDiscount ? sellingPrice - (sellingPrice * (product.discount || 0) / 100) : sellingPrice; // Harga yang ditampilkan
                  const profit = displayedPrice - (product.originalPrice || 0);
                  return (
                    <tr key={product.id} className="border-b border-gray-200 dark:border-white/5">
                      <td className="py-2 text-gray-900 dark:text-white">{product.name}</td>
                      <td className="py-2 text-gray-900 dark:text-white">{category}</td>
                      <td className="py-2 text-gray-900 dark:text-white">Rp {(product.originalPrice || 0).toLocaleString('id-ID')}</td>
                      <td className="py-2 text-gray-900 dark:text-white">
                        {hasDiscount ? (
                          <>
                            <span className="line-through text-gray-400 dark:text-white/50 mr-2">Rp {sellingPrice.toLocaleString('id-ID')}</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">Rp {displayedPrice.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                          </>
                        ) : (
                          <span>Rp {sellingPrice.toLocaleString('id-ID')}</span>
                        )}
                      </td>
                      <td className="py-2 text-gray-900 dark:text-white">{hasDiscount ? `${product.discount}%` : '-'}</td>
                      <td className="py-2 text-gray-900 dark:text-white">
                        <span className={profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          Rp {profit.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="py-2 text-gray-900 dark:text-white">{product.stock}</td>
                      <td className="py-2">
                        <button className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 rounded px-3 py-1 mr-2 transition" onClick={() => handleEdit(product)}>Edit</button>
                        <button className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 rounded px-3 py-1 transition" onClick={() => handleDelete(product.id)}>Hapus</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="text-gray-700 dark:text-white/70 text-sm">
          Menampilkan {(page - 1) * perPage + 1} - {Math.min(page * perPage, filteredProducts.length)} dari {filteredProducts.length} produk
        </div>
        <div className="flex gap-1">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 rounded px-3 py-1 disabled:opacity-50 transition">Prev</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`rounded px-3 py-1 transition ${page === i + 1 ? 'bg-blue-600 text-white dark:bg-neon-blue' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20'}`}>{i + 1}</button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 rounded px-3 py-1 disabled:opacity-50 transition">Next</button>
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{editingProduct ? 'Edit Detail Produk' : 'Tambah Produk'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">Nama Produk *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full h-11 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 transition" required />
              </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">Deskripsi Singkat</label>
                  <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full h-11 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 transition" />
              </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">Deskripsi Panjang</label>
                  <textarea value={formData.longDescription} onChange={e => setFormData({ ...formData, longDescription: e.target.value })} className="w-full min-h-[70px] bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 transition" />
              </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">Harga Asli (Modal) *</label>
                  <input type="number" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} className="w-full h-11 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 transition" required />
              </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">Harga Jual *</label>
                  <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full h-11 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 transition" required />
              </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">Diskon (%)</label>
                  <input type="number" value={formData.discount} onChange={e => setFormData({ ...formData, discount: e.target.value })} className="w-full h-11 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 transition" />
              </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">Harga yang Ditampilkan (Otomatis)</label>
                  <input type="number" value={formData.price && formData.discount ? (Number(formData.price) - (Number(formData.price) * Number(formData.discount) / 100)).toFixed(0) : formData.price} readOnly className="w-full h-11 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 transition opacity-70" />
          </div>
                {/* Gambar Produk */}
                <div className="md:col-span-2 space-y-2">
                  <div className="text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">Gambar Produk</div>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {(formData.images || []).map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 bg-gray-200 dark:bg-white/10 rounded-lg overflow-hidden flex items-center justify-center border border-gray-300 dark:border-white/20">
                        <img src={img} alt="preview" className="object-cover w-full h-full" />
                        <button type="button" className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md" onClick={() => setFormData({ ...formData, images: formData.images!.filter((_, i) => i !== idx) })}>×</button>
        </div>
                    ))}
              </div>
                  <div className="flex gap-2 items-center mb-2">
                    <input type="file" accept="image/*" className="text-xs" onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) {
                        toast.error('Ukuran file maksimal 2MB');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = ev => {
                        setFormData({ ...formData, images: [...(formData.images || []), ev.target?.result as string] });
                      };
                      reader.readAsDataURL(file);
                    }} />
                    <input type="text" placeholder="atau masukkan link gambar" className="bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white flex-1 text-xs" onBlur={e => {
                      if (e.target.value) setFormData({ ...formData, images: [...(formData.images || []), e.target.value] });
                      e.target.value = '';
                    }} />
              </div>
              </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">Kategori *</label>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full h-11 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 transition"
                    required
                  >
                    {categories.some(cat => String(cat.id) === String(formData.categoryId)) ? null : (
                      <option value="" disabled>Kategori tidak ditemukan</option>
                    )}
                    <option value="">Pilih Kategori</option>
                    {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">Stok *</label>
                  <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="w-full h-11 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 transition" required />
              </div>
                <div className="flex items-center gap-6 md:col-span-2 mt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-white/70">
                    <input type="checkbox" checked={formData.isNew} onChange={e => setFormData({ ...formData, isNew: e.target.checked })} />
                    Produk Baru
                </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-white/70">
                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                    Aktif
                </label>
              </div>
              </div>
              {/* Spesifikasi (key-value) */}
              <div className="pt-2">
                <div className="text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">Spesifikasi (key-value)</div>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(formData.specifications || {}).map(([key, value], idx) => (
                    <div key={key + idx} className="flex gap-2 mb-2 items-center">
                      <input type="text" value={key} onChange={e => {
                        const newSpecs = { ...formData.specifications };
                        const val = newSpecs[key];
                        delete newSpecs[key];
                        newSpecs[e.target.value] = val;
                        setFormData({ ...formData, specifications: newSpecs });
                      }} placeholder="Key" className="flex-1 h-10 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs" />
                      <input type="text" value={value} onChange={e => {
                        setFormData({ ...formData, specifications: { ...formData.specifications, [key]: e.target.value } });
                      }} placeholder="Value" className="flex-1 h-10 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs" />
                      <button type="button" className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 rounded px-2 py-1 text-xs" onClick={() => {
                        const newSpecs = { ...formData.specifications };
                        delete newSpecs[key];
                        setFormData({ ...formData, specifications: newSpecs });
                      }}>Hapus</button>
                  </div>
                ))}
              </div>
                <button type="button" className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 rounded px-3 py-1 mt-2 text-xs" onClick={() => {
                  setFormData({ ...formData, specifications: { ...formData.specifications, '': '' } });
                }}>+ Tambah Spesifikasi</button>
              </div>
              {/* Fitur (list string) */}
              <div className="pt-2">
                <div className="text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">Fitur</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(formData.features || []).map((feature, idx) => (
                    <div key={idx} className="flex gap-2 mb-2 items-center">
                      <input type="text" value={feature} onChange={e => {
                        const newFeatures = [...formData.features!];
                        newFeatures[idx] = e.target.value;
                        setFormData({ ...formData, features: newFeatures });
                      }} className="flex-1 h-10 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs" />
                      <button type="button" className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 rounded px-2 py-1 text-xs" onClick={() => {
                        setFormData({ ...formData, features: formData.features!.filter((_, i) => i !== idx) });
                      }}>Hapus</button>
                  </div>
                ))}
              </div>
                <button type="button" className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 rounded px-3 py-1 mt-2 text-xs" onClick={() => {
                  setFormData({ ...formData, features: [...(formData.features || []), ''] });
                }}>+ Tambah Fitur</button>
              </div>
              {/* Readonly fields */}
              {editingProduct && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">Rating (readonly)</label>
                    <input type="text" value={editingProduct.rating ?? ''} readOnly className="w-full h-10 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">Reviews (readonly)</label>
                    <input type="text" value={editingProduct.reviews ?? ''} readOnly className="w-full h-10 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">Dibuat (readonly)</label>
                    <input type="text" value={editingProduct.createdAt ?? ''} readOnly className="w-full h-10 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">Diupdate (readonly)</label>
                    <input type="text" value={editingProduct.updatedAt ?? ''} readOnly className="w-full h-10 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs" />
                </div>
              </div>
              )}
              <div className="flex gap-2 pt-6">
                <button type="submit" className="futuristic-button flex-1 h-12 text-base">
                  {editingProduct ? 'Update' : 'Simpan'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 rounded-lg px-6 py-3 font-semibold transition flex-1 h-12 text-base">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 