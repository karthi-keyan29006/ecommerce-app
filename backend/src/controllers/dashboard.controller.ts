import { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";
import { asyncHandler, sendResponse } from "../utils/response";

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  sendResponse(res, 200, { stats: await dashboardService.getDashboard(req.user!) });
});
