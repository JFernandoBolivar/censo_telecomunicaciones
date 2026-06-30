import type { RepoAuth } from "../../domain/ports/repo-auth";
import type { AuthResultDTO, RegisterDTO } from "../dtos/login-dto";

export async function registrarUsuario(
  repo: RepoAuth,
  dto: RegisterDTO,
): Promise<AuthResultDTO> {
  const result = await repo.register({
    email: dto.email,
    nombreEmpresa: dto.nombreEmpresa,
    rifEmpresa: dto.rifEmpresa,
    password: dto.password,
  });

  return {
    access: result.access,
    refresh: result.refresh,
    user: {
      id: result.user.id,
      email: result.user.email.value,
      nombreEmpresa: result.user.nombreEmpresa,
      rifEmpresa: result.user.rifEmpresa.value,
      isActive: result.user.isActive,
      isStaff: result.user.isStaff,
    },
  };
}
