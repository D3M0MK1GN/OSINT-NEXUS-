import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  cedula: z.string().optional(),
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

export function UploadModal({
  isOpen,
  onClose,
  onSuccess,
}: UploadModalProps) {
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
        onClose();
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
        onClose();
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
      <p className="text-sm text-gray-600 mb-6">
        Selecciona el tipo de carga que deseas realizar:
      </p>

      <Card
        className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
        onClick={() => setOpcionSeleccionada(1)}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                Opción 1: Cargar Caso Completo
              </h3>
              <p className="text-sm text-gray-600">
                Crea una nueva persona/caso y opcionalmente importa sus registros de comunicación
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
        onClick={() => setOpcionSeleccionada(2)}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                Opción 2: Cargar Solo Registros
              </h3>
              <p className="text-sm text-gray-600">
                Importa únicamente registros de comunicación sin crear una persona/caso
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFormularioPersona = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleGuardarCasoCompleto)} className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cedula"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cédula</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="V-12345678" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expediente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expediente</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="EXP-2024-001" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apellido"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono Principal</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="4121234567" maxLength={10} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="delito"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delito</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>Archivo de Registros (Opcional)</FormLabel>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-primary transition-colors text-center"
          >
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              {archivo ? archivo.name : "Haz clic para seleccionar o arrastra un archivo"}
            </p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
              accept=".csv,.xlsx,.xls,.txt"
            />
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={() => setOpcionSeleccionada(null)}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar Caso"}
          </Button>
        </div>
      </form>
    </Form>
  );

  const renderSoloRegistros = () => (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <FormLabel>Archivo de Registros de Comunicación</FormLabel>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-10 cursor-pointer hover:border-primary transition-colors text-center"
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-base font-medium">
            {archivo ? archivo.name : "Seleccionar archivo Excel, CSV o TXT"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Los registros se importarán directamente a la base de datos
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
            accept=".csv,.xlsx,.xls,.txt"
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={() => setOpcionSeleccionada(null)}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <Button 
          onClick={handleImportarRegistros} 
          disabled={isLoading || !archivo}
          className="px-8"
        >
          {isLoading ? "Importando..." : "Importar Registros"}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) handleReset(); onClose(); }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Upload className="h-6 w-6 text-primary" />
            Cargar Datos al Sistema
          </DialogTitle>
        </DialogHeader>

        {!opcionSeleccionada && renderSeleccionOpcion()}
        {opcionSeleccionada === 1 && renderFormularioPersona()}
        {opcionSeleccionada === 2 && renderSoloRegistros()}
      </DialogContent>
    </Dialog>
  );
}
