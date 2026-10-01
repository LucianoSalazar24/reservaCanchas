import api from "./api";
import type { Cliente } from '@/types'

export const ClientesService = {
  async obtenerTodos(params: Record<string, string> = {}): Promise<Cliente[]> {
    const { data } = await api.get("/clientes", { params });
    return data;
  },

  async obtenerPorId(id: number): Promise<Cliente> {
    const { data } = await api.get(`/clientes/${id}`);
    return data;
  },

  async buscarPorTelefono(telefono: string): Promise<Cliente | null> {
    const { data } = await api.get("/clientes", { params: { telefono } });
    return data;
  },

  async crear(datos: Partial<Cliente>): Promise<Cliente> {
    const { data } = await api.post("/clientes", datos);
    return data;
  },

  async actualizar(id: number, datos: Partial<Cliente>): Promise<Cliente> {
    const { data } = await api.put(`/clientes/${id}`, datos);
    return data;
  },

  async cambiarEstado(id: number, estado: string): Promise<Cliente> {
    const { data } = await api.patch(`/clientes/${id}`, { estado });
    return data;
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/clientes/${id}`);
  },

  async obtenerEstadisticas(): Promise<{
    total: number
    activos: number
    suspendidos: number
    bloqueados: number
  }> {
    const todos = await ClientesService.obtenerTodos({ limite: '1000' })
    return {
      total: todos.length,
      activos: todos.filter(c => c.estado === 'activo').length,
      suspendidos: todos.filter(c => c.estado === 'suspendido').length,
      bloqueados: todos.filter(c => c.estado === 'bloqueado').length,
    }
  },
};
