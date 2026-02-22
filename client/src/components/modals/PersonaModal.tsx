import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { type PersonaCaso } from "@shared/schema";
import { User, FileText, Phone, Hash, Calendar, MapPin, Briefcase, Scale, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: any;
}

export function PersonaModal({ isOpen, onClose, persona }: PersonaModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border text-foreground max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="w-5 h-5 text-primary" />
            Información del Objetivo
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Detalles completos del expediente seleccionado.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="grid gap-6 py-4">
            <section className="space-y-4">
              <h4 className="text-sm font-semibold text-primary flex items-center gap-2 border-b border-border pb-2">
                <User className="w-4 h-4" /> Datos Personales
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nombre</label>
                  <div className="p-2 bg-secondary/30 rounded-md border border-border font-medium text-sm">
                    {persona.nombre}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Apellido</label>
                  <div className="p-2 bg-secondary/30 rounded-md border border-border font-medium text-sm">
                    {persona.apellido || "N/A"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cédula</label>
                  <div className="p-2 bg-secondary/30 rounded-md border border-border font-mono text-sm">
                    {persona.cedula}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Seudónimo</label>
                  <div className="p-2 bg-secondary/30 rounded-md border border-border font-medium text-sm">
                    {persona.pseudonimo || "N/A"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Edad</label>
                  <div className="p-2 bg-secondary/30 rounded-md border border-border font-mono text-sm">
                    {persona.edad || "N/A"} años
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Fecha Nacimiento</label>
                  <div className="p-2 bg-secondary/30 rounded-md border border-border font-mono text-sm">
                    {persona.fechaDeNacimiento || "N/A"}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Teléfonos
                </label>
                <div className="p-2 bg-secondary/30 rounded-md border border-border font-mono text-sm">
                  {persona.telefonos?.map((t: any) => t.numero).join(", ") || persona.numeroAsociado || "No registrado"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Profesión
                </label>
                <div className="p-2 bg-secondary/30 rounded-md border border-border text-sm">
                  {persona.profesion || "No especificada"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Dirección
                </label>
                <div className="p-2 bg-secondary/30 rounded-md border border-border text-sm">
                  {persona.direccion || "No registrada"}
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
                    {persona.expediente || "N/A"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">N° Oficio</label>
                  <div className="p-2 bg-secondary/30 rounded-md border border-border font-mono text-sm">
                    {persona.nOficio || "N/A"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Delito</label>
                  <div className="p-2 bg-red-950/20 text-red-200 rounded-md border border-red-900/30 text-sm font-medium">
                    {persona.delito || "En investigación"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Fecha Inicio</label>
                  <div className="p-2 bg-secondary/30 rounded-md border border-border font-mono text-sm">
                    {persona.fechaDeInicio || "N/A"}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Scale className="w-3 h-3" /> Fiscalía
                </label>
                <div className="p-2 bg-secondary/30 rounded-md border border-border text-sm">
                  {persona.fiscalia || "No asignada"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Info className="w-3 h-3" /> Descripción / Observación
                </label>
                <div className="p-2 bg-secondary/20 rounded-md border border-border text-sm min-h-[60px] whitespace-pre-wrap">
                  {persona.descripcion || persona.observacion || "Sin detalles adicionales"}
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

