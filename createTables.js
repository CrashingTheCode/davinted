const csv = require('csv');
const fs = require('fs');
const {parse} = require('csv-parse');

const {sequelize, User, Product, Iteration} = require('./models/products.model');
