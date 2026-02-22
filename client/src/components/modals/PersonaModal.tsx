import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { type PersonaCaso } from "@shared/schema";
import { User, FileText, Phone, Hash, Calendar } from "lucide-react";

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: PersonaCaso;
}

export function PersonaModal({ isOpen, onClose, persona }: PersonaModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="w-5 h-5 text-primary" />
            Información del Objetivo
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Detalles completos del expediente seleccionado.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase">Nombre</label>
              <div className="p-2 bg-secondary/50 rounded-md border border-border font-medium">
                {persona.nombre}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase">Apellido</label>
              <div className="p-2 bg-secondary/50 rounded-md border border-border font-medium">
                {persona.apellido}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase">Cédula de Identidad</label>
              <div className="p-2 bg-secondary/50 rounded-md border border-border font-mono">
                {persona.cedula}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase">Pseudónimo</label>
              <div className="p-2 bg-secondary/50 rounded-md border border-border font-medium">
                {persona.pseudonimo || "N/A"}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
              <FileText className="w-3 h-3" /> Expediente
            </label>
            <div className="p-2 bg-secondary/50 rounded-md border border-border font-mono text-primary">
              {persona.expediente}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                <Phone className="w-3 h-3" /> Teléfonos
              </label>
              <div className="p-2 bg-secondary/50 rounded-md border border-border font-mono">
                {persona.telefonos?.map((t: any) => t.numero).join(", ") || "No registrado"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                <Hash className="w-3 h-3" /> Edad
              </label>
              <div className="p-2 bg-secondary/50 rounded-md border border-border font-mono">
                {persona.edad || "N/A"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase">Delito Investigado</label>
              <div className="p-2 bg-red-950/30 text-red-200 rounded-md border border-red-900/50">
                {persona.delito || "En investigación"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Fecha Inicio
              </label>
              <div className="p-2 bg-secondary/50 rounded-md border border-border">
                {persona.fechaDeInicio || "N/A"}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
