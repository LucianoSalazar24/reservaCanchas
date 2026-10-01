import api from "./api";
import type { Sesion, RegistroData } from "@/types";

function mapearSesion(data: Record<string, any>): Sesion {
  const u = data.usuario ?? {};
  return {
    id: u.id,
    nombre: u.nombre ?? "",
    apellido: u.apellido ?? "",
    email: u.email,
    telefono: u.telefono ?? "",
    clienteId: u.cliente_id ?? u.clienteId ?? null,
    rol: u.rol,
    token: data.access_token,
  };
}

export const AuthService = {
  async login(email: string, password: string): Promise<Sesion> {
    const { data } = await api.post("/auth/login", { email, password });
    return mapearSesion(data);
  },

  async registro(datos: RegistroData): Promise<Sesion> {
    const { data } = await api.post("/auth/registro", datos);
    return mapearSesion(data);
  },
};
