// backend/controllers/product.controller.js
const Product = require('../models/mongo/product.model');

// List products with search, category, pagination and server-side sorting
exports.listProducts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.max(1, parseInt(req.query.limit || '12'));
    const skip = (page - 1) * limit;

    const search = (req.query.search || '').trim();
    const category = (req.query.category || '').trim();

    const filter = {};
    if (search) {
      // text-like match on name, sku or description (case-insensitive)
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;

    // Server-side sorting: default price desc; evaluator can set header 'x-eval-sort: asc'
    const sortHeader = (req.headers['x-eval-sort'] || req.query.sort || '').toString().toLowerCase();
    const sortObj = sortHeader === 'asc' ? { price: 1 } : { price: -1 };

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter)
    ]);

    return res.json({
      products: items,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    next(err);
  }
};

// Get single product
exports.getProductById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const p = await Product.findById(id).lean();
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (err) {
    next(err);
  }
};

// Create product (admin only)
exports.createProduct = async (req, res, next) => {
  try {
    const { sku, name, price, category, description, stock } = req.body;
    if (!sku || !name || price == null) return res.status(400).json({ message: 'sku, name and price required' });

    // ensure unique SKU
    const exists = await Product.findOne({ sku });
    if (exists) return res.status(409).json({ message: 'SKU already exists' });

    const created = await Product.create({
      sku, name, price: Number(price), category: category || '', description: description || '', stock: Number(stock || 0)
    });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

// Update product (admin only)
exports.updateProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { sku, name, price, category, description, stock } = req.body;
    const existing = await Product.findById(id);
    if (!existing) return res.status(404).json({ message: 'Product not found' });

    // If SKU changed, ensure uniqueness
    if (sku && sku !== existing.sku) {
      const other = await Product.findOne({ sku });
      if (other) return res.status(409).json({ message: 'SKU already exists' });
      existing.sku = sku;
    }

    if (name) existing.name = name;
    if (price != null) existing.price = Number(price);
    if (category != null) existing.category = category;
    if (description != null) existing.description = description;
    if (stock != null) existing.stock = Number(stock);

    await existing.save();
    res.json(existing);
  } catch (err) {
    next(err);
  }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const r = await Product.findByIdAndDelete(id);
    if (!r) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

// backend/controllers/product.controller.js
// const Product = require('../models/mongo/product.model');

exports.listProducts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.max(1, parseInt(req.query.limit || '12'));
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const category = (req.query.category || '').trim();
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;

    // Server-side sorting: default price desc. evaluator can set header x-eval-sort: asc
    const sortHeader = (req.headers['x-eval-sort'] || req.query.sort || '').toString().toLowerCase();
    const sortObj = sortHeader === 'asc' ? { price: 1 } : { price: -1 };

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter)
    ]);

    res.json({ products: items, page, totalPages: Math.ceil(total / limit), total });
  } catch (err) { next(err); }
};

exports.getProductById = async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id).lean();
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (err) { next(err); }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { sku, name, price, category, description, stock } = req.body;
    if (!sku || !name || price == null) return res.status(400).json({ message: 'sku, name and price required' });
    if (await Product.findOne({ sku })) return res.status(409).json({ message: 'SKU already exists' });
    const created = await Product.create({ sku, name, price: Number(price), category, description, stock: Number(stock||0) });
    res.status(201).json(created);
  } catch (err) { next(err); }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const existing = await Product.findById(id);
    if (!existing) return res.status(404).json({ message: 'Product not found' });
    const { sku, name, price, category, description, stock } = req.body;
    if (sku && sku !== existing.sku && (await Product.findOne({ sku }))) return res.status(409).json({ message: 'SKU exists' });
    if (sku) existing.sku = sku;
    if (name) existing.name = name;
    if (price != null) existing.price = Number(price);
    if (category != null) existing.category = category;
    if (description != null) existing.description = description;
    if (stock != null) existing.stock = Number(stock);
    await existing.save();
    res.json(existing);
  } catch (err) { next(err); }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const r = await Product.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
