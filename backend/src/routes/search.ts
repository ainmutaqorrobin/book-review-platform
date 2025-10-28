import { Router } from "express";
import { handleValidation } from "../middlewares/validateRequest";
import { searchHandler } from "../controllers/search";
import { searchValidation } from "../validation/search";

const router = Router();

router.get("/", searchValidation, handleValidation, searchHandler);

export { router as SearchRouter };
