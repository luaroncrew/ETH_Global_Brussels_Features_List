import { NextResponse } from "next/server";
import { auth } from "./auth";

export default auth((req) => {
  const hasValidSession = req.auth && new Date(req.auth.expires) > new Date();

  if (!hasValidSession && req?.nextUrl?.pathname.includes("/app")) {
    const newUrl = new URL(process.env.NEXT_PUBLIC_BASE_URL!);
    return Response.redirect(newUrl);
  }

  //to get pathname in server component
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-url", req.url);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
