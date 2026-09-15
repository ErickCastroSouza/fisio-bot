import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

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

  const [appointments, setAppointments] = useState<
    Appointment[]
  >([])

  const [patients, setPatients] = useState<Patient[]>([])

  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const location = useLocation()

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

  const loadAppointments = async () => {
    try {
      const response = await fetch(
        'http://localhost:3000/appointments'
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

  const loadPatients = async () => {
    try {
      const response = await fetch(
        'http://localhost:3000/patients'
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

  const loadData = async () => {
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

  const changeDay = (amount: number) => {
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

  const dayAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => {
        if (
          appointment.status === 'cancelled'
        ) {
          return false
        }

        const date = new Date(
          appointment.start_at
        )

        const year = date.getFullYear()
        const month = String(
          date.getMonth() + 1
        ).padStart(2, '0')
        const day = String(
          date.getDate()
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

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault()

    if (
      !patientId ||
      !date ||
      !startTime ||
      !endTime
    ) {
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        'http://localhost:3000/appointments',
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

  const cancelAppointment = async (
    appointment: Appointment
  ) => {
    const confirmed =
      window.confirm(
        `Deseja cancelar o agendamento de ${appointment.patient.name}?`
      )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `http://localhost:3000/appointments/${appointment.id}`,
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

  const confirmAppointment = async (
    appointment: Appointment
  ) => {
    try {
      const response = await fetch(
        `http://localhost:3000/appointments/${appointment.id}`,
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

  const goToToday = () => {
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

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-gray-50 p-8">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Agenda
          </h2>

          <p className="mt-1 text-gray-500">
            Gerencie os horários e
            agendamentos dos pacientes.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(true)
            setDate(selectedDate)
          }}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Novo agendamento
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="mt-6 rounded-xl border bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Novo agendamento
          </h3>

          <form
            onSubmit={handleSubmit}
            className="mt-5 space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-gray-700">
                Paciente
              </label>

              <select
                value={patientId}
                onChange={(event) =>
                  setPatientId(
                    event.target.value
                  )
                }
                className="mt-1 w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
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
              <label className="text-sm font-medium text-gray-700">
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
                className="mt-1 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Horário de início
                </label>

                <input
                  type="time"
                  value={startTime}
                  onChange={(event) =>
                    setStartTime(
                      event.target.value
                    )
                  }
                  className="mt-1 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Horário de término
                </label>

                <input
                  type="time"
                  value={endTime}
                  onChange={(event) =>
                    setEndTime(
                      event.target.value
                    )
                  }
                  className="mt-1 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setPatientId('')
                  setDate('')
                  setStartTime('')
                  setEndTime('')
                }}
                className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {saving
                  ? 'Agendando...'
                  : 'Agendar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Navegação da agenda */}
      <div className="mt-6 flex items-center justify-between rounded-xl border bg-white px-5 py-4">
        <button
          onClick={() => changeDay(-1)}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          ← Anterior
        </button>

        <div className="text-center">
          <p className="font-semibold capitalize text-gray-900">
            {formattedSelectedDate}
          </p>

          <button
            onClick={goToToday}
            className="mt-1 text-xs font-medium text-gray-500 hover:text-gray-900"
          >
            Ir para hoje
          </button>
        </div>

        <button
          onClick={() => changeDay(1)}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Próximo →
        </button>
      </div>

      {/* Agenda do dia */}
      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <div className="border-b px-5 py-4">
          <h3 className="font-semibold text-gray-900">
            Horários do dia
          </h3>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-gray-500">
            Carregando agenda...
          </p>
        ) : dayAppointments.length ===
          0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-gray-700">
              Nenhum agendamento neste dia.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Clique em "Novo agendamento"
              para adicionar um horário.
            </p>
          </div>
        ) : (
          <div className="divide-y">
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

                return (
                  <div
                    key={appointment.id}
                    className="flex min-h-24"
                  >
                    {/* Horário */}
                    <div className="w-24 shrink-0 border-r px-4 py-5 text-right">
                      <p className="font-semibold text-gray-900">
                        {start.toLocaleTimeString(
                          'pt-BR',
                          {
                            hour: '2-digit',
                            minute:
                              '2-digit',
                          }
                        )}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
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

                    {/* Agendamento */}
                    <div className="flex flex-1 items-center justify-between gap-4 px-5 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {
                            appointment
                              .patient
                              .name
                          }
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {
                            appointment
                              .patient
                              .phone
                          }
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {appointment.status ===
                          'scheduled' && (
                          <button
                            onClick={() =>
                              confirmAppointment(
                                appointment
                              )
                            }
                            className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
                          >
                            Confirmar
                          </button>
                        )}

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

                        <button
                          onClick={() =>
                            cancelAppointment(
                              appointment
                            )
                          }
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
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
      </div>
    </main>
  )
}

export default Agenda