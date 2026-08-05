// Shared with components/ChatWidget.tsx — using the same localStorage key
// means a visitor's page-tracking session and their ASHA chat session are
// the same id, so admin analytics can join "what did this visitor ask" to
// "where did this visitor come from" without a separate lookup table.
const SESSION_KEY = "asha_session_id";

export function getVisitorSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}
