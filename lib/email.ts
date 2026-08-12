import nodemailer from "nodemailer";

export interface ItemComprovante {
  timeCasa: string;
  timeVisitante: string;
  placarCasa: number;
  placarVisitante: number;
}

function getAppUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  // Vercel expõe essas variáveis automaticamente, sem precisar configurar nada.
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const usuario = process.env.GMAIL_USER;
  const senha = process.env.GMAIL_APP_PASSWORD;
  if (!usuario || !senha) return null;

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: usuario, pass: senha },
  });
  return transporter;
}

function montarHtml(nome: string, etapaNome: string, itens: ItemComprovante[]) {
  const linhas = itens
    .map(
      (i) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">${i.timeCasa}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:bold;">${i.placarCasa} x ${i.placarVisitante}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:left;">${i.timeVisitante}</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#0f172a;">Comprovante de palpites — ${etapaNome}</h2>
      <p>Olá, ${nome}! Seus palpites foram salvos com sucesso:</p>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;">
        <tbody>${linhas}</tbody>
      </table>
      <p style="margin-top:16px;color:#64748b;font-size:12px;">
        Este é um email automático do Bolão. Se você não reconhece esta ação, ignore esta mensagem.
      </p>
    </div>`;
}

function montarTexto(nome: string, etapaNome: string, itens: ItemComprovante[]) {
  const linhas = itens
    .map((i) => `${i.timeCasa} ${i.placarCasa} x ${i.placarVisitante} ${i.timeVisitante}`)
    .join("\n");
  return `Olá, ${nome}!\n\nSeus palpites da ${etapaNome} foram salvos:\n\n${linhas}`;
}

export async function enviarComprovantePalpites(
  usuario: { nome: string; email: string },
  etapaNome: string,
  itens: ItemComprovante[]
): Promise<void> {
  const t = getTransporter();
  if (!t) {
    console.log(
      `[email não configurado] comprovante de palpites para ${usuario.email} (${etapaNome}):`,
      itens.map((i) => `${i.timeCasa} ${i.placarCasa}x${i.placarVisitante} ${i.timeVisitante}`).join(", ")
    );
    return;
  }

  await t.sendMail({
    from: `Bolão <${process.env.GMAIL_USER}>`,
    to: usuario.email,
    subject: `Comprovante de palpites — ${etapaNome}`,
    text: montarTexto(usuario.nome, etapaNome, itens),
    html: montarHtml(usuario.nome, etapaNome, itens),
  });
}

export async function enviarEmailVerificacao(
  usuario: { nome: string; email: string },
  token: string
): Promise<void> {
  const link = `${getAppUrl()}/verificar-email?token=${token}`;

  const t = getTransporter();
  if (!t) {
    console.log(`[email não configurado] link de verificação para ${usuario.email}: ${link}`);
    return;
  }

  await t.sendMail({
    from: `Bolão <${process.env.GMAIL_USER}>`,
    to: usuario.email,
    subject: "Confirme seu email — Bolão",
    text: `Olá, ${usuario.nome}!\n\nConfirme seu email clicando no link abaixo (válido por 24 horas):\n${link}\n\nSe você não criou essa conta, ignore esta mensagem.`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;">
        <h2 style="color:#0f172a;">Confirme seu email</h2>
        <p>Olá, ${usuario.nome}! Falta só um passo para liberar seu acesso ao Bolão.</p>
        <p style="margin:24px 0;">
          <a href="${link}" style="background:#0f172a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
            Confirmar meu email
          </a>
        </p>
        <p style="color:#64748b;font-size:12px;">Este link expira em 24 horas. Se você não criou essa conta, ignore esta mensagem.</p>
      </div>`,
  });
}
