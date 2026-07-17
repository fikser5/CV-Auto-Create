import "server-only";
import { Resend } from "resend";

const FROM_ADDRESS = process.env.EMAIL_FROM || "CVAutomat <onboarding@resend.dev>";

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

function emailShell(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="pl">
  <body style="margin:0;padding:0;background-color:#f4f1f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e6e1eb;">
            <tr>
              <td style="background-image:linear-gradient(115deg,#6d28d9 10%,#be123c 100%);padding:24px 32px;">
                <span style="color:#ffffff;font-size:18px;font-weight:700;">CVAutomat</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#1c1524;">
                <h1 style="margin:0 0 16px;font-size:20px;">${title}</h1>
                ${bodyHtml}
              </td>
            </tr>
          </table>
          <p style="color:#8a8194;font-size:12px;margin-top:16px;">CVAutomat — generator CV dopasowanych do ofert pracy.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendWelcomeEmail(to: string, fullName: string): Promise<void> {
  const client = getResendClient();
  if (!client) {
    console.warn("RESEND_API_KEY nie jest skonfigurowany — pominięto e-mail powitalny.");
    return;
  }

  const html = emailShell(
    "Witaj w CVAutomat!",
    `<p style="font-size:14px;line-height:1.6;">Cześć ${fullName},</p>
     <p style="font-size:14px;line-height:1.6;">Twoje konto zostało założone. Uzupełnij teraz swój profil zawodowy, żeby móc generować CV dopasowane do konkretnych ofert pracy.</p>`,
  );

  try {
    await client.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: "Witaj w CVAutomat",
      html,
    });
  } catch (error) {
    // A failed welcome email should never break registration — log and move on.
    console.error("Nie udało się wysłać e-maila powitalnego:", error);
  }
}

export async function sendPasswordResetEmail(to: string, fullName: string, resetUrl: string): Promise<void> {
  const client = getResendClient();
  if (!client) {
    throw new Error("Wysyłka e-maili nie jest jeszcze skonfigurowana (brak klucza RESEND_API_KEY).");
  }

  const html = emailShell(
    "Reset hasła",
    `<p style="font-size:14px;line-height:1.6;">Cześć ${fullName},</p>
     <p style="font-size:14px;line-height:1.6;">Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta. Kliknij poniższy przycisk, aby ustawić nowe hasło. Link jest ważny przez godzinę.</p>
     <p style="text-align:center;margin:28px 0;">
       <a href="${resetUrl}" style="display:inline-block;background-image:linear-gradient(115deg,#6d28d9 10%,#be123c 100%);color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">Ustaw nowe hasło</a>
     </p>
     <p style="font-size:12px;line-height:1.6;color:#6f6579;">Jeśli to nie Ty prosiłeś/aś o reset hasła, możesz zignorować tę wiadomość — Twoje hasło pozostanie bez zmian.</p>`,
  );

  const { error } = await client.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Reset hasła — CVAutomat",
    html,
  });

  if (error) {
    throw new Error(`Nie udało się wysłać e-maila: ${error.message}`);
  }
}
