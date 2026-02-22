import { pgTable, text, serial, integer, timestamp, boolean, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// 1. TABLA: personas_casos
export const personasCasos = pgTable("personas_casos", {
  nro: serial("nro").primaryKey(),
  cedula: text("cedula").notNull().unique(),
  nombre: text("nombre"),
  apellido: text("apellido"),
  pseudonimo: text("pseudonimo"),
  edad: integer("edad"),
  fechaDeNacimiento: text("fecha_de_nacimiento"),
  profesion: text("profesion"),
  direccion: text("direccion"),
  expediente: text("expediente"),
  fechaDeInicio: text("fecha_de_inicio"),
  delito: text("delito"),
  nOficio: text("n_oficio"),
  fiscalia: text("fiscalia"),
  descripcion: text("descripcion"),
  observacion: text("observacion"),
  usuarioId: integer("usuario_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 2. TABLA: persona_telefonos
export const personaTelefonos = pgTable("persona_telefonos", {
  id: serial("id").primaryKey(),
  personaId: integer("persona_id").references(() => personasCasos.nro),
  numero: text("numero").notNull().unique(),
  tipo: text("tipo"), // Móvil, Fijo, Trabajo, Satelital
  iconoTipo: text("icono_tipo"),
  activo: boolean("activo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// 3. TABLA: registros_comunicacion
export const registrosComunicacion = pgTable("registros_comunicacion", {
  registroId: serial("registro_id").primaryKey(),
  abonadoA: text("abonado_a").notNull(),
  abonadoB: text("abonado_b"),
  abonadoAId: integer("abonado_a_id").references(() => personaTelefonos.id),
  abonadoBId: integer("abonado_b_id").references(() => personaTelefonos.id),
  imei1A: text("imei1_a"),
  imei2A: text("imei2_a"),
  imei1B: text("imei1_b"),
  imei2B: text("imei2_b"),
  tipoYTransaccion: text("tipo_y_transaccion"),
  segundos: integer("segundos"),
  hora: text("hora"),
  fecha: text("fecha"),
  direccionInicialA: text("direccion_inicial_a"),
  latitudInicialA: text("latitud_inicial_a"),
  longitudInicialA: text("longitud_inicial_a"),
  archivo: text("archivo"),
  peso: text("peso"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPersonaCasoSchema = createInsertSchema(personasCasos).omit({ nro: true, createdAt: true, updatedAt: true });
export const insertPersonaTelefonoSchema = createInsertSchema(personaTelefonos).omit({ id: true, createdAt: true });
export const insertRegistroComunicacionSchema = createInsertSchema(registrosComunicacion).omit({ registroId: true, createdAt: true });

export type PersonaCaso = typeof personasCasos.$inferSelect;
export type InsertPersonaCaso = z.infer<typeof insertPersonaCasoSchema>;

export type PersonaTelefono = typeof personaTelefonos.$inferSelect;
export type InsertPersonaTelefono = z.infer<typeof insertPersonaTelefonoSchema>;

export type RegistroComunicacion = typeof registrosComunicacion.$inferSelect;
export type InsertRegistroComunicacion = z.infer<typeof insertRegistroComunicacionSchema>;

export type ResultadosBusqueda = {
  resultados: PersonaCaso[];
  total: number;
};

export type GrafoNode = {
  data: { id: string; label: string; type: 'persona' | 'telefono' };
};

export type GrafoEdge = {
  data: { source: string; target: string; label: string; weight: number };
};

export type AnalisisData = {
  nodes: GrafoNode[];
  edges: GrafoEdge[];
};
