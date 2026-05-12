import type { ChatModeId } from "@/constants/modes";

export type MessageRole = "user" | "assistant";

export type ApiMessageContent =
  | string
  | Array<{
      type: "text" | "image";
      text?: string;
      source?: { type: "base64"; media_type: string; data: string };
    }>;

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  apiContent?: ApiMessageContent;
  filePreview?: string | null;
  fileName?: string | null;
  modeId?: ChatModeId;
  modeLabel?: string;
  modeColor?: string;
}

export interface ChatRequestBody {
  messages: Array<{ role: MessageRole; content: ApiMessageContent }>;
  system: string;
  webSearch: boolean;
  hasImage: boolean;
  mode: ChatModeId;
}

export interface ChatResponseBody {
  reply: string;
  messagesRemaining?: number;
  upgrade?: boolean;
}
