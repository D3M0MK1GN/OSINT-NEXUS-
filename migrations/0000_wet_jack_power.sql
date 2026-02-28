CREATE TABLE "persona_telefonos" (
	"id" serial PRIMARY KEY NOT NULL,
	"persona_id" integer,
	"numero" text NOT NULL,
	"tipo" text,
	"linea" text,
	"status" text,
	"alerta" text,
	"imei1" text,
	"imei2" text,
	"icono_tipo" text,
	"activo" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "persona_telefonos_numero_unique" UNIQUE("numero")
);
--> statement-breakpoint
CREATE TABLE "personas_casos" (
	"nro" serial PRIMARY KEY NOT NULL,
	"cedula" text NOT NULL,
	"nombre" text,
	"apellido" text,
	"pseudonimo" text,
	"edad" integer,
	"fecha_de_nacimiento" text,
	"profesion" text,
	"direccion" text,
	"expediente" text,
	"fecha_de_inicio" text,
	"delito" text,
	"n_oficio" text,
	"fiscalia" text,
	"descripcion" text,
	"observacion" text,
	"usuario_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "personas_casos_cedula_unique" UNIQUE("cedula")
);
--> statement-breakpoint
CREATE TABLE "registros_comunicacion" (
	"registro_id" serial PRIMARY KEY NOT NULL,
	"abonado_a" text NOT NULL,
	"abonado_b" text,
	"abonado_a_id" integer,
	"abonado_b_id" integer,
	"imei1_a" text,
	"imei2_a" text,
	"imei1_b" text,
	"imei2_b" text,
	"tipo_y_transaccion" text,
	"segundos" integer,
	"hora" text,
	"fecha" text,
	"direccion_inicial_a" text,
	"latitud_inicial_a" text,
	"longitud_inicial_a" text,
	"direccion_inicial_b" text,
	"latitud_inicial_b" text,
	"longitud_inicial_b" text,
	"archivo" text,
	"peso" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "persona_telefonos" ADD CONSTRAINT "persona_telefonos_persona_id_personas_casos_nro_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas_casos"("nro") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registros_comunicacion" ADD CONSTRAINT "registros_comunicacion_abonado_a_id_persona_telefonos_id_fk" FOREIGN KEY ("abonado_a_id") REFERENCES "public"."persona_telefonos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registros_comunicacion" ADD CONSTRAINT "registros_comunicacion_abonado_b_id_persona_telefonos_id_fk" FOREIGN KEY ("abonado_b_id") REFERENCES "public"."persona_telefonos"("id") ON DELETE no action ON UPDATE no action;