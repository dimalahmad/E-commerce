const fs = require('fs');
const path = require('path');

const ordersPath = path.join(__dirname, '../data/orders.json');
const productsPath = path.join(__dirname, '../data/products_clean.json');

function readOrders() {
  if (!fs.existsSync(ordersPath)) return [];
  return JSON.parse(fs.readFileSync(ordersPath, 'utf-8'));
}

function writeOrders(data) {
  fs.writeFileSync(ordersPath, JSON.stringify(data, null, 2));
}

function readProducts() {
  if (!fs.existsSync(productsPath)) return [];
  return JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
}

function writeProducts(data) {
  fs.writeFileSync(productsPath, JSON.stringify(data, null, 2));
}

exports.getAll = (req, res) => {
  try {
    const orders = readOrders();
    res.json(Array.isArray(orders) ? orders : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = (req, res) => {
  try {
    const orders = readOrders();
    const order = orders.find((o) => o.id == req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = (req, res) => {
  try {
    const orders = readOrders();
    const products = readProducts();
    const { orderNumber, userId, items, shipping, payment, status, total, shippingCost, subtotal } = req.body;
    // Cek stok cukup
    for (const item of items) {
      const prodIdx = products.findIndex(p => String(p.id) === String(item.productId));
      if (prodIdx === -1) return res.status(400).json({ error: `Produk ${item.productId} tidak ditemukan` });
      if (products[prodIdx].stock < item.quantity) return res.status(400).json({ error: `Stok produk ${products[prodIdx].name} tidak cukup` });
    }
    // Kurangi stok
    for (const item of items) {
      const prodIdx = products.findIndex(p => String(p.id) === String(item.productId));
      products[prodIdx].stock -= item.quantity;
    }
    writeProducts(products);
    const generatedOrderNumber = orderNumber || `BLK${Date.now()}`;
    const newOrder = {
      id: Date.now(),
      orderNumber: generatedOrderNumber,
      userId,
      items,
      shipping,
      payment,
      status: status || 'menunggu_pembayaran',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      total,
      shippingCost,
      subtotal
    };
    orders.push(newOrder);
    writeOrders(orders);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = (req, res) => {
  try {
    const orders = readOrders();
    const idx = orders.findIndex((o) => o.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Order not found' });
    const { orderNumber, userId, items, shipping, payment, status, total, shippingCost, subtotal, paymentProof } = req.body;
    orders[idx] = {
      ...orders[idx],
      orderNumber: orderNumber || orders[idx].orderNumber,
      userId: userId || orders[idx].userId,
      items: items || orders[idx].items,
      shipping: shipping || orders[idx].shipping,
      payment: payment || orders[idx].payment,
      status: status || orders[idx].status,
      total: total || orders[idx].total,
      shippingCost: shippingCost || orders[idx].shippingCost,
      subtotal: subtotal || orders[idx].subtotal,
      updatedAt: new Date().toISOString(),
      paymentProof: paymentProof !== undefined ? paymentProof : orders[idx].paymentProof
    };
    writeOrders(orders);
    res.json(orders[idx]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateStatus = (req, res) => {
  try {
    const orders = readOrders();
    const idx = orders.findIndex((o) => o.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Order not found' });
    const { status } = req.body;
    orders[idx].status = status;
    orders[idx].updatedAt = new Date().toISOString();
    writeOrders(orders);
    res.json(orders[idx]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = (req, res) => {
  try {
    let orders = readOrders();
    const idx = orders.findIndex((o) => o.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Order not found' });
    const removed = orders.splice(idx, 1);
    writeOrders(orders);
    res.json({ message: 'Order deleted', removed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 