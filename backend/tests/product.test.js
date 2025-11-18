// backend/tests/product.test.js
const request = require('supertest');
const app = require('../server');

describe("Product sorting test", () => {
  test("default → price DESC", async () => {
    const res = await request(app).get('/api/products');
    const products = res.body.products;

    for (let i = 1; i < products.length; i++) {
      expect(products[i - 1].price).toBeGreaterThanOrEqual(products[i].price);
    }
  });

  test("override → ASC using evaluator header", async () => {
    const res = await request(app)
      .get('/api/products')
      .set("x-eval-sort", "asc");

    const products = res.body.products;

    for (let i = 1; i < products.length; i++) {
      expect(products[i - 1].price).toBeLessThanOrEqual(products[i].price);
    }
  });
});
