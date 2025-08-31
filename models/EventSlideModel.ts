import { DataTypes } from "sequelize";
import { sequelize } from "../database/config.js";

export const EventSlide = sequelize.define(
  "EventSlide",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    image: {
      type: DataTypes.STRING, 
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cta_text: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cta_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    background_color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "eventslides",
  }
);
