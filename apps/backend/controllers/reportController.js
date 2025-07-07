const fs = require('fs');
const path = require('path');

const ordersPath = path.join(__dirname, '../data/orders.json');
const productsPath = path.join(__dirname, '../data/products_clean.json');
const usersPath = path.join(__dirname, '../data/users.json');

function readOrders() {
  if (!fs.existsSync(ordersPath)) return [];
  return JSON.parse(fs.readFileSync(ordersPath, 'utf-8'));
}
function readProducts() {
  if (!fs.existsSync(productsPath)) return [];
  return JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
}
function readUsers() {
  if (!fs.existsSync(usersPath)) return [];
  return JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
}

const statusLabels = {
  'terkirim': 'Terkirim',
  'pembayaran_diterima': 'Pembayaran Diterima',
  'dibayar': 'Dibayar',
  'pending': 'Pending',
  'batal': 'Dibatalkan',
  'menunggu_pembayaran': 'Menunggu Pembayaran',
  // tambahkan mapping lain jika ada
};

// f. Laporan penjualan global
exports.globalSales = (req, res) => {
  const orders = readOrders();
  let totalQty = 0;
  let totalRevenue = 0;
  let totalProfit = 0;
  const products = readProducts();
  orders.forEach(order => {
    if (order.status !== 'dibayar' && order.status !== 'pembayaran_diterima' && order.status !== 'terkirim') return;
    order.items.forEach(item => {
      totalQty += item.quantity;
      totalRevenue += item.price * item.quantity;
      const prod = products.find(p => String(p.id) === String(item.productId));
      if (prod && prod.originalPrice) {
        totalProfit += (item.price - prod.originalPrice) * item.quantity;
      }
    });
  });
  res.json({ totalQty, totalRevenue, totalProfit });
};

// g. Laporan penjualan periodik (by month)
exports.periodicSales = (req, res) => {
  const { start, end } = req.query;
  const orders = readOrders();
  const products = readProducts();
  const result = {};
  orders.forEach(order => {
    if (order.status !== 'dibayar' && order.status !== 'pembayaran_diterima' && order.status !== 'terkirim') return;
    const date = new Date(order.createdAt);
    if ((start && date < new Date(start)) || (end && date > new Date(end))) return;
    const ym = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
    if (!result[ym]) result[ym] = { qty: 0, revenue: 0, profit: 0 };
    order.items.forEach(item => {
      result[ym].qty += item.quantity;
      result[ym].revenue += item.price * item.quantity;
      const prod = products.find(p => String(p.id) === String(item.productId));
      if (prod && prod.originalPrice) {
        result[ym].profit += (item.price - prod.originalPrice) * item.quantity;
      }
    });
  });
  res.json(result);
};

// h. Laporan pendapatan periodik (hanya order sudah bayar)
exports.periodicIncome = (req, res) => {
  const { start, end } = req.query;
  const orders = readOrders();
  const products = readProducts();
  let totalIncome = 0;
  let totalProfit = 0;
  orders.forEach(order => {
    if (order.status !== 'dibayar' && order.status !== 'pembayaran_diterima' && order.status !== 'terkirim') return;
    const date = new Date(order.createdAt);
    if ((start && date < new Date(start)) || (end && date > new Date(end))) return;
    order.items.forEach(item => {
      totalIncome += item.price * item.quantity;
      const prod = products.find(p => String(p.id) === String(item.productId));
      if (prod && prod.originalPrice) {
        totalProfit += (item.price - prod.originalPrice) * item.quantity;
      }
    });
  });
  res.json({ totalIncome, totalProfit });
};

exports.complexReport = (req, res) => {
  const { start, end, status, user, product } = req.query;
  const orders = readOrders();
  const products = readProducts();
  const users = readUsers();
  // Filter order yang sudah dibayar/terkirim
  let validOrders = orders.filter(order => ['dibayar', 'pembayaran_diterima', 'terkirim'].includes(order.status));
  // Filter tanggal
  if (start || end) {
    validOrders = validOrders.filter(order => {
      const date = new Date(order.createdAt);
      if (start && date < new Date(start)) return false;
      if (end && date > new Date(end)) return false;
      return true;
    });
  }
  // Filter status
  if (status) {
    validOrders = validOrders.filter(order => order.status === status);
  }
  // Filter user
  if (user) {
    validOrders = validOrders.filter(order => String(order.userId) === String(user));
  }
  // Filter produk
  if (product) {
    validOrders = validOrders.filter(order => order.items.some(item => String(item.productId) === String(product)));
  }
  // GLOBAL
  let totalOrder = validOrders.length;
  let totalItem = 0;
  let totalRevenue = 0;
  let totalProfit = 0;
  let totalIncome = 0;
  validOrders.forEach(order => {
    order.items.forEach(item => {
      if (product && String(item.productId) !== String(product)) return;
      totalItem += item.quantity;
      totalRevenue += item.price * item.quantity;
      totalIncome += item.price * item.quantity;
      const prod = products.find(p => String(p.id) === String(item.productId));
      if (prod && prod.originalPrice) {
        totalProfit += (item.price - prod.originalPrice) * item.quantity;
      }
    });
  });
  const avgOrderValue = totalOrder ? totalRevenue / totalOrder : 0;
  const avgProfitPerOrder = totalOrder ? totalProfit / totalOrder : 0;
  // PERIODIK (per bulan)
  const periodic = {};
  validOrders.forEach(order => {
    const date = new Date(order.createdAt);
    const ym = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
    if (!periodic[ym]) periodic[ym] = { order: 0, item: 0, revenue: 0, profit: 0, income: 0 };
    periodic[ym].order++;
    order.items.forEach(item => {
      if (product && String(item.productId) !== String(product)) return;
      periodic[ym].item += item.quantity;
      periodic[ym].revenue += item.price * item.quantity;
      periodic[ym].income += item.price * item.quantity;
      const prod = products.find(p => String(p.id) === String(item.productId));
      if (prod && prod.originalPrice) {
        periodic[ym].profit += (item.price - prod.originalPrice) * item.quantity;
      }
    });
  });
  // DETAIL
  const detail = validOrders.map(order => {
    let profit = 0;
    order.items.forEach(item => {
      if (product && String(item.productId) !== String(product)) return;
      const prod = products.find(p => String(p.id) === String(item.productId));
      if (prod && prod.originalPrice) {
        profit += (item.price - prod.originalPrice) * item.quantity;
      }
    });
    const userObj = users.find(u => String(u.id) === String(order.userId));
    return {
      orderNumber: order.orderNumber,
      date: order.createdAt,
      user: userObj ? userObj.username : order.userId,
      status: statusLabels[order.status] || order.status,
      total: order.total,
      profit,
      items: order.items.filter(item => !product || String(item.productId) === String(product))
    };
  });
  // PRODUK TERLARIS
  const productMap = {};
  validOrders.forEach(order => {
    order.items.forEach(item => {
      if (product && String(item.productId) !== String(product)) return;
      if (!productMap[item.productId]) productMap[item.productId] = { sold: 0, revenue: 0, profit: 0, name: '', productId: item.productId };
      productMap[item.productId].sold += item.quantity;
      productMap[item.productId].revenue += item.price * item.quantity;
      const prod = products.find(p => String(p.id) === String(item.productId));
      if (prod) productMap[item.productId].name = prod.name;
      if (prod && prod.originalPrice) {
        productMap[item.productId].profit += (item.price - prod.originalPrice) * item.quantity;
      }
    });
  });
  const topProducts = Object.values(productMap).sort((a, b) => b.sold - a.sold).slice(0, 10);
  // USER TERBANYAK
  const userMap = {};
  validOrders.forEach(order => {
    if (!userMap[order.userId]) userMap[order.userId] = { userId: order.userId, orderCount: 0, totalSpent: 0 };
    userMap[order.userId].orderCount++;
    userMap[order.userId].totalSpent += order.total;
  });
  const topUsers = Object.values(userMap).sort((a, b) => b.orderCount - a.orderCount).slice(0, 10);
  // STATUS STATS
  const statusMap = {};
  validOrders.forEach(order => {
    const label = statusLabels[order.status] || order.status;
    if (!statusMap[label]) statusMap[label] = { status: label, count: 0 };
    statusMap[label].count++;
  });
  const statusStats = Object.values(statusMap);
  res.json({
    global: { totalOrder, totalItem, totalRevenue, totalProfit, avgOrderValue, avgProfitPerOrder, totalIncome },
    periodic,
    detail,
    topProducts,
    topUsers,
    statusStats
  });
}; 