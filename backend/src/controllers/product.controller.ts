import { Request, Response } from "express";
import { productService } from "../services/product.service";
import { ListProductsQuery } from "../types/product.types";
import { asyncHandler, sendResponse } from "../utils/response";

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  sendResponse(res, 200, await productService.list(req.query as unknown as ListProductsQuery));
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  sendResponse(res, 200, { product: await productService.getById(req.params.id) });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  sendResponse(res, 201, { product: await productService.create(req.body) });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  sendResponse(res, 200, { product: await productService.update(req.params.id, req.body) });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.remove(req.params.id);
  res.status(204).send();
});
