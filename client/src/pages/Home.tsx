import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, FileWarning, Search, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

function StatCard({ title, value, description, icon: Icon, trend }: any) {
  return (
    <Card className="bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          <span className={trend > 0 ? "text-emerald-500" : "text-rose-500"}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>{" "}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Bienvenido al Sistema de Inteligencia Criminal.
              </p>
            </div>
            <Link href="/trazabilidad">
              <Button className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/20">
                <Search className="w-4 h-4 mr-2" />
                Nueva Búsqueda
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Casos Activos" 
              value="1,248" 
              trend={12} 
              description="desde el mes pasado" 
              icon={Activity} 
            />
            <StatCard 
              title="Personas Investigadas" 
              value="3,842" 
              trend={4} 
              description="nuevos registros" 
              icon={Users} 
            />
            <StatCard 
              title="Alertas Generadas" 
              value="42" 
              trend={-8} 
              description="menos que ayer" 
              icon={FileWarning} 
            />
            <StatCard 
              title="Búsquedas Recientes" 
              value="892" 
              trend={24} 
              description="en las últimas 24h" 
              icon={Search} 
            />
          </div>

          {/* Recent Activity Placeholders */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 bg-card/50">
              <CardHeader>
                <CardTitle>Actividad Reciente del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mr-3" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          Análisis de trazabilidad completado #EXP-{2024000 + i}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Hace {i * 15} minutos por Analista Principal
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3 bg-card/50">
              <CardHeader>
                <CardTitle>Accesos Directos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-muted-foreground hover:text-foreground">
                  <Search className="mr-2 h-4 w-4" /> Búsqueda Avanzada
                </Button>
                <Button variant="outline" className="w-full justify-start text-muted-foreground hover:text-foreground">
                  <Database className="mr-2 h-4 w-4" /> Importar Registros CDR
                </Button>
                <Button variant="outline" className="w-full justify-start text-muted-foreground hover:text-foreground">
                  <FileWarning className="mr-2 h-4 w-4" /> Ver Alertas Críticas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
