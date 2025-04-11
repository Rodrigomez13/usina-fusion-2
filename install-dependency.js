import { execSync } from 'child_process';

console.log('Instalando dependencias de Supabase...');

try {
  // Instalar las dependencias necesarias
  console.log('Ejecutando: npm install @supabase/auth-helpers-nextjs');
  execSync('npm install @supabase/auth-helpers-nextjs', { stdio: 'inherit' });
  
  console.log('\nVerificando si se necesita instalar @supabase/supabase-js...');
  try {
    // Intentar importar @supabase/supabase-js para ver si ya está instalado
    require.resolve('@supabase/supabase-js');
    console.log('✅ @supabase/supabase-js ya está instalado');
  } catch (e) {
    console.log('Instalando @supabase/supabase-js...');
    execSync('npm install @supabase/supabase-js', { stdio: 'inherit' });
  }
  
  console.log('\n✅ Instalación completada con éxito');
  console.log('Ahora puedes reiniciar tu servidor de desarrollo con:');
  console.log('npm run dev');
} catch (error) {
  console.error('\n❌ Error durante la instalación:', error.message);
  console.log('\nAlternativa: Puedes instalar manualmente ejecutando estos comandos:');
  console.log('npm install @supabase/auth-helpers-nextjs');
  console.log('npm install @supabase/supabase-js');
}