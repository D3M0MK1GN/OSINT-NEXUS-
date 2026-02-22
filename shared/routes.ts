import { z } from 'zod';
import { insertPersonaCasoSchema, insertRegistroComunicacionSchema, personasCasos, registrosComunicacion } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  trazabilidad: {
    buscar: {
      method: 'GET' as const,
      path: '/api/trazabilidad/buscar' as const,
      input: z.object({
        tipo: z.string(),
        valor: z.string(),
      }).optional(),
      responses: {
        200: z.object({
          resultados: z.array(z.custom<typeof personasCasos.$inferSelect>()),
          total: z.number(),
        }),
      },
    },
    coincidencias: {
      method: 'GET' as const,
      path: '/api/trazabilidad/coincidencias/:numero' as const,
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    analisis: {
      method: 'GET' as const,
      path: '/api/trazabilidad/:numero' as const,
      responses: {
        200: z.object({
          nodes: z.array(z.any()),
          edges: z.array(z.any()),
        }),
        404: errorSchemas.notFound,
      },
    },
  },
  personasCasos: {
    get: {
      method: 'GET' as const,
      path: '/api/personas-casos/:id' as const,
      responses: {
        200: z.custom<typeof personasCasos.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  registros: {
    getByAbonado: {
      method: 'GET' as const,
      path: '/api/registros-comunicacion/abonado/:numero' as const,
      responses: {
        200: z.array(z.custom<typeof registrosComunicacion.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
