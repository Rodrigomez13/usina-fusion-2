// app/api/setup/route.ts
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  // Solo permitir en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Solo disponible en desarrollo' }, { status: 403 })
  }

  const supabase = createServerSupabaseClient()
  
  try {
    // 1. Crear usuario administrador
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'admin@usinaleads.com',
      password: 'admin123', // Cambiar después del primer inicio de sesión
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrador Principal'
      }
    })

    if (userError) throw userError

    // 2. Asignar rol de administrador
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userData.user.id,
        role: 'admin'
      })

    if (roleError) throw roleError

    return NextResponse.json({ 
      success: true, 
      message: 'Usuario administrador creado correctamente',
      user: userData.user
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}