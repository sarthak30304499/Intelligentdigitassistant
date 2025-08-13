import { NextResponse } from "next/server";

export const config = {
  matcher: "/integrations/:path*",
};

export function middleware(request) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-createxyz-project-id", "fc926032-ace9-48c6-96a9-583ee9b4dd3d");
  requestHeaders.set("x-createxyz-project-group-id", "6e3e5343-6c19-42ec-b965-09705260fc21");


  request.nextUrl.href = `https://www.create.xyz/${request.nextUrl.pathname}`;

  return NextResponse.rewrite(request.nextUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}