import { RequestHandler } from "express";
import { z } from "zod";
import { AuthRequest } from "../utils/auth.js";
import { Notification } from "../models/notificationModel.js";
import { Op } from "sequelize";

const notificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.string().min(1, "Type is required"),
  userId: z.string().uuid().optional(),
});

export const getUserNotifications: RequestHandler = async (
  req: AuthRequest,
  res,
) => {
  try {
    const userId = req.user?.id;

    const notifications = await Notification.findAll({
      where: {
        [Op.or]: [{ user_id: userId }, { user_id: null }],
      },
      order: [["createdAt", "DESC"]],
    });

    const formattedNotifications = notifications.map((notification: any) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.is_read,
      metadata: notification.metadata,
      createdAt: notification.createdAt,
    }));

    res.json({ notifications: formattedNotifications });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.json({ error });
  }
};

export const markNotificationAsRead: RequestHandler = async (
  req: AuthRequest,
  res,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const [updatedCount] = await Notification.update(
      { is_read: true },
      {
        where: {
          id,
          [Op.or]: [{ user_id: userId }, { user_id: null }],
        },
      },
    );

    if (updatedCount === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({ error});
  }
};

export const createNotification: RequestHandler = async (req: AuthRequest,res) => {
  try {
    const validatedData = notificationSchema.parse(req.body);
    const { title, message, type, userId } = validatedData;

    const notification: any = await Notification.create({
      title,
      message,
      type,
      user_id: userId || null,
    });

    const formattedNotification = {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      userId: notification.user_id,
      isRead: notification.is_read,
      metadata: notification.metadata,
      createdAt: notification.createdAt,
    };

    res.status(201).json({
      message: userId
        ? "Notification created successfully"
        : "Notification sent to all users",
      notification: formattedNotification,
    });
  } catch (error) {
    console.error("Create notification error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error });
  }
};

export const deleteNotification: RequestHandler = async (
  req: AuthRequest,
  res,
) => {
  try {
    const { id } = req.params;

    const deletedCount = await Notification.destroy({ where: { id } });

    if (deletedCount === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ error});
  }
};

export const createProductNotification = async (
  productName: string,
  productId: string,
) => {
  try {
    await Notification.create({
      title: "New Product Added!",
      message: `Check out our new product: ${productName}. Click to view details.`,
      type: "product_added",
      user_id: null,
      metadata: { productId, productName },
    });
    console.log("Product notification created successfully");
  } catch (error) {
    console.error("Error creating product notification:", error);
  }
};
