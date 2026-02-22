import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Upload,
  FileSpreadsheet,
  User,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CargarDatosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const personaCasoSchema = z.object({
  telefono: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      const numeros = val.replace(/\D/g, "");
      return numeros.length === 10;
    }, "El teléfono debe tener exactamente 10 dígitos"),
  cedula: z.string().min(1, "La cédula es requerida"),
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().optional(),
  pseudonimo: z.string().optional(),
  edad: z.string().optional(),
  fechaDeNacimiento: z.string().optional(),
  profesion: z.string().optional(),
  direccion: z.string().optional(),
  expediente: z.string().optional(),
  fechaDeInicio: z.string().optional(),
  delito: z.string().optional(),
  nOficio: z.string().optional(),
  fiscalia: z.string().optional(),
  descripcion: z.string().optional(),
  observacion: z.string().optional(),
});

type PersonaCasoFormData = z.infer<typeof personaCasoSchema>;

export function CargarDatosModal({
  open,
  onOpenChange,
  onSuccess,
}: CargarDatosModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [opcionSeleccionada, setOpcionSeleccionada] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);

  const form = useForm<PersonaCasoFormData>({
    resolver: zodResolver(personaCasoSchema),
    defaultValues: {
      telefono: "",
      cedula: "",
      nombre: "",
      apellido: "",
      pseudonimo: "",
      edad: "",
      fechaDeNacimiento: "",
      profesion: "",
      direccion: "",
      expediente: "",
      fechaDeInicio: "",
      delito: "",
      nOficio: "",
      fiscalia: "",
      descripcion: "",
      observacion: "",
    },
  });

  const handleReset = () => {
    setOpcionSeleccionada(null);
    setArchivo(null);
    form.reset();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!["xlsx", "xls", "csv", "txt"].includes(extension || "")) {
        toast({
          title: "Formato no válido",
          description: "Solo se permiten archivos Excel (.xlsx, .xls), CSV (.csv) o TXT (.txt)",
          variant: "destructive",
        });
        return;
      }
      setArchivo(file);
    }
  };

  const handleGuardarCasoCompleto = async (data: PersonaCasoFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/personas-casos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          edad: data.edad ? parseInt(data.edad) : null,
        }),
      });

      if (response.ok) {
        if (archivo && data.telefono) {
          const formDataToSend = new FormData();
          formDataToSend.append("archivo", archivo);
          formDataToSend.append("numeroAsociado", data.telefono);

          const registrosResponse = await fetch("/api/registros-comunicacion/importar", {
            method: "POST",
            body: formDataToSend,
          });

          if (registrosResponse.ok) {
            const registrosData = await registrosResponse.json();
            toast({
              title: "Éxito",
              description: `Caso creado con ${registrosData.registrosImportados} registros importados`,
            });
          } else {
            toast({
              title: "Parcialmente exitoso",
              description: "Caso creado, pero hubo un error al importar los registros",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Éxito",
            description: "Persona/Caso creado correctamente",
          });
        }
        handleReset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "No se pudo crear la persona/caso",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al crear persona/caso:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al crear la persona/caso",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportarRegistros = async () => {
    if (!archivo) {
      toast({
        title: "Archivo requerido",
        description: "Por favor selecciona un archivo para importar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append("archivo", archivo);

    const telefono = form.getValues("telefono");
    if (opcionSeleccionada === 1 && telefono) {
      formDataToSend.append("numeroAsociado", telefono);
    }

    try {
      const response = await fetch("/api/registros-comunicacion/importar", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Importación exitosa",
          description: `Se importaron ${data.registrosImportados} registros correctamente`,
        });
        handleReset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "No se pudo importar el archivo",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al importar registros:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al importar los registros",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderSeleccionOpcion = () => (
    <div className="space-y-4 py-4">
      <p className="text-sm text-muted-foreground mb-6">
        Selecciona el tipo de carga que deseas realizar:
      </p>
      <div className="grid gap-4">
        <Card className="cursor-pointer hover:border-primary hover:shadow-md transition-all bg-card border-border" onClick={() => setOpcionSeleccionada(1)}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-lg"><User className="h-6 w-6 text-primary" /></div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 text-foreground">Opción 1: Cargar Caso Completo</h3>
                <p className="text-sm text-muted-foreground">Crea una nueva persona/caso y opcionalmente importa sus registros de comunicación.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary hover:shadow-md transition-all bg-card border-border" onClick={() => setOpcionSeleccionada(2)}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-lg"><FileSpreadsheet className="h-6 w-6 text-primary" /></div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 text-foreground">Opción 2: Cargar Solo Registros</h3>
                <p className="text-sm text-muted-foreground">Importa únicamente registros de comunicación sin crear una persona/caso.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderFormularioPersona = () => (
    <div className="grid grid-cols-2 gap-4 py-4">
      <FormField control={form.control} name="cedula" render={({ field }) => (
        <FormItem>
          <FormLabel>Cédula *</FormLabel>
          <FormControl><Input {...field} placeholder="V-12345678" className="bg-background border-input" onChange={(e) => field.onChange(e.target.value.toUpperCase())}/></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name="expediente" render={({ field }) => (
        <FormItem>
          <FormLabel>Expediente</FormLabel>
          <FormControl><Input {...field} placeholder="EXP-2024-001" className="bg-background border-input" /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name="nombre" render={({ field }) => (
        <FormItem>
          <FormLabel>Nombre *</FormLabel>
          <FormControl><Input {...field} className="bg-background border-input" /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name="apellido" render={({ field }) => (
        <FormItem>
          <FormLabel>Apellido</FormLabel>
          <FormControl><Input {...field} className="bg-background border-input" /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name="telefono" render={({ field }) => (
        <FormItem>
          <FormLabel>Teléfono Principal</FormLabel>
          <FormControl><Input {...field} placeholder="4121234567" maxLength={10} className="bg-background border-input" onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}/></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name="pseudonimo" render={({ field }) => (
        <FormItem>
          <FormLabel>Seudónimo</FormLabel>
          <FormControl><Input {...field} className="bg-background border-input" /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name="edad" render={({ field }) => (
        <FormItem>
          <FormLabel>Edad</FormLabel>
          <FormControl><Input {...field} type="number" className="bg-background border-input" /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name="fechaDeNacimiento" render={({ field }) => (
        <FormItem>
          <FormLabel>Fecha de Nacimiento</FormLabel>
          <FormControl><Input {...field} type="date" className="bg-background border-input" /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name="profesion" render={({ field }) => (
        <FormItem>
          <FormLabel>Profesión</FormLabel>
          <FormControl><Input {...field} className="bg-background border-input" /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name="fechaDeInicio" render={({ field }) => (
        <FormItem>
          <FormLabel>Fecha de Inicio</FormLabel>
          <FormControl><Input {...field} type="date" className="bg-background border-input" /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name="delito" render={({ field }) => (
        <FormItem>
          <FormLabel>Delito</FormLabel>
          <FormControl><Input {...field} className="bg-background border-input" /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name="nOficio" render={({ field }) => (
        <FormItem>
          <FormLabel>N° Oficio</FormLabel>
          <FormControl><Input {...field} className="bg-background border-input" /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <div className="col-span-2">
        <FormField control={form.control} name="fiscalia" render={({ field }) => (
          <FormItem>
            <FormLabel>Fiscalía</FormLabel>
            <FormControl><Input {...field} className="bg-background border-input" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>
      <div className="col-span-2">
        <FormField control={form.control} name="direccion" render={({ field }) => (
          <FormItem>
            <FormLabel>Dirección</FormLabel>
            <FormControl><Input {...field} className="bg-background border-input" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>
      <div className="col-span-2">
        <FormField control={form.control} name="descripcion" render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción</FormLabel>
            <FormControl><Textarea {...field} rows={2} className="bg-background border-input" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>
      <div className="col-span-2">
        <FormField control={form.control} name="observacion" render={({ field }) => (
          <FormItem>
            <FormLabel>Observación</FormLabel>
            <FormControl><Textarea {...field} rows={2} className="bg-background border-input" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>
    </div>
  );

  const renderImportarArchivo = (showInfo = true) => (
    <div className="space-y-4 py-4">
      {showInfo && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-sm text-primary mb-2 flex items-center gap-2"><Info className="w-4 h-4"/> Formato del archivo</h4>
          <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wide">Columnas requeridas:</p>
          <div className="text-[10px] text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 font-mono">
            <div>• ABONADO A</div><div>• IMSI ABONADO A</div><div>• IMEI ABONADO A</div><div>• ABONADO B</div><div>• IMSI ABONADO B</div><div>• IMEI ABONADO B</div><div>• TIPO DE TRANSACCION</div><div>• FECHA</div><div>• HORA</div><div>• SEG</div>
          </div>
        </div>
      )}
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-card hover:bg-secondary/10 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv,.txt" onChange={handleFileChange} className="hidden" />
        {archivo ? (
          <div className="space-y-2">
            <FileSpreadsheet className="h-10 w-10 mx-auto text-primary" />
            <p className="font-medium text-sm">{archivo.name}</p>
            <p className="text-xs text-muted-foreground">{(archivo.size / 1024).toFixed(2)} KB</p>
            <Button variant="ghost" size="sm" className="mt-2">Cambiar archivo</Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="font-medium text-sm text-foreground">Seleccionar archivo de registros</p>
            <p className="text-xs text-muted-foreground">Excel, CSV o TXT (máx. 50MB)</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if(!isOpen) handleReset(); onOpenChange(isOpen); }}>
      <DialogContent className="max-w-3xl bg-card border-border text-foreground max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {opcionSeleccionada ? (
              <Button variant="ghost" size="icon" onClick={() => setOpcionSeleccionada(null)} className="h-8 w-8 text-foreground"><ChevronLeft className="h-4 w-4" /></Button>
            ) : null}
            Carga de Datos de Inteligencia
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">Complete los campos requeridos para ingresar información al sistema.</DialogDescription>
        </DialogHeader>

        {!opcionSeleccionada ? renderSeleccionOpcion() : (
          <ScrollArea className="flex-1 -mr-4 pr-4">
            {opcionSeleccionada === 1 ? (
              <Tabs defaultValue="datos" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="datos">1. Datos del Objetivo</TabsTrigger>
                  <TabsTrigger value="archivo">2. Archivo de Registros</TabsTrigger>
                </TabsList>
                <Form {...form}>
                  <TabsContent value="datos">{renderFormularioPersona()}</TabsContent>
                  <TabsContent value="archivo">{renderImportarArchivo()}</TabsContent>
                </Form>
                <div className="flex justify-end gap-3 pt-6 border-t border-border sticky bottom-0 bg-card py-4">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                  <Button onClick={form.handleSubmit(handleGuardarCasoCompleto)} disabled={isLoading} className="bg-primary text-primary-foreground">
                    {isLoading ? "Guardando..." : "Guardar Caso Completo"}
                  </Button>
                </div>
              </Tabs>
            ) : (
              <div className="space-y-6 py-4">
                <div className="flex items-center gap-2"><div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">!</div><span className="font-medium text-lg">Importación Directa de Registros</span></div>
                {renderImportarArchivo(true)}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                  <Button onClick={handleImportarRegistros} disabled={isLoading || !archivo} className="bg-primary text-primary-foreground">
                    {isLoading ? "Importando..." : "Importar Registros"}
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
