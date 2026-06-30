import { auth } from "@/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;

  if (!publicRoutes.includes(nextUrl.pathname) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (nextUrl.pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/encuestas", nextUrl));
  }

  if (nextUrl.pathname === "/register" && isLoggedIn) {
    return NextResponse.redirect(new URL("/encuestas", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|api|static|.*\\..*).*)"],
};
