export type TicketStatus = "open" | "pending" | "resolved" | "closed" | string;

export interface SupportTicket {
  id: string;
  subject: string;
  status: TicketStatus;
  updatedAt: string;
  createdAt: string;
  lastMessagePreview?: string;
}

export interface SupportMessage {
  id: string;
  role: "user" | "agent" | "system";
  body: string;
  createdAt: string;
}

export interface SupportTicketDetail extends SupportTicket {
  messages: SupportMessage[];
}
