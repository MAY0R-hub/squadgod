import { Router, type IRouter } from "express";
import healthRouter from "./health";
import playersRouter from "./players";
import squadsRouter from "./squads";
import matchesRouter from "./matches";
import gafferRouter from "./gaffer";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/players", playersRouter);
router.use("/squads", squadsRouter);
router.use("/matches", matchesRouter);
router.use("/gaffer", gafferRouter);

export default router;
