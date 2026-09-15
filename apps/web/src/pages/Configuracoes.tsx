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
    <main className="min-w-0 flex-1 overflow-y-auto bg-gray-50">
      <div className="mx-auto max-w-6xl p-6">
        {/* CABEÇALHO */}

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Configurações
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Gerencie os horários da clínica,
            o comportamento do FisioBot e as
            perguntas frequentes.
          </p>
        </div>

        {/* ==================================================
            CONFIGURAÇÕES DA CLÍNICA
        ================================================== */}

        <section className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              🏥 Configurações da clínica
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Defina os dias e horários de
              atendimento e a duração das
              consultas.
            </p>
          </div>

          {loadingClinic ? (
            <p className="text-sm text-gray-500">
              Carregando configurações...
            </p>
          ) : clinicSettings ? (
            <>
              <div className="space-y-3">
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
                      className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
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
                          className="h-4 w-4 rounded"
                        />

                        <span className="text-sm font-medium text-gray-800">
                          {day.label}
                        </span>
                      </label>

                      <div className="flex items-center gap-2">
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
                          className="rounded-lg border px-3 py-2 text-sm disabled:bg-gray-100"
                        />

                        <span className="text-sm text-gray-400">
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
                          className="rounded-lg border px-3 py-2 text-sm disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* ALMOÇO */}

              <div className="mt-6 rounded-lg border p-4">
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
                    className="h-4 w-4 rounded"
                  />

                  <span className="text-sm font-medium text-gray-800">
                    Intervalo para almoço
                  </span>
                </label>

                {clinicSettings.lunch_enabled && (
                  <div className="mt-4 flex items-center gap-2">
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
                      className="rounded-lg border px-3 py-2 text-sm"
                    />

                    <span className="text-sm text-gray-400">
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
                      className="rounded-lg border px-3 py-2 text-sm"
                    />
                  </div>
                )}
              </div>

              {/* DURAÇÃO */}

              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Duração da consulta
                </label>

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
                  className="rounded-lg border bg-white px-3 py-2 text-sm"
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

              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm text-green-600">
                  {clinicMessage}
                </span>

                <button
                  type="button"
                  onClick={
                    saveClinicSettings
                  }
                  disabled={savingClinic}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingClinic
                    ? 'Salvando...'
                    : 'Salvar configurações'}
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-red-600">
              Não foi possível carregar as
              configurações da clínica.
            </p>
          )}
        </section>

        {/* ==================================================
            BOT
        ================================================== */}

        <section className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              🤖 Respostas automáticas
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Personalize as mensagens enviadas
              automaticamente pelo FisioBot.
            </p>
          </div>

          {loadingBot ? (
            <p className="text-sm text-gray-500">
              Carregando configurações do bot...
            </p>
          ) : botSettings ? (
            <>
              {/* MENSAGEM DE BOAS-VINDAS */}

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-800">
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
                  rows={3}
                  className="w-full resize-y rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Essa mensagem aparece no
                  primeiro contato do paciente.
                </p>
              </div>

              {/* INSTRUÇÃO */}

              <div className="mb-8">
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Instrução do menu
                </label>

                <input
                  type="text"
                  value={
                    botSettings.menu_instruction
                  }
                  onChange={(event) =>
                    updateBotSetting(
                      'menu_instruction',
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="mb-8 flex items-center justify-between border-b pb-6">
                <span className="text-sm text-green-600">
                  {botMessage}
                </span>

                <button
                  type="button"
                  onClick={saveBotSettings}
                  disabled={savingBot}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingBot
                    ? 'Salvando...'
                    : 'Salvar mensagens gerais'}
                </button>
              </div>

              {/* OPÇÕES */}

              <div>
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900">
                    Opções do menu
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Configure o título e a
                    resposta de cada opção.
                  </p>
                </div>

                <div className="space-y-5">
                  {botOptions.map(
                    (option) => (
                      <div
                        key={option.id}
                        className="rounded-xl border p-5"
                      >
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {option.option_number}️⃣{' '}
                              {option.title}
                            </p>

                            {option.transfer_to_human && (
                              <p className="mt-1 text-xs text-blue-600">
                                Esta opção encaminha
                                a conversa para a
                                fisioterapeuta.
                              </p>
                            )}
                          </div>

                          <label className="flex items-center gap-2 text-sm text-gray-600">
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
                              className="h-4 w-4 rounded"
                            />

                            Ativa
                          </label>
                        </div>

                        <div className="mb-4">
                          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
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
                            className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
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
                            rows={5}
                            className="w-full resize-y rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div className="mt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              saveBotOption(
                                option
                              )
                            }
                            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                          >
                            Salvar opção
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-red-600">
              Não foi possível carregar as
              configurações do bot.
            </p>
          )}
        </section>

        {/* ==================================================
            FAQ
        ================================================== */}

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              ❓ Perguntas frequentes
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Cadastre perguntas que o FisioBot
              poderá responder automaticamente.
            </p>
          </div>

          {/* NOVA FAQ */}

          <div className="rounded-xl bg-gray-50 p-5">
            <h3 className="mb-4 font-medium text-gray-900">
              Nova pergunta
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
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
                  className="w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
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
                  placeholder="Digite a resposta que o bot deverá enviar..."
                  className="w-full resize-y rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingFaq
                    ? 'Salvando...'
                    : 'Adicionar FAQ'}
                </button>
              </div>
            </div>
          </div>

          {/* LISTA */}

          <div className="mt-6">
            {loadingFaqs ? (
              <p className="text-sm text-gray-500">
                Carregando FAQs...
              </p>
            ) : faqs.length === 0 ? (
              <p className="text-sm text-gray-500">
                Nenhuma FAQ cadastrada.
              </p>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq) => {
                  const isEditing =
                    editingFaqId === faq.id

                  return (
                    <div
                      key={faq.id}
                      className="rounded-xl border p-5"
                    >
                      {isEditing ? (
                        <>
                          <div className="space-y-4">
                            <div>
                              <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                className="w-full rounded-lg border px-4 py-3 text-sm"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                className="w-full resize-y rounded-lg border px-4 py-3 text-sm"
                              />
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={
                                cancelEditingFaq
                              }
                              className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Cancelar
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                saveFaq(faq)
                              }
                              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                            >
                              Salvar
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <h3 className="font-medium text-gray-900">
                                {faq.question}
                              </h3>

                              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                                {faq.answer}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                                faq.active
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {faq.active
                                ? 'Ativa'
                                : 'Inativa'}
                            </span>
                          </div>

                          <div className="mt-4 flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                startEditingFaq(
                                  faq
                                )
                              }
                              className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                toggleFaq(faq)
                              }
                              className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
                              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
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
        </section>
      </div>
    </main>
  )
}

export default Configuracoes