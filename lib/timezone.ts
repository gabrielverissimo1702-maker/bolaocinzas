export const TIMEZONE_BRASIL = "America/Sao_Paulo";

// Brasília não observa horário de verão desde 2019 — offset fixo é seguro.
const OFFSET_BRASIL = "-03:00";

// Interpreta o valor de um <input type="datetime-local"> ("YYYY-MM-DDTHH:mm")
// como horário de Brasília, independente do fuso do servidor que executa o código.
export function parseDataHoraBrasilia(datetimeLocalValue: string): Date {
  return new Date(`${datetimeLocalValue}:00${OFFSET_BRASIL}`);
}

// Formata uma data armazenada de volta para "YYYY-MM-DDTHH:mm" em horário de
// Brasília, para preencher o defaultValue de um <input type="datetime-local">.
export function paraDatetimeLocalBrasilia(dataHora: Date | string): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE_BRASIL,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(dataHora));

  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "00";
  return `${valor("year")}-${valor("month")}-${valor("day")}T${valor("hour")}:${valor("minute")}`;
}
