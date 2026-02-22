/*
  # Creación del esquema inicial del sistema de inteligencia criminal

  1. Nuevas Tablas
    - `personas_casos`
      - `nro` (serial, PK) - Identificador único
      - `cedula` (text, UNIQUE) - Cédula de identidad
      - `nombre` (text) - Nombres del investigado
      - `apellido` (text) - Apellidos
      - `pseudonimo` (text) - Alias o apodos
      - `edad` (integer) - Edad
      - `fecha_de_nacimiento` (text) - Fecha de nacimiento
      - `profesion` (text) - Ocupación
      - `direccion` (text) - Dirección de habitación
      - `expediente` (text) - Número de expediente judicial
      - `fecha_de_inicio` (text) - Fecha de inicio de investigación
      - `delito` (text) - Calificación jurídica del hecho
      - `n_oficio` (text) - Número de oficio de solicitud
      - `fiscalia` (text) - Fiscalía que conoce la causa
      - `descripcion` (text) - Detalles adicionales del caso
      - `observacion` (text) - Notas del investigador
      - `usuario_id` (integer) - ID del usuario que registró
      - `created_at` (timestamp) - Fecha de creación
      - `updated_at` (timestamp) - Fecha de actualización

    - `persona_telefonos`
      - `id` (serial, PK) - Identificador único
      - `persona_id` (integer) - FK a personas_casos
      - `numero` (text, UNIQUE) - Número de teléfono
      - `tipo` (text) - Categoría (Móvil, Fijo, Extranjero)
      - `linea` (text) - Operadora (Digitel, Movistar, etc)
      - `status` (text) - Estado (Activa, Desactiva, Cortada)
      - `alerta` (text) - Tipo de alerta (Spam, Investigada, etc)
      - `imei1` (text) - IMEI del dispositivo 1
      - `imei2` (text) - IMEI del dispositivo 2
      - `icono_tipo` (text) - Identificador de icono para visualización
      - `activo` (boolean) - Estado del número
      - `created_at` (timestamp) - Fecha de registro

    - `registros_comunicacion`
      - `registro_id` (serial, PK) - Identificador único
      - `abonado_a` (text) - Número que origina la comunicación
      - `abonado_b` (text) - Número que recibe
      - `abonado_a_id` (integer) - FK opcional a persona_telefonos
      - `abonado_b_id` (integer) - FK opcional a persona_telefonos
      - `imei1_a` / `imei2_a` (text) - IMEIs del abonado A
      - `imei1_b` / `imei2_b` (text) - IMEIs del abonado B
      - `tipo_y_transaccion` (text) - Tipo de evento
      - `segundos` (integer) - Duración en segundos
      - `hora` (text) - Hora exacta del evento
      - `fecha` (text) - Fecha del evento
      - `direccion_inicial_a` (text) - Dirección física de la celda/antena
      - `latitud_inicial_a` (text) - Coordenada de latitud
      - `longitud_inicial_a` (text) - Coordenada de longitud
      - `archivo` (text) - Nombre del archivo fuente
      - `peso` (text) - Información adicional de metadatos
      - `created_at` (timestamp) - Fecha de importación

  2. Seguridad
    - Se habilita RLS en todas las tablas
    - Se crean políticas para acceso público (sin autenticación requerida)

  3. Índices
    - Se crean índices para búsquedas optimizadas
*/

-- Crear tabla personas_casos
CREATE TABLE IF NOT EXISTS personas_casos (
  nro SERIAL PRIMARY KEY,
  cedula TEXT NOT NULL UNIQUE,
  nombre TEXT,
  apellido TEXT,
  pseudonimo TEXT,
  edad INTEGER,
  fecha_de_nacimiento TEXT,
  profesion TEXT,
  direccion TEXT,
  expediente TEXT,
  fecha_de_inicio TEXT,
  delito TEXT,
  n_oficio TEXT,
  fiscalia TEXT,
  descripcion TEXT,
  observacion TEXT,
  usuario_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla persona_telefonos
CREATE TABLE IF NOT EXISTS persona_telefonos (
  id SERIAL PRIMARY KEY,
  persona_id INTEGER REFERENCES personas_casos(nro) ON DELETE CASCADE,
  numero TEXT NOT NULL UNIQUE,
  tipo TEXT,
  linea TEXT,
  status TEXT,
  alerta TEXT,
  imei1 TEXT,
  imei2 TEXT,
  icono_tipo TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla registros_comunicacion
CREATE TABLE IF NOT EXISTS registros_comunicacion (
  registro_id SERIAL PRIMARY KEY,
  abonado_a TEXT NOT NULL,
  abonado_b TEXT,
  abonado_a_id INTEGER REFERENCES persona_telefonos(id) ON DELETE SET NULL,
  abonado_b_id INTEGER REFERENCES persona_telefonos(id) ON DELETE SET NULL,
  imei1_a TEXT,
  imei2_a TEXT,
  imei1_b TEXT,
  imei2_b TEXT,
  tipo_y_transaccion TEXT,
  segundos INTEGER,
  hora TEXT,
  fecha TEXT,
  direccion_inicial_a TEXT,
  latitud_inicial_a TEXT,
  longitud_inicial_a TEXT,
  archivo TEXT,
  peso TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para optimización de búsquedas
CREATE INDEX IF NOT EXISTS idx_personas_cedula ON personas_casos(cedula);
CREATE INDEX IF NOT EXISTS idx_personas_nombre ON personas_casos(nombre);
CREATE INDEX IF NOT EXISTS idx_personas_apellido ON personas_casos(apellido);
CREATE INDEX IF NOT EXISTS idx_personas_expediente ON personas_casos(expediente);
CREATE INDEX IF NOT EXISTS idx_personas_pseudonimo ON personas_casos(pseudonimo);

CREATE INDEX IF NOT EXISTS idx_telefonos_numero ON persona_telefonos(numero);
CREATE INDEX IF NOT EXISTS idx_telefonos_persona_id ON persona_telefonos(persona_id);

CREATE INDEX IF NOT EXISTS idx_registros_abonado_a ON registros_comunicacion(abonado_a);
CREATE INDEX IF NOT EXISTS idx_registros_abonado_b ON registros_comunicacion(abonado_b);
CREATE INDEX IF NOT EXISTS idx_registros_fecha ON registros_comunicacion(fecha);

-- Habilitar RLS en todas las tablas
ALTER TABLE personas_casos ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_telefonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_comunicacion ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para personas_casos (acceso público para desarrollo)
CREATE POLICY "Permitir todas las operaciones en personas_casos"
  ON personas_casos FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- Políticas RLS para persona_telefonos (acceso público para desarrollo)
CREATE POLICY "Permitir todas las operaciones en persona_telefonos"
  ON persona_telefonos FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- Políticas RLS para registros_comunicacion (acceso público para desarrollo)
CREATE POLICY "Permitir todas las operaciones en registros_comunicacion"
  ON registros_comunicacion FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);
