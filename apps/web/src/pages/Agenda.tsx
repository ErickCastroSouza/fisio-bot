import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { API_URL } from '../config'

type Patient = {
  id: string
  name: string
  phone: string
}

type Appointment = {
  id: string
  patient_id: string
  start_at: string
  end_at: string
  status:
    | 'scheduled'
    | 'confirmed'
    | 'cancelled'
    | 'completed'
  created_at: string
  patient: Patient
}

function Agenda() {
  const location = useLocation()

  const [appointments, setAppointments] = useState<
    Appointment[]
  >([])

  const [patients, setPatients] = useState<Patient[]>([])

  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [selectedDate, setSelectedDate] =
    useState(() => {
      const dateFromDashboard =
        location.state?.date

      if (dateFromDashboard) {
        return dateFromDashboard
      }

      const today = new Date()

      const year = today.getFullYear()
      const month = String(
        today.getMonth() + 1
      ).padStart(2, '0')
      const day = String(
        today.getDate()
      ).padStart(2, '0')

      return `${year}-${month}-${day}`
    })

  const [patientId, setPatientId] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const [saving, setSaving] = useState(false)

  async function loadAppointments() {
    try {
      const response = await fetch(
        `${API_URL}/appointments`
      )

      if (!response.ok) {
        throw new Error(
          'Erro ao buscar agendamentos'
        )
      }

      const data = await response.json()

      setAppointments(data)
    } catch (error) {
      console.error(error)
    }
  }

  async function loadPatients() {
    try {
      const response = await fetch(
        `${API_URL}/patients`
      )

      if (!response.ok) {
        throw new Error(
          'Erro ao buscar pacientes'
        )
      }

      const data = await response.json()

      setPatients(data)
    } catch (error) {
      console.error(error)
    }
  }

  async function loadData() {
    setLoading(true)

    await Promise.all([
      loadAppointments(),
      loadPatients(),
    ])

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (location.state?.date) {
      window.history.replaceState(
        {},
        '',
        window.location.pathname
      )
    }
  }, [location.state])

  function changeDay(amount: number) {
    const [year, month, day] =
      selectedDate.split('-').map(Number)

    const currentDate = new Date(
      year,
      month - 1,
      day
    )

    currentDate.setDate(
      currentDate.getDate() + amount
    )

    const newYear =
      currentDate.getFullYear()

    const newMonth = String(
      currentDate.getMonth() + 1
    ).padStart(2, '0')

    const newDay = String(
      currentDate.getDate()
    ).padStart(2, '0')

    setSelectedDate(
      `${newYear}-${newMonth}-${newDay}`
    )
  }

  const formattedSelectedDate =
    useMemo(() => {
      const [year, month, day] =
        selectedDate
          .split('-')
          .map(Number)

      return new Date(
        year,
        month - 1,
        day
      ).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    }, [selectedDate])

  const shortSelectedDate =
    useMemo(() => {
      const [year, month, day] =
        selectedDate
          .split('-')
          .map(Number)

      return new Date(
        year,
        month - 1,
        day
      ).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
      })
    }, [selectedDate])

  const dayAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => {
        if (
          appointment.status === 'cancelled'
        ) {
          return false
        }

        const appointmentDate = new Date(
          appointment.start_at
        )

        const year =
          appointmentDate.getFullYear()

        const month = String(
          appointmentDate.getMonth() + 1
        ).padStart(2, '0')

        const day = String(
          appointmentDate.getDate()
        ).padStart(2, '0')

        return (
          `${year}-${month}-${day}` ===
          selectedDate
        )
      })
      .sort(
        (a, b) =>
          new Date(
            a.start_at
          ).getTime() -
          new Date(
            b.start_at
          ).getTime()
      )
  }, [appointments, selectedDate])

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault()

    if (
      !patientId ||
      !date ||
      !startTime ||
      !endTime
    ) {
      return
    }

    if (endTime <= startTime) {
      alert(
        'O horário de término deve ser posterior ao horário de início.'
      )
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        `${API_URL}/appointments`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            patient_id: patientId,
            start_at: `${date}T${startTime}:00-03:00`,
            end_at: `${date}T${endTime}:00-03:00`,
          }),
        }
      )

      const data = await response.json()

      if (response.status === 409) {
        alert(data.error)
        return
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Erro ao criar agendamento'
        )
      }

      setPatientId('')
      setDate('')
      setStartTime('')
      setEndTime('')
      setShowForm(false)

      await loadAppointments()
    } catch (error) {
      console.error(error)

      alert(
        'Não foi possível criar o agendamento.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function cancelAppointment(
    appointment: Appointment
  ) {
    const confirmed =
      window.confirm(
        `Deseja cancelar o agendamento de ${appointment.patient.name}?`
      )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/appointments/${appointment.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            status: 'cancelled',
          }),
        }
      )

      if (!response.ok) {
        const data =
          await response.json()

        throw new Error(
          data.error ||
            'Erro ao cancelar agendamento'
        )
      }

      await loadAppointments()
    } catch (error) {
      console.error(error)

      alert(
        'Não foi possível cancelar o agendamento.'
      )
    }
  }

  async function confirmAppointment(
    appointment: Appointment
  ) {
    try {
      const response = await fetch(
        `${API_URL}/appointments/${appointment.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            status: 'confirmed',
          }),
        }
      )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Erro ao confirmar agendamento'
        )
      }

      await loadAppointments()
    } catch (error) {
      console.error(
        'Erro ao confirmar agendamento:',
        error
      )

      alert(
        error instanceof Error
          ? error.message
          : 'Não foi possível confirmar o agendamento.'
      )
    }
  }

  function goToToday() {
    const today = new Date()

    const year =
      today.getFullYear()

    const month = String(
      today.getMonth() + 1
    ).padStart(2, '0')

    const day = String(
      today.getDate()
    ).padStart(2, '0')

    setSelectedDate(
      `${year}-${month}-${day}`
    )
  }

  function openNewAppointment() {
    setShowForm(true)
    setDate(selectedDate)
  }

  function closeForm() {
    setShowForm(false)
    setPatientId('')
    setDate('')
    setStartTime('')
    setEndTime('')
  }

  function getStatus(
    status: Appointment['status']
  ) {
    if (status === 'confirmed') {
      return {
        label: 'Confirmado',
        className:
          'bg-[#eef5ec] text-[#63845f]',
      }
    }

    if (status === 'completed') {
      return {
        label: 'Concluído',
        className:
          'bg-[#eee9f5] text-[#644498]',
      }
    }

    return {
      label: 'Agendado',
      className:
        'bg-[#fff6df] text-[#9b7935]',
    }
  }

  const confirmedCount =
    dayAppointments.filter(
      (appointment) =>
        appointment.status ===
        'confirmed'
    ).length

  const pendingCount =
    dayAppointments.filter(
      (appointment) =>
        appointment.status ===
        'scheduled'
    ).length

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#f8f7f9]">
      {/* ========================================
          CABEÇALHO
      ========================================= */}
      <header className="shrink-0 border-b border-[#e8e3ec] bg-white px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8b7aa3] sm:text-xs">
              Organização
            </p>

            <h1 className="mt-1 text-xl font-bold tracking-tight text-[#3f3a43] sm:text-2xl">
              Agenda
            </h1>

            <p className="mt-1 hidden text-sm text-[#85808b] sm:block">
              Gerencie os horários e agendamentos dos pacientes.
            </p>
          </div>

          <button
            type="button"
            onClick={
              openNewAppointment
            }
            className="flex shrink-0 items-center gap-2 rounded-xl bg-[#644498] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#553987] hover:shadow-md active:scale-[0.98] sm:px-4"
          >
            <span className="text-lg leading-none">
              +
            </span>

            <span className="hidden sm:inline">
              Novo agendamento
            </span>

            <span className="sm:hidden">
              Novo
            </span>
          </button>
        </div>
      </header>

      {/* ========================================
          CONTEÚDO
      ========================================= */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="p-3 sm:p-5 lg:p-6 xl:p-8">
          {/* ======================================
              FORMULÁRIO
          ====================================== */}
          {showForm && (
            <section className="mb-5 overflow-hidden rounded-2xl border border-[#e8e3ec] bg-white shadow-[0_2px_10px_rgba(77,52,121,0.04)] sm:mb-6">
              <div className="border-b border-[#eeeaf0] px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eee9f5] text-lg text-[#644498]">
                      +
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-semibold text-[#3f3a43]">
                        Novo agendamento
                      </h2>

                      <p className="mt-0.5 text-xs text-[#918b96]">
                        Adicione um novo horário à agenda.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closeForm}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-[#918b96] transition hover:bg-[#f6f4f7] hover:text-[#4d3479]"
                    aria-label="Fechar formulário"
                  >
                    ×
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-4 sm:p-6"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#716a76]">
                      Paciente
                    </label>

                    <select
                      value={patientId}
                      onChange={(event) =>
                        setPatientId(
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-[#ddd7e1] bg-[#fcfbfd] px-4 py-3 text-sm text-[#454049] outline-none transition focus:border-[#9b82b8] focus:ring-4 focus:ring-[#644498]/10"
                      required
                    >
                      <option value="">
                        Selecione um paciente
                      </option>

                      {patients.map(
                        (patient) => (
                          <option
                            key={patient.id}
                            value={patient.id}
                          >
                            {patient.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#716a76]">
                      Data
                    </label>

                    <input
                      type="date"
                      value={date}
                      onChange={(event) =>
                        setDate(
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-[#ddd7e1] bg-[#fcfbfd] px-4 py-3 text-sm text-[#454049] outline-none transition focus:border-[#9b82b8] focus:ring-4 focus:ring-[#644498]/10"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#716a76]">
                      Início
                    </label>

                    <input
                      type="time"
                      value={startTime}
                      onChange={(event) =>
                        setStartTime(
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-[#ddd7e1] bg-[#fcfbfd] px-4 py-3 text-sm text-[#454049] outline-none transition focus:border-[#9b82b8] focus:ring-4 focus:ring-[#644498]/10"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#716a76]">
                      Término
                    </label>

                    <input
                      type="time"
                      value={endTime}
                      onChange={(event) =>
                        setEndTime(
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-[#ddd7e1] bg-[#fcfbfd] px-4 py-3 text-sm text-[#454049] outline-none transition focus:border-[#9b82b8] focus:ring-4 focus:ring-[#644498]/10"
                      required
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-col-reverse gap-2 border-t border-[#eeeaf0] pt-5 sm:flex-row sm:justify-end sm:gap-3">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-xl border border-[#ddd7e1] bg-white px-4 py-2.5 text-sm font-medium text-[#625d66] transition hover:bg-[#f6f4f7]"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-[#644498] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#553987] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? 'Agendando...'
                      : 'Agendar'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* ======================================
              NAVEGAÇÃO DO DIA
          ====================================== */}
          <section className="overflow-hidden rounded-2xl border border-[#e8e3ec] bg-white shadow-[0_2px_10px_rgba(77,52,121,0.04)]">
            <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-4">
              <button
                type="button"
                onClick={() =>
                  changeDay(-1)
                }
                className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-[#ddd7e1] px-3 text-sm font-medium text-[#625d66] transition hover:bg-[#f6f4f7] hover:text-[#4d3479]"
              >
                <span className="text-base">
                  ←
                </span>

                <span className="hidden sm:inline">
                  Anterior
                </span>
              </button>

              <div className="min-w-0 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8b7aa3] sm:text-xs">
                  {shortSelectedDate}
                </p>

                <p className="mt-0.5 truncate text-sm font-semibold capitalize text-[#3f3a43] sm:text-base">
                  {formattedSelectedDate}
                </p>

                <button
                  type="button"
                  onClick={goToToday}
                  className="mt-1 text-[11px] font-semibold text-[#644498] transition hover:text-[#4d3479] sm:text-xs"
                >
                  Ir para hoje
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  changeDay(1)
                }
                className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-[#ddd7e1] px-3 text-sm font-medium text-[#625d66] transition hover:bg-[#f6f4f7] hover:text-[#4d3479]"
              >
                <span className="hidden sm:inline">
                  Próximo
                </span>

                <span className="text-base">
                  →
                </span>
              </button>
            </div>
          </section>

          {/* ======================================
              RESUMO
          ====================================== */}
          <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-4">
            <div className="rounded-2xl border border-[#e8e3ec] bg-white p-3 shadow-[0_2px_10px_rgba(77,52,121,0.04)] sm:p-5">
              <p className="text-[10px] font-medium text-[#918b96] sm:text-xs">
                Atendimentos
              </p>

              <p className="mt-1.5 text-xl font-bold text-[#3f3a43] sm:mt-2 sm:text-2xl">
                {dayAppointments.length}
              </p>

              <p className="mt-1 hidden text-xs text-[#aaa4af] sm:block">
                Neste dia
              </p>
            </div>

            <div className="rounded-2xl border border-[#e8e3ec] bg-white p-3 shadow-[0_2px_10px_rgba(77,52,121,0.04)] sm:p-5">
              <p className="text-[10px] font-medium text-[#918b96] sm:text-xs">
                Confirmados
              </p>

              <p className="mt-1.5 text-xl font-bold text-[#63845f] sm:mt-2 sm:text-2xl">
                {confirmedCount}
              </p>

              <p className="mt-1 hidden text-xs text-[#aaa4af] sm:block">
                Pacientes confirmados
              </p>
            </div>

            <div className="rounded-2xl border border-[#e8e3ec] bg-white p-3 shadow-[0_2px_10px_rgba(77,52,121,0.04)] sm:p-5">
              <p className="text-[10px] font-medium text-[#918b96] sm:text-xs">
                Pendentes
              </p>

              <p className="mt-1.5 text-xl font-bold text-[#9b7935] sm:mt-2 sm:text-2xl">
                {pendingCount}
              </p>

              <p className="mt-1 hidden text-xs text-[#aaa4af] sm:block">
                Aguardando confirmação
              </p>
            </div>
          </div>

          {/* ======================================
              AGENDA DO DIA
          ====================================== */}
          <section className="mt-4 overflow-hidden rounded-2xl border border-[#e8e3ec] bg-white shadow-[0_2px_10px_rgba(77,52,121,0.04)] sm:mt-5">
            <div className="flex items-center justify-between gap-3 border-b border-[#eeeaf0] px-4 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <h2 className="font-semibold text-[#3f3a43]">
                  Horários do dia
                </h2>

                <p className="mt-1 hidden text-xs text-[#918b96] sm:block">
                  Atendimentos programados para esta data.
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

            {loading ? (
              <div className="p-10 text-center">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#644498]/20 border-t-[#644498]" />

                <p className="mt-3 text-xs text-[#918b96]">
                  Carregando agenda...
                </p>
              </div>
            ) : dayAppointments.length ===
              0 ? (
              <div className="px-5 py-12 text-center sm:px-6 sm:py-14">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ec] text-xl text-[#63845f]">
                  ✓
                </div>

                <p className="mt-4 text-sm font-semibold text-[#5f5963]">
                  Nenhum agendamento neste dia
                </p>

                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#918b96]">
                  Sua agenda está livre. Adicione um novo atendimento para este horário.
                </p>

                <button
                  type="button"
                  onClick={
                    openNewAppointment
                  }
                  className="mt-5 rounded-xl bg-[#644498] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#553987]"
                >
                  + Novo agendamento
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#f0edf2]">
                {dayAppointments.map(
                  (appointment) => {
                    const start =
                      new Date(
                        appointment.start_at
                      )

                    const end =
                      new Date(
                        appointment.end_at
                      )

                    const status =
                      getStatus(
                        appointment.status
                      )

                    return (
                      <div
                        key={appointment.id}
                        className="flex min-w-0 transition hover:bg-[#fcfbfd]"
                      >
                        {/* Horário */}
                        <div className="flex w-[76px] shrink-0 flex-col items-end border-r border-[#eeeaf0] px-2.5 py-4 sm:w-24 sm:px-4 sm:py-5">
                          <p className="text-xs font-bold text-[#3f3a43] sm:text-sm">
                            {start.toLocaleTimeString(
                              'pt-BR',
                              {
                                hour: '2-digit',
                                minute:
                                  '2-digit',
                              }
                            )}
                          </p>

                          <p className="mt-1 text-[9px] text-[#aaa4af] sm:text-[11px]">
                            até{' '}
                            {end.toLocaleTimeString(
                              'pt-BR',
                              {
                                hour: '2-digit',
                                minute:
                                  '2-digit',
                              }
                            )}
                          </p>
                        </div>

                        {/* Indicador */}
                        <div className="flex w-4 shrink-0 justify-center sm:w-5">
                          <div className="mt-6 h-2.5 w-2.5 rounded-full bg-[#8b6ab3] ring-4 ring-[#eee9f5]" />
                        </div>

                        {/* Atendimento */}
                        <div className="flex min-w-0 flex-1 flex-col gap-3 px-2.5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-5">
                          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d9c9df] text-xs font-semibold text-[#644498] sm:h-10 sm:w-10 sm:text-sm">
                              {appointment.patient.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#454049]">
                                {
                                  appointment
                                    .patient
                                    .name
                                }
                              </p>

                              <p className="mt-0.5 truncate text-[11px] text-[#918b96] sm:text-xs">
                                {
                                  appointment
                                    .patient
                                    .phone
                                }
                              </p>
                            </div>
                          </div>

                          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
                            {appointment.status ===
                              'scheduled' && (
                              <button
                                type="button"
                                onClick={() =>
                                  confirmAppointment(
                                    appointment
                                  )
                                }
                                className="rounded-lg border border-[#dcebd9] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#63845f] transition hover:bg-[#eef5ec] sm:px-3 sm:text-xs"
                              >
                                Confirmar
                              </button>
                            )}

                            <span
                              className={`rounded-full px-2.5 py-1.5 text-[10px] font-semibold sm:px-3 sm:text-[11px] ${status.className}`}
                            >
                              {status.label}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                cancelAppointment(
                                  appointment
                                )
                              }
                              className="rounded-lg border border-[#f0d9d4] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#b06a60] transition hover:bg-[#fff5f3] sm:px-3 sm:text-xs"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default Agenda