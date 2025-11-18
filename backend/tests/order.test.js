// backend/tests/order.test.js
const request = require('supertest');
const app = require('../server');

describe("Checkout test", () => {
  let token;

  beforeAll(async () => {
    const login = await request(app).post('/api/auth/login').send({
      email: "admin@example.com",
      password: "Admin@123"
    });
    token = login.body.token;
  });

  test("create order", async () => {
    const res = await request(app)
      .post('/api/orders/checkout')
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [
          { productId: "replace_me_with_valid_product_id", quantity: 2 }
        ]
      });

    expect([200, 201]).toContain(res.statusCode);
  });
});
