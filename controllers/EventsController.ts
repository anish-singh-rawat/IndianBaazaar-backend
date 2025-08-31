import { RequestHandler } from "express";
import { AuthRequest } from "../utils/auth.js";
import { EventSlide } from "../models/EventSlideModel.js";


export const createEventSlide : RequestHandler = async (req: AuthRequest, res: any) => {
    try {
        const { image, title, subtitle, ctaText, ctaLink, backgroundColor } = req.body;

        const newSlide = await EventSlide.create({
            image,
            title,
            subtitle,
            cta_text: ctaText,
            cta_link: ctaLink,
            background_color: backgroundColor,
        });

        res.status(201).json({ message: "Event slide created successfully", slide: newSlide });
    } catch (error) {
        console.error("Create slide error:", error);
        res.status(503).json({ error: "Failed to create slide" });
    }
};

export const getEventSlides : RequestHandler = async (req: AuthRequest, res: any) => {
    try {
        const slides = await EventSlide.findAll({ order: [["createdAt", "DESC"]] });
        res.status(200).json(slides);
    } catch (error) {
        console.error("Fetch slides error:", error);
        res.status(503).json({ error: "Failed to fetch slides" });
    }
};
