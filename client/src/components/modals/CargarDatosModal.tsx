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
  Phone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CargarDatosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const telefonoSchema = z.object({
  numero: z
    .string()
    .min(1, "El número de teléfono es requerido")
    .refine((val) => {
      const numeros = val.replace(/\D/g, "");
      return numeros.length >= 10;
    }, "El teléfono debe tener al menos 10 dígitos"),
  tipo: z.string().optional(),
  linea: z.string().optional(),
  status: z.string().optional(),
  alerta: z.string().optional(),
  imei1: z.string().optional(),
  imei2: z.string().optional(),
});

const personaCasoSchema = z.object({
  telefonos: z.array(telefonoSchema).optional(), // Array de teléfonos
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
  const [telefonosAgregados, setTelefonosAgregados] = useState<z.infer<typeof telefonoSchema>[]>([]);
  const [currentTelefono, setCurrentTelefono] = useState<z.infer<typeof telefonoSchema>>({
    numero: "",
    tipo: "Móvil",
    linea: "Digitel",
    status: "Activa",
    alerta: "Ninguna",
    imei1: "",
    imei2: "",
  });

  const form = useForm<PersonaCasoFormData>({
    resolver: zodResolver(personaCasoSchema),
    defaultValues: {
      telefonos: [],
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
    setTelefonosAgregados([]);
    setCurrentTelefono({
      numero: "",
      tipo: "Móvil",
      linea: "Digitel",
      status: "Activa",
      alerta: "Ninguna",
      imei1: "",
      imei2: "",
    });
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
          telefonos: telefonosAgregados, // Enviar el array de teléfonos
        }),
      });

      if (response.ok) {
        const personaCreada = await response.json(); // Obtener la persona creada para su ID
        if (archivo && telefonosAgregados.length > 0) {
          const formDataToSend = new FormData();
          formDataToSend.append("archivo", archivo);
          // Si hay múltiples teléfonos, ¿cuál se asocia a los registros?
          // Por ahora, asociamos al primer teléfono agregado si existe.
          if (telefonosAgregados[0]?.numero) {
            formDataToSend.append("numeroAsociado", telefonosAgregados[0].numero);
          }

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

    const telefonoAsociado = currentTelefono.numero;
    if (opcionSeleccionada === 2 && telefonoAsociado) { // Solo para la opción 2
      formDataToSend.append("numeroAsociado", telefonoAsociado);
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
    <div className="space-y-3 py-3">
      <p className="text-sm text-muted-foreground mb-4">
        Selecciona el tipo de carga que deseas realizar:
      </p>
      <div className="grid gap-3">
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
    <div className="grid grid-cols-2 gap-3 py-3">
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
      <div className="col-span-2">
        <Card className="mt-2 border-primary/20 bg-primary/5">
          <CardContent className="p-3 grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="telefonos.0.numero" // Usamos un campo dummy para la validación del número actual
              render={() => (
                <FormItem className="col-span-2">
                  <FormLabel>Número</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="4121234567"
                      className="bg-background"
                      value={currentTelefono.numero}
                      onChange={(e) =>
                        setCurrentTelefono({ ...currentTelefono, numero: e.target.value })
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select
                value={currentTelefono.tipo}
                onValueChange={(value) =>
                  setCurrentTelefono({ ...currentTelefono, tipo: value })
                }
              >
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Móvil">Móvil</SelectItem>
                  <SelectItem value="Fijo">Fijo</SelectItem>
                  <SelectItem value="Extranjero">Extranjero</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>

            <FormItem>
              <FormLabel>Línea</FormLabel>
              <Select
                value={currentTelefono.linea}
                onValueChange={(value) =>
                  setCurrentTelefono({ ...currentTelefono, linea: value })
                }
              >
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Línea" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Digitel">Digitel</SelectItem>
                  <SelectItem value="Movistar">Movistar</SelectItem>
                  <SelectItem value="Movilnet">Movilnet</SelectItem>
                  <SelectItem value="Cantv">Cantv</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>

            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                value={currentTelefono.status}
                onValueChange={(value) =>
                  setCurrentTelefono({ ...currentTelefono, status: value })
                }
              >
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Activa">Activa</SelectItem>
                  <SelectItem value="Desactiva">Desactiva</SelectItem>
                  <SelectItem value="Cortada">Cortada</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>

            <FormItem>
              <FormLabel>Alerta</FormLabel>
              <Select
                value={currentTelefono.alerta}
                onValueChange={(value) =>
                  setCurrentTelefono({ ...currentTelefono, alerta: value })
                }
              >
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Alerta" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Ninguna">Ninguna</SelectItem>
                  <SelectItem value="Spam">Spam</SelectItem>
                  <SelectItem value="Investigada">Investigada</SelectItem>
                  <SelectItem value="Victima">Víctima</SelectItem>
                  <SelectItem value="Critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>

            <FormItem>
              <FormLabel>IMEI 1</FormLabel>
              <FormControl>
                <Input
                  className="bg-background"
                  value={currentTelefono.imei1}
                  onChange={(e) =>
                    setCurrentTelefono({ ...currentTelefono, imei1: e.target.value })
                  }
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>IMEI 2</FormLabel>
              <FormControl>
                <Input
                  className="bg-background"
                  value={currentTelefono.imei2}
                  onChange={(e) =>
                    setCurrentTelefono({ ...currentTelefono, imei2: e.target.value })
                  }
                />
              </FormControl>
            </FormItem>
            <div className="col-span-2 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (currentTelefono.numero && currentTelefono.numero.replace(/\D/g, "").length >= 10) {
                    setTelefonosAgregados([...telefonosAgregados, currentTelefono]);
                    setCurrentTelefono({
                      numero: "",
                      tipo: "Móvil",
                      linea: "Digitel",
                      status: "Activa",
                      alerta: "Ninguna",
                      imei1: "",
                      imei2: "",
                    });
                  } else {
                    toast({
                      title: "Error",
                      description: "El número de teléfono debe tener al menos 10 dígitos.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Agregar Teléfono
              </Button>
            </div>
          </CardContent>
        </Card>

        {telefonosAgregados.length > 0 && (
          <Card className="mt-4 border-primary/20 bg-primary/5">
            <CardContent className="p-3">
              <h4 className="font-semibold text-sm mb-2">Teléfonos Agregados:</h4>
              <ScrollArea className="h-40 w-full rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Línea</TableHead>
                      <TableHead>Alerta</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {telefonosAgregados.map((tel, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{tel.numero}</TableCell>
                        <TableCell>{tel.tipo}</TableCell>
                        <TableCell>{tel.linea}</TableCell>
                        <TableCell>{tel.alerta}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Lógica para editar (cargar en el formulario de arriba)
                              setCurrentTelefono(tel);
                              setTelefonosAgregados(telefonosAgregados.filter((_, i) => i !== index));
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setTelefonosAgregados(telefonosAgregados.filter((_, i) => i !== index))
                            }
                          >
                            Eliminar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
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
    <div className="space-y-3 py-3">
      {showInfo && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-3">
          <h4 className="font-semibold text-sm text-primary mb-1 flex items-center gap-2"><Info className="w-4 h-4"/> Formato del archivo</h4>
          <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">Columnas requeridas:</p>
          <div className="text-[10px] text-muted-foreground grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono">
            <div>• ABONADO A</div><div>• IMSI ABONADO A</div><div>• IMEI ABONADO A</div><div>• ABONADO B</div><div>• IMSI ABONADO B</div><div>• IMEI ABONADO B</div><div>• TIPO DE TRANSACCION</div><div>• FECHA</div><div>• HORA</div><div>• SEG</div>
          </div>
        </div>
      )}
      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-card hover:bg-secondary/10 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv,.txt" onChange={handleFileChange} className="hidden" />
        {archivo ? (
          <div className="space-y-1">
            <FileSpreadsheet className="h-8 w-8 mx-auto text-primary" />
            <p className="font-medium text-sm">{archivo.name}</p>
            <p className="text-xs text-muted-foreground">{(archivo.size / 1024).toFixed(2)} KB</p>
            <Button variant="ghost" size="sm" className="mt-1">Cambiar archivo</Button>
          </div>
        ) : (
          <div className="space-y-1">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="font-medium text-sm text-foreground">Seleccionar archivo de registros</p>
            <p className="text-xs text-muted-foreground">Excel, CSV o TXT (máx. 50MB)</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if(!isOpen) handleReset(); onOpenChange(isOpen); }}>
      <DialogContent className="max-w-4xl bg-card border-border text-foreground h-[90vh] flex flex-col p-0">
        <div className="p-4 pb-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {opcionSeleccionada ? (
                <Button variant="ghost" size="icon" onClick={() => setOpcionSeleccionada(null)} className="h-8 w-8 text-foreground"><ChevronLeft className="h-4 w-4" /></Button>
              ) : null}
              Carga de Datos de Inteligencia
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">Complete los campos requeridos para ingresar información al sistema.</DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-2">
          {!opcionSeleccionada ? renderSeleccionOpcion() : (
            <div className="flex-1">
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
                </Tabs>
              ) : (
                <div className="space-y-6 py-4">
                  <div className="flex items-center gap-2"><div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">!</div><span className="font-medium text-lg">Importación Directa de Registros</span></div>
                  {renderImportarArchivo(true)}
                </div>
              )}
            </div>
          )}
        </div>
        {opcionSeleccionada === 1 && (
          <div className="flex justify-end gap-3 p-4 border-t border-border bg-card">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={form.handleSubmit(handleGuardarCasoCompleto)} disabled={isLoading} className="bg-primary text-primary-foreground">
              {isLoading ? "Guardando..." : "Guardar Caso Completo"}
            </Button>
          </div>
        )}
        {opcionSeleccionada === 2 && (
          <div className="flex justify-end gap-3 p-4 border-t border-border bg-card">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleImportarRegistros} disabled={isLoading || !archivo} className="bg-primary text-primary-foreground">
              {isLoading ? "Importando..." : "Importar Registros"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
