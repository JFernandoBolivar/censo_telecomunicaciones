"use client";

import useSWR from "swr";
import { fetchTodasRespuestasAction } from "../infrastructure/actions/admin-actions";
import { Button } from "@/shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/components/card";
import { Skeleton } from "@/shared/ui/components/skeleton";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/shared/ui/components/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/components/table";
import { CloudArrowDown, Spinner } from "@phosphor-icons/react";

export function AdminRespuestasPage() {
  const { data, error, isLoading } = useSWR("admin-respuestas", fetchTodasRespuestasAction);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Error al cargar</EmptyTitle>
          <EmptyDescription>No se pudieron cargar las respuestas.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Sin respuestas</EmptyTitle>
          <EmptyDescription>No hay respuestas registradas aún.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Todas las Respuestas</h1>
        <a href="/api/encuestas/exportar-excel" download>
          <Button variant="outline">
            <CloudArrowDown className="size-4" />
            Exportar Excel
          </Button>
        </a>
      </div>

      {data.map((usuario) => (
        <Card key={usuario.usuario.id}>
          <CardHeader>
            <CardTitle className="text-base">
              {usuario.usuario.nombre_empresa}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {usuario.usuario.email} · {usuario.usuario.rif_empresa}
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Pregunta</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Respuesta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuario.respuestas.map((r) => (
                  <TableRow key={r.pregunta_id}>
                    <TableCell className="font-mono text-xs">{r.codigo}</TableCell>
                    <TableCell className="max-w-xs truncate">{r.enunciado}</TableCell>
                    <TableCell>{r.tipo}</TableCell>
                    <TableCell>{r.respuesta}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
