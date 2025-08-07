import { RequestHandler } from "express";
import { z } from "zod";
import Razorpay from "razorpay";
import crypto from "crypto";
import { AuthRequest } from "../utils/auth.js";
import { Order } from "../models/orderModel.js";
import { Product } from "../models/productModel.js";
import { OrderItem } from "../models/OrderdItem.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrderSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("INR"),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().positive(),
      price: z.number().positive(),
      selectedSize: z.string().optional(),
      selectedColor: z.string().optional(),
    }),
  ),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    country: z.string().default("India"),
  }),
});

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  orderId: z.string(),
});

export const createOrder: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const { amount, currency, items, shippingAddress } =
      createOrderSchema.parse(req.body);

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: `order_${Date.now()}`,
    });

    if(!req.user){
      return res.status(403).json({ error: "please provide user and it's id" });
    }

    const newOrder: any = await Order.create({
      user_id: req.user.id,
      total_amount: amount,
      payment_id: razorpayOrder.id,
      shipping_address: shippingAddress,
    });

    for (const item of items) {
      await OrderItem.create({
        order_id: newOrder.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
        selected_size: item.selectedSize,
        selected_color: item.selectedColor,
      });

      await Product.decrement("stock_quantity", {
        by: item.quantity,
        where: { id: item.productId },
      });
    }

    res.status(201).json({
      message: "Order created successfully",
      orderId: newOrder.id,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(503).json({ error });
  }
};

export const verifyPayment: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = verifyPaymentSchema.parse(req.body);

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: "Razorpay key secret is not configured" });
    }
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

     if(!req.user){
      return res.status(403).json({ error: "please provide user and it's id" });
    }

    await Order.update(
      {
        status: "confirmed",
        payment_status: "completed",
        payment_id: razorpay_payment_id,
      },
      {
        where: { id: orderId, user_id: req.user.id },
      },
    );

    res.json({
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(503).json({ error });
    }
};

export const getOrders: RequestHandler = async (req: AuthRequest, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ error: "Authentication required" });

    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: OrderItem,
          as: "OrderItems",
          include: [
            {
              model: Product,
              as: "Product",
              attributes: ["name", "images"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formattedOrders = orders.map((order: any) => ({
      id: order.id,
      totalAmount: parseFloat(order.total_amount as any) || 0,
      status: order.status,
      paymentStatus: order.payment_status,
      paymentId: order.payment_id,
      shippingAddress: order.shipping_address,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items:
        (order as any).OrderItems?.map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          quantity: item.quantity || 0,
          price: parseFloat(item.price) || 0,
          selectedSize: item.selected_size,
          selectedColor: item.selected_color,
          productName: item.Product?.name,
          productImage: item.Product?.images?.[0],
        })) || [],
    }));

    res.json({ orders: formattedOrders });
  } catch (error) {
    console.error("Get orders error:", error);
    res.json({ error });
  }
};

export const getOrderById: RequestHandler = async (req: AuthRequest, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ error: "Authentication required" });

    const { id } = req.params;

    const order: any = await Order.findOne({
      where: {
        id,
        user_id: req.user.id,
      },
      include: [
        {
          model: OrderItem,
          as: "OrderItems",
          include: [
            {
              model: Product,
              as: "Product",
              attributes: ["name", "images"],
            },
          ],
        },
      ],
    });

    if (!order) return res.status(404).json({ error: "Order not found" });

    const formattedOrder = {
      id: order.id,
      totalAmount: parseFloat(order.total_amount as any) || 0,
      status: order.status,
      paymentStatus: order.payment_status,
      paymentId: order.payment_id,
      shippingAddress: order.shipping_address,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items:
        (order as any).OrderItems?.map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          quantity: item.quantity || 0,
          price: parseFloat(item.price) || 0,
          selectedSize: item.selected_size,
          selectedColor: item.selected_color,
          productName: item.Product?.name,
          productImage: item.Product?.images?.[0],
        })) || [],
    };

    res.json({ order: formattedOrder });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ error });
  }
};
