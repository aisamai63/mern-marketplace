const request = require("supertest");

jest.mock("../models/User", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
}));

jest.mock("../models/Listing", () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock("../models/History", () => ({
  create: jest.fn(),
}));

const User = require("../models/User");
const Listing = require("../models/Listing");
const History = require("../models/History");
const { app } = require("../server");

let users = [];
let listings = [];
let idCounter = 1;

const nextId = () => {
  const id = idCounter.toString(16).padStart(24, "0");
  idCounter += 1;
  return id;
};

const makeQuery = (result) => ({
  select: async () => result,
  then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  catch: (reject) => Promise.resolve(result).catch(reject),
});

beforeAll(() => {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test_jwt_secret";
  process.env.JWT_EXPIRE = "1d";
});

beforeEach(() => {
  jest.clearAllMocks();
  users = [];
  listings = [];
  idCounter = 1;

  User.findOne.mockImplementation(({ email }) => {
    const user = users.find((item) => item.email === email) || null;
    if (!user) {
      return makeQuery(null);
    }

    const loginDoc = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      matchPassword: async (enteredPassword) =>
        enteredPassword === user.rawPassword,
    };

    return makeQuery(loginDoc);
  });

  User.create.mockImplementation(async ({ name, email, password }) => {
    const created = {
      _id: nextId(),
      name,
      email,
      role: "user",
      rawPassword: password,
    };

    users.push(created);

    return {
      _id: created._id,
      name: created.name,
      email: created.email,
      role: created.role,
    };
  });

  User.findById.mockImplementation((id) => {
    const user = users.find((item) => item._id === id) || null;
    if (!user) {
      return makeQuery(null);
    }

    return makeQuery({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  });

  Listing.create.mockImplementation(async (payload) => {
    const created = {
      _id: nextId(),
      ...payload,
    };

    listings.push(created);
    return created;
  });

  Listing.findById.mockImplementation(async (id) => {
    return listings.find((item) => item._id === id) || null;
  });

  Listing.findByIdAndUpdate.mockImplementation(async (id, data) => {
    const index = listings.findIndex((item) => item._id === id);
    if (index === -1) {
      return null;
    }

    listings[index] = {
      ...listings[index],
      ...data,
    };

    return listings[index];
  });

  Listing.findByIdAndDelete.mockImplementation(async (id) => {
    const index = listings.findIndex((item) => item._id === id);
    if (index === -1) {
      return null;
    }

    const [deleted] = listings.splice(index, 1);
    return deleted;
  });

  History.create.mockResolvedValue({ _id: nextId() });
});

describe("Backend integration flow tests", () => {
  it("registers, logs in, creates listing, and updates own listing", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Owner User",
      email: "owner@example.com",
      password: "123456",
    });

    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body.success).toBe(true);

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "owner@example.com",
      password: "123456",
    });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.token).toBeDefined();

    const ownerToken = loginRes.body.data.token;

    const createRes = await request(app)
      .post("/api/listings")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        title: "Test Phone",
        description: "Good condition",
        price: 700,
        category: "Electronics",
        images: ["https://example.com/phone.jpg"],
        location: "Toronto",
        status: "active",
      });

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data._id).toBeDefined();

    const listingId = createRes.body.data._id;

    const updateRes = await request(app)
      .put(`/api/listings/${listingId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        price: 650,
        description: "Updated by owner",
      });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.price).toBe(650);
    expect(updateRes.body.data.description).toBe("Updated by owner");
  });

  it("prevents another user from updating owner listing", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Owner User",
      email: "owner@example.com",
      password: "123456",
    });

    const ownerLoginRes = await request(app).post("/api/auth/login").send({
      email: "owner@example.com",
      password: "123456",
    });

    const ownerToken = ownerLoginRes.body.data.token;

    const createRes = await request(app)
      .post("/api/listings")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        title: "Owner Listing",
        description: "Owned item",
        price: 500,
        category: "Electronics",
        images: ["https://example.com/owner.jpg"],
        location: "Toronto",
        status: "active",
      });

    const listingId = createRes.body.data._id;

    await request(app).post("/api/auth/register").send({
      name: "Other User",
      email: "other@example.com",
      password: "123456",
    });

    const otherLoginRes = await request(app).post("/api/auth/login").send({
      email: "other@example.com",
      password: "123456",
    });

    const otherToken = otherLoginRes.body.data.token;

    const forbiddenUpdateRes = await request(app)
      .put(`/api/listings/${listingId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        price: 300,
      });

    expect(forbiddenUpdateRes.statusCode).toBe(403);
    expect(forbiddenUpdateRes.body.success).toBe(false);
    expect(forbiddenUpdateRes.body.message).toBe(
      "Not authorized to update this listing",
    );
  });
});
