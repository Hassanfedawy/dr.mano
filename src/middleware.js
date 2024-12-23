import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Your middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

export const config = {
  matcher: ["/profile", "/dashboard", "/admin/:path*"]
};
