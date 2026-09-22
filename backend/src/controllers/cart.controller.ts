import { Request, Response } from "express";
import { cartService } from "../services/cart.service";
import { asyncHandler, sendResponse } from "../utils/response";

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  sendResponse(res, 200, { cart: await cartService.getCart(req.user!.id) });
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  sendResponse(res, 201, { cart: await cartService.addItem(req.user!.id, req.body) });
});

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  sendResponse(res, 200, { cart: await cartService.updateItem(req.user!.id, req.params.id, req.body) });
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  sendResponse(res, 200, { cart: await cartService.removeItem(req.user!.id, req.params.id) });
});
