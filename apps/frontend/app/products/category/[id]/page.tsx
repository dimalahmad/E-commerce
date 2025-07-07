'use client'
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Product, Category } from '@/types';
import ProductCard from '@/components/ProductCard';

export default function CategoryProductsPage() {
  const params = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('popularity');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [search, setSearch] = useState('');
  const [minDiscount, setMinDiscount] = useState('');
  const [minStock, setMinStock] = useState('');
  const [isNew, setIsNew] = useState('');
  const [minRating, setMinRating] = useState('');

  useEffect(() => {
    apiClient.getCategories().then((data) => {
      setCategories(data.map((c: any) => ({ id: c.id.toString(), name: c.name })));
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const allProducts = await apiClient.getProducts();
      const allCategories = await apiClient.getCategories();
      const cat = allCategories.find((c: Category) => c.id.toString() === params.id);
      setCategory(cat || null);
      let filtered = allProducts.filter((p: Product) => p.category?.id?.toString() === params.id && p.isActive !== false);
      if (search) filtered = filtered.filter((p: Product) => p.name.toLowerCase().includes(search.toLowerCase()));
      if (minPrice) filtered = filtered.filter((p: Product) => p.price >= Number(minPrice));
      if (maxPrice) filtered = filtered.filter((p: Product) => p.price <= Number(maxPrice));
      if (minDiscount) filtered = filtered.filter((p: Product) => (p.discount || 0) >= Number(minDiscount));
      if (minStock) filtered = filtered.filter((p: Product) => (p.stock || 0) >= Number(minStock));
      if (isNew) filtered = filtered.filter((p: Product) => p.isNew === (isNew === 'true'));
      if (minRating) filtered = filtered.filter((p: Product) => (p.rating || 0) >= Number(minRating));
      if (sort === 'price-asc') filtered = filtered.sort((a: Product, b: Product) => a.price - b.price);
      if (sort === 'price-desc') filtered = filtered.sort((a: Product, b: Product) => b.price - a.price);
      if (sort === 'rating') filtered = filtered.sort((a: Product, b: Product) => (b.rating || 0) - (a.rating || 0));
      setProducts(filtered);
      setLoading(false);
    };
    fetchData();
  }, [params.id, sort, minPrice, maxPrice, search, minDiscount, minStock, isNew, minRating]);

  return (
    <div className="min-h-screen pt-16 pb-20 w-full bg-white dark:bg-dark-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">{category ? category.name : 'Kategori'}</h1>
          <p className="text-white/60">Lihat semua produk dalam kategori ini</p>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filter */}
          <aside className="md:w-64 w-full md:sticky md:top-20 flex-shrink-0 z-10">
            <div className="glass-card p-4 space-y-4">
              <select value={params.id} disabled className="glass px-4 py-2 rounded w-full bg-white dark:bg-dark-900 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20">
                <option value="">{category ? category.name : 'Kategori'}</option>
              </select>
              <input type="number" placeholder="Harga min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="glass px-4 py-2 rounded w-full bg-white dark:bg-dark-900 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 placeholder-gray-400 dark:placeholder-white/50" />
              <input type="number" placeholder="Harga max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="glass px-4 py-2 rounded w-full bg-white dark:bg-dark-900 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 placeholder-gray-400 dark:placeholder-white/50" />
              <input type="number" placeholder="Diskon min %" value={minDiscount} onChange={e => setMinDiscount(e.target.value)} className="glass px-4 py-2 rounded w-full bg-white dark:bg-dark-900 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 placeholder-gray-400 dark:placeholder-white/50" />
              <input type="number" placeholder="Stok min" value={minStock} onChange={e => setMinStock(e.target.value)} className="glass px-4 py-2 rounded w-full bg-white dark:bg-dark-900 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 placeholder-gray-400 dark:placeholder-white/50" />
              <select value={isNew} onChange={e => setIsNew(e.target.value)} className="glass px-4 py-2 rounded w-full bg-white dark:bg-dark-900 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20">
                <option value="">Semua Status</option>
                <option value="true">Produk Baru</option>
                <option value="false">Bukan Produk Baru</option>
              </select>
              <input type="number" placeholder="Rating min" value={minRating} onChange={e => setMinRating(e.target.value)} className="glass px-4 py-2 rounded w-full bg-white dark:bg-dark-900 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 placeholder-gray-400 dark:placeholder-white/50" />
              <select value={sort} onChange={e => setSort(e.target.value)} className="glass px-4 py-2 rounded w-full bg-white dark:bg-dark-900 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20">
                <option value="popularity">Paling Populer</option>
                <option value="price-asc">Harga Termurah</option>
                <option value="price-desc">Harga Termahal</option>
                <option value="rating">Rating Tertinggi</option>
              </select>
            </div>
          </aside>
          {/* Produk Grid */}
          <main className="flex-1">
            {/* Search bar di kanan atas */}
            <div className="flex justify-end mb-4">
              <input type="text" placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)} className="glass px-4 py-2 rounded w-full max-w-xs" />
            </div>
            {loading ? (
              <div className="text-white/60 py-12 text-center">Memuat produk...</div>
            ) : products.length === 0 ? (
              <div className="text-white/60 py-12 text-center">Tidak ada produk ditemukan.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product, idx) => (
                  <ProductCard key={product.id} product={product as any} index={idx} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
} 