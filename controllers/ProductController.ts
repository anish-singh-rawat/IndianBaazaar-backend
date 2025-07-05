import { RequestHandler } from "express";
import { AuthRequest } from "../utils/auth";
import { z } from "zod";
import { Op } from "sequelize";
import { Product } from "../models/productModel";
import { createProductNotification } from "./NotificationController";

const faqSchema = z.object({
  id: z.string(),
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  mrp: z.number().positive("MRP must be positive"),
  our_price: z.number().positive("Price must be positive"),
  discount: z.number().min(0).max(100).optional(),
  offers: z.array(z.string()).optional(),
  coupons: z.array(z.string()).optional(),
  company: z.string().min(1, "Company name is required"),
  color: z.string().optional(),
  size: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  category: z.enum([
    "clothes",
    "beauty",
    "mice",
    "electronics",
    "books",
    "groceries",
    "other",
  ]),
  in_stock: z.boolean().default(true),
  stockQuantity: z.number().int().min(0).default(0),
  faqs: z.array(faqSchema).optional().default([]),
});

// Fallback sample data for when database is unavailable
const sampleProducts = [
  {
    id: "P1A2B3C4D5E6F7G8H9I0",
    name: "Premium Wireless Headphones",
    description:
      "High-quality wireless headphones with noise cancellation and superior sound quality.",
    images: ["/api/placeholder/400/300"],
    mrp: 299.99,
    our_price: 249.99,
    discount: 17,
    rating: 4.5,
    afterExchangePrice: 199.99,
    offers: ["Free shipping", "1 year warranty"],
    coupons: ["SAVE20", "NEWYEAR"],
    company: "AudioTech",
    color: "Black",
    size: "One Size",
    weight: "350g",
    height: "20cm",
    category: "electronics",
    in_stock: true,
    stockQuantity: 50,
    reviews: [],
    faqs: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "Q2B3C4D5E6F7G8H9I0J1",
    name: "Smart Fitness Watch",
    description:
      "Advanced fitness tracking with heart rate monitor, GPS, and smartphone connectivity.",
    images: ["/api/placeholder/400/300"],
    mrp: 199.99,
    our_price: 159.99,
    discount: 20,
    rating: 4.3,
    afterExchangePrice: 129.99,
    offers: ["Free shipping", "30-day trial"],
    coupons: ["FITNESS15"],
    company: "WearTech",
    color: "Silver",
    size: "42mm",
    weight: "45g",
    height: "1.2cm",
    category: "electronics",
    in_stock: true,
    stockQuantity: 75,
    reviews: [],
    faqs: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "R3C4D5E6F7G8H9I0J1K2",
    name: "Organic Cotton T-Shirt",
    description:
      "Comfortable and sustainable organic cotton t-shirt in various colors.",
    images: ["/api/placeholder/400/300"],
    mrp: 29.99,
    our_price: 24.99,
    discount: 17,
    rating: 4.7,
    afterExchangePrice: 19.99,
    offers: ["Buy 2 get 1 free"],
    coupons: ["ORGANIC10"],
    company: "EcoWear",
    color: "Blue",
    size: "M",
    weight: "200g",
    height: "70cm",
    category: "clothes",
    in_stock: true,
    stockQuantity: 100,
    reviews: [],
    faqs: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const getAllProducts: RequestHandler = async (req, res) => {
  // Extract query parameters outside try-catch to access in catch block
  const { category, search, in_stock } = req.query;

  try {
    const whereClause: any = {};

    if (category) whereClause.category = category;
    if (in_stock === "true") whereClause.in_stock = true;
    if (search) {
      whereClause.name = { [Op.iLike]: `%${search}%` };
    }

    const products = await Product.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });
    res.json({ products });
  } catch (error) {
    console.error("getAllProducts error:", error);
    console.log("Database unavailable, using fallback sample data");

    // Filter sample products based on query parameters
    let filteredProducts = [...sampleProducts];

    if (category && category !== "all") {
      filteredProducts = filteredProducts.filter(
        (product) => product.category === category,
      );
    }

    if (search) {
      const searchLower = search.toString().toLowerCase();
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower),
      );
    }

    if (in_stock === "true") {
      filteredProducts = filteredProducts.filter(
        (product: any) => product.in_stock,
      );
    }

    res.json({ products: filteredProducts });
  }
};

export const getProductById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ product });
  } catch (error) {
    console.error("getProductById error:", error);
    console.log("Database unavailable, using fallback sample data");

    // Find product in sample data
    const product = sampleProducts.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ product });
  }
};

export const createProduct: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const data: any = productSchema.parse(req.body);
    const discount =
      data.discount ||
      Math.round(((data.mrp - data.our_price) / data.mrp) * 100);
    const afterExchangePrice = parseFloat((data.our_price * 0.95).toFixed(2));

    const product: any = await Product.create({
      ...data,
      our_price: data.our_price,
      discount,
      after_exchange_price: afterExchangePrice,
      in_stock: data.in_stock,
      stock_quantity: data.stockQuantity,
      faqs: data.faqs || [],
    });

    await createProductNotification(product.name, product.id);
    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    console.error("createProduct error:", error);
    if (error instanceof z.ZodError)
      return res.status(400).json({ error: error.errors[0].message });
    res.status(503).json({ error: "Could not create product" });
  }
};

export const updateProduct: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const data: any = productSchema.partial().parse(req.body);

    const product: any = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    await product.update({
      ...data,
      our_price: data.our_price,
      in_stock: data.in_stock,
      stock_quantity: data.stockQuantity,
      faqs: data.faqs || product.faqs,
    });

    res.json({ message: "Product updated", product });
  } catch (error) {
    console.error("updateProduct error:", error);
    if (error instanceof z.ZodError)
      return res.status(400).json({ error: error.errors[0].message });
    res.status(503).json({ error: "Could not update product" });
  }
};

export const deleteProduct: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("deleteProduct error:", error);
    res.status(503).json({ error: "Could not delete product" });
  }
};

export const getProductsByCategory: RequestHandler = async (req, res) => {
  try {
    const { category } = req.params;
    const { in_stock } = req.query;
    const whereClause: any = { category };
    if (in_stock === "true") whereClause.in_stock = true;

    const products = await Product.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });
    res.json({ products });
  } catch (error) {
    console.error("getProductsByCategory error:", error);
    console.log("Database unavailable, using fallback sample data");

    // Filter sample products by category
    const { category } = req.params;
    const { in_stock } = req.query;
    let filteredProducts = sampleProducts.filter(
      (product) => product.category === category,
    );

    if (in_stock === "true") {
      filteredProducts = filteredProducts.filter(
        (product: any) => product.in_stock,
      );
    }

    res.json({ products: filteredProducts });
  }
};

export const getSearchSuggestions: RequestHandler = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string" || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const term = q.trim();
    const products = await Product.findAll({
      where: {
        name: { [Op.iLike]: `%${term}%` },
        in_stock: true,
      },
      limit: 10,
    });

    const suggestions = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      image: p.images?.[0] || "/placeholder.svg",
      category: p.category,
      price: parseFloat(p.our_price as any) || 0,
    }));

    res.json({ suggestions });
  } catch (error) {
    console.error("getSearchSuggestions error:", error);
    console.log("Database unavailable, using fallback sample data");

    const { q } = req.query;
    if (!q || typeof q !== "string" || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const term = q.trim().toLowerCase();
    const filteredProducts = sampleProducts
      .filter(
        (product: any) =>
          product.name.toLowerCase().includes(term) && product.in_stock,
      )
      .slice(0, 10);

    const suggestions = filteredProducts.map((p) => ({
      id: p.id,
      name: p.name,
      image: p.images?.[0] || "/placeholder.svg",
      category: p.category,
      price: p.our_price,
    }));

    res.json({ suggestions });
  }
};
