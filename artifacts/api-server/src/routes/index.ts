import { Router, type IRouter } from "express";
import healthRouter from "./health";
import accountsRouter from "./accounts";
import resourcesRouter from "./resources";
import recommendationsRouter from "./recommendations";
import alertsRouter from "./alerts";
import forecastsRouter from "./forecasts";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(accountsRouter);
router.use(resourcesRouter);
router.use(recommendationsRouter);
router.use(alertsRouter);
router.use(forecastsRouter);
router.use(dashboardRouter);

export default router;
