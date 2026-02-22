import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.trazabilidad.buscar.path, async (req, res) => {
    try {
      const tipo = String(req.query.tipo || 'cedula');
      const valor = String(req.query.valor || '');
      const resultados = await storage.buscarPersonasCasos(tipo, valor);
      res.json({ resultados, total: resultados.length });
    } catch (err) {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get(api.personasCasos.get.path, async (req, res) => {
    try {
      const persona = await storage.getPersonaCaso(Number(req.params.id));
      if (!persona) {
        return res.status(404).json({ message: "Persona no encontrada" });
      }
      const telefonos = await storage.getTelefonosPersona(persona.nro);
      res.json({ ...persona, telefonos });
    } catch (err) {
      res.status(500).json({ message: "Error al obtener persona" });
    }
  });

  app.get(api.registros.getByAbonado.path, async (req, res) => {
    try {
      const registros = await storage.getRegistrosComunicacionPorAbonado(req.params.numero);
      res.json(registros);
    } catch (err) {
      res.status(500).json({ message: "Error al obtener registros" });
    }
  });

  app.get(api.trazabilidad.coincidencias.path, async (req, res) => {
    try {
      const coincidencias = await storage.getCoincidencias(req.params.numero);
      res.json(coincidencias);
    } catch (err) {
      res.status(500).json({ message: "Error al obtener coincidencias" });
    }
  });

  app.get(api.trazabilidad.analisis.path, async (req, res) => {
    try {
      const analisis = await storage.getAnalisis(req.params.numero);
      res.json(analisis);
    } catch (err) {
      res.status(500).json({ message: "Error al generar análisis" });
    }
  });

  async function seedDatabase() {
    try {
      const existing = await storage.buscarPersonasCasos("cedula", "");
      if (existing.length === 0) {
        const persona1 = await storage.createPersonaCaso({
          cedula: "12345678",
          nombre: "Juan",
          apellido: "Pérez García",
          pseudonimo: "El Juan",
          edad: 35,
          fechaDeNacimiento: "1988-05-10",
          profesion: "Comerciante",
          direccion: "Av. Principal 123",
          expediente: "EXP-2023-001",
          fechaDeInicio: "2023-01-15",
          delito: "Estafa",
          nOficio: "OF-100",
          fiscalia: "Fiscalía 1",
          descripcion: "Caso de estafa continuada",
          observacion: "Sujeto de interés",
          usuarioId: 1
        });

        await storage.createPersonaTelefono({
          personaId: persona1.nro,
          numero: "04141234567",
          tipo: "Móvil",
          iconoTipo: "phone",
          activo: true
        });
        
        const persona2 = await storage.createPersonaCaso({
          cedula: "87654321",
          nombre: "María",
          apellido: "López Sánchez",
          pseudonimo: "Mari",
          edad: 28,
          fechaDeNacimiento: "1995-08-20",
          profesion: "Desempleada",
          direccion: "Calle Ciega 456",
          expediente: "EXP-2023-045",
          fechaDeInicio: "2023-05-20",
          delito: "Robo",
          nOficio: "OF-245",
          fiscalia: "Fiscalía 4",
          descripcion: "Robo a mano armada",
          observacion: "Cómplice",
          usuarioId: 1
        });

        await storage.createPersonaTelefono({
          personaId: persona2.nro,
          numero: "04247654321",
          tipo: "Móvil",
          iconoTipo: "phone",
          activo: true
        });

        await storage.createRegistroComunicacion({
          abonadoA: "04141234567",
          abonadoB: "04247654321",
          tipoYTransaccion: "Llamada Saliente",
          segundos: 120,
          fecha: "2023-06-01",
          hora: "14:30:00",
          direccionInicialA: "Antena Centro",
          latitudInicialA: "10.4806",
          longitudInicialA: "-66.9036",
          archivo: "cdr_062023.csv",
          peso: "1024"
        });
      }
    } catch (e) {
      console.error("Error al sembrar la base de datos:", e);
    }
  }

  seedDatabase();

  return httpServer;
}