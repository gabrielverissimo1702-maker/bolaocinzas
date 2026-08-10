import "dotenv/config";
import { enviarComprovantePalpites } from "@/lib/email";

async function main() {
  await enviarComprovantePalpites(
    { nome: "Teste", email: process.env.GMAIL_USER! },
    "Rodada de teste",
    [{ timeCasa: "Corinthians", timeVisitante: "Bahia", placarCasa: 2, placarVisitante: 1 }]
  );
  console.log("Email enviado com sucesso.");
}

main().catch((e) => {
  console.error("Falha ao enviar email:", e);
  process.exitCode = 1;
});
