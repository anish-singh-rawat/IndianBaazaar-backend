import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../database/config.js";
import { Order } from "./orderModel.js";
import { Product } from "./productModel.js";

export const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Order,
        key: "id",
      },
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    selected_size: {
      type: DataTypes.STRING,
    },
    selected_color: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
    tableName: "order_items",
  },
);
