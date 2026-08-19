import { Jersey } from "@/components/ui/Jersey";

export interface UsuarioUniformeInfo {
  nome: string;
  sigla: string;
  cores: string[];
  padraoUniforme: "SOLIDO" | "LISTRAS_VERTICAIS" | "LISTRAS_HORIZONTAIS" | "LISTRAS_DIAGONAIS" | "MANGAS_CONTRASTANTES" | "GOLA_CONTRASTANTE" | "BICOLOR" | "DEGRADE";
}

export function UsuarioUniforme({
  usuario,
  size = 30,
  lado = "esquerda",
  className = "",
}: {
  usuario: UsuarioUniformeInfo;
  size?: number;
  lado?: "esquerda" | "direita";
  className?: string;
}) {
  const nome = <span className="min-w-0 truncate font-semibold">{usuario.nome}</span>;
  const uniforme = <Jersey {...usuario} size={size} className="shrink-0" />;

  return (
    <span className={`flex min-w-0 items-center gap-2 ${className}`}>
      {lado === "esquerda" ? (
        <>
          {uniforme}
          {nome}
        </>
      ) : (
        <>
          {nome}
          {uniforme}
        </>
      )}
    </span>
  );
}
