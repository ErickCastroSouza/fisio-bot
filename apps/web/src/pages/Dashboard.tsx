import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type UpcomingAppointment = {
  id: string
  patientName: string
  startAt: string
  endAt: string
  status: string
}

type WaitingHumanConversation = {
  id: string
  patientName: string
  lastMessage: string
  lastMessageAt: string
}

type RecentConversation = {
  id: string
  patientName: string
  status: string
  lastMessageAt: string
}

type DashboardData = {
  conversationsToday: number
  resolvedByBot: number
  appointmentsToday: number
  upcomingAppointments: UpcomingAppointment[]
  waitingHuman: WaitingHumanConversation[]
  recentConversations: RecentConversation[]
}

function Dashboard() {
  const navigate = useNavigate()

  const [data, setData] =
    useState<DashboardData | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      setLoading(true)

      const response = await fetch(
        'http://localhost:3000/dashboard'
      )

      if (!response.ok) {
        throw new Error(
          'Erro ao carregar dashboard'
        )
      }

      const result = await response.json()

      setData(result)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString(
      'pt-BR',
      {
        timeZone: 'America/Recife',
        hour: '2-digit',
        minute: '2-digit',
      }
    )
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      'pt-BR',
      {
        timeZone: 'America/Recife',
        day: '2-digit',
        month: '2-digit',
      }
    )
  }

  function goToAppointment(
    appointment: UpcomingAppointment
  ) {
    const date = new Date(
      appointment.startAt
    )

    const year = new Intl.DateTimeFormat(
      'en-US',
      {
        timeZone: 'America/Recife',
        year: 'numeric',
      }
    ).format(date)

    const month = new Intl.DateTimeFormat(
      'en-US',
      {
        timeZone: 'America/Recife',
        month: '2-digit',
      }
    ).format(date)

    const day = new Intl.DateTimeFormat(
      'en-US',
      {
        timeZone: 'America/Recife',
        day: '2-digit',
      }
    ).format(date)

    navigate('/agenda', {
      state: {
        date: `${year}-${month}-${day}`,
      },
    })
  }

  function goToConversation(
    conversationId: string
  ) {
    navigate('/conversas', {
      state: {
        conversationId,
      },
    })
  }

  if (loading) {
    return (
      <main className="flex min-w-0 flex-1 items-center justify-center">
        <p className="text-sm text-gray-500">
          Carregando dashboard...
        </p>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="flex min-w-0 flex-1 items-center justify-center">
        <p className="text-sm text-red-500">
          Não foi possível carregar o dashboard.
        </p>
      </main>
    )
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-gray-50">
      {/* Cabeçalho */}
      <div className="border-b bg-white px-6 py-5">
        <h1 className="text-2xl font-semibold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Visão geral do atendimento
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Conversas hoje */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Conversas hoje
                </p>

                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {data.conversationsToday}
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 px-3 py-2 text-blue-600">
                💬
              </div>
            </div>
          </div>

          {/* Resolvidas pelo bot */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Resolvidas pelo bot
                </p>

                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {data.resolvedByBot}
                </p>
              </div>

              <div className="rounded-lg bg-green-50 px-3 py-2 text-green-600">
                ✓
              </div>
            </div>
          </div>

          {/* Agendamentos hoje */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Agendamentos hoje
                </p>

                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {data.appointmentsToday}
                </p>
              </div>

              <div className="rounded-lg bg-purple-50 px-3 py-2 text-purple-600">
                📅
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Próximos atendimentos */}
          <section className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold text-gray-900">
                Próximos atendimentos
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Agendamentos futuros
              </p>
            </div>

            <div className="divide-y">
              {data.upcomingAppointments.length ===
              0 ? (
                <div className="px-5 py-8 text-center text-sm text-gray-500">
                  Nenhum atendimento próximo.
                </div>
              ) : (
                data.upcomingAppointments.map(
                  (appointment) => (
                    <button
                      key={appointment.id}
                      type="button"
                      onClick={() =>
                        goToAppointment(
                          appointment
                        )
                      }
                      className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-gray-50"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">
                          {appointment.patientName}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {formatDate(
                            appointment.startAt
                          )}{' '}
                          às{' '}
                          {formatTime(
                            appointment.startAt
                          )}
                        </p>
                      </div>

                      <div className="ml-4 shrink-0">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            appointment.status ===
                            'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {appointment.status ===
                          'confirmed'
                            ? 'Confirmado'
                            : 'Agendado'}
                        </span>
                      </div>
                    </button>
                  )
                )
              )}
            </div>
          </section>

          {/* Aguardando atendimento humano */}
          <section className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold text-gray-900">
                Aguardando atendimento
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Conversas que precisam da fisioterapeuta
              </p>
            </div>

            <div className="divide-y">
              {data.waitingHuman.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-gray-500">
                  Nenhuma conversa aguardando atendimento.
                </div>
              ) : (
                data.waitingHuman.map(
                  (conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() =>
                        goToConversation(
                          conversation.id
                        )
                      }
                      className="w-full px-5 py-4 text-left transition hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">
                            {conversation.patientName}
                          </p>

                          <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-gray-500">
                            {conversation.lastMessage}
                          </p>
                        </div>

                        <span className="shrink-0 text-xs text-gray-400">
                          {formatTime(
                            conversation.lastMessageAt
                          )}
                        </span>
                      </div>
                    </button>
                  )
                )
              )}
            </div>
          </section>
        </div>

        {/* Conversas recentes */}
        <section className="mt-6 rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Conversas recentes
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Últimas conversas registradas
            </p>
          </div>

          <div className="divide-y">
            {data.recentConversations.length ===
            0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-500">
                Nenhuma conversa recente.
              </div>
            ) : (
              data.recentConversations.map(
                (conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() =>
                      goToConversation(
                        conversation.id
                      )
                    }
                    className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {conversation.patientName}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Última mensagem às{' '}
                        {formatTime(
                          conversation.lastMessageAt
                        )}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        conversation.status ===
                        'bot'
                          ? 'bg-blue-100 text-blue-700'
                          : conversation.status ===
                              'human'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {conversation.status ===
                      'bot'
                        ? 'Bot'
                        : conversation.status ===
                            'human'
                          ? 'Humano'
                          : 'Encerrada'}
                    </span>
                  </button>
                )
              )
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default Dashboard