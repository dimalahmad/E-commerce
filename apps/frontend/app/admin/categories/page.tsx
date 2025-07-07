"use client";

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { categoryApi } from '@/lib/adminApi';
import Select from 'react-select';

interface Category {
  id: string;
  name: string;
  productCount: number;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [search, setSearch] = useState('');
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
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#f3f4f6',
      color: isDark ? '#fff' : '#111827',
      borderColor: state.isFocused ? (isDark ? '#38bdf8' : '#2563eb') : (isDark ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db'),
      boxShadow: state.isFocused ? `0 0 0 2px ${isDark ? '#38bdf8' : '#2563eb'}` : undefined,
      minHeight: '40px',
      borderRadius: '8px',
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      color: isDark ? '#fff' : '#111827',
      borderRadius: '8px',
      border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #d1d5db',
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused
        ? (isDark ? '#2563eb' : '#e0e7ff')
        : (isDark ? '#1e293b' : '#fff'),
      color: isDark ? '#fff' : '#111827',
      cursor: 'pointer',
      fontSize: '14px',
      padding: '8px 12px',
    }),
    singleValue: (base: any) => ({
      ...base,
      color: isDark ? '#fff' : '#111827',
      fontSize: '14px',
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
      color: isDark ? '#fff' : '#111827',
    }),
    indicatorSeparator: (base: any) => ({
      ...base,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db',
    }),
    input: (base: any) => ({
      ...base,
      color: isDark ? '#fff' : '#111827',
      fontSize: '14px',
    }),
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getAll();
      setCategories(response.data);
    } catch (error: any) {
      toast.error('Gagal memuat kategori');
      console.error('Error fetching categories:', error);
      if (error && error.response) {
        console.error('API error response:', error.response);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nama kategori wajib diisi');
      return;
    }

    // Validasi anti-duplikat
    const trimmedName = formData.name.trim();
    const existingCategory = categories.find(
      cat => cat.name.toLowerCase() === trimmedName.toLowerCase() && 
      (!editingCategory || cat.id !== editingCategory.id)
    );

    if (existingCategory) {
      toast.error('Kategori dengan nama ini sudah ada!');
      return;
    }

    try {
      if (editingCategory) {
        await categoryApi.update(Number(editingCategory.id), { name: trimmedName });
        toast.success('Kategori berhasil diperbarui');
      } else {
        await categoryApi.create({ name: trimmedName });
        toast.success('Kategori berhasil ditambahkan');
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '' });
      fetchCategories();
    } catch (error) {
      toast.error('Gagal menyimpan kategori');
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      try {
        await categoryApi.delete(Number(id));
        toast.success('Kategori berhasil dihapus');
        fetchCategories();
      } catch (error) {
        toast.error('Gagal menghapus kategori');
        console.error('Error deleting category:', error);
      }
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '' });
    setShowModal(true);
  };

  const filteredCategories = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredCategories.length / perPage) || 1;
  const paginatedCategories = filteredCategories.slice((page - 1) * perPage, page * perPage);
  useEffect(() => { setPage(1); }, [search, perPage]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gradient mb-4 dark:text-gradient">Kelola Kategori</h1>
      <p className="text-gray-700 dark:text-white/70 mb-6">Tambah, edit, atau hapus kategori produk blangkon.</p>
      <button className="futuristic-button mb-6" onClick={openAddModal}>+ Tambah Kategori</button>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="Cari kategori..."
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
      <div className="glass-card p-6 border border-gray-200 dark:border-white/10 overflow-x-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 dark:border-white mx-auto"></div>
            <p className="text-gray-700 dark:text-white/70 mt-2">Memuat kategori...</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-700 dark:text-white/80 border-b border-gray-200 dark:border-white/10">
                <th className="py-2">Nama Kategori</th>
                <th className="py-2">Jumlah Produk</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-400 dark:text-white/50">
                    Tidak ada kategori ditemukan
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((category) => (
                  <tr key={category.id} className="border-b border-gray-200 dark:border-white/5">
                    <td className="py-2 text-gray-900 dark:text-white">{category.name}</td>
                    <td className="py-2 text-gray-900 dark:text-white">{category.productCount || 0}</td>
                    <td className="py-2">
                      <button className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 rounded px-3 py-1 mr-2 transition" onClick={() => handleEdit(category)}>Edit</button>
                      <button className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 rounded px-3 py-1 transition" onClick={() => handleDelete(category.id)}>Hapus</button>
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
          Menampilkan {(page - 1) * perPage + 1} - {Math.min(page * perPage, filteredCategories.length)} dari {filteredCategories.length} kategori
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
          <div className="glass-card p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">Nama Kategori *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className="w-full h-11 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 transition"
                  placeholder="Masukkan nama kategori"
                  required
                />
              </div>
              <div className="flex gap-2 pt-6">
                <button type="submit" className="futuristic-button flex-1 h-12 text-base">
                  {editingCategory ? 'Update' : 'Simpan'}
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