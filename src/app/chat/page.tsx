import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ChatExperience } from "@/components/chat/ChatExperience";

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatExperience />
    </ProtectedRoute>
  );
}
