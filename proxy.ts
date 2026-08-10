import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "bolao_sessao";
const ROTAS_PUBLICAS = ["/login", "/cadastro", "/verificar-email"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const temSessao = request.cookies.has(COOKIE_NAME);

  const rotaPublica = ROTAS_PUBLICAS.some((rota) => pathname.startsWith(rota));

  if (!temSessao && !rotaPublica) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (temSessao && rotaPublica) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
