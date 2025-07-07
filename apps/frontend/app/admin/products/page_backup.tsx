"use client";

import { useState, useEffect, useRef } from 'react';
import { productApi, categoryApi } from '@/lib/adminApi';
import toast from 'react-hot-toast';
import Select from 'react-select';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  categoryId: number;
  discount?: number;
  category?: Category;
  description?: string;
  longDescription?: string;
  originalPrice?: number;
  images?: string[];
  isNew?: boolean;
  isActive?: boolean;
  specifications?: Record<string, string>;
  features?: string[];
  rating?: number;
  reviews?: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', categoryId: '', discount: '' });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailForm, setDetailForm] = useState<any>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [filterNew, setFilterNew] = useState('');
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
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productApi.getAll(),
        categoryApi.getAll(),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (error) {
      toast.error('Gagal memuat data produk/kategori');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', price: '', stock: '', categoryId: '', discount: '' });
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      categoryId: product.categoryId.toString(),
      discount: (product.discount ?? 0).toString(),
    });
    setShowModal(true);
  };

  const handleEditDetail = (product: Product) => {
    setDetailProduct(product);
    setDetailForm({
      name: product.name || '',
      description: product.description || '',
      longDescription: product.longDescription || '',
      price: product.price?.toString() || '',
      originalPrice: product.originalPrice?.toString() || product.price?.toString() || '',
      discount: (product.discount ?? 0).toString(),
      stock: product.stock?.toString() || '',
      categoryId: product.categoryId?.toString() || '',
      images: product.images ? [...product.images] : [],
      isNew: !!product.isNew,
      isActive: product.isActive !== false,
      specifications: product.specifications ? Object.entries(product.specifications) : [],
      features: product.features ? [...product.features] : [],
    });
    setShowDetailModal(true);
  };

  const handleDetailChange = (field: string, value: any) => {
    setDetailForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleAddSpec = () => {
    setDetailForm((prev: any) => ({ ...prev, specifications: [...prev.specifications, ['', '']] }));
  };

  const handleRemoveSpec = (idx: number) => {
    setDetailForm((prev: any) => ({ ...prev, specifications: prev.specifications.filter((_: any, i: number) => i !== idx) }));
  };

  const handleSpecChange = (idx: number, key: string, value: string) => {
    setDetailForm((prev: any) => ({
      ...prev,
      specifications: prev.specifications.map((item: any, i: number) => i === idx ? [key, value] : item)
    }));
  };

  const handleAddFeature = () => {
    setDetailForm((prev: any) => ({ ...prev, features: [...prev.features, ''] }));
  };

  const handleRemoveFeature = (idx: number) => {
    setDetailForm((prev: any) => ({ ...prev, features: prev.features.filter((_: any, i: number) => i !== idx) }));
  };

  const handleFeatureChange = (idx: number, value: string) => {
    setDetailForm((prev: any) => ({ ...prev, features: prev.features.map((item: string, i: number) => i === idx ? value : item) }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const arr = Array.from(files);
    for (const file of arr) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran gambar maksimal 2MB');
        continue;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setDetailForm((prev: any) => ({ ...prev, images: [...prev.images, ev.target?.result as string] }));
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (idx: number) => {
    setDetailForm((prev: any) => ({ ...prev, images: prev.images.filter((_: any, i: number) => i !== idx) }));
  };

  const handleDetailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailForm.name.trim() || !detailForm.price || !detailForm.stock || !detailForm.categoryId) {
      toast.error('Nama, harga, stok, dan kategori wajib diisi');
      return;
    }
    const payload = {
      name: detailForm.name,
      description: detailForm.description,
      longDescription: detailForm.longDescription,
      price: Number(detailForm.price),
      originalPrice: Number(detailForm.originalPrice),
      discount: Number(detailForm.discount) || 0,
      stock: Number(detailForm.stock),
      categoryId: Number(detailForm.categoryId),
      images: detailForm.images,
      isNew: !!detailForm.isNew,
      isActive: !!detailForm.isActive,
      specifications: Object.fromEntries(detailForm.specifications),
      features: detailForm.features,
    };
    try {
      await productApi.update(detailProduct!.id, payload);
      toast.success('Detail produk berhasil diperbarui');
      setShowDetailModal(false);
      setDetailProduct(null);
      setDetailForm(null);
      fetchAll();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Gagal menyimpan detail produk');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await productApi.delete(id);
        toast.success('Produk berhasil dihapus');
        fetchAll();
      } catch (error: any) {
        toast.error(error?.response?.data?.error || 'Gagal menghapus produk');
        console.error(error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.stock || !formData.categoryId) {
      toast.error('Nama, harga, stok, dan kategori wajib diisi');
      return;
    }
    const payload = {
      name: formData.name,
      price: Number(formData.price),
      stock: Number(formData.stock),
      categoryId: Number(formData.categoryId),
      discount: Number(formData.discount) || 0,
    };
    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, payload);
        toast.success('Produk berhasil diperbarui');
      } else {
        await productApi.create(payload);
        toast.success('Produk berhasil ditambahkan');
      }
      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '', price: '', stock: '', categoryId: '', discount: '' });
      fetchAll();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Gagal menyimpan produk');
      console.error(error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !filterCategory || product.categoryId.toString() === filterCategory;
    const matchesActive = !filterActive || (filterActive === 'true' ? product.isActive : !product.isActive);
    const matchesNew = !filterNew || (filterNew === 'true' ? product.isNew : !product.isNew);
    return matchesSearch && matchesCategory && matchesActive && matchesNew;
  });

  const paginatedProducts = filteredProducts.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filteredProducts.length / perPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 transition-colors">
      <h1 className="text-2xl font-bold text-gradient dark:text-gradient mb-4">Kelola Produk</h1>
      <p className="text-gray-700 dark:text-white/70 mb-6">Tambah, edit, atau hapus produk blangkon.</p>
      <button 
        onClick={openAddModal}
        className="futuristic-button mb-6 bg-blue-600 text-white hover:bg-blue-700 dark:bg-neon-blue dark:text-white"
      >
        + Tambah Produk
      </button>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded px-3 py-2 text-gray-900 dark:text-white w-48"
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
      <div className="glass-card bg-white/80 dark:bg-dark-900/80 border border-gray-200 dark:border-white/10 p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 dark:border-white mx-auto"></div>
            <p className="text-gray-700 dark:text-white/70 mt-2">Memuat produk...</p>
          </div>
        ) : (
          <table className="w-full text-left bg-white dark:bg-dark-900 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-white/80">
              <tr>
                <th className="py-2">Nama Produk</th>
                <th className="py-2">Kategori</th>
                <th className="py-2">Harga</th>
                <th className="py-2">Stok</th>
                <th className="py-2">Status</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-white/50">
                    Tidak ada produk ditemukan
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-200 dark:border-white/5">
                    <td className="py-2 text-gray-900 dark:text-white">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500 dark:text-white/60 truncate max-w-xs">
                          {product.description}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 text-gray-900 dark:text-white">{categories.find(cat => cat.id === product.categoryId)?.name || 'Unknown'}</td>
                    <td className="py-2 text-gray-900 dark:text-white">
                      Rp {product.price.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 text-gray-900 dark:text-white">{product.stock}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {product.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="py-2">
                      <button 
                        onClick={() => handleEditDetail(product)}
                        className="glass-button mr-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                      >
                        Detail
                      </button>
                      <button 
                        onClick={() => handleEdit(product)}
                        className="glass-button mr-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="glass-button bg-red-100 text-red-700 hover:bg-red-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
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
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="glass-button px-3 disabled:opacity-50 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">Prev</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`glass-button px-3 ${page === i + 1 ? 'bg-blue-600 text-white dark:bg-neon-blue dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20'}`}>{i + 1}</button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="glass-button px-3 disabled:opacity-50 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">Next</button>
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card bg-white/90 dark:bg-dark-900/90 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-white/80 mb-2">Nama Produk</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded px-3 py-2 text-gray-900 dark:text-white"
                  placeholder="Masukkan nama produk"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-white/80 mb-2">Kategori</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded px-3 py-2 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 dark:text-white/80 mb-2">Harga</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded px-3 py-2 text-gray-900 dark:text-white"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-white/80 mb-2">Stok</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded px-3 py-2 text-gray-900 dark:text-white"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="flex items-center text-gray-700 dark:text-white/80">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  Produk Aktif
                </label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="futuristic-button flex-1 bg-blue-600 text-white hover:bg-blue-700 dark:bg-neon-blue dark:text-white">
                  {editingProduct ? 'Update' : 'Simpan'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="glass-button flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Edit Detail Produk */}
      {showDetailModal && detailForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">Edit Detail Produk</h2>
            <form onSubmit={handleDetailSubmit}>
              <div className="mb-4">
                <label className="block text-white/80 mb-2">Nama Produk</label>
                <input type="text" value={detailForm.name} onChange={e => handleDetailChange('name', e.target.value)} className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white" required />
              </div>
              <div className="mb-4">
                <label className="block text-white/80 mb-2">Deskripsi Singkat</label>
                <input type="text" value={detailForm.description} onChange={e => handleDetailChange('description', e.target.value)} className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white" required />
              </div>
              <div className="mb-4">
                <label className="block text-white/80 mb-2">Deskripsi Panjang</label>
                <textarea value={detailForm.longDescription} onChange={e => handleDetailChange('longDescription', e.target.value)} className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white" rows={4} required />
              </div>
              <div className="mb-4">
                <label className="block text-white/80 mb-2">Harga Modal</label>
                <input type="number" value={detailForm.originalPrice} onChange={e => handleDetailChange('originalPrice', e.target.value)} className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white" required min={0} />
              </div>
              <div className="mb-4">
                <label className="block text-white/80 mb-2">Harga Jual</label>
                <input type="number" value={detailForm.price} onChange={e => handleDetailChange('price', e.target.value)} className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white" required min={0} />
                <div className="text-sm text-white/60 mt-1">Harga Modal: Rp {Number(detailForm.originalPrice).toLocaleString('id-ID')}</div>
              </div>
              <div className="mb-4">
                <label className="block text-white/80 mb-2">Diskon (%)</label>
                <input type="number" value={detailForm.discount} onChange={e => handleDetailChange('discount', e.target.value)} className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white" min={0} max={100} />
              </div>
              <div className="mb-4">
                <label className="block text-white/80 mb-2">Gambar Produk (max 2MB per file, bisa upload atau link)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {detailForm.images.map((img: string, idx: number) => (
                    <div key={idx} className="relative w-20 h-20 rounded overflow-hidden bg-white/10 flex items-center justify-center">
                      {/* Preview gambar, jika base64 atau url */}
                      {img.startsWith('data:') ? (
                        <img src={img} alt="img" className="object-cover w-full h-full" />
                      ) : (
                        <img src={img} alt="img" className="object-cover w-full h-full" />
                      )}
                      <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                    </div>
                  ))}
                </div>
                <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleImageUpload} className="mb-2" />
                <input type="text" placeholder="atau masukkan link gambar" className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white" onBlur={e => { if (e.target.value) { setDetailForm((prev: any) => ({ ...prev, images: [...prev.images, e.target.value] })); e.target.value = ''; } }} />
              </div>
              <div className="mb-4">
                <label className="block text-white/80 mb-2">Kategori</label>
                <select value={detailForm.categoryId} onChange={e => handleDetailChange('categoryId', e.target.value)} className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white" required>
                  <option value="">Pilih kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-white/80 mb-2">Stok</label>
                <input type="number" value={detailForm.stock} onChange={e => handleDetailChange('stock', e.target.value)} className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white" required min={0} />
              </div>
              <div className="mb-4 flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={detailForm.isNew} onChange={e => handleDetailChange('isNew', e.target.checked)} />
                  <span className="text-white/80">Produk Baru</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={detailForm.isActive} onChange={e => handleDetailChange('isActive', e.target.checked)} />
                  <span className="text-white/80">Aktif</span>
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-white/80 mb-2">Spesifikasi (key-value)</label>
                {detailForm.specifications.map((item: [string, string], idx: number) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" value={item[0]} onChange={e => handleSpecChange(idx, e.target.value, item[1])} placeholder="Key" className="w-1/3 bg-white/10 border border-white/20 rounded px-3 py-2 text-white" />
                    <input type="text" value={item[1]} onChange={e => handleSpecChange(idx, item[0], e.target.value)} placeholder="Value" className="w-2/3 bg-white/10 border border-white/20 rounded px-3 py-2 text-white" />
                    <button type="button" onClick={() => handleRemoveSpec(idx)} className="glass-button px-2">Hapus</button>
                  </div>
                ))}
                <button type="button" onClick={handleAddSpec} className="glass-button mt-2">+ Tambah Spesifikasi</button>
              </div>
              <div className="mb-4">
                <label className="block text-white/80 mb-2">Fitur Utama</label>
                {detailForm.features.map((item: string, idx: number) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" value={item} onChange={e => handleFeatureChange(idx, e.target.value)} className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white" />
                    <button type="button" onClick={() => handleRemoveFeature(idx)} className="glass-button px-2">Hapus</button>
                  </div>
                ))}
                <button type="button" onClick={handleAddFeature} className="glass-button mt-2">+ Tambah Fitur</button>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 mb-2">Rating (readonly)</label>
                  <input type="number" value={detailProduct?.rating ?? 0} readOnly className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-white/80 mb-2">Reviews (readonly)</label>
                  <input type="number" value={detailProduct?.reviews ?? 0} readOnly className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white" />
                </div>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 mb-2">Dibuat (readonly)</label>
                  <input type="text" value={detailProduct?.createdAt ?? ''} readOnly className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-white/80 mb-2">Diupdate (readonly)</label>
                  <input type="text" value={detailProduct?.updatedAt ?? ''} readOnly className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white" />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button type="submit" className="futuristic-button flex-1">Simpan</button>
                <button type="button" onClick={() => setShowDetailModal(false)} className="glass-button flex-1">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 