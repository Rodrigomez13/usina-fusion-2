import { createClient } from "@supabase/supabase-js"

// Configura las variables de entorno
const supabaseUrl = "https://tkemwktgewtrrsqocydy.supabase.co"
const supabaseAnonKey = "tu-clave-anon-aquí" // Reemplaza con tu clave anon real

// Crea el cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Función para probar el inicio de sesión
async function testLogin() {
  console.log("Intentando iniciar sesión con admin@usina.com...")

  const { data, error } = await supabase.auth.signInWithPassword({
    email: "admin@usina.com",
    password: "usina123",
  })

  if (error) {
    console.error("Error de inicio de sesión:", error.message)
    console.error("Código de error:", error.status)
    return
  }

  console.log("Inicio de sesión exitoso!")
  console.log("Usuario:", data.user?.email)
  console.log("ID de usuario:", data.user?.id)
}

// Función para verificar la sesión actual
async function checkSession() {
  console.log("Verificando sesión actual...")

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error("Error al verificar sesión:", error.message)
    return
  }

  if (data.session) {
    console.log("Sesión activa encontrada")
    console.log("Usuario:", data.session.user.email)
  } else {
    console.log("No hay sesión activa")
  }
}

// Ejecutar las pruebas
async function runTests() {
  await checkSession()
  console.log("------------------------")
  await testLogin()
}

runTests()
