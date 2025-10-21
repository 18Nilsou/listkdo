export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/dashboard/:path*', '/list/:path*/edit']
}
