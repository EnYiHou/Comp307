import express from "express";
import { sendPlaceholder } from "../utils/response.js";

const router = express.Router();

router.get("/", (req, res) => sendPlaceholder(res, "Meeting requests"));

export default router;
