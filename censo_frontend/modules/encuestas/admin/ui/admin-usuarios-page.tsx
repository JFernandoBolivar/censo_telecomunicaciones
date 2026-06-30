"use client";

import useSWR from "swr";
import { fetchUsuariosAction } from "../infrastructure/actions/admin-actions";
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
import { Badge } from "@/shared/ui/components/badge";

export function AdminUsuariosPage() {
  const { data, error, isLoading } = useSWR("admin-usuarios", fetchUsuariosAction);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Error al cargar</EmptyTitle>
          <EmptyDescription>No se pudieron cargar los usuarios.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Sin usuarios</EmptyTitle>
          <EmptyDescription>No hay usuarios registrados aún.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Usuarios Registrados</h1>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>RIF</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.nombreEmpresa}</TableCell>
                  <TableCell className="font-mono text-xs">{u.rifEmpresa}</TableCell>
                  <TableCell>
                    <Badge variant={u.isActive ? "default" : "secondary"}>
                      {u.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>{u.isStaff ? "Sí" : "No"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(u.fechaCreacion).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
