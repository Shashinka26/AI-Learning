import type {
  LoginRequest,
  LoginResponse,
} from "../types/Auth";

const API_BASE_URL = "http://localhost:5136/api";

export async function login(
  request: LoginRequest
): Promise<LoginResponse> {
  const response = await fetch(
    `${API_BASE_URL}/Auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => null);

    throw new Error(
      errorData?.message ?? "Login failed."
    );
  }

  return response.json();
}