import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type AnalisisData, type PersonaCaso, type RegistroComunicacion } from "@shared/schema";

// Helper to handle API responses
async function fetchApi<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    if (res.status === 404) return null as T;
    throw new Error(`API Error: ${res.status}`);
  }
  return await res.json();
}

// Search Hook
export function useBuscarPersonas(tipo: string, valor: string) {
  const isEnabled = !!valor && valor.length > 2;
  const url = `${api.trazabilidad.buscar.path}?tipo=${encodeURIComponent(tipo)}&valor=${encodeURIComponent(valor)}`;

  return useQuery({
    queryKey: [api.trazabilidad.buscar.path, tipo, valor],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Error searching");
      return await res.json();
    },
    enabled: isEnabled,
  });
}

// Get Single Person Hook
export function usePersona(id: number | null) {
  return useQuery({
    queryKey: [api.personasCasos.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.personasCasos.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Error fetching persona");
      return await res.json();
    },
    enabled: !!id,
  });
}

// Get Communication Records Hook
export function useRegistrosComunicacion(numero: string | null) {
  return useQuery({
    queryKey: [api.registros.getByAbonado.path, numero],
    queryFn: async () => {
      if (!numero) return [];
      const url = buildUrl(api.registros.getByAbonado.path, { numero });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Error fetching records");
      return await res.json();
    },
    enabled: !!numero,
  });
}

// Get Graph Analysis Hook
export function useAnalisisGrafo(numero: string | null) {
  return useQuery({
    queryKey: [api.trazabilidad.analisis.path, numero],
    queryFn: async () => {
      if (!numero) return null;
      const url = buildUrl(api.trazabilidad.analisis.path, { numero });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Error fetching analysis");
      return await res.json();
    },
    enabled: !!numero,
  });
}
