import { db } from "./db";
import {
  personasCasos,
  personaTelefonos,
  registrosComunicacion,
  type PersonaCaso,
  type InsertPersonaCaso,
  type PersonaTelefono,
  type InsertPersonaTelefono,
  type RegistroComunicacion,
  type InsertRegistroComunicacion,
  type AnalisisData
} from "@shared/schema";
import { eq, or, ilike } from "drizzle-orm";

export interface IStorage {
  buscarPersonasCasos(tipo: string, valor: string): Promise<PersonaCaso[]>;
  getPersonaCaso(nro: number): Promise<PersonaCaso | undefined>;
  getTelefonosPersona(personaId: number): Promise<PersonaTelefono[]>;
  getRegistrosComunicacionPorAbonado(numero: string): Promise<RegistroComunicacion[]>;
  createPersonaCaso(persona: InsertPersonaCaso): Promise<PersonaCaso>;
  createPersonaTelefono(telefono: InsertPersonaTelefono): Promise<PersonaTelefono>;
  createRegistroComunicacion(registro: InsertRegistroComunicacion): Promise<RegistroComunicacion>;
  getCoincidencias(numero: string): Promise<any>;
  getAnalisis(numero: string): Promise<AnalisisData>;
}

export class DatabaseStorage implements IStorage {
  async buscarPersonasCasos(tipo: string, valor: string): Promise<PersonaCaso[]> {
    const term = `%${valor}%`;
    if (tipo === "cedula") {
      return await db.select().from(personasCasos).where(ilike(personasCasos.cedula, term));
    } else if (tipo === "nombre") {
      return await db.select().from(personasCasos).where(
        or(
          ilike(personasCasos.nombre, term),
          ilike(personasCasos.apellido, term)
        )
      );
    } else if (tipo === "expediente") {
      return await db.select().from(personasCasos).where(ilike(personasCasos.expediente, term));
    } else if (tipo === "pseudonimo") {
      return await db.select().from(personasCasos).where(ilike(personasCasos.pseudonimo, term));
    }
    return await db.select().from(personasCasos);
  }

  async getPersonaCaso(nro: number): Promise<PersonaCaso | undefined> {
    const [persona] = await db.select().from(personasCasos).where(eq(personasCasos.nro, nro));
    return persona;
  }

  async getTelefonosPersona(personaId: number): Promise<PersonaTelefono[]> {
    return await db.select().from(personaTelefonos).where(eq(personaTelefonos.personaId, personaId));
  }

  async getRegistrosComunicacionPorAbonado(numero: string): Promise<RegistroComunicacion[]> {
    return await db.select().from(registrosComunicacion).where(
      or(
        eq(registrosComunicacion.abonadoA, numero),
        eq(registrosComunicacion.abonadoB, numero)
      )
    );
  }

  async createPersonaCaso(persona: InsertPersonaCaso): Promise<PersonaCaso> {
    const [created] = await db.insert(personasCasos).values(persona).returning();
    return created;
  }

  async createPersonaTelefono(telefono: InsertPersonaTelefono): Promise<PersonaTelefono> {
    const [created] = await db.insert(personaTelefonos).values(telefono).returning();
    return created;
  }

  async createRegistroComunicacion(registro: InsertRegistroComunicacion): Promise<RegistroComunicacion> {
    const [created] = await db.insert(registrosComunicacion).values(registro).returning();
    return created;
  }

  async getCoincidencias(numero: string): Promise<any> {
    return {
      numero: numero,
      coincidenciasEncontradas: 2,
      detalles: [
        { tipo: "Caso Anterior", descripcion: "Vinculado al Exp. 2021-001" },
        { tipo: "Llamada Sospechosa", descripcion: "Comunicación con número en lista negra" }
      ]
    };
  }

  async getAnalisis(numero: string): Promise<AnalisisData> {
    return {
      nodes: [
        { data: { id: numero, label: `Objetivo: ${numero}`, type: 'telefono' } },
        { data: { id: "123456789", label: "Contacto 1", type: 'telefono' } },
        { data: { id: "987654321", label: "Contacto 2", type: 'telefono' } },
        { data: { id: "P1", label: "Juan Pérez", type: 'persona' } },
      ],
      edges: [
        { data: { source: numero, target: "123456789", label: "Llamada Saliente", weight: 5 } },
        { data: { source: "987654321", target: numero, label: "Llamada Entrante", weight: 2 } },
        { data: { source: "123456789", target: "P1", label: "Titular", weight: 10 } },
      ]
    };
  }
}

export const storage = new DatabaseStorage();