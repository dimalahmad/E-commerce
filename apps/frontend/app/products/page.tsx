'use client'
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';

export default function AllProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('popularity');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
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
      let allProducts = await apiClient.getProducts();
      allProducts = allProducts.filter((p: Product) => p.isActive !== false);
      if (search) allProducts = allProducts.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
      if (category) allProducts = allProducts.filter((p) => p.categoryId?.toString() === category);
      if (minPrice) allProducts = allProducts.filter((p) => p.price >= Number(minPrice));
      if (maxPrice) allProducts = allProducts.filter((p) => p.price <= Number(maxPrice));
      if (minDiscount) allProducts = allProducts.filter((p) => (p.discount || 0) >= Number(minDiscount));
      if (minStock) allProducts = allProducts.filter((p) => (p.stock || 0) >= Number(minStock));
      if (isNew) allProducts = allProducts.filter((p) => p.isNew === (isNew === 'true'));
      if (minRating) allProducts = allProducts.filter((p) => (p.rating || 0) >= Number(minRating));
      if (sort === 'price-asc') allProducts = allProducts.sort((a, b) => a.price - b.price);
      if (sort === 'price-desc') allProducts = allProducts.sort((a, b) => b.price - a.price);
      if (sort === 'rating') allProducts = allProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setProducts(allProducts);
      setLoading(false);
    };
    fetchData();
  }, [sort, minPrice, maxPrice, search, category, minDiscount, minStock, isNew, minRating]);

  return (
    <div className="pt-16 pb-20 min-h-screen w-full bg-white dark:bg-dark-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gradient mb-2">Semua Produk</h2>
          <p className="text-gray-600 dark:text-white/70">Lihat semua produk Blangkis</p>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filter */}
          <aside className="md:w-64 w-full md:sticky md:top-20 flex-shrink-0 z-10">
            <div className="glass-card p-4 space-y-4 bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 shadow-md dark:shadow-lg">
              <select value={category} onChange={e => setCategory(e.target.value)} className="glass px-4 py-2 rounded w-full bg-white dark:bg-dark-900 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20">
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <input type="number" placeholder="Harga min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="glass px-4 py-2 rounded w-full bg-white dark:bg-dark-900 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20" />
              <input type="number" placeholder="Harga max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="glass px-4 py-2 rounded w-full bg-white dark:bg-dark-900 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20" />
              <input type="number" placeholder="Diskon min %" value={minDiscount} onChange={e => setMinDiscount(e.target.value)} className="glass px-4 py-2 rounded w-full bg-white dark:bg-dark-900 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20" />
              <input type="number" placeholder="Stok min" value={minStock} onChange={e => setMinStock(e.target.value)} className="glass px-4 py-2 rounded w-full bg-white dark:bg-dark-900 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20" />
              <select value={isNew} onChange={e => setIsNew(e.target.value)} className="glass px-4 py-2 rounded w-full bg-white dark:bg-dark-900 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20">
                <option value="">Semua Status</option>
                <option value="true">Produk Baru</option>
                <option value="false">Bukan Produk Baru</option>
              </select>
              <input type="number" placeholder="Rating min" value={minRating} onChange={e => setMinRating(e.target.value)} className="glass px-4 py-2 rounded w-full bg-white dark:bg-dark-900 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20" />
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
            <div className="flex justify-end mb-4">
              <input type="text" placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)} className="glass px-4 py-2 rounded w-full max-w-xs bg-white dark:bg-dark-900 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20" />
            </div>
            {loading ? (
              <div className="text-gray-600 dark:text-white/70 py-12 text-center">Memuat produk...</div>
            ) : products.length === 0 ? (
              <div className="text-gray-600 dark:text-white/70 py-12 text-center">Tidak ada produk ditemukan.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
} 