const fs = require('fs');
const path = require('path');

const categoriesPath = path.join(__dirname, '../data/categories.json');
const productsPath = path.join(__dirname, '../data/products_clean.json');

function readCategories() {
  if (!fs.existsSync(categoriesPath)) return [];
  return JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
}

function writeCategories(data) {
  fs.writeFileSync(categoriesPath, JSON.stringify(data, null, 2));
}

function readProducts() {
  if (!fs.existsSync(productsPath)) return [];
  return JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
}

// Fungsi untuk menghitung product count yang akurat
function calculateProductCounts() {
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
  
  return updatedCategories;
}

// Fungsi untuk update product count di file categories.json
function updateCategoryProductCounts() {
  const updatedCategories = calculateProductCounts();
  writeCategories(updatedCategories);
  return updatedCategories;
}

exports.getAll = (req, res) => {
  try {
    // Selalu hitung ulang product count yang akurat
    const categories = updateCategoryProductCounts();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = (req, res) => {
  try {
    const categories = updateCategoryProductCounts();
    const category = categories.find((c) => c.id == req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = (req, res) => {
  try {
    const categories = readCategories();
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    // Check if category name already exists
    if (categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    
    const newCategory = {
      id: Date.now().toString(),
      name: name.trim(),
      productCount: 0
    };
    
    categories.push(newCategory);
    writeCategories(categories);
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = (req, res) => {
  try {
    const categories = readCategories();
    const idx = categories.findIndex((c) => c.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Category not found' });
    
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    // Check if category name already exists (excluding current category)
    const existingCategory = categories.find(c => 
      c.id !== req.params.id && 
      c.name.toLowerCase() === name.toLowerCase()
    );
    if (existingCategory) {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    
    categories[idx] = {
      ...categories[idx],
      name: name.trim()
    };
    
    writeCategories(categories);
    res.json(categories[idx]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = (req, res) => {
  try {
    const categories = readCategories();
    const products = readProducts();
    
    const idx = categories.findIndex((c) => c.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Category not found' });
    
    // Check if category has products
    const hasProducts = products.some(p => p.categoryId === req.params.id);
    if (hasProducts) {
      return res.status(400).json({ error: 'Cannot delete category that has products' });
    }
    
    const removed = categories.splice(idx, 1);
    writeCategories(categories);
    res.json({ message: 'Category deleted', removed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 