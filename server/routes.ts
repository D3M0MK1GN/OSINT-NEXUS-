import multer from "multer";
import { storage } from "./storage";
import { api } from "@shared/routes";

// Configuración de Multer para la subida de archivos
const upload = multer({
  storage: multer.memoryStorage(), // Almacena el archivo en memoria
  fileFilter: (req, file, cb) => {
    // Permitir solo archivos Excel
    if (
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || // .xlsx
      file.mimetype === "application/vnd.ms-excel" // .xls
    ) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de archivo no válido. Solo se permiten archivos Excel (.xlsx, .xls)."), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // Límite de 50MB
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/personas-casos", async (req, res) => {
    try {
      const data = req.body;
      console.log("Datos recibidos en /api/personas-casos:", data);
      const persona = await storage.createPersonaCaso(data);
      if (data.telefonos && Array.isArray(data.telefonos)) {
        console.log("Teléfonos recibidos para crear:", data.telefonos);
        for (const telefonoData of data.telefonos) {
          console.log("Creando teléfono:", telefonoData);
          await storage.createPersonaTelefono({
            personaId: persona.nro,
            numero: telefonoData.numero,
            tipo: telefonoData.tipo || "Móvil",
            linea: telefonoData.linea,
            status: telefonoData.status,
            alerta: telefonoData.alerta,
            imei1: telefonoData.imei1,
            imei2: telefonoData.imei2,
            iconoTipo: "phone",
            activo: true
          });
        }
      }
      res.json(persona);
    } catch (err) {
      console.error("Error al crear persona:", err);
      res.status(500).json({ message: "Error al crear persona" });
    }
  });

  app.post("/api/registros-comunicacion/importar", upload.single("archivo"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se ha subido ningún archivo." });
      }

      const archivoBuffer = req.file.buffer;
      const numeroAsociado = req.body.numeroAsociado as string | undefined;

      const registrosImportados = await storage.importRegistrosComunicacion(archivoBuffer, numeroAsociado);

      res.json({ registrosImportados });
    } catch (err: any) {
      console.error("Error al importar registros:", err);
      if (err.message === "Tipo de archivo no válido. Solo se permiten archivos Excel (.xlsx, .xls).") {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: err.message || "Error al importar registros" });
    }
  });

  app.get(api.trazabilidad.buscar.path, async (req, res) => {
    try {
      const tipo = String(req.query.tipo || 'cedula');
      const valor = String(req.query.valor || '');
      let resultados: any[] = [];
      let total = 0;

      if (tipo === "identificar_numero") {
        resultados = await storage.buscarPersonaPorTelefono(valor);
        total = resultados.length;
      } else if (tipo === "registro_comunicacional") {
        resultados = await storage.getRegistrosComunicacionPorAbonado(valor);
        total = resultados.length;
      } else {
        // Búsquedas existentes por cedula, nombre, expediente, pseudonimo
        resultados = await storage.buscarPersonasCasos(tipo, valor);
        total = resultados.length;
      }
      res.json({ resultados, total });
    } catch (err) {
      console.error("Error interno del servidor al buscar:", err);
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