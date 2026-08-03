import type { Message } from "../types/Message";

const API_BASE_URL = "http://localhost:5136/api";

function getToken(): string {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  return token;
}

export async function getMessages(
  conversationId: string,
): Promise<Message[]> {
  const response = await fetch(
    `${API_BASE_URL}/Message/${conversationId}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Could not load messages.");
  }

  return response.json();
}

export async function saveMessage(
  conversationId: string,
  sender: "user" | "ai",
  text: string,
): Promise<Message> {
  const response = await fetch(`${API_BASE_URL}/Message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      conversationId,
      sender,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error("Could not save message.");
  }

  return response.json();
}