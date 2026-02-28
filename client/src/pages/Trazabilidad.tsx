import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, Info, FileText, Network, Share2, Upload, Database, FileWarning, Trash } from "lucide-react";
import { useState } from "react";
import { useBuscarPersonas } from "@/hooks/use-trazabilidad";
import { PersonaModal } from "@/components/modals/PersonaModal";
import { RegistrosModal } from "@/components/modals/RegistrosModal";
import { AnalisisModal } from "@/components/modals/AnalisisModal";
import { CargarDatosModal } from "@/components/modals/CargarDatosModal";
import { type PersonaCaso } from "@shared/schema";

  const handleDeletePersona = (persona: PersonaCaso) => {
    // Lógica para confirmar y eliminar
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${persona.nombre} ${persona.apellido}?`)) {
      console.log("Eliminar persona:", persona.nro);
      // Aquí iría la llamada a la API DELETE
    }
  };

export default function Trazabilidad() {
  const [searchParams, setSearchParams] = useState({ tipo: "cedula", valor: "" });
  const [activeSearch, setActiveSearch] = useState({ tipo: "cedula", valor: "" });
  
  // Modal states
  const [selectedPersona, setSelectedPersona] = useState<PersonaCaso | null>(null);
  const [modalType, setModalType] = useState<"info" | "registros" | "analisis" | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const { data, isLoading, error, refetch } = useBuscarPersonas(activeSearch.tipo, activeSearch.valor);

  const handleSearch = () => {
    setActiveSearch(searchParams);
    refetch();
  };

  const handleOpenModal = (persona: any, type: "info" | "registros" | "analisis") => {
    const numero = persona.telefonos?.[0]?.numero;
    setSelectedPersona({ ...persona, numeroAsociado: numero });
    setModalType(type);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Módulo de Trazabilidad</h1>
              <p className="text-muted-foreground text-sm">Búsqueda y análisis de objetivos</p>
            </div>
            <Button 
              onClick={() => setIsUploadOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Upload className="w-4 h-4 mr-2" />
              Cargar Datos
            </Button>
          </div>

          {/* Search Card */}
          <Card className="bg-card/50 border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-48 space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Criterio de Búsqueda</label>
                  <Select 
                    value={searchParams.tipo} 
                    onValueChange={(val) => setSearchParams(prev => ({ ...prev, tipo: val }))}
                  >
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cedula">Cédula</SelectItem>
                      <SelectItem value="nombre">Nombre</SelectItem>
                      <SelectItem value="pseudonimo">Pseudónimo</SelectItem>
                      <SelectItem value="identificar_numero">Identificar Número</SelectItem>
                      <SelectItem value="expediente">Expediente</SelectItem>
                      <SelectItem value="registro_comunicacional">Registro Comunicacional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 space-y-2 w-full">
                  <label className="text-sm font-medium text-muted-foreground">Valor de Búsqueda</label>
                  <Input 
                    placeholder={
                      searchParams.tipo === "cedula" ? "Ej: V-12345678" :
                      searchParams.tipo === "nombre" ? "Ej: Juan Pérez" :
                      searchParams.tipo === "pseudonimo" ? "Ej: El Toro" :
                      searchParams.tipo === "identificar_numero" ? "Ej: 04141234567" :
                      searchParams.tipo === "expediente" ? "Ej: EXP-2024-001" :
                      searchParams.tipo === "registro_comunicacional" ? "Ej: 04141234567" :
                      "Ingrese el valor a buscar..."
                    }
                    value={searchParams.valor}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, valor: e.target.value }))}
                    className="bg-background border-input"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>

                <Button 
                  onClick={handleSearch}
                  disabled={isLoading || !searchParams.valor}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Area */}
          <Card className="bg-card/50 border-border flex-1 min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Resultados de la Búsqueda
                {data?.total ? <span className="ml-2 text-xs bg-secondary px-2 py-0.5 rounded-full text-foreground">{data.total} encontrados</span> : null}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                  <p>Consultando bases de datos...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-64 text-rose-500">
                  <FileWarning className="w-8 h-8 mb-4" />
                  <p>Error al realizar la búsqueda. Intente nuevamente.</p>
                </div>
              ) : !data?.resultados?.length ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Search className="w-8 h-8 mb-4 opacity-50" />
                  <p>Ingrese un criterio de búsqueda para ver resultados</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  {activeSearch.tipo === "registro_comunicacional" ? (
                    <table className="w-full text-sm text-left">
                      <thead className="bg-secondary text-secondary-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Fecha</th>
                          <th className="px-4 py-3 font-medium">Hora</th>
                          <th className="px-4 py-3 font-medium">Abonado A</th>
                          <th className="px-4 py-3 font-medium">Abonado B</th>
                          <th className="px-4 py-3 font-medium">Tipo Transacción</th>
                          <th className="px-4 py-3 font-medium">Segundos</th>
                          <th className="px-4 py-3 font-medium">Dirección A</th>
                          <th className="px-4 py-3 font-medium">Dirección B</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {data.resultados.map((registro: any, index: number) => (
                          <tr key={index} className="hover:bg-muted/50 transition-colors">
                            <td className="px-4 py-3">{registro.fecha}</td>
                            <td className="px-4 py-3">{registro.hora}</td>
                            <td className="px-4 py-3 font-mono text-primary">{registro.abonadoA}</td>
                            <td className="px-4 py-3 font-mono text-primary">{registro.abonadoB}</td>
                            <td className="px-4 py-3">{registro.tipoYTransaccion}</td>
                            <td className="px-4 py-3">{registro.segundos}</td>
                            <td className="px-4 py-3">{registro.direccionInicialA}</td>
                            <td className="px-4 py-3">{registro.direccionInicialB}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-sm text-left">
                      <thead className="bg-secondary text-secondary-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Expediente</th>
                          <th className="px-4 py-3 font-medium">Cédula</th>
                          <th className="px-4 py-3 font-medium">Nombre</th>
                          <th className="px-4 py-3 font-medium">Apellido</th>
                          <th className="px-4 py-3 font-medium">Pseudónimo</th>
                          <th className="px-4 py-3 font-medium">Delito</th>
                          <th className="px-4 py-3 font-medium text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {data.resultados.map((persona: any) => (
                          <tr key={persona.nro} className="hover:bg-muted/50 transition-colors">
                            <td className="px-4 py-3 font-mono text-primary">{persona.expediente}</td>
                            <td className="px-4 py-3">{persona.cedula}</td>
                            <td className="px-4 py-3 font-medium">{persona.nombre}</td>
                            <td className="px-4 py-3 font-medium">{persona.apellido}</td>
                            <td className="px-4 py-3">{persona.pseudonimo}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400">
                                {persona.delito || 'Investigación'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(persona, "info")} title="Ver Info">
                                  <Info className="w-4 h-4 text-blue-400" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeletePersona(persona)} title="Eliminar">
                                  <Trash className="w-4 h-4 text-red-500" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(persona, "registros")} title="Registros" disabled={!persona.telefonos?.[0]?.numero}>
                                  <FileText className="w-4 h-4 text-emerald-400" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(persona, "analisis")} title="Analizar Grafo" disabled={!persona.telefonos?.[0]?.numero}>
                                  <Network className="w-4 h-4 text-amber-400" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modals */}
      <CargarDatosModal 
        open={isUploadOpen} 
        onOpenChange={setIsUploadOpen} 
        onSuccess={() => refetch()}
      />
      {selectedPersona && (
        <>
          <PersonaModal 
            isOpen={modalType === "info"} 
            onClose={() => setModalType(null)} 
            persona={selectedPersona} 
          />
          <RegistrosModal 
            isOpen={modalType === "registros"} 
            onClose={() => setModalType(null)} 
            persona={selectedPersona} 
          />
          <AnalisisModal 
            isOpen={modalType === "analisis"} 
            onClose={() => setModalType(null)} 
            persona={selectedPersona} 
          />
        </>
      )}
    </div>
  );
}


