import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Product, Category } from '@/types';
import ProductCard from '@/components/ProductCard';

export default function CategoryProductsPage() {
  const params = useParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('popularity');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const allProducts = await apiClient.getProducts();
      const allCategories = await apiClient.getCategories();
      const cat = allCategories.find((c: Category) => c.id.toString() === params.id);
      setCategory(cat || null);
      let filtered = allProducts.filter((p: Product) => p.categoryId?.toString() === params.id && p.isActive !== false);
      if (search) filtered = filtered.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
      if (minPrice) filtered = filtered.filter((p) => p.price >= Number(minPrice));
      if (maxPrice) filtered = filtered.filter((p) => p.price <= Number(maxPrice));
      if (sort === 'price-asc') filtered = filtered.sort((a, b) => a.price - b.price);
      if (sort === 'price-desc') filtered = filtered.sort((a, b) => b.price - a.price);
      if (sort === 'rating') filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setProducts(filtered);
      setLoading(false);
    };
    fetchData();
  }, [params.id, sort, minPrice, maxPrice, search]);

  return (
    <div className="pt-16 pb-20 min-h-screen w-full bg-white dark:bg-dark-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gradient mb-2">{category ? category.name : 'Kategori'}</h2>
          <p className="text-gray-600 dark:text-white/70">Lihat semua produk dalam kategori ini</p>
        </div>
        <div className="flex flex-wrap gap-4 mb-8">
          <input type="text" placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)} className="glass px-4 py-2 rounded" />
          <input type="number" placeholder="Harga min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="glass px-4 py-2 rounded w-32" />
          <input type="number" placeholder="Harga max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="glass px-4 py-2 rounded w-32" />
          <select value={sort} onChange={e => setSort(e.target.value)} className="glass px-4 py-2 rounded">
            <option value="popularity">Paling Populer</option>
            <option value="price-asc">Harga Termurah</option>
            <option value="price-desc">Harga Termahal</option>
            <option value="rating">Rating Tertinggi</option>
          </select>
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
      </div>
    </div>
  );
} 