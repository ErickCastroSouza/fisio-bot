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
      <main className="flex min-w-0 flex-1 items-center justify-center bg-[#f8f7f9]">
        <div className="px-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eee9f5]">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#644498]/20 border-t-[#644498]" />
          </div>

          <p className="mt-4 text-sm font-medium text-[#85808b]">
            Carregando dashboard...
          </p>
        </div>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="flex min-w-0 flex-1 items-center justify-center bg-[#f8f7f9] px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white px-6 py-7 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            !
          </div>

          <p className="mt-4 font-medium text-[#3f3a43]">
            Não foi possível carregar o dashboard.
          </p>

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-5 w-full rounded-xl bg-[#644498] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#553987] active:scale-[0.99]"
          >
            Tentar novamente
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-[#f8f7f9]">
      {/* =====================================================
          CABEÇALHO
      ====================================================== */}
      <header className="border-b border-[#e8e3ec] bg-white px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <div className="mx-auto w-full max-w-[1600px]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8b7aa3] sm:text-xs">
            Visão geral
          </p>

          <h1 className="mt-1 text-xl font-bold tracking-tight text-[#3f3a43] sm:text-2xl">
            Dashboard
          </h1>

          <p className="mt-1 max-w-xl text-xs leading-5 text-[#85808b] sm:text-sm">
            Acompanhe o atendimento e a agenda da clínica.
          </p>
        </div>
      </header>

      {/* =====================================================
          CONTEÚDO
      ====================================================== */}
      <div className="flex-1 overflow-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-[1600px]">
          {/* =================================================
              CARDS PRINCIPAIS
          ================================================== */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {/* Conversas */}
            <div className="rounded-2xl border border-[#e8e3ec] bg-white p-4 shadow-[0_2px_10px_rgba(77,52,121,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(77,52,121,0.08)] sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium leading-4 text-[#85808b] sm:text-sm">
                    Conversas hoje
                  </p>

                  <p className="mt-2 text-2xl font-bold tracking-tight text-[#3f3a43] sm:mt-3 sm:text-3xl">
                    {data.conversationsToday}
                  </p>

                  <p className="mt-1 hidden text-xs text-[#aaa4af] sm:block">
                    Atendimentos registrados
                  </p>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eee9f5] text-[#644498] sm:h-11 sm:w-11">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 8.7 3.9a8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bot */}
            <div className="rounded-2xl border border-[#e8e3ec] bg-white p-4 shadow-[0_2px_10px_rgba(77,52,121,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(77,52,121,0.08)] sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium leading-4 text-[#85808b] sm:text-sm">
                    Resolvidas pelo bot
                  </p>

                  <p className="mt-2 text-2xl font-bold tracking-tight text-[#3f3a43] sm:mt-3 sm:text-3xl">
                    {data.resolvedByBot}
                  </p>

                  <p className="mt-1 hidden text-xs text-[#aaa4af] sm:block">
                    Atendimentos automatizados
                  </p>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef5ec] text-[#63845f] sm:h-11 sm:w-11">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="3"
                    />
                    <path d="M8 10h.01M16 10h.01M8 15c1.2.8 2.5 1.2 4 1.2s2.8-.4 4-1.2" />
                    <path d="M12 5V3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Agenda */}
            <div className="col-span-2 rounded-2xl border border-[#e8e3ec] bg-white p-4 shadow-[0_2px_10px_rgba(77,52,121,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(77,52,121,0.08)] sm:col-span-1 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium leading-4 text-[#85808b] sm:text-sm">
                    Agendamentos hoje
                  </p>

                  <p className="mt-2 text-2xl font-bold tracking-tight text-[#3f3a43] sm:mt-3 sm:text-3xl">
                    {data.appointmentsToday}
                  </p>

                  <p className="mt-1 hidden text-xs text-[#aaa4af] sm:block">
                    Consultas programadas
                  </p>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f1e8f1] text-[#8b638d] sm:h-11 sm:w-11">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="17"
                      rx="3"
                    />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              CONTEÚDO PRINCIPAL
          ================================================== */}
          <div className="mt-5 grid grid-cols-1 gap-5 sm:mt-6 sm:gap-6 xl:grid-cols-2">
            {/* Próximos atendimentos */}
            <section className="overflow-hidden rounded-2xl border border-[#e8e3ec] bg-white shadow-[0_2px_10px_rgba(77,52,121,0.04)]">
              <div className="flex items-center justify-between gap-3 border-b border-[#eeeaf0] px-4 py-4 sm:px-6 sm:py-5">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-[#3f3a43] sm:text-base">
                    Próximos atendimentos
                  </h2>

                  <p className="mt-1 text-[11px] text-[#918b96] sm:text-xs">
                    Agendamentos futuros
                  </p>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eee9f5] text-[#644498]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="17"
                      rx="3"
                    />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
              </div>

              <div className="divide-y divide-[#f0edf2]">
                {data.upcomingAppointments.length ===
                0 ? (
                  <div className="px-5 py-10 text-center sm:px-6 sm:py-12">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#eef5ec] text-[#63845f]">
                      ✓
                    </div>

                    <p className="mt-3 text-sm font-medium text-[#5f5963]">
                      Tudo tranquilo por aqui
                    </p>

                    <p className="mt-1 text-xs text-[#9a949d]">
                      Nenhum atendimento próximo.
                    </p>
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
                        className="group flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-[#faf9fb] active:bg-[#f7f4f9] sm:px-6"
                      >
                        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1e8f1] text-sm font-semibold text-[#8b638d]">
                            {appointment.patientName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[#454049]">
                              {appointment.patientName}
                            </p>

                            <p className="mt-1 text-xs text-[#918b96]">
                              {formatDate(
                                appointment.startAt
                              )}{' '}
                              às{' '}
                              {formatTime(
                                appointment.startAt
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <span
                            className={`hidden rounded-full px-3 py-1 text-[11px] font-semibold sm:inline-flex ${
                              appointment.status ===
                              'confirmed'
                                ? 'bg-[#eef5ec] text-[#63845f]'
                                : 'bg-[#fff6df] text-[#9b7935]'
                            }`}
                          >
                            {appointment.status ===
                            'confirmed'
                              ? 'Confirmado'
                              : 'Agendado'}
                          </span>

                          <span className="text-[#c0bac3] transition group-hover:translate-x-0.5 group-hover:text-[#644498]">
                            →
                          </span>
                        </div>
                      </button>
                    )
                  )
                )}
              </div>
            </section>

            {/* Aguardando atendimento */}
            <section className="overflow-hidden rounded-2xl border border-[#e8e3ec] bg-white shadow-[0_2px_10px_rgba(77,52,121,0.04)]">
              <div className="flex items-center justify-between gap-3 border-b border-[#eeeaf0] px-4 py-4 sm:px-6 sm:py-5">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-[#3f3a43] sm:text-base">
                    Aguardando atendimento
                  </h2>

                  <p className="mt-1 text-[11px] leading-4 text-[#918b96] sm:text-xs">
                    Conversas que precisam da fisioterapeuta
                  </p>
                </div>

                {data.waitingHuman.length > 0 && (
                  <span className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-[#f1e8f1] px-2 text-xs font-semibold text-[#644498]">
                    {data.waitingHuman.length}
                  </span>
                )}
              </div>

              <div className="divide-y divide-[#f0edf2]">
                {data.waitingHuman.length === 0 ? (
                  <div className="px-5 py-10 text-center sm:px-6 sm:py-12">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#eef5ec] text-[#63845f]">
                      ✓
                    </div>

                    <p className="mt-3 text-sm font-medium text-[#5f5963]">
                      Nenhuma conversa pendente
                    </p>

                    <p className="mt-1 text-xs text-[#9a949d]">
                      O bot está cuidando dos atendimentos.
                    </p>
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
                        className="group w-full px-4 py-4 text-left transition hover:bg-[#faf9fb] active:bg-[#f7f4f9] sm:px-6"
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eee9f5] text-sm font-semibold text-[#644498]">
                            {conversation.patientName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-medium text-[#454049]">
                                {conversation.patientName}
                              </p>

                              <span className="shrink-0 text-[10px] text-[#aaa4af] sm:text-[11px]">
                                {formatTime(
                                  conversation.lastMessageAt
                                )}
                              </span>
                            </div>

                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#918b96]">
                              {conversation.lastMessage}
                            </p>
                          </div>

                          <span className="mt-1 shrink-0 text-[#c0bac3] transition group-hover:translate-x-0.5 group-hover:text-[#644498]">
                            →
                          </span>
                        </div>
                      </button>
                    )
                  )
                )}
              </div>
            </section>
          </div>

          {/* =================================================
              CONVERSAS RECENTES
          ================================================== */}
          <section className="mt-5 overflow-hidden rounded-2xl border border-[#e8e3ec] bg-white shadow-[0_2px_10px_rgba(77,52,121,0.04)] sm:mt-6">
            <div className="flex items-center justify-between gap-3 border-b border-[#eeeaf0] px-4 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[#3f3a43] sm:text-base">
                  Conversas recentes
                </h2>

                <p className="mt-1 text-[11px] text-[#918b96] sm:text-xs">
                  Últimas conversas registradas
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate('/conversas')
                }
                className="shrink-0 rounded-lg px-2 py-2 text-xs font-semibold text-[#644498] transition hover:bg-[#f5f1f7] hover:text-[#4d3479] active:bg-[#eee9f5]"
              >
                Ver todas →
              </button>
            </div>

            <div className="divide-y divide-[#f0edf2]">
              {data.recentConversations.length ===
              0 ? (
                <div className="px-5 py-10 text-center text-sm text-[#918b96] sm:px-6">
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
                      className="group flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-[#faf9fb] active:bg-[#f7f4f9] sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d9c9df] text-xs font-semibold text-[#644498]">
                          {conversation.patientName
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#454049]">
                            {conversation.patientName}
                          </p>

                          <p className="mt-1 text-xs text-[#aaa4af]">
                            Última mensagem às{' '}
                            {formatTime(
                              conversation.lastMessageAt
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        <span
                          className={`hidden rounded-full px-3 py-1 text-[11px] font-semibold sm:inline-flex ${
                            conversation.status ===
                            'bot'
                              ? 'bg-[#eee9f5] text-[#644498]'
                              : conversation.status ===
                                  'human'
                                ? 'bg-[#fff1e7] text-[#a66a42]'
                                : 'bg-[#f1eff2] text-[#77717a]'
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

                        <span className="text-[#c0bac3] transition group-hover:translate-x-0.5 group-hover:text-[#644498]">
                          →
                        </span>
                      </div>
                    </button>
                  )
                )
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default Dashboard