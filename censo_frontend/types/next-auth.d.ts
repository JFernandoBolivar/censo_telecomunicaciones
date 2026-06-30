import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      nombreEmpresa: string;
      rifEmpresa: string;
      isActive: boolean;
      isStaff: boolean;
      djAccess: string;
      djRefresh: string;
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    name: string;
    email: string;
    nombreEmpresa: string;
    rifEmpresa: string;
    isActive: boolean;
    isStaff: boolean;
    djAccess: string;
    djRefresh: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    nombreEmpresa: string;
    rifEmpresa: string;
    isActive: boolean;
    isStaff: boolean;
    djAccess: string;
    djRefresh: string;
  }
}
