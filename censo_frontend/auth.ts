import NextAuth from "next-auth";
import authConfig from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  trustHost: true,
  cookies: {
    sessionToken: {
      options: {
        secure: false,
        httpOnly: true,
        sameSite: "lax",
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  ...authConfig,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.nombreEmpresa = user.nombreEmpresa;
        token.rifEmpresa = user.rifEmpresa;
        token.isActive = user.isActive;
        token.isStaff = user.isStaff;
        token.djAccess = user.djAccess;
        token.djRefresh = user.djRefresh;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          nombreEmpresa: token.nombreEmpresa as string,
          rifEmpresa: token.rifEmpresa as string,
          isActive: token.isActive as boolean,
          isStaff: token.isStaff as boolean,
          djAccess: token.djAccess as string,
          djRefresh: token.djRefresh as string,
        },
      };
    },
  },
});
