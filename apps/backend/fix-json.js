const fs = require('fs');

try {
  // Read the problematic JSON file
  const content = fs.readFileSync('data/products.json', 'utf8');
  
  // Try to parse and re-stringify to fix any formatting issues
  const data = JSON.parse(content);
  
  // Write back with proper formatting
  fs.writeFileSync('data/products.json', JSON.stringify(data, null, 2));
  
  console.log('JSON file fixed successfully!');
} catch (error) {
  console.log('Error fixing JSON:', error.message);
  
  // If parsing fails, try to create a minimal valid JSON
  console.log('Creating backup and minimal JSON...');
  
  // Create a backup
  fs.copyFileSync('data/products.json', 'data/products_backup.json');
  
  // Create minimal valid JSON with just a few products
  const minimalData = [
    {
      "id": "1001",
      "name": "Blangkon Batik Premium",
      "description": "Blangkon batik premium dengan motif tradisional yang elegan.",
      "price": 300000,
      "categoryId": "1",
      "stock": 106,
      "isActive": true
    },
    {
      "id": "1002", 
      "name": "Blangkon Modern Hitam",
      "description": "Blangkon modern dengan desain minimalis dan warna hitam elegan.",
      "price": 200000,
      "categoryId": "2",
      "stock": 15,
      "isActive": false
    }
  ];
  
  fs.writeFileSync('data/products.json', JSON.stringify(minimalData, null, 2));
  console.log('Created minimal valid JSON file');
} 