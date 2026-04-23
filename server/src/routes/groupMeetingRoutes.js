import express from "express";
import { sendPlaceholder } from "../utils/response.js";

const router = express.Router();

router.get("/", (req, res) => sendPlaceholder(res, "Group meetings"));

export default router;
