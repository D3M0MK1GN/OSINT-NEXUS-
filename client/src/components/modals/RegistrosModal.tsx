import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { type PersonaCaso } from "@shared/schema";
import { useRegistrosComunicacion } from "@/hooks/use-trazabilidad";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Download, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { format } from "date-fns";

interface RegistrosModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: PersonaCaso;
}

export function RegistrosModal({ isOpen, onClose, persona }: RegistrosModalProps) {
  const { data: registros, isLoading } = useRegistrosComunicacion(persona.telefono || persona.numeroAsociado);

  const handleExport = () => {
    if (!registros) return;
    
    // Simple CSV export logic
    const headers = ["Fecha", "Hora", "Origen", "Destino", "Duración (s)", "Tipo", "Ubicación"];
    const rows = registros.map(r => [
      r.fecha,
      r.hora,
      r.abonadoA,
      r.abonadoB,
      r.segundos,
      r.tipoYTransaccion,
      r.direccionInicialA
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `registros_${persona.cedula}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-card border-border text-foreground h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex justify-between items-center pr-8">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                Registros de Comunicación
              </DialogTitle>
              <DialogDescription>
                Historial de llamadas y mensajes para el objetivo: <span className="text-primary font-mono">{persona.nombreCompleto}</span>
              </DialogDescription>
            </div>
            <Button size="sm" variant="outline" onClick={handleExport} disabled={!registros?.length}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto border rounded-md mt-4">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !registros || registros.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No se encontraron registros de comunicación para este número.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-secondary sticky top-0">
                <TableRow>
                  <TableHead className="w-[100px]">Fecha</TableHead>
                  <TableHead className="w-[80px]">Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead className="text-right">Duración</TableHead>
                  <TableHead>Ubicación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registros.map((registro, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-xs">{registro.fecha}</TableCell>
                    <TableCell className="font-mono text-xs">{registro.hora}</TableCell>
                    <TableCell>
                      {registro.tipoYTransaccion?.includes('Saliente') ? (
                        <span className="flex items-center text-xs text-blue-400 gap-1"><PhoneOutgoing className="w-3 h-3"/> Saliente</span>
                      ) : (
                        <span className="flex items-center text-xs text-green-400 gap-1"><PhoneIncoming className="w-3 h-3"/> Entrante</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{registro.abonadoA}</TableCell>
                    <TableCell className="font-mono text-xs">{registro.abonadoB}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{registro.segundos}s</TableCell>
                    <TableCell className="text-xs truncate max-w-[200px]" title={registro.direccionInicialA || ''}>
                      {registro.direccionInicialA || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
