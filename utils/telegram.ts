import { ADMIN_BOT_TOKEN, ADMIN_CHAT_ID } from "@/constants/config";

export async function reportActivity(
  username: string,
  action: string,
  details?: string
): Promise<void> {
  try {
    const emoji = getActionEmoji(action);
    const text =
      `${emoji} *Maro Bot Manager Activity*\n` +
      `👤 User: \`${username}\`\n` +
      `⚡ Action: ${action}` +
      (details ? `\n📝 Details: ${details}` : "") +
      `\n🕒 Time: ${new Date().toLocaleString("ar-EG")}`;

    await fetch(
      `https://api.telegram.org/bot${ADMIN_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text,
          parse_mode: "Markdown",
        }),
      }
    );
  } catch {
  }
}

export async function testBotToken(
  token: string
): Promise<{ valid: boolean; botName?: string; username?: string }> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/getMe`
    );
    const data = (await response.json()) as {
      ok: boolean;
      result?: { first_name: string; username: string };
    };
    if (data.ok && data.result) {
      return {
        valid: true,
        botName: data.result.first_name,
        username: data.result.username,
      };
    }
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

function getActionEmoji(action: string): string {
  if (action.includes("تسجيل الدخول") || action.includes("Login")) return "🔑";
  if (action.includes("تسجيل") || action.includes("Register")) return "✨";
  if (action.includes("بوت") || action.includes("Bot")) return "🤖";
  if (action.includes("رسالة") || action.includes("Message")) return "💬";
  if (action.includes("دعوة") || action.includes("Invite")) return "🔗";
  if (action.includes("حذف") || action.includes("Delete")) return "🗑";
  if (action.includes("خروج") || action.includes("Logout")) return "👋";
  if (action.includes("زائر") || action.includes("Guest")) return "👻";
  return "📊";
}
