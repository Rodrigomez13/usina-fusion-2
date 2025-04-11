-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Habilitar RLS en la tabla user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Crear política para que los usuarios vean su propio rol
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Crear política para que los administradores gestionen todos los roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Insertar un usuario administrador (reemplaza con el ID de tu usuario)
INSERT INTO public.user_roles (user_id, role)
VALUES ('f23ce3ca-d104-4386-86a8-42bb79e9c28e', 'admin')
ON CONFLICT (user_id) DO NOTHING;
