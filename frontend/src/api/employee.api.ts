import type { CreateEmployeePayload, Employee, EmployeeMeta, EmployeeQuery } from "../types/auth.types";
import type { Paginated } from "../types/product.types";
import { apiClient } from "./axios";

export const getEmployeesRequest = async (params: EmployeeQuery): Promise<Paginated<Employee, EmployeeMeta>> => {
  const { data } = await apiClient.get<Paginated<Employee, EmployeeMeta>>("/employees", { params });
  return data;
};

export const createEmployeeRequest = async (payload: CreateEmployeePayload): Promise<{ employee: Employee }> => {
  const { data } = await apiClient.post<{ employee: Employee }>("/employees", payload);
  return data;
};
