import { useEffect, useState } from 'react'

type ClinicSettings = {
  id: string

  monday_enabled: boolean
  monday_start: string
  monday_end: string

  tuesday_enabled: boolean
  tuesday_start: string
  tuesday_end: string

  wednesday_enabled: boolean
  wednesday_start: string
  wednesday_end: string

  thursday_enabled: boolean
  thursday_start: string
  thursday_end: string

  friday_enabled: boolean
  friday_start: string
  friday_end: string

  saturday_enabled: boolean
  saturday_start: string
  saturday_end: string

  sunday_enabled: boolean
  sunday_start: string
  sunday_end: string

  lunch_enabled: boolean
  lunch_start: string
  lunch_end: string

  appointment_duration: number
}

type BotSettings = {
  id: string
  welcome_message: string
  menu_instruction: string
}

type BotMenuOption = {
  id: string
  option_number: number
  title: string
  response: string
  active: boolean
  transfer_to_human: boolean
}

type FAQ = {
  id: string
  question: string
  answer: string
  active: boolean
}

type DayConfig = {
  key:
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday'

  label: string
}

const API_URL = 'http://localhost:3000'

const DAYS: DayConfig[] = [
  {
    key: 'monday',
    label: 'Segunda-feira',
  },
  {
    key: 'tuesday',
    label: 'Terça-feira',
  },
  {
    key: 'wednesday',
    label: 'Quarta-feira',
  },
  {
    key: 'thursday',
    label: 'Quinta-feira',
  },
  {
    key: 'friday',
    label: 'Sexta-feira',
  },
  {
    key: 'saturday',
    label: 'Sábado',
  },
  {
    key: 'sunday',
    label: 'Domingo',
  },
]

function Configuracoes() {
  // ==================================================
  // CLÍNICA
  // ==================================================

  const [clinicSettings, setClinicSettings] =
    useState<ClinicSettings | null>(null)

  const [loadingClinic, setLoadingClinic] =
    useState(true)

  const [savingClinic, setSavingClinic] =
    useState(false)

  const [clinicMessage, setClinicMessage] =
    useState('')

  // ==================================================
  // BOT
  // ==================================================

  const [botSettings, setBotSettings] =
    useState<BotSettings | null>(null)

  const [botOptions, setBotOptions] =
    useState<BotMenuOption[]>([])

  const [loadingBot, setLoadingBot] =
    useState(true)

  const [savingBot, setSavingBot] =
    useState(false)

  const [botMessage, setBotMessage] =
    useState('')

  // ==================================================
  // FAQ
  // ==================================================

  const [faqs, setFaqs] = useState<FAQ[]>([])

  const [loadingFaqs, setLoadingFaqs] =
    useState(true)

  const [faqQuestion, setFaqQuestion] =
    useState('')

  const [faqAnswer, setFaqAnswer] =
    useState('')

  const [savingFaq, setSavingFaq] =
    useState(false)

  const [editingFaqId, setEditingFaqId] =
    useState<string | null>(null)

  const [editingQuestion, setEditingQuestion] =
    useState('')

  const [editingAnswer, setEditingAnswer] =
    useState('')

  // ==================================================
  // CARREGAMENTO
  // ==================================================

  useEffect(() => {
    loadClinicSettings()
    loadBotSettings()
    loadFaqs()
  }, [])

  async function loadClinicSettings() {
    try {
      setLoadingClinic(true)

      const response = await fetch(
        `${API_URL}/settings/clinic`
      )

      if (!response.ok) {
        throw new Error(
          'Erro ao carregar configurações da clínica'
        )
      }

      const data =
        (await response.json()) as ClinicSettings

      setClinicSettings(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingClinic(false)
    }
  }

  async function loadBotSettings() {
    try {
      setLoadingBot(true)

      const response = await fetch(
        `${API_URL}/settings/bot`
      )

      if (!response.ok) {
        throw new Error(
          'Erro ao carregar configurações do bot'
        )
      }

      const data = await response.json()

      setBotSettings(data.settings)
      setBotOptions(data.options ?? [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingBot(false)
    }
  }

  async function loadFaqs() {
    try {
      setLoadingFaqs(true)

      const response = await fetch(
        `${API_URL}/faqs`
      )

      if (!response.ok) {
        throw new Error(
          'Erro ao carregar FAQs'
        )
      }

      const data =
        (await response.json()) as FAQ[]

      setFaqs(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingFaqs(false)
    }
  }

  // ==================================================
  // CLÍNICA
  // ==================================================

  function updateClinicSetting(
    field: keyof ClinicSettings,
    value: boolean | string | number
  ) {
    setClinicSettings((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        [field]: value,
      }
    })
  }

  async function saveClinicSettings() {
    if (!clinicSettings) {
      return
    }

    try {
      setSavingClinic(true)
      setClinicMessage('')

      const {
        id,
        ...settings
      } = clinicSettings

      const response = await fetch(
        `${API_URL}/settings/clinic`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify(settings),
        }
      )

      if (!response.ok) {
        const data =
          await response.json().catch(
            () => null
          )

        throw new Error(
          data?.error ||
            'Erro ao salvar configurações'
        )
      }

      const updated =
        (await response.json()) as ClinicSettings

      setClinicSettings(updated)

      setClinicMessage(
        'Configurações da clínica salvas com sucesso.'
      )
    } catch (error) {
      console.error(error)

      setClinicMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao salvar configurações.'
      )
    } finally {
      setSavingClinic(false)
    }
  }

  // ==================================================
  // BOT
  // ==================================================

  function updateBotSetting(
    field: keyof BotSettings,
    value: string
  ) {
    setBotSettings((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        [field]: value,
      }
    })
  }

  async function saveBotSettings() {
    if (!botSettings) {
      return
    }

    try {
      setSavingBot(true)
      setBotMessage('')

      const response = await fetch(
        `${API_URL}/settings/bot`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            welcome_message:
              botSettings.welcome_message,
            menu_instruction:
              botSettings.menu_instruction,
          }),
        }
      )

      if (!response.ok) {
        const data =
          await response.json().catch(
            () => null
          )

        throw new Error(
          data?.error ||
            'Erro ao salvar configurações do bot'
        )
      }

      const updated =
        (await response.json()) as BotSettings

      setBotSettings(updated)

      setBotMessage(
        'Configurações do bot salvas com sucesso.'
      )
    } catch (error) {
      console.error(error)

      setBotMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao salvar configurações do bot.'
      )
    } finally {
      setSavingBot(false)
    }
  }

  function updateBotOption(
    id: string,
    field:
      | 'title'
      | 'response'
      | 'active',
    value: string | boolean
  ) {
    setBotOptions((current) =>
      current.map((option) =>
        option.id === id
          ? {
              ...option,
              [field]: value,
            }
          : option
      )
    )
  }

  async function saveBotOption(
    option: BotMenuOption
  ) {
    try {
      setBotMessage('')

      const response = await fetch(
        `${API_URL}/settings/bot/options/${option.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            title: option.title,
            response: option.response,
            active: option.active,
          }),
        }
      )

      if (!response.ok) {
        const data =
          await response.json().catch(
            () => null
          )

        throw new Error(
          data?.error ||
            'Erro ao salvar opção'
        )
      }

      const updated =
        (await response.json()) as BotMenuOption

      setBotOptions((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item
        )
      )

      setBotMessage(
        `Opção ${option.option_number} salva com sucesso.`
      )
    } catch (error) {
      console.error(error)

      setBotMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao salvar opção.'
      )
    }
  }

  // ==================================================
  // FAQ
  // ==================================================

  async function createFaq() {
    if (
      !faqQuestion.trim() ||
      !faqAnswer.trim()
    ) {
      return
    }

    try {
      setSavingFaq(true)

      const response = await fetch(
        `${API_URL}/faqs`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            question:
              faqQuestion.trim(),
            answer:
              faqAnswer.trim(),
          }),
        }
      )

      const data =
        await response.json().catch(
          () => null
        )

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Erro ao criar FAQ'
        )
      }

      setFaqs((current) => [
        data,
        ...current,
      ])

      setFaqQuestion('')
      setFaqAnswer('')
    } catch (error) {
      console.error(error)

      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao criar FAQ.'
      )
    } finally {
      setSavingFaq(false)
    }
  }

  function startEditingFaq(faq: FAQ) {
    setEditingFaqId(faq.id)
    setEditingQuestion(faq.question)
    setEditingAnswer(faq.answer)
  }

  function cancelEditingFaq() {
    setEditingFaqId(null)
    setEditingQuestion('')
    setEditingAnswer('')
  }

  async function saveFaq(faq: FAQ) {
    if (
      !editingQuestion.trim() ||
      !editingAnswer.trim()
    ) {
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/faqs/${faq.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            question:
              editingQuestion.trim(),
            answer:
              editingAnswer.trim(),
          }),
        }
      )

      const data =
        await response.json().catch(
          () => null
        )

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Erro ao atualizar FAQ'
        )
      }

      setFaqs((current) =>
        current.map((item) =>
          item.id === faq.id
            ? data
            : item
        )
      )

      cancelEditingFaq()
    } catch (error) {
      console.error(error)

      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar FAQ.'
      )
    }
  }

  async function toggleFaq(faq: FAQ) {
    try {
      const response = await fetch(
        `${API_URL}/faqs/${faq.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            active: !faq.active,
          }),
        }
      )

      const data =
        await response.json().catch(
          () => null
        )

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Erro ao alterar FAQ'
        )
      }

      setFaqs((current) =>
        current.map((item) =>
          item.id === faq.id
            ? data
            : item
        )
      )
    } catch (error) {
      console.error(error)

      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao alterar FAQ.'
      )
    }
  }

  async function deleteFaq(
    faqId: string
  ) {
    const confirmed = window.confirm(
      'Deseja realmente excluir esta FAQ?'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/faqs/${faqId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const data =
          await response.json().catch(
            () => null
          )

        throw new Error(
          data?.error ||
            'Erro ao excluir FAQ'
        )
      }

      setFaqs((current) =>
        current.filter(
          (faq) => faq.id !== faqId
        )
      )
    } catch (error) {
      console.error(error)

      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao excluir FAQ.'
      )
    }
  }

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-[#f8f7f9]">
      <header className="border-b border-[#e8e3ec] bg-white px-8 py-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b7aa3]">
            Sistema
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#3f3a43]">
            Configurações
          </h1>

          <p className="mt-1 text-sm text-[#85808b]">
            Configure os horários da clínica,
            o FisioBot e suas respostas automáticas.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl p-8">

        {/* ==================================================
            CLÍNICA
        ================================================== */}

        <section className="overflow-hidden rounded-2xl border border-[#e8e3ec] bg-white shadow-[0_2px_10px_rgba(77,52,121,0.04)]">
          <div className="border-b border-[#eeeaf0] px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eee9f5] text-[#644498]">
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
                  <path d="M3 21h18" />
                  <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                  <path d="M9 7h2" />
                  <path d="M13 7h2" />
                  <path d="M9 11h2" />
                  <path d="M13 11h2" />
                  <path d="M9 15h2" />
                  <path d="M13 15h2" />
                </svg>
              </div>

              <div>
                <h2 className="font-semibold text-[#3f3a43]">
                  Horários da clínica
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#918b96]">
                  Defina os dias e horários de
                  atendimento e a duração das consultas.
                </p>
              </div>
            </div>
          </div>

          {loadingClinic ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#644498]/20 border-t-[#644498]" />

              <p className="mt-3 text-xs text-[#918b96]">
                Carregando configurações...
              </p>
            </div>
          ) : clinicSettings ? (
            <div className="p-6">

              {/* Dias */}

              <div className="space-y-2">
                {DAYS.map((day) => {
                  const enabled =
                    clinicSettings[
                      `${day.key}_enabled` as keyof ClinicSettings
                    ] as boolean

                  const start =
                    clinicSettings[
                      `${day.key}_start` as keyof ClinicSettings
                    ] as string

                  const end =
                    clinicSettings[
                      `${day.key}_end` as keyof ClinicSettings
                    ] as string

                  return (
                    <div
                      key={day.key}
                      className={`flex flex-col gap-4 rounded-xl border px-4 py-4 transition sm:flex-row sm:items-center sm:justify-between ${
                        enabled
                          ? 'border-[#e8e3ec] bg-white'
                          : 'border-[#eeeaf0] bg-[#fcfbfd]'
                      }`}
                    >
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(event) =>
                            updateClinicSetting(
                              `${day.key}_enabled` as keyof ClinicSettings,
                              event.target.checked
                            )
                          }
                          className="h-4 w-4 rounded border-[#cfc7d5] text-[#644498] accent-[#644498]"
                        />

                        <span
                          className={`text-sm font-medium ${
                            enabled
                              ? 'text-[#454049]'
                              : 'text-[#aaa4af]'
                          }`}
                        >
                          {day.label}
                        </span>

                        {!enabled && (
                          <span className="rounded-full bg-[#f1eff2] px-2 py-0.5 text-[10px] font-medium text-[#918b96]">
                            Fechado
                          </span>
                        )}
                      </label>

                      <div className="flex items-center gap-2 sm:pr-1">
                        <input
                          type="time"
                          value={start}
                          disabled={!enabled}
                          onChange={(event) =>
                            updateClinicSetting(
                              `${day.key}_start` as keyof ClinicSettings,
                              event.target.value
                            )
                          }
                          className="rounded-lg border border-[#ddd7e1] bg-[#fcfbfd] px-3 py-2 text-sm text-[#454049] outline-none transition focus:border-[#9b82b8] focus:ring-4 focus:ring-[#644498]/10 disabled:cursor-not-allowed disabled:opacity-40"
                        />

                        <span className="text-xs text-[#aaa4af]">
                          até
                        </span>

                        <input
                          type="time"
                          value={end}
                          disabled={!enabled}
                          onChange={(event) =>
                            updateClinicSetting(
                              `${day.key}_end` as keyof ClinicSettings,
                              event.target.value
                            )
                          }
                          className="rounded-lg border border-[#ddd7e1] bg-[#fcfbfd] px-3 py-2 text-sm text-[#454049] outline-none transition focus:border-[#9b82b8] focus:ring-4 focus:ring-[#644498]/10 disabled:cursor-not-allowed disabled:opacity-40"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Almoço + duração */}

              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">

                <div className="rounded-xl border border-[#e8e3ec] bg-[#fcfbfd] p-5">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={
                        clinicSettings.lunch_enabled
                      }
                      onChange={(event) =>
                        updateClinicSetting(
                          'lunch_enabled',
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-[#cfc7d5] accent-[#644498]"
                    />

                    <span className="text-sm font-medium text-[#454049]">
                      Intervalo para almoço
                    </span>
                  </label>

                  <p className="mt-1.5 pl-7 text-xs text-[#918b96]">
                    Horário bloqueado para novos atendimentos.
                  </p>

                  {clinicSettings.lunch_enabled && (
                    <div className="mt-4 flex items-center gap-2 pl-7">
                      <input
                        type="time"
                        value={
                          clinicSettings.lunch_start
                        }
                        onChange={(event) =>
                          updateClinicSetting(
                            'lunch_start',
                            event.target.value
                          )
                        }
                        className="rounded-lg border border-[#ddd7e1] bg-white px-3 py-2 text-sm text-[#454049] outline-none focus:border-[#9b82b8] focus:ring-4 focus:ring-[#644498]/10"
                      />

                      <span className="text-xs text-[#aaa4af]">
                        até
                      </span>

                      <input
                        type="time"
                        value={
                          clinicSettings.lunch_end
                        }
                        onChange={(event) =>
                          updateClinicSetting(
                            'lunch_end',
                            event.target.value
                          )
                        }
                        className="rounded-lg border border-[#ddd7e1] bg-white px-3 py-2 text-sm text-[#454049] outline-none focus:border-[#9b82b8] focus:ring-4 focus:ring-[#644498]/10"
                      />
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-[#e8e3ec] bg-[#fcfbfd] p-5">
                  <label className="mb-1.5 block text-sm font-medium text-[#454049]">
                    Duração da consulta
                  </label>

                  <p className="mb-3 text-xs text-[#918b96]">
                    Define o intervalo usado pela agenda.
                  </p>

                  <select
                    value={
                      clinicSettings.appointment_duration
                    }
                    onChange={(event) =>
                      updateClinicSetting(
                        'appointment_duration',
                        Number(
                          event.target.value
                        )
                      )
                    }
                    className="rounded-lg border border-[#ddd7e1] bg-white px-3 py-2.5 text-sm text-[#454049] outline-none focus:border-[#9b82b8] focus:ring-4 focus:ring-[#644498]/10"
                  >
                    <option value={30}>
                      30 minutos
                    </option>

                    <option value={45}>
                      45 minutos
                    </option>

                    <option value={60}>
                      60 minutos
                    </option>

                    <option value={90}>
                      90 minutos
                    </option>

                    <option value={120}>
                      120 minutos
                    </option>
                  </select>
                </div>
              </div>

              {/* Salvar */}

              <div className="mt-6 flex flex-col gap-3 border-t border-[#eeeaf0] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <span
                  className={`text-xs ${
                    clinicMessage.includes(
                      'sucesso'
                    )
                      ? 'text-[#63845f]'
                      : 'text-[#b36d6d]'
                  }`}
                >
                  {clinicMessage}
                </span>

                <button
                  type="button"
                  onClick={
                    saveClinicSettings
                  }
                  disabled={savingClinic}
                  className="rounded-xl bg-[#644498] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#553987] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingClinic
                    ? 'Salvando...'
                    : 'Salvar horários'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <p className="text-sm text-[#b36d6d]">
                Não foi possível carregar as configurações da clínica.
              </p>
            </div>
          )}
        </section>

        {/* ==================================================
            BOT
        ================================================== */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#e8e3ec] bg-white shadow-[0_2px_10px_rgba(77,52,121,0.04)]">
          <div className="border-b border-[#eeeaf0] px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef5ec] text-[#63845f]">
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
                    x="4"
                    y="5"
                    width="16"
                    height="14"
                    rx="3"
                  />
                  <path d="M8 9h8" />
                  <path d="M8 13h5" />
                  <path d="M9 5V3" />
                  <path d="M15 5V3" />
                </svg>
              </div>

              <div>
                <h2 className="font-semibold text-[#3f3a43]">
                  FisioBot
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#918b96]">
                  Personalize as mensagens e as opções
                  apresentadas aos pacientes.
                </p>
              </div>
            </div>
          </div>

          {loadingBot ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#644498]/20 border-t-[#644498]" />

              <p className="mt-3 text-xs text-[#918b96]">
                Carregando configurações do bot...
              </p>
            </div>
          ) : botSettings ? (
            <div className="p-6">

              {/* Mensagens gerais */}

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#716a76]">
                    Mensagem de boas-vindas
                  </label>

                  <textarea
                    value={
                      botSettings.welcome_message
                    }
                    onChange={(event) =>
                      updateBotSetting(
                        'welcome_message',
                        event.target.value
                      )
                    }
                    rows={5}
                    className="w-full resize-y rounded-xl border border-[#ddd7e1] bg-[#fcfbfd] px-4 py-3 text-sm leading-5 text-[#454049] outline-none transition placeholder:text-[#aaa4af] focus:border-[#9b82b8] focus:ring-4 focus:ring-[#644498]/10"
                  />

                  <p className="mt-1.5 text-[11px] text-[#aaa4af]">
                    Enviada no primeiro contato do paciente.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#716a76]">
                    Instrução do menu
                  </label>

                  <textarea
                    value={
                      botSettings.menu_instruction
                    }
                    onChange={(event) =>
                      updateBotSetting(
                        'menu_instruction',
                        event.target.value
                      )
                    }
                    rows={5}
                    className="w-full resize-y rounded-xl border border-[#ddd7e1] bg-[#fcfbfd] px-4 py-3 text-sm leading-5 text-[#454049] outline-none transition focus:border-[#9b82b8] focus:ring-4 focus:ring-[#644498]/10"
                  />

                  <p className="mt-1.5 text-[11px] text-[#aaa4af]">
                    Orienta o paciente sobre como utilizar o menu.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 border-b border-[#eeeaf0] pb-6 sm:flex-row sm:items-center sm:justify-between">
                <span
                  className={`text-xs ${
                    botMessage.includes(
                      'sucesso'
                    )
                      ? 'text-[#63845f]'
                      : 'text-[#b36d6d]'
                  }`}
                >
                  {botMessage}
                </span>

                <button
                  type="button"
                  onClick={saveBotSettings}
                  disabled={savingBot}
                  className="rounded-xl bg-[#644498] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#553987] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingBot
                    ? 'Salvando...'
                    : 'Salvar mensagens'}
                </button>
              </div>

              {/* Opções */}

              <div className="mt-6">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[#3f3a43]">
                    Opções do menu
                  </h3>

                  <p className="mt-1 text-xs text-[#918b96]">
                    Configure as respostas utilizadas pelo atendimento automático.
                  </p>
                </div>

                <div className="space-y-3">
                  {botOptions.map(
                    (option) => (
                      <div
                        key={option.id}
                        className="rounded-xl border border-[#e8e3ec] bg-[#fcfbfd] p-5"
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 items-start gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eee9f5] text-xs font-bold text-[#644498]">
                                {option.option_number}
                              </div>

                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#454049]">
                                  {option.title}
                                </p>

                                {option.transfer_to_human && (
                                  <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-[#f1e8f1] px-2.5 py-1 text-[10px] font-medium text-[#8b638d]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#b18ab3]" />
                                    Encaminha para a fisioterapeuta
                                  </div>
                                )}
                              </div>
                            </div>

                            <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs font-medium text-[#625d66]">
                              <input
                                type="checkbox"
                                checked={
                                  option.active
                                }
                                onChange={(event) =>
                                  updateBotOption(
                                    option.id,
                                    'active',
                                    event.target
                                      .checked
                                  )
                                }
                                className="h-4 w-4 rounded border-[#cfc7d5] accent-[#644498]"
                              />

                              Ativa
                            </label>
                          </div>

                          <div>
                            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#aaa4af]">
                              Título da opção
                            </label>

                            <input
                              type="text"
                              value={
                                option.title
                              }
                              onChange={(event) =>
                                updateBotOption(
                                  option.id,
                                  'title',
                                  event.target
                                    .value
                                )
                              }
                              className="w-full rounded-xl border border-[#ddd7e1] bg-white px-4 py-2.5 text-sm text-[#454049] outline-none transition focus:border-[#9b82b8] focus:ring-4 focus:ring-[#644498]/10"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#aaa4af]">
                              Resposta automática
                            </label>

                            <textarea
                              value={
                                option.response
                              }
                              onChange={(event) =>
                                updateBotOption(
                                  option.id,
                                  'response',
                                  event.target
                                    .value
                                )
                              }
                              rows={4}
                              className="w-full resize-y rounded-xl border border-[#ddd7e1] bg-white px-4 py-3 text-sm leading-5 text-[#454049] outline-none transition focus:border-[#9b82b8] focus:ring-4 focus:ring-[#644498]/10"
                            />
                          </div>

                          <div className="flex justify-end border-t border-[#eeeaf0] pt-4">
                            <button
                              type="button"
                              onClick={() =>
                                saveBotOption(
                                  option
                                )
                              }
                              className="rounded-xl border border-[#d8cee1] bg-white px-4 py-2 text-xs font-semibold text-[#644498] transition hover:bg-[#f6f2f8]"
                            >
                              Salvar opção
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <p className="text-sm text-[#b36d6d]">
                Não foi possível carregar as configurações do bot.
              </p>
            </div>
          )}
        </section>

        {/* ==================================================
            FAQ
        ================================================== */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#e8e3ec] bg-white shadow-[0_2px_10px_rgba(77,52,121,0.04)]">
          <div className="border-b border-[#eeeaf0] px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1e8f1] text-[#8b638d]">
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
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                  />
                  <path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-1 .8-1.7 1.2-1.7 2.7" />
                  <path d="M12 17h.01" />
                </svg>
              </div>

              <div>
                <h2 className="font-semibold text-[#3f3a43]">
                  Perguntas frequentes
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#918b96]">
                  Cadastre informações que o FisioBot
                  pode responder automaticamente.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">

            {/* Nova FAQ */}

            <div className="rounded-xl border border-[#dcebd9] bg-[#f5f8f4] p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#4f614c]">
                  Adicionar pergunta
                </h3>

                <p className="mt-1 text-xs text-[#789075]">
                  Crie uma nova resposta para dúvidas frequentes.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#789075]">
                    Pergunta
                  </label>

                  <input
                    type="text"
                    value={faqQuestion}
                    onChange={(event) =>
                      setFaqQuestion(
                        event.target.value
                      )
                    }
                    placeholder="Ex.: Vocês atendem convênio?"
                    className="w-full rounded-xl border border-[#d8e3d5] bg-white px-4 py-3 text-sm text-[#454049] outline-none transition placeholder:text-[#aaa4af] focus:border-[#8ba586] focus:ring-4 focus:ring-[#7fa77c]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#789075]">
                    Resposta
                  </label>

                  <textarea
                    value={faqAnswer}
                    onChange={(event) =>
                      setFaqAnswer(
                        event.target.value
                      )
                    }
                    rows={4}
                    placeholder="Digite a resposta que o FisioBot deverá enviar..."
                    className="w-full resize-y rounded-xl border border-[#d8e3d5] bg-white px-4 py-3 text-sm leading-5 text-[#454049] outline-none transition placeholder:text-[#aaa4af] focus:border-[#8ba586] focus:ring-4 focus:ring-[#7fa77c]/10"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={createFaq}
                    disabled={
                      savingFaq ||
                      !faqQuestion.trim() ||
                      !faqAnswer.trim()
                    }
                    className="rounded-xl bg-[#63845f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#557153] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingFaq
                      ? 'Salvando...'
                      : 'Adicionar FAQ'}
                  </button>
                </div>
              </div>
            </div>

            {/* Lista */}

            <div className="mt-6">
              {loadingFaqs ? (
                <div className="p-8 text-center">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#644498]/20 border-t-[#644498]" />

                  <p className="mt-3 text-xs text-[#918b96]">
                    Carregando FAQs...
                  </p>
                </div>
              ) : faqs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#ddd7e1] px-6 py-10 text-center">
                  <p className="text-sm font-medium text-[#625d66]">
                    Nenhuma FAQ cadastrada
                  </p>

                  <p className="mt-1 text-xs text-[#918b96]">
                    As perguntas adicionadas aparecerão aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {faqs.map((faq) => {
                    const isEditing =
                      editingFaqId === faq.id

                    return (
                      <div
                        key={faq.id}
                        className="rounded-xl border border-[#e8e3ec] bg-[#fcfbfd] p-5"
                      >
                        {isEditing ? (
                          <>
                            <div className="space-y-4">
                              <div>
                                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#aaa4af]">
                                  Pergunta
                                </label>

                                <input
                                  type="text"
                                  value={
                                    editingQuestion
                                  }
                                  onChange={(event) =>
                                    setEditingQuestion(
                                      event.target
                                        .value
                                    )
                                  }
                                  className="w-full rounded-xl border border-[#ddd7e1] bg-white px-4 py-3 text-sm text-[#454049] outline-none focus:border-[#9b82b8] focus:ring-4 focus:ring-[#644498]/10"
                                />
                              </div>

                              <div>
                                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#aaa4af]">
                                  Resposta
                                </label>

                                <textarea
                                  value={
                                    editingAnswer
                                  }
                                  onChange={(event) =>
                                    setEditingAnswer(
                                      event.target
                                        .value
                                    )
                                  }
                                  rows={4}
                                  className="w-full resize-y rounded-xl border border-[#ddd7e1] bg-white px-4 py-3 text-sm leading-5 text-[#454049] outline-none focus:border-[#9b82b8] focus:ring-4 focus:ring-[#644498]/10"
                                />
                              </div>
                            </div>

                            <div className="mt-4 flex justify-end gap-2 border-t border-[#eeeaf0] pt-4">
                              <button
                                type="button"
                                onClick={
                                  cancelEditingFaq
                                }
                                className="rounded-xl border border-[#ddd7e1] bg-white px-4 py-2 text-xs font-semibold text-[#625d66] transition hover:bg-[#f6f4f7]"
                              >
                                Cancelar
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  saveFaq(faq)
                                }
                                className="rounded-xl bg-[#644498] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#553987]"
                              >
                                Salvar alterações
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#eee9f5] text-xs font-bold text-[#644498]">
                                    ?
                                  </div>

                                  <div>
                                    <h3 className="text-sm font-semibold leading-5 text-[#454049]">
                                      {faq.question}
                                    </h3>

                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-[#716a76]">
                                      {faq.answer}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <span
                                className={`shrink-0 self-start rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                  faq.active
                                    ? 'bg-[#eef5ec] text-[#63845f]'
                                    : 'bg-[#f1eff2] text-[#918b96]'
                                }`}
                              >
                                {faq.active
                                  ? 'Ativa'
                                  : 'Inativa'}
                              </span>
                            </div>

                            <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-[#eeeaf0] pt-4">
                              <button
                                type="button"
                                onClick={() =>
                                  startEditingFaq(
                                    faq
                                  )
                                }
                                className="rounded-xl border border-[#ddd7e1] bg-white px-4 py-2 text-xs font-semibold text-[#625d66] transition hover:bg-[#f6f4f7]"
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  toggleFaq(faq)
                                }
                                className="rounded-xl border border-[#ddd7e1] bg-white px-4 py-2 text-xs font-semibold text-[#625d66] transition hover:bg-[#f6f4f7]"
                              >
                                {faq.active
                                  ? 'Desativar'
                                  : 'Ativar'}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteFaq(
                                    faq.id
                                  )
                                }
                                className="rounded-xl border border-[#ead2d2] bg-white px-4 py-2 text-xs font-semibold text-[#b36d6d] transition hover:bg-[#fff5f5]"
                              >
                                Excluir
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Configuracoes