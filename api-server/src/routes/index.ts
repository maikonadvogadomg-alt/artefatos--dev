import { Router, type IRouter } from "express";
import healthRouter from "./health";
import analyticsRouter from "./analytics";
import aiRouter from "./ai";
import apkRouter from "./apk";
import androidRouter from "./android";

const router: IRouter = Router();

router.use(healthRouter);
router.use(analyticsRouter);
router.use(aiRouter);
router.use(apkRouter);
router.use(androidRouter);

export default router;
