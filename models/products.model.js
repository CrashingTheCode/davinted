const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
});

// Define a model
const User = sequelize.define('user', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    //   unique: true,
    allowNull: false,
  },
});

User.sync()
  .then(() => console.log('Table created successfully'))
  .catch(error => console.error(error));

const Product = sequelize.define('product', {
  Vendedor: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  SKU: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  Sexo: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  Tags: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  vendedor2: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  Nombre: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  Marca: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  Talla: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  Categoría: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  Subcategoría: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  Estilo: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  Estilo_2: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  Color: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  Color_optional: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  Precio_Influ: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  Inventory: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  noof_Fotos: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  Precio_Final: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  Fecha: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  Descripción: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

Product.sync()
  .then(() => console.log('Table created successfully'))
  .catch(error => console.error(error));

const Iteration = sequelize.define('iteration', {
  current: {
    type: Sequelize.NUMBER,
    default: 0,
  },
});

Iteration.sync()
  .then(() => console.log('Iteration created successfully'))
  .catch(error => console.error(error));

module.exports = {sequelize, User, Product, Iteration};
