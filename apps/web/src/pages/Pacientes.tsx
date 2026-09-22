import { useEffect, useState } from 'react'
import { API_URL } from '../config'

type Patient = {
  id: string
  name: string
  phone: string
  email: string | null
  created_at: string
}

function Pacientes() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  const [saving, setSaving] = useState(false)

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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
  }, [])

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault()

    if (!name.trim() || !phone.trim()) {
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        `${API_URL}/patients`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() || undefined,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          'Erro ao cadastrar paciente'
        )
      }

      setName('')
      setPhone('')
      setEmail('')
      setShowForm(false)

      await loadPatients()
    } catch (error) {
      console.error(error)

      alert(
        'Não foi possível cadastrar o paciente.'
      )
    } finally {
      setSaving(false)
    }
  }

  function closeForm() {
    setShowForm(false)
    setName('')
    setPhone('')
    setEmail('')
  }

  const patientsWithEmail =
    patients.filter(
      (patient) => Boolean(patient.email)
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
              Cadastro
            </p>

            <h1 className="mt-1 text-xl font-bold tracking-tight text-[#3f3a43] sm:text-2xl">
              Pacientes
            </h1>

            <p className="mt-1 hidden text-sm text-[#85808b] sm:block">
              Gerencie os pacientes cadastrados no FisioBot.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowForm(true)
            }
            className="flex shrink-0 items-center gap-2 rounded-xl bg-[#644498] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#553987] hover:shadow-md active:scale-[0.98] sm:px-4"
          >
            <span className="text-lg leading-none">
              +
            </span>

            <span className="hidden sm:inline">
              Novo paciente
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
              RESUMO
          ====================================== */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Total */}
            <div className="rounded-2xl border border-[#e8e3ec] bg-white p-4 shadow-[0_2px_10px_rgba(77,52,121,0.04)] sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-[#85808b] sm:text-sm">
                    Pacientes cadastrados
                  </p>

                  <p className="mt-2 text-2xl font-bold tracking-tight text-[#3f3a43] sm:mt-3 sm:text-3xl">
                    {patients.length}
                  </p>

                  <p className="mt-1 hidden text-xs text-[#aaa4af] sm:block">
                    Registros no sistema
                  </p>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eee9f5] text-[#644498] sm:h-11 sm:w-11">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle
                      cx="9"
                      cy="7"
                      r="4"
                    />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Com e-mail */}
            <div className="rounded-2xl border border-[#e8e3ec] bg-white p-4 shadow-[0_2px_10px_rgba(77,52,121,0.04)] sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-[#85808b] sm:text-sm">
                    Com e-mail
                  </p>

                  <p className="mt-2 text-2xl font-bold tracking-tight text-[#63845f] sm:mt-3 sm:text-3xl">
                    {patientsWithEmail}
                  </p>

                  <p className="mt-1 hidden text-xs text-[#aaa4af] sm:block">
                    Cadastros com contato por e-mail
                  </p>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef5ec] text-[#63845f] sm:h-11 sm:w-11">
                  <svg
                    width="20"
                    height="20"
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

                    <path d="m3 7 9 6 9-6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================
              FORMULÁRIO
          ====================================== */}
          {showForm && (
            <section className="mt-4 overflow-hidden rounded-2xl border border-[#e8e3ec] bg-white shadow-[0_2px_10px_rgba(77,52,121,0.04)] sm:mt-6">
              <div className="border-b border-[#eeeaf0] px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eee9f5] text-lg text-[#644498]">
                      +
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-semibold text-[#3f3a43]">
                        Novo paciente
                      </h2>

                      <p className="mt-0.5 text-xs text-[#918b96]">
                        Cadastre os dados básicos do paciente.
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {/* Nome */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#716a76]">
                      Nome
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(
                          event.target.value
                        )
                      }
                      placeholder="Nome completo"
                      className="w-full rounded-xl border border-[#ddd7e1] bg-[#fcfbfd] px-4 py-3 text-sm text-[#454049] outline-none transition placeholder:text-[#aaa4af] focus:border-[#9b82b8] focus:ring-4 focus:ring-[#644498]/10"
                      required
                    />
                  </div>

                  {/* Telefone */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#716a76]">
                      Telefone
                    </label>

                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) =>
                        setPhone(
                          event.target.value
                        )
                      }
                      placeholder="(81) 99999-9999"
                      className="w-full rounded-xl border border-[#ddd7e1] bg-[#fcfbfd] px-4 py-3 text-sm text-[#454049] outline-none transition placeholder:text-[#aaa4af] focus:border-[#9b82b8] focus:ring-4 focus:ring-[#644498]/10"
                      required
                    />
                  </div>

                  {/* E-mail */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#716a76]">
                      E-mail
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="email@exemplo.com"
                      className="w-full rounded-xl border border-[#ddd7e1] bg-[#fcfbfd] px-4 py-3 text-sm text-[#454049] outline-none transition placeholder:text-[#aaa4af] focus:border-[#9b82b8] focus:ring-4 focus:ring-[#644498]/10"
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
                      ? 'Cadastrando...'
                      : 'Cadastrar paciente'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* ======================================
              LISTA
          ====================================== */}
          <section className="mt-4 overflow-hidden rounded-2xl border border-[#e8e3ec] bg-white shadow-[0_2px_10px_rgba(77,52,121,0.04)] sm:mt-6">
            <div className="flex items-center justify-between gap-3 border-b border-[#eeeaf0] px-4 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <h2 className="font-semibold text-[#3f3a43]">
                  Lista de pacientes
                </h2>

                <p className="mt-1 hidden text-xs text-[#918b96] sm:block">
                  Pacientes cadastrados no sistema.
                </p>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f1e8f1] text-[#8b638d]">
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
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

                  <circle
                    cx="9"
                    cy="7"
                    r="4"
                  />

                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />

                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#644498]/20 border-t-[#644498]" />

                <p className="mt-3 text-xs text-[#918b96]">
                  Carregando pacientes...
                </p>
              </div>
            ) : patients.length === 0 ? (
              <div className="px-5 py-12 text-center sm:px-6 sm:py-14">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eee9f5] text-xl text-[#644498]">
                  +
                </div>

                <p className="mt-4 text-sm font-semibold text-[#5f5963]">
                  Nenhum paciente cadastrado
                </p>

                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#918b96]">
                  Cadastre o primeiro paciente para começar a utilizar o atendimento.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(true)
                  }
                  className="mt-5 rounded-xl bg-[#644498] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#553987]"
                >
                  + Novo paciente
                </button>
              </div>
            ) : (
              <>
                {/* ==================================
                    CABEÇALHO DESKTOP
                ================================== */}
                <div className="hidden grid-cols-[minmax(220px,1.5fr)_minmax(160px,1fr)_minmax(200px,1fr)] border-b border-[#f0edf2] bg-[#fcfbfd] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#aaa4af] md:grid">
                  <span>Paciente</span>
                  <span>Telefone</span>
                  <span>E-mail</span>
                </div>

                {/* ==================================
                    PACIENTES
                ================================== */}
                <div className="divide-y divide-[#f0edf2]">
                  {patients.map(
                    (patient) => (
                      <div
                        key={patient.id}
                        className="group flex flex-col gap-3 px-4 py-4 transition hover:bg-[#fcfbfd] sm:px-6 md:grid md:grid-cols-[minmax(220px,1.5fr)_minmax(160px,1fr)_minmax(200px,1fr)] md:items-center"
                      >
                        {/* Paciente */}
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d9c9df] text-sm font-semibold text-[#644498]">
                            {patient.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#454049]">
                              {patient.name}
                            </p>

                            <p className="mt-0.5 text-[11px] text-[#aaa4af] md:hidden">
                              Paciente cadastrado
                            </p>
                          </div>
                        </div>

                        {/* Telefone */}
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#aaa4af] md:hidden">
                            Telefone
                          </p>

                          <p className="mt-1 text-sm text-[#625d66] md:mt-0">
                            {patient.phone}
                          </p>
                        </div>

                        {/* E-mail */}
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#aaa4af] md:hidden">
                            E-mail
                          </p>

                          {patient.email ? (
                            <p className="mt-1 truncate text-sm text-[#625d66] md:mt-0">
                              {patient.email}
                            </p>
                          ) : (
                            <span className="mt-1 inline-flex rounded-full bg-[#f1eff2] px-2.5 py-1 text-[10px] font-medium text-[#918b96] md:mt-0">
                              Sem e-mail
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default Pacientes