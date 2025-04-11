// Este archivo facilita las importaciones desde @/lib/supabase
export * from "./client"
export * from "./server"
export * from "./middleware"

// Re-exportar createClient para mantener compatibilidad
export { createClient } from "./client"
