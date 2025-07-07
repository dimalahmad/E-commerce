const fs = require('fs');
const path = require('path');

const categoriesPath = path.join(__dirname, './data/categories.json');
const productsPath = path.join(__dirname, './data/products_clean.json');

function readCategories() {
  if (!fs.existsSync(categoriesPath)) return [];
  return JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
}

function readProducts() {
  if (!fs.existsSync(productsPath)) return [];
  return JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
}

function writeCategories(data) {
  fs.writeFileSync(categoriesPath, JSON.stringify(data, null, 2));
}

// Fungsi untuk menghitung ulang product count yang akurat
function recalculateCategoryCounts() {
  console.log('🔄 Menghitung ulang product count kategori...');
  
  const products = readProducts();
  const categories = readCategories();
  
  console.log(`📊 Total produk: ${products.length}`);
  console.log(`📂 Total kategori: ${categories.length}`);
  
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
    } else {
      console.log(`⚠️  Produk ${product.name} (ID: ${product.id}) memiliki categoryId "${product.categoryId}" yang tidak ditemukan`);
    }
  });
  
  // Tampilkan hasil
  console.log('\n📈 Hasil perhitungan:');
  updatedCategories.forEach(cat => {
    console.log(`  - ${cat.name}: ${cat.productCount} produk`);
  });
  
  // Simpan ke file
  writeCategories(updatedCategories);
  console.log('\n✅ Product count kategori berhasil diperbarui!');
  
  return updatedCategories;
}

// Jalankan script
if (require.main === module) {
  try {
    recalculateCategoryCounts();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

module.exports = { recalculateCategoryCounts }; 