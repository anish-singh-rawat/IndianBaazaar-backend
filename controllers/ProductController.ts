import { RequestHandler } from "express";
import { z } from "zod";
import { Op } from "sequelize";
import { AuthRequest } from "../utils/auth.js";
import { Product } from "../models/productModel.js";
import { createProductNotification } from "./NotificationController.js";

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
    res.status(500).json({ error });
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
    res.status(500).json({ error });
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
    res.status(400).json({ error });
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
    res.status(400).json({ error });
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
    res.status(500).json({ error });
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
    res.status(500).json({ error });
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
    res.status(500).json({ error});
  }
};
