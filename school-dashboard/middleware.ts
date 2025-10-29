import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Note: Supabase session cannot be verified in middleware without auth-helpers cookies.
// We rely on client-side guards (e.g., in dashboard layout) to protect routes.
export async function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|public).*)'],
}
