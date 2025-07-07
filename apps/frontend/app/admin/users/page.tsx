'use client';
import { useState, useEffect } from 'react';
import { userApi } from '@/lib/adminApi';
import toast from 'react-hot-toast';
import Select from 'react-select';

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  alamat: string;
  role: string;
  joinedAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'konsumen' });
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => { fetchUsers(); }, []);
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAll();
      setUsers(res.data);
    } catch (e) {
      toast.error('Gagal memuat user');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    (u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
    (filterRole ? u.role === filterRole : true)
  );
  const totalPages = Math.ceil(filteredUsers.length / perPage) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * perPage, page * perPage);
  useEffect(() => { setPage(1); }, [search, filterRole, perPage]);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '', role: 'konsumen' });
    setShowModal(true);
  };
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ username: user.username, email: user.email, password: '', role: user.role });
    setShowModal(true);
  };
  const handleDelete = async (id: number) => {
    if (confirm('Yakin hapus user ini?')) {
      try {
        await userApi.delete(id);
        toast.success('User dihapus');
        fetchUsers();
      } catch (e) {
        toast.error('Gagal hapus user');
      }
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim() || (!editingUser && !formData.password.trim())) {
      toast.error('Semua field wajib diisi');
      return;
    }
    
    // Validasi email tidak boleh duplikat
    const trimmedEmail = formData.email.trim().toLowerCase();
    const existingUser = users.find(u => 
      u.email.toLowerCase() === trimmedEmail && 
      (!editingUser || u.id !== editingUser.id)
    );
    
    if (existingUser) {
      toast.error('Email sudah terdaftar!');
      return;
    }
    
    try {
      if (editingUser) {
        await userApi.update(editingUser.id, { ...formData, password: formData.password || undefined });
        toast.success('User diperbarui');
      } else {
        await userApi.create(formData);
        toast.success('User ditambahkan');
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ username: '', email: '', password: '', role: 'konsumen' });
      fetchUsers();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Gagal simpan user');
    }
  };

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

  const roleOptions = [
    { value: '', label: 'Semua Role' },
    { value: 'konsumen', label: 'Konsumen' },
    { value: 'admin', label: 'Admin' },
  ];
  const perPageOptions = [
    { value: 10, label: '10 / halaman' },
    { value: 20, label: '20 / halaman' },
    { value: 50, label: '50 / halaman' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gradient mb-4 dark:text-gradient">Kelola User/Konsumen</h1>
      <p className="text-gray-700 dark:text-white/70 mb-6">Tambah, edit, atau hapus user/konsumen (kecuali admin).</p>
      <button className="futuristic-button mb-6" onClick={openAddModal}>+ Tambah User</button>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="Cari user..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded px-3 py-2 text-gray-900 dark:text-white w-48"
        />
        <Select
          options={roleOptions}
          value={roleOptions.find(opt => opt.value === filterRole)}
          onChange={opt => setFilterRole(opt?.value || '')}
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
      <div className="glass-card p-6 border border-gray-200 dark:border-white/10 overflow-x-auto rounded-2xl shadow-lg">
          <table className="w-full text-left">
            <thead>
            <tr className="text-xs font-bold text-gray-700 dark:text-white/80 uppercase tracking-wider bg-gray-50 dark:bg-white/5">
              <th className="px-6 py-3">Username</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Bergabung Sejak</th>
              <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-white/50">Memuat user...</td>
              </tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400 dark:text-white/50">Tidak ada user ditemukan.</td>
              </tr>
            ) : (
              paginatedUsers.map(user => (
                <tr key={user.id} className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">{user.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">{user.role}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">{user.joinedAt}</td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <button className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 rounded px-3 py-1 mr-2 transition" onClick={() => handleEdit(user)}>Edit</button>
                    <button className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 rounded px-3 py-1 transition" onClick={() => handleDelete(user.id)}>Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </div>
      {/* Pagination & Info di luar card */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-gray-700 dark:text-white/70 text-sm">
          Menampilkan {(page - 1) * perPage + 1} - {Math.min(page * perPage, filteredUsers.length)} dari {filteredUsers.length} user
        </div>
        <div className="flex gap-1">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 rounded px-3 py-1 disabled:opacity-50 transition">Prev</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`rounded px-3 py-1 transition ${page === i + 1 ? 'bg-blue-600 text-white dark:bg-neon-blue' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20'}`}>{i + 1}</button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 rounded px-3 py-1 disabled:opacity-50 transition">Next</button>
        </div>
      </div>
      {/* Modal Add/Edit User */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-[#181f2a] rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white" onClick={() => setShowModal(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{editingUser ? 'Edit User' : 'Tambah User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Username</label>
                <input type="text" className="w-full rounded border border-gray-300 dark:border-white/20 bg-gray-100 dark:bg-white/10 px-3 py-2 text-gray-900 dark:text-white" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Email</label>
                <input type="email" className="w-full rounded border border-gray-300 dark:border-white/20 bg-gray-100 dark:bg-white/10 px-3 py-2 text-gray-900 dark:text-white" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Password {editingUser && <span className="text-xs text-gray-400">(Kosongkan jika tidak ingin mengubah)</span>}</label>
                <input type="password" className="w-full rounded border border-gray-300 dark:border-white/20 bg-gray-100 dark:bg-white/10 px-3 py-2 text-gray-900 dark:text-white" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required={!editingUser} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Role</label>
                <Select
                  options={roleOptions.filter(opt => opt.value !== '' || editingUser?.role === '')}
                  value={roleOptions.find(opt => opt.value === formData.role)}
                  onChange={opt => setFormData({ ...formData, role: opt?.value || 'konsumen' })}
                  styles={customSelectStyles}
                  className="w-full text-sm"
                  classNamePrefix="react-select-dark"
                  isSearchable={false}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="px-4 py-2 rounded bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white/80" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">{editingUser ? 'Simpan Perubahan' : 'Tambah User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 