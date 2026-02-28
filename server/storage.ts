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
import * as xlsx from "xlsx"; // Importar la librería xlsx

export interface IStorage {
  buscarPersonasCasos(tipo: string, valor: string): Promise<PersonaCaso[]>;
  getPersonaCaso(nro: number): Promise<PersonaCaso | undefined>;
  getTelefonosPersona(personaId: number): Promise<PersonaTelefono[]>;
  getRegistrosComunicacionPorAbonado(numero: string): Promise<RegistroComunicacion[]>;
  createPersonaCaso(persona: InsertPersonaCaso): Promise<PersonaCaso>;
  createPersonaTelefono(telefono: InsertPersonaTelefono): Promise<PersonaTelefono>;
  createRegistroComunicacion(registro: InsertRegistroComunicacion): Promise<RegistroComunicacion>;
  importRegistrosComunicacion(fileBuffer: Buffer, numeroAsociado?: string): Promise<number>; // Nuevo método
  getCoincidencias(numero: string): Promise<any>;
  getAnalisis(numero: string): Promise<AnalisisData>;
  buscarPersonaPorTelefono(numero: string): Promise<PersonaCaso[]>; // Modificado para devolver un array
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
    } else if (tipo === "telefono") {
      const telefonos = await db.select().from(personaTelefonos).where(ilike(personaTelefonos.numero, term));
      if (telefonos.length === 0) return [];
      const personaIds = telefonos.map(t => t.personaId).filter(Boolean) as number[];
      if (personaIds.length === 0) return [];
      return await db.select().from(personasCasos).where(
        or(...personaIds.map(id => eq(personasCasos.nro, id)))
      );
    }
    return await db.select().from(personasCasos);
  }

  async buscarPersonaPorTelefono(numero: string): Promise<PersonaCaso[]> { // Modificado para devolver un array
    const personas = await db
      .selectDistinct(personasCasos) // Seleccionar personas distintas
      .from(personasCasos)
      .leftJoin(personaTelefonos, eq(personasCasos.nro, personaTelefonos.personaId))
      .where(eq(personaTelefonos.numero, numero));
    return personas;
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
    console.log("Datos recibidos en createPersonaTelefono:", telefono);
    const [created] = await db.insert(personaTelefonos).values(telefono).returning();
    return created;
  }

  async createRegistroComunicacion(registro: InsertRegistroComunicacion): Promise<RegistroComunicacion> {
    const [created] = await db.insert(registrosComunicacion).values(registro).returning();
    return created;
  }

  async importRegistrosComunicacion(fileBuffer: Buffer, numeroAsociado?: string): Promise<number> {
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonRecords: any[] = xlsx.utils.sheet_to_json(worksheet);

    let importedCount = 0;
    for (const record of jsonRecords) {
      // Normalizar nombres de columnas a minúsculas y sin espacios para fácil acceso
      const normalizedRecord: { [key: string]: any } = {};
      for (const key in record) {
        normalizedRecord[key.toLowerCase().replace(/\s/g, "")] = record[key];
      }

      const abonadoA = String(normalizedRecord["abonadoa"]);
      const abonadoB = String(normalizedRecord["abonadob"]);

      if (!abonadoA || !abonadoB) {
        console.warn("Registro omitido por falta de ABONADO A o ABONADO B:", record);
        continue;
      }

      // Buscar o crear personaTelefono para abonadoA
      let telefonoA = await db.query.personaTelefonos.findFirst({ where: eq(personaTelefonos.numero, abonadoA) });
      if (!telefonoA) {
        telefonoA = await this.createPersonaTelefono({ numero: abonadoA, tipo: "Desconocido", linea: "Desconocido", status: "Desconocido", alerta: "Ninguna" });
      }

      // Buscar o crear personaTelefono para abonadoB
      let telefonoB = await db.query.personaTelefonos.findFirst({ where: eq(personaTelefonos.numero, abonadoB) });
      if (!telefonoB) {
        telefonoB = await this.createPersonaTelefono({ numero: abonadoB, tipo: "Desconocido", linea: "Desconocido", status: "Desconocido", alerta: "Ninguna" });
      }

      // Mapeo de datos y manejo de la discrepancia IMSI/IMEI
      const newRegistro: InsertRegistroComunicacion = {
        abonadoA: abonadoA,
        abonadoB: abonadoB,
        abonadoAId: telefonoA.id,
        abonadoBId: telefonoB.id,
        imei1A: normalizedRecord["imeiabonadoa"] || normalizedRecord["imsiabonadoa"] || null, // Priorizar IMEI, si no, usar IMSI
        imei2A: null, // No hay campo para imei2A en el frontend, se deja nulo
        imei1B: normalizedRecord["imeiabonadob"] || normalizedRecord["imsiabonadob"] || null, // Priorizar IMEI, si no, usar IMSI
        imei2B: null, // No hay campo para imei2B en el frontend, se deja nulo
        tipoYTransaccion: normalizedRecord["tipodetransaccion"] || "Desconocido",
        segundos: parseInt(normalizedRecord["seg"]) || 0,
        fecha: normalizedRecord["fecha"] || null,
        hora: normalizedRecord["hora"] || null,
        direccionInicialA: normalizedRecord["direccioniniciala"] || null,
        latitudInicialA: normalizedRecord["latitudiniciala"] || null,
        longitudInicialA: normalizedRecord["longitudiniciala"] || null,
        direccionInicialB: normalizedRecord["direccioninicialb"] || null, // Nuevo campo
        latitudInicialB: normalizedRecord["latitudinicialb"] || null,     // Nuevo campo
        longitudInicialB: normalizedRecord["longitudiinicialb"] || null,   // Nuevo campo
        archivo: null, // No se especifica en el frontend, se deja nulo
        peso: null,    // No se especifica en el frontend, se deja nulo
      };

      await this.createRegistroComunicacion(newRegistro);
      importedCount++;
    }

    return importedCount;
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