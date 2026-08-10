"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Modo = "USUARIO" | "ADMIN";

const STORAGE_KEY = "bolao_modo";

const ModoContext = createContext<{ modo: Modo; setModo: (m: Modo) => void } | null>(null);

export function ModoProvider({ children }: { children: React.ReactNode }) {
  const [modo, setModoState] = useState<Modo>("USUARIO");

  useEffect(() => {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo === "ADMIN" || salvo === "USUARIO") setModoState(salvo);
  }, []);

  function setModo(m: Modo) {
    setModoState(m);
    localStorage.setItem(STORAGE_KEY, m);
  }

  return <ModoContext.Provider value={{ modo, setModo }}>{children}</ModoContext.Provider>;
}

export function useModo() {
  const ctx = useContext(ModoContext);
  if (!ctx) throw new Error("useModo deve ser usado dentro de ModoProvider");
  return ctx;
}
