import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../database/config";
import { User } from "./userModel";

export const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "id",
      },
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
    payment_id: {
      type: DataTypes.STRING,
    },
    payment_status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
    shipping_address: {
      type: DataTypes.JSONB,
    },
  },
  {
    timestamps: true,
    tableName: "orders",
  },
);
