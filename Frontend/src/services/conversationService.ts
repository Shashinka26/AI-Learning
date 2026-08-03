import type { Conversation } from "../types/Conversation";

const API_BASE_URL = "http://localhost:5136/api";

function getToken(): string {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  return token;
}

export async function getConversations(): Promise<Conversation[]> {
  const response = await fetch(`${API_BASE_URL}/Conversation`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Could not load conversations.");
  }

  return response.json();
}

export async function createConversation(
  title: string,
): Promise<Conversation> {
  const response = await fetch(`${API_BASE_URL}/Conversation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      title,
    }),
  });

  if (!response.ok) {
    throw new Error("Could not create conversation.");
  }

  return response.json();
}