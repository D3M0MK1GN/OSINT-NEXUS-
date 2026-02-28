import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { type PersonaCaso } from "@shared/schema";
import { User, FileText, Phone, Hash, Calendar, MapPin, Briefcase, Scale, Info, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePersona } from "@/hooks/use-trazabilidad"; // Importar el hook

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: PersonaCaso; // Aseguramos que persona tenga al menos nro
}

export function PersonaModal({ isOpen, onClose, persona }: PersonaModalProps) {
  const { data: fetchedPersona, isLoading, error } = usePersona(persona.nro);

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border text-foreground h-[90vh] flex flex-col p-0">
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Cargando información...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border text-foreground h-[90vh] flex flex-col p-0">
          <div className="flex flex-col items-center justify-center h-full text-rose-500">
            <Info className="w-8 h-8" />
            <p className="mt-4">Error al cargar la información de la persona.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const displayPersona = fetchedPersona || persona; // Usar los datos cargados o los de la prop como fallback

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border text-foreground h-[90vh] flex flex-col p-0">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <User className="w-5 h-5 text-primary" />
              Información del Objetivo
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Detalles completos del expediente seleccionado.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-2">
          <div className="grid gap-6 py-4">
            <section className="space-y-4">
              <h4 className="text-sm font-semibold text-primary flex items-center gap-2 border-b border-border pb-2">
                <User className="w-4 h-4" /> Datos Personales
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nombre</label>
                  <div className="p-2 bg-secondary/30 rounded-md border border-border font-medium text-sm">
                    {displayPersona.nombre}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Apellido</label>
                  <div className="p-2 bg-secondary/30 rounded-md border border-border font-medium text-sm">
                    {displayPersona.apellido || "N/A"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cédula</label>
                  <div className="p-2 bg-secondary/30 rounded-md border border-border font-mono text-sm">
                    {displayPersona.cedula}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Seudónimo</label>
                  <div className="p-2 bg-secondary/30 rounded-md border border-border font-medium text-sm">
                    {displayPersona.pseudonimo || "N/A"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Edad</label>
                  <div className="p-2 bg-secondary/30 rounded-md border border-border font-mono text-sm">
                    {displayPersona.edad || "N/A"} años
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Fecha Nacimiento</label>
                  <div className="p-2 bg-secondary/30 rounded-md border border-border font-mono text-sm">
                    {displayPersona.fechaDeNacimiento || "N/A"}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Teléfonos
                </label>
                <div className="p-2 bg-secondary/30 rounded-md border border-border font-mono text-sm">
                  {displayPersona.telefonos?.map((t: any) => t.numero).join(", ") || "No registrado"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Profesión
                </label>
                <div className="p-2 bg-secondary/30 rounded-md border border-border text-sm">
                  {displayPersona.profesion || "No especificada"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Dirección
                </label>
                <div className="p-2 bg-secondary/30 rounded-md border border-border text-sm">
                  {displayPersona.direccion || "No registrada"}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-sm font-semibold text-primary flex items-center gap-2 border-b border-border pb-2">
                <FileText className="w-4 h-4" /> Información del Caso
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Expediente</label>
                  <div className="p-2 bg-primary/5 rounded-md border border-primary/20 font-mono text-primary text-sm font-bold">
                    {displayPersona.expediente || "N/A"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">N° Oficio</label>
                  <div className="p-2 bg-secondary/30 rounded-md border border-border font-mono text-sm">
                    {displayPersona.nOficio || "N/A"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Delito</label>
                  <div className="p-2 bg-red-950/20 text-red-200 rounded-md border border-red-900/30 text-sm font-medium">
                    {displayPersona.delito || "En investigación"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Fecha Inicio</label>
                  <div className="p-2 bg-secondary/30 rounded-md border border-border font-mono text-sm">
                    {displayPersona.fechaDeInicio || "N/A"}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Scale className="w-3 h-3" /> Fiscalía
                </label>
                <div className="p-2 bg-secondary/30 rounded-md border border-border text-sm">
                  {displayPersona.fiscalia || "No asignada"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Info className="w-3 h-3" /> Descripción / Observación
                </label>
                <div className="p-2 bg-secondary/20 rounded-md border border-border text-sm min-h-[60px] whitespace-pre-wrap">
                  {displayPersona.descripcion || displayPersona.observacion || "Sin detalles adicionales"}
                </div>
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

