import { apiPost, authHeaders } from "@/lib/api/client";
import { API_V1_PREFIX } from "@/constants/routes";
import type { ChatRequestBody, ChatResponseBody } from "@/types/chat";

const base = API_V1_PREFIX;

export async function sendChat(
  token: string,
  body: ChatRequestBody,
): Promise<ChatResponseBody> {
  return apiPost<ChatResponseBody>(`${base}/chat`, body, authHeaders(token));
}
