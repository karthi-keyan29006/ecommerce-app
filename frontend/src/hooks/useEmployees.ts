import { useEffect, useState } from "react";
import { createEmployeeRequest, getEmployeesRequest } from "../api/employee.api";
import type { CreateEmployeePayload, Employee, EmployeeQuery, Role } from "../types/auth.types";
import type { LoadStatus, PageMeta } from "../types/product.types";
import { getErrorMessage } from "../utils/error";
import { useAppContext } from "./useAppContext";

/** Employee list. `refreshKey` lets a parent force a reload (e.g. after adding an employee). */
export function useEmployees({ page, limit, role, search }: EmployeeQuery, refreshKey = 0) {
  const { notify } = useAppContext();
  const [items, setItems] = useState<Employee[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  /** Roles the current user is allowed to filter by (sent by the server). */
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);
    getEmployeesRequest({ page, limit, role, search })
      .then((result) => {
        if (cancelled) return;
        setItems(result.data);
        setMeta(result.meta);
        setAvailableRoles(result.meta.availableRoles);
        setStatus("idle");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = getErrorMessage(err);
        setError(message);
        setStatus("failed");
        notify.error(message);
      });
    return () => {
      cancelled = true;
    };
  }, [page, limit, role, search, refreshKey, notify]);

  return { items, meta, availableRoles, status, error };
}

export function useCreateEmployee() {
  const { notify } = useAppContext();
  const [creating, setCreating] = useState(false);

  const create = async (payload: CreateEmployeePayload): Promise<boolean> => {
    setCreating(true);
    try {
      await createEmployeeRequest(payload);
      notify.success("Employee added");
      return true;
    } catch (err) {
      notify.error(getErrorMessage(err));
      return false;
    } finally {
      setCreating(false);
    }
  };

  return { creating, create };
}
