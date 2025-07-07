const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../data/products_clean.json');
const categoriesPath = path.join(__dirname, '../data/categories.json');

function readProducts() {
  if (!fs.existsSync(productsPath)) return [];
  return JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
}

function writeProducts(data) {
  fs.writeFileSync(productsPath, JSON.stringify(data, null, 2));
}

function readCategories() {
  if (!fs.existsSync(categoriesPath)) return [];
  return JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
}

// Fungsi untuk update product count di kategori
function updateCategoryProductCounts() {
  const products = readProducts();
  const categories = readCategories();
  
  // Reset semua productCount ke 0
  const updatedCategories = categories.map(cat => ({
    ...cat,
    productCount: 0
  }));
  
  // Hitung ulang berdasarkan produk yang ada
  products.forEach(product => {
    const category = updatedCategories.find(cat => cat.id === product.categoryId);
    if (category) {
      category.productCount = (category.productCount || 0) + 1;
    }
  });
  
  // Simpan ke file
  fs.writeFileSync(categoriesPath, JSON.stringify(updatedCategories, null, 2));
  return updatedCategories;
}

exports.getAll = (req, res) => {
  try {
    const products = readProducts();
    const categories = readCategories();
    // Attach category object to each product
    const productsWithCategory = products.map((p) => ({
      ...p,
      category: categories.find((c) => c.id === p.categoryId) || null,
    }));
    res.json(productsWithCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = (req, res) => {
  try {
    const products = readProducts();
    const categories = readCategories();
    const product = products.find((p) => p.id == req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    product.category = categories.find((c) => c.id === product.categoryId) || null;
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = (req, res) => {
  try {
    const products = readProducts();
    const categories = readCategories();
    const {
      name, price, stock, categoryId, discount,
      description, longDescription, originalPrice, images,
      isNew, isActive, specifications, features
    } = req.body;
    
    // Validasi nama produk tidak boleh kosong
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nama produk wajib diisi' });
    }
    
    // Validasi nama produk tidak boleh duplikat
    const trimmedName = name.trim();
    const existingProduct = products.find(p => p.name.toLowerCase() === trimmedName.toLowerCase());
    if (existingProduct) {
      return res.status(400).json({ error: 'Produk dengan nama ini sudah ada' });
    }
    
    if (!categories.find((c) => c.id === categoryId)) {
      return res.status(400).json({ error: 'Invalid categoryId' });
    }
    // Validasi images (array of string, max 2MB jika file upload, di sini hanya link/demo)
    const orig = Number(originalPrice) || 0;
    const priceValue = Number(price) || 0; // Harga jual asli (sebelum diskon)
    const disc = Number(discount) || 0;
    const newProduct = {
      id: Date.now(),
      name: trimmedName,
      price: priceValue, // Simpan harga jual asli, bukan yang sudah diskon
      stock,
      categoryId,
      discount: disc,
      description: description || '',
      longDescription: longDescription || '',
      originalPrice: orig,
      images: Array.isArray(images) ? images : [],
      isNew: !!isNew,
      isActive: isActive !== false,
      specifications: typeof specifications === 'object' && specifications !== null ? specifications : {},
      features: Array.isArray(features) ? features : [],
      rating: 0,
      reviews: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.push(newProduct);
    writeProducts(products);
    
    // Update category product counts
    updateCategoryProductCounts();
    
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = (req, res) => {
  try {
    const products = readProducts();
    const categories = readCategories();
    const idx = products.findIndex((p) => p.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });
    const {
      name, price, stock, categoryId, discount,
      description, longDescription, originalPrice, images,
      isNew, isActive, specifications, features
    } = req.body;
    
    // Validasi nama produk tidak boleh kosong
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nama produk wajib diisi' });
    }
    
    // Validasi nama produk tidak boleh duplikat (kecuali produk yang sedang diedit)
    const trimmedName = name.trim();
    const existingProduct = products.find(p => 
      p.name.toLowerCase() === trimmedName.toLowerCase() && 
      p.id != req.params.id
    );
    if (existingProduct) {
      return res.status(400).json({ error: 'Produk dengan nama ini sudah ada' });
    }
    
    if (!categories.find((c) => c.id === categoryId)) {
      return res.status(400).json({ error: 'Invalid categoryId' });
    }
    const origU = Number(originalPrice) || (products[idx].originalPrice ? Number(products[idx].originalPrice) : 0);
    const priceValueU = Number(price) || (products[idx].price ? Number(products[idx].price) : 0); // Harga jual asli
    const discU = Number(discount) || (products[idx].discount ? Number(products[idx].discount) : 0);
    products[idx] = {
      ...products[idx],
      name: trimmedName,
      price: priceValueU, // Simpan harga jual asli, bukan yang sudah diskon
      stock,
      categoryId,
      discount: discU,
      description: description || '',
      longDescription: longDescription || '',
      originalPrice: origU,
      images: Array.isArray(images) ? images : [],
      isNew: !!isNew,
      isActive: isActive !== false,
      specifications: typeof specifications === 'object' && specifications !== null ? specifications : {},
      features: Array.isArray(features) ? features : [],
      updatedAt: new Date().toISOString(),
      // rating, reviews, createdAt tidak diubah
    };
    writeProducts(products);
    
    // Update category product counts
    updateCategoryProductCounts();
    
    res.json(products[idx]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = (req, res) => {
  try {
    let products = readProducts();
    const idx = products.findIndex((p) => p.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });
    const removed = products.splice(idx, 1);
    writeProducts(products);
    
    // Update category product counts
    updateCategoryProductCounts();
    
    res.json({ message: 'Product deleted', removed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 