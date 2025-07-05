import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../database/config";

export const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    faqs: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    mrp: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    our_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount: {
      type: DataTypes.INTEGER,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    after_exchange_price: {
      type: DataTypes.DECIMAL(10, 2),
    },
    offers: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    coupons: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    company: {
      type: DataTypes.STRING,
    },
    color: {
      type: DataTypes.STRING,
    },
    size: {
      type: DataTypes.STRING,
    },
    weight: {
      type: DataTypes.STRING,
    },
    height: {
      type: DataTypes.STRING,
    },
    category: {
      type: DataTypes.STRING,
    },
    in_stock: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
  },
);
