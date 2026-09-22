import axios from "axios";

interface ApiErrorBody {
  message?: string;
  errors?: { field?: string; message: string }[];
}

/** Turns any error into a short message that is safe to show to the user. */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) return "Cannot reach the server. Check your connection and try again.";
    const body = error.response.data;
    if (Array.isArray(body?.errors) && body.errors.length > 0) {
      return body.errors.map((item) => item.message).join(". ");
    }
    return body?.message ?? "Something went wrong. Please try again.";
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
};

/** Runs a request and rethrows any failure as a plain Error carrying a user-friendly message. */
export async function withErrorMessage<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
