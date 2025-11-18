// backend/controllers/order.controller.js
const { getPrisma } = require('../config/db');
const Product = require('../models/mongo/product.model');

/**
 * Checkout: create SQL Order and OrderItems.
 * This already existed in Phase 2; kept and exported.
 */
exports.checkout = async (req, res, next) => {
  try {
    const prisma = getPrisma();
    const userId = req.user.id;
    const items = req.body.items || [];

    if (!items.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let total = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });

      const priceAtPurchase = product.price;
      const subtotal = priceAtPurchase * item.quantity;
      total += subtotal;

      orderItemsData.push({
        productId: String(product._id),
        quantity: item.quantity,
        priceAtPurchase
      });
    }

    const order = await prisma.order.create({
      data: {
        userId,
        total,
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: true
      }
    });

    return res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

/**
 * Get orders for authenticated user.
 * Returns orders with items enriched with product info from Mongo.
 */
exports.getUserOrders = async (req, res, next) => {
  try {
    const prisma = getPrisma();
    const userId = req.user.id;

    const orders = await prisma.order.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });

    // enrich items with product info from Mongo
    const enriched = await Promise.all(orders.map(async (order) => {
      const itemsWithProduct = await Promise.all(order.items.map(async (it) => {
        const product = await Product.findById(it.productId).lean().exec().catch(()=>null);
        return {
          id: it.id,
          productId: it.productId,
          quantity: it.quantity,
          priceAtPurchase: it.priceAtPurchase,
          subtotal: Number((it.priceAtPurchase * it.quantity).toFixed(2)),
          product: product ? {
            _id: product._id,
            sku: product.sku,
            name: product.name,
            category: product.category,
            price: product.price,
            description: product.description
          } : null
        };
      }));

      return {
        id: order.id,
        userId: order.userId,
        total: order.total,
        createdAt: order.createdAt,
        items: itemsWithProduct
      };
    }));

    res.json(enriched);
  } catch (err) {
    next(err);
  }
};
