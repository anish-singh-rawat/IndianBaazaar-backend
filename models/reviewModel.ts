import { Sequelize, DataTypes } from "sequelize";
import { sequelize } from "../database/config.ts";
import { User } from "./userModel.ts";
import { Product } from "./productModel.ts";

export const Review = sequelize.define(
  "Review",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.UUID,
      references: {
        model: Product,
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "id",
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  },
);
