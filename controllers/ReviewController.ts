import { RequestHandler } from "express";
import { z } from "zod";
import { AuthRequest } from "../utils/auth.js";
import { Review } from "../models/reviewModel.js";
import { Order } from "../models/orderModel.js";
import { OrderItem } from "../models/OrderdItem.js";
import { User } from "../models/userModel.js";
import { Product } from "../models/productModel.js";

const reviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
});

export const createReview: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const { productId, rating, comment } = reviewSchema.parse(req.body);

    if(!req.user){
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }
    
    const order = await Order.findOne({
      where: {
        user_id: req.user.id,
        status: "confirmed",
      },
      include: {
        model: OrderItem,
        as: "OrderItems",
        where: { product_id: productId },
      },
    });

    if (!order) {
      return res
        .status(403)
        .json({ error: "You can only review products you purchased." });
    }

    await Review.create({
      product_id: productId,
      user_id: req.user.id,
      rating,
      comment,
      verified: true,
    });

    const reviews = await Review.findAll({
      where: { product_id: productId },
    });

    const totalRatings = reviews.reduce((sum, review: any) => sum + review.rating, 0) + rating;
    const averageRating = totalRatings / (reviews.length + 1);

    const product: any = await Product?.findByPk(productId);
    if (product) {
      await product.update({
        rating: averageRating
      });
    }

    res.status(201).json({ message: "Review submitted successfully." });
  } catch (error) {
    console.error("Create review error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res
      .status(503)
      .json({ error: "Database not available. Review submission failed." });
  }
};

export const getProductReviews: RequestHandler = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate UUID format
    if (!productId || typeof productId !== "string") {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    // Remove any colon prefix if present
    const cleanProductId = productId.startsWith(":")
      ? productId.substring(1)
      : productId;

    const reviews = await Review.findAll({
      where: { product_id: cleanProductId },
      include: {
        model: User,
        as: "User",
        attributes: ["name"],
      },
      order: [["createdAt", "DESC"]],
    });

    const formatted = reviews.map((review: any) => ({
      id: review.id,
      userId: review.user_id,
      userName: review.User?.name || "Anonymous",
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt,
      verified: review.verified,
    }));

    res.json({ reviews: formatted });
  } catch (error) {
    console.error("Get product reviews error:", error);
    res.json({ error });
  }
};
