export default function ServidoresPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Servidores</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-700">
          Bienvenido a la sección de gestión de servidores. Desde aquí podrás administrar todos los servidores del
          sistema.
        </p>

        <div className="mt-4">
          <a
            href="/admin/servers"
            className="inline-block px-4 py-2 bg-[#0e2a38] text-white rounded hover:bg-[#1a3e4e] transition-colors"
          >
            Ir a Administración de Servidores
          </a>
        </div>
      </div>
    </div>
  )
}
