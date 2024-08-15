const express = require('express');
const morgan = require('morgan');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const api = process.env.API_URL;
const authJWT = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

app.use(cors());
app.options('*', cors());

//middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJWT());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler);

//routers
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');

app.use(`${api}/products`, productsRoutes);
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/users`, usersRoutes);

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log('conectao');
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(3000, () => {
  console.log('server is running http://localhost:3000');
});
