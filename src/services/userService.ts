import { apiGet, apiPost, authHeaders } from "@/lib/api/client";
import { API_V1_PREFIX } from "@/constants/routes";
import type { AuthUser } from "@/types/auth";
import type { SupportTicket, SupportTicketDetail } from "@/types/support";

const base = API_V1_PREFIX;

export type UserResourceRequest =
  | { op: "support_list_tickets" }
  | { op: "support_get_ticket"; ticketId: string }
  | { op: "support_create_ticket"; subject: string; message: string }
  | { op: "support_reply"; ticketId: string; message: string };

export interface UserResourceEnvelope {
  user?: AuthUser;
  tickets?: SupportTicket[];
  ticket?: SupportTicketDetail;
  ok?: boolean;
}

export async function getUserResource(token: string): Promise<UserResourceEnvelope> {
  return apiGet<UserResourceEnvelope>(`${base}/user`, authHeaders(token));
}

export async function postUserResource(
  token: string,
  body: UserResourceRequest,
): Promise<UserResourceEnvelope> {
  return apiPost<UserResourceEnvelope>(`${base}/user`, body, authHeaders(token));
}
