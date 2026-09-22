import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { asyncHandler, sendResponse } from "../utils/response";

export const register = asyncHandler(async (req: Request, res: Response) => {
  sendResponse(res, 201, await authService.register(req.body));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  sendResponse(res, 200, await authService.login(req.body));
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  sendResponse(res, 200, { user: await authService.getProfile(req.user!.id) });
});
