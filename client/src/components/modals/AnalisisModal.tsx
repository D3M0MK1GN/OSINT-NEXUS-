import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, Loader2, RefreshCw } from "lucide-react";
import { useAnalisisGrafo } from "@/hooks/use-trazabilidad";
import CytoscapeComponent from "react-cytoscapejs";
import { useState, useMemo } from "react";

interface AnalisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: any;
}

export function AnalisisModal({ isOpen, onClose, persona }: AnalisisModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const targetNumber = persona.numeroAsociado || (persona.telefonos && persona.telefonos.length > 0 ? persona.telefonos[0].numero : null);
  
  const { data: graphData, isLoading, refetch } = useAnalisisGrafo(targetNumber);

  // Cytoscape layout configuration
  const layout = {
    name: "cose",
    animate: true,
    animationDuration: 500,
    nodeDimensionsIncludeLabels: true,
    fit: true,
    padding: 50,
    randomize: false,
    componentSpacing: 100,
    nodeRepulsion: 400000,
  };

  // Cytoscape stylesheet
  const stylesheet = [
    {
      selector: "node",
      style: {
        "background-color": "#1e293b",
        "label": "data(label)",
        "color": "#e2e8f0",
        "font-size": "12px",
        "text-valign": "bottom",
        "text-halign": "center",
        "text-margin-y": 6,
        "width": 40,
        "height": 40,
        "border-width": 2,
        "border-color": "#475569",
        "text-background-color": "#020617",
        "text-background-opacity": 0.7,
        "text-background-padding": 2,
        "text-background-shape": "roundrectangle",
      }
    },
    {
      selector: 'node[type="persona"]',
      style: {
        "background-color": "#0ea5e9", // Sky blue for main target
        "border-color": "#0284c7",
        "width": 60,
        "height": 60,
        "font-size": "14px",
        "font-weight": "bold",
      }
    },
    {
      selector: "edge",
      style: {
        "width": 2,
        "line-color": "#475569",
        "target-arrow-color": "#475569",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
        "label": "data(weight)",
        "font-size": "10px",
        "text-rotation": "autorotate",
        "text-background-color": "#0f172a",
        "text-background-opacity": 1,
        "color": "#94a3b8"
      }
    }
  ];

  // Transform API data to Cytoscape elements
  const elements = useMemo(() => {
    if (!graphData) return [];
    
    // Ensure nodes are unique
    const nodes = (graphData as any).nodes.map((n: any) => ({
      data: { ...n.data, id: String(n.data.id) }
    }));
    
    const edges = (graphData as any).edges.map((e: any, i: number) => ({
      data: { ...e.data, id: `e${i}`, source: String(e.data.source), target: String(e.data.target) }
    }));

    return [...nodes, ...edges];
  }, [graphData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? "w-screen h-screen max-w-none m-0 rounded-none" : "max-w-6xl h-[85vh]"} bg-card border-border text-foreground flex flex-col transition-all duration-300`}>
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                Análisis de Vínculos
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Visualización gráfica de conexiones para: <span className="text-primary font-mono">{persona.nombre} {persona.apellido || ''}</span>
              </DialogDescription>
            </div>
            <div className="flex gap-2 mr-8">
              <Button size="icon" variant="outline" onClick={() => refetch()} title="Recargar Grafo">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={() => setIsFullscreen(!isFullscreen)} title={isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"}>
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 bg-background rounded-lg border border-border mt-4 relative overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground font-medium">Generando grafo de conexiones...</p>
            </div>
          ) : !elements.length ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <p>No hay suficientes datos para generar el grafo.</p>
            </div>
          ) : (
            <CytoscapeComponent
              elements={elements}
              style={{ width: "100%", height: "100%" }}
              stylesheet={stylesheet as any}
              layout={layout}
              cy={(cy) => {
                cy.fit();
                cy.on('tap', 'node', (evt) => {
                  const node = evt.target;
                  console.log('Tapped node ' + node.id());
                });
              }}
            />
          )}
          
          <div className="absolute bottom-4 left-4 bg-card/90 border border-border p-3 rounded-lg shadow-lg backdrop-blur text-[10px] space-y-2 pointer-events-none">
            <div className="font-bold uppercase tracking-wider mb-1 text-primary">Leyenda</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-sky-500 border border-sky-600"></div>
              <span>Objetivo Principal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-slate-800 border border-slate-600"></div>
              <span>Contacto Vinculado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-[2px] bg-slate-500"></div>
              <span>Registro de Comunicación</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
