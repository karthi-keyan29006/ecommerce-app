import { Request, Response } from "express";
import { employeeService } from "../services/employee.service";
import { ListEmployeesQuery } from "../types/auth.types";
import { asyncHandler, sendResponse } from "../utils/response";

export const listEmployees = asyncHandler(async (req: Request, res: Response) => {
  sendResponse(res, 200, await employeeService.list(req.user!, req.query as unknown as ListEmployeesQuery));
});

export const createEmployee = asyncHandler(async (req: Request, res: Response) => {
  sendResponse(res, 201, { employee: await employeeService.create(req.user!, req.body) });
});
