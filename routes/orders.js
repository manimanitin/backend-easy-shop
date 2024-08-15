const { Order } = require('../models/order');
const { OrderItem } = require('../models/orderItem');

const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
  const ordersList = await Order.find()
    .populate('user', 'name')
    .sort({ dateOrdered: -1 });
  if (!ordersList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(ordersList);
});
router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({
      path: 'orderItems',
      populate: { path: 'product', populate: 'category' },
    });
  if (!order) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(order);
});

router.post('/', async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );
  const resolvedItemOrders = await orderItemsIds;

  const totalPrices = await Promise.all(
    resolvedItemOrders.map(async (orderItemsIds) => {
      const orderItem = await OrderItem.findById(orderItemsIds).populate(
        'product',
        'price'
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );
  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  let order = new Order({
    orderItems: resolvedItemOrders,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
    dateOrdered: req.body.dateOrdered,
  });

  console.log(req.body);
  order = await order.save();
  if (!order) {
    return res.status(404).send('the order cannot be created');
  }
  res.send(order);
});

router.put('/:id', async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    {
      new: true,
    }
  );
  if (!order) {
    return res.status(404).send('the order is the very not updated');
  }
  res.send(order);
});

router.delete('/:id', (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        return res.status(200).json({
          success: true,
          message: 'the order is deleted',
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'order not found',
        });
      }
    })
    .catch((err) => {
      return res.status(400).json({
        success: false,
        error: err,
      });
    });
});

router.get('/get/totalsales', async (req, res) => {
  const totalSales = await Order.aggregate([
    {
      $group: { _id: null, totalSales: { $sum: '$totalPrice' } },
    },
  ]);
  if (!totalSales) {
    return res.status(400).send('No generazzione');
  }
  res.send({ totalSales: totalSales.pop().totalSales });
});

router.get(`/get/count`, async (req, res) => {
  const orderCount = await Order.countDocuments();
  if (!orderCount) {
    res.status(500).json({
      success: false,
    });
  }
  res.send({
    orderCount: orderCount,
  });
});

router.get(`/get/userOrders/:userid`, async (req, res) => {
  const UserOrdersList = await Order.find({ user: req.params.userid })
    .populate({
      path: 'orderItems',
      populate: { path: 'product', populate: 'category' },
    })
    .sort({ dateOrdered: -1 });
  if (!UserOrdersList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(UserOrdersList);
});

module.exports = router;
