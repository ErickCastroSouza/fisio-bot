function Dashboard() {
  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h2>

        <p className="mt-1 text-gray-500">
          Acompanhe o atendimento dos seus pacientes.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-gray-500">
            Conversas hoje
          </p>

          <p className="mt-2 text-3xl font-bold">
            24
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-gray-500">
            Resolvidas pelo bot
          </p>

          <p className="mt-2 text-3xl font-bold">
            18
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-gray-500">
            Agendamentos
          </p>

          <p className="mt-2 text-3xl font-bold">
            7
          </p>
        </div>
      </div>

      <section className="mt-8 rounded-xl border bg-white">
        <div className="border-b px-6 py-4">
          <h3 className="font-semibold">
            Conversas recentes
          </h3>
        </div>

        <div className="divide-y">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="font-medium">Carlos Silva</p>
              <p className="text-sm text-gray-500">
                Gostaria de agendar uma consulta
              </p>
            </div>

            <span className="text-sm text-gray-500">
              Agendamento
            </span>
          </div>

          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="font-medium">Maria Santos</p>
              <p className="text-sm text-gray-500">
                Gostaria de saber o valor da sessão
              </p>
            </div>

            <span className="text-sm text-gray-500">
              Automático
            </span>
          </div>

          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="font-medium">João Oliveira</p>
              <p className="text-sm text-gray-500">
                Preciso falar com a fisioterapeuta
              </p>
            </div>

            <span className="text-sm text-gray-500">
              Atendimento
            </span>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Dashboard