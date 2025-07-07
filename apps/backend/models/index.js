const sequelize = require('../config/database');
const Category = require('./Category');
const Product = require('./Product');
const User = require('./User');

const syncDb = async () => {
  await sequelize.sync({ alter: true });
  console.log('Database synced!');
};

module.exports = {
  sequelize,
  Category,
  Product,
  User,
  syncDb,
}; 
 
 
 
 
 
 
 