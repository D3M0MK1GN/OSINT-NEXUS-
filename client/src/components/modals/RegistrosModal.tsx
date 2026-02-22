import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useRegistrosComunicacion } from "@/hooks/use-trazabilidad";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Download, PhoneIncoming, PhoneOutgoing } from "lucide-react";

interface RegistrosModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: any;
}

export function RegistrosModal({ isOpen, onClose, persona }: RegistrosModalProps) {
  const targetNumber = persona.numeroAsociado || (persona.telefonos && persona.telefonos.length > 0 ? persona.telefonos[0].numero : null);
  const { data: registros, isLoading } = useRegistrosComunicacion(targetNumber);

  const handleExport = () => {
    if (!registros) return;
    
    const headers = ["Fecha", "Hora", "Origen", "Destino", "Duración (s)", "Tipo", "Ubicación"];
    const rows = (registros as any[]).map((r: any) => [
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
      + rows.map((e: any[]) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `registros_${persona.cedula || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <DialogDescription className="text-muted-foreground">
                Historial de llamadas y mensajes para el objetivo: <span className="text-primary font-mono font-bold">{persona.nombre} {persona.apellido || ''}</span>
              </DialogDescription>
            </div>
            <Button size="sm" variant="outline" onClick={handleExport} disabled={!registros || (registros as any[]).length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto border rounded-md mt-4 bg-background/50">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !registros || (registros as any[]).length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground italic">
              No se encontraron registros de comunicación para este número.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-secondary sticky top-0 z-10">
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
                {(registros as any[]).map((registro: any, idx: number) => (
                  <TableRow key={idx} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-mono text-xs">{registro.fecha}</TableCell>
                    <TableCell className="font-mono text-xs">{registro.hora}</TableCell>
                    <TableCell>
                      {registro.tipoYTransaccion?.toLowerCase().includes('saliente') ? (
                        <span className="flex items-center text-[10px] uppercase font-bold text-blue-400 gap-1"><PhoneOutgoing className="w-3 h-3"/> Saliente</span>
                      ) : (
                        <span className="flex items-center text-[10px] uppercase font-bold text-emerald-400 gap-1"><PhoneIncoming className="w-3 h-3"/> Entrante</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{registro.abonadoA}</TableCell>
                    <TableCell className="font-mono text-xs">{registro.abonadoB}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{registro.segundos}s</TableCell>
                    <TableCell className="text-xs truncate max-w-[200px] text-muted-foreground" title={registro.direccionInicialA || ''}>
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
