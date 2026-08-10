import nodemailer from "nodemailer";

export interface ItemComprovante {
  timeCasa: string;
  timeVisitante: string;
  placarCasa: number;
  placarVisitante: number;
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
