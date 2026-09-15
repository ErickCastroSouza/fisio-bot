import { useEffect, useState } from 'react'

type FAQ = {
  id: string
  question: string
  answer: string
  active: boolean
  created_at: string
}

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

  created_at: string
  updated_at: string
}

function Configuracoes() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [saving, setSaving] = useState(false)

  const [settings, setSettings] =
    useState<ClinicSettings | null>(null)

  const [settingsLoading, setSettingsLoading] =
    useState(true)

  const [settingsSaving, setSettingsSaving] =
    useState(false)

  const [editingFAQ, setEditingFAQ] =
    useState<FAQ | null>(null)

  const loadFaqs = async () => {
    try {
      const response = await fetch(
        'http://localhost:3000/faqs'
      )

      if (!response.ok) {
        throw new Error('Erro ao buscar FAQs')
      }

      const data = await response.json()

      setFaqs(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch(
        'http://localhost:3000/settings/clinic'
      )

      if (!response.ok) {
        throw new Error(
          'Erro ao buscar configurações'
        )
      }

      const data = await response.json()

      setSettings(data)
    } catch (error) {
      console.error(error)
    } finally {
      setSettingsLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!settings) {
      return
    }

    setSettingsSaving(true)

    try {
      const response = await fetch(
        'http://localhost:3000/settings/clinic',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            monday_enabled:
              settings.monday_enabled,
            monday_start:
              settings.monday_start,
            monday_end:
              settings.monday_end,

            tuesday_enabled:
              settings.tuesday_enabled,
            tuesday_start:
              settings.tuesday_start,
            tuesday_end:
              settings.tuesday_end,

            wednesday_enabled:
              settings.wednesday_enabled,
            wednesday_start:
              settings.wednesday_start,
            wednesday_end:
              settings.wednesday_end,

            thursday_enabled:
              settings.thursday_enabled,
            thursday_start:
              settings.thursday_start,
            thursday_end:
              settings.thursday_end,

            friday_enabled:
              settings.friday_enabled,
            friday_start:
              settings.friday_start,
            friday_end:
              settings.friday_end,

            saturday_enabled:
              settings.saturday_enabled,
            saturday_start:
              settings.saturday_start,
            saturday_end:
              settings.saturday_end,

            sunday_enabled:
              settings.sunday_enabled,
            sunday_start:
              settings.sunday_start,
            sunday_end:
              settings.sunday_end,

            lunch_enabled:
              settings.lunch_enabled,
            lunch_start:
              settings.lunch_start,
            lunch_end:
              settings.lunch_end,

            appointment_duration:
              settings.appointment_duration,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          'Erro ao salvar configurações'
        )
      }

      const data = await response.json()

      setSettings(data)

      alert(
        'Horários de atendimento salvos com sucesso!'
      )
    } catch (error) {
      console.error(error)

      alert(
        'Não foi possível salvar os horários.'
      )
    } finally {
      setSettingsSaving(false)
    }
  }

  useEffect(() => {
    loadFaqs()
    loadSettings()
  }, [])

  // Criar FAQ
  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault()

    if (!question.trim() || !answer.trim()) {
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        'http://localhost:3000/faqs',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question,
            answer,
          }),
        }
      )

      if (response.status === 409) {
        alert(
          'Já existe uma resposta cadastrada para essa pergunta.'
        )
        return
      }

      if (!response.ok) {
        throw new Error(
          'Erro ao cadastrar FAQ'
        )
      }

      setQuestion('')
      setAnswer('')
      setShowForm(false)

      await loadFaqs()
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  // Editar FAQ
  const handleEdit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault()

    if (
      !editingFAQ ||
      !editingFAQ.question.trim() ||
      !editingFAQ.answer.trim()
    ) {
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        `http://localhost:3000/faqs/${editingFAQ.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question:
              editingFAQ.question.trim(),
            answer:
              editingFAQ.answer.trim(),
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          'Erro ao editar FAQ'
        )
      }

      setEditingFAQ(null)

      await loadFaqs()
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  // Ativar / desativar FAQ
  const toggleFAQ = async (faq: FAQ) => {
    try {
      const response = await fetch(
        `http://localhost:3000/faqs/${faq.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            active: !faq.active,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          'Erro ao alterar FAQ'
        )
      }

      await loadFaqs()
    } catch (error) {
      console.error(error)
    }
  }

  // Excluir FAQ
  const deleteFAQ = async (id: string) => {
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir esta resposta automática?'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `http://localhost:3000/faqs/${id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error(
          'Erro ao excluir FAQ'
        )
      }

      await loadFaqs()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <main className="min-w-0 flex-1 overflow-y-auto p-8">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Configurações
          </h2>

          <p className="mt-1 text-gray-500">
            Configure as respostas automáticas do FisioBot.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(true)
            setEditingFAQ(null)
          }}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Nova resposta
        </button>
      </div>

      {/* Configurações de horários */}
      <div className="mt-6 rounded-xl border bg-white p-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Horários de atendimento
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Defina os dias e horários em que a fisioterapeuta estará disponível.
          </p>
        </div>

        {settingsLoading ? (
          <p className="mt-6 text-sm text-gray-500">
            Carregando configurações...
          </p>
        ) : !settings ? (
          <p className="mt-6 text-sm text-red-500">
            Não foi possível carregar as configurações.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {[
              {
                label: 'Segunda-feira',
                enabled: 'monday_enabled',
                start: 'monday_start',
                end: 'monday_end',
              },
              {
                label: 'Terça-feira',
                enabled: 'tuesday_enabled',
                start: 'tuesday_start',
                end: 'tuesday_end',
              },
              {
                label: 'Quarta-feira',
                enabled: 'wednesday_enabled',
                start: 'wednesday_start',
                end: 'wednesday_end',
              },
              {
                label: 'Quinta-feira',
                enabled: 'thursday_enabled',
                start: 'thursday_start',
                end: 'thursday_end',
              },
              {
                label: 'Sexta-feira',
                enabled: 'friday_enabled',
                start: 'friday_start',
                end: 'friday_end',
              },
              {
                label: 'Sábado',
                enabled: 'saturday_enabled',
                start: 'saturday_start',
                end: 'saturday_end',
              },
              {
                label: 'Domingo',
                enabled: 'sunday_enabled',
                start: 'sunday_start',
                end: 'sunday_end',
              },
            ].map((day) => (
              <div
                key={day.enabled}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <label className="flex w-40 shrink-0 items-center gap-3">
                  <input
                    type="checkbox"
                    checked={
                      settings[
                        day.enabled as keyof ClinicSettings
                      ] as boolean
                    }
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        [day.enabled]:
                          event.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />

                  <span className="text-sm font-medium text-gray-700">
                    {day.label}
                  </span>
                </label>

                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={
                      settings[
                        day.start as keyof ClinicSettings
                      ] as string
                    }
                    disabled={
                      !settings[
                        day.enabled as keyof ClinicSettings
                      ]
                    }
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        [day.start]:
                          event.target.value,
                      })
                    }
                    className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                  />

                  <span className="text-sm text-gray-400">
                    até
                  </span>

                  <input
                    type="time"
                    value={
                      settings[
                        day.end as keyof ClinicSettings
                      ] as string
                    }
                    disabled={
                      !settings[
                        day.enabled as keyof ClinicSettings
                      ]
                    }
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        [day.end]:
                          event.target.value,
                      })
                    }
                    className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>
              </div>
            ))}

            {/* Intervalo */}
            <div className="mt-6 rounded-lg border p-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.lunch_enabled}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      lunch_enabled:
                        event.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />

                <span className="text-sm font-medium text-gray-700">
                  Intervalo
                </span>
              </label>

              <div className="mt-4 flex items-center gap-3">
                <input
                  type="time"
                  value={settings.lunch_start}
                  disabled={!settings.lunch_enabled}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      lunch_start:
                        event.target.value,
                    })
                  }
                  className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                />

                <span className="text-sm text-gray-400">
                  até
                </span>

                <input
                  type="time"
                  value={settings.lunch_end}
                  disabled={!settings.lunch_enabled}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      lunch_end:
                        event.target.value,
                    })
                  }
                  className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
            </div>

            {/* Duração */}
            <div className="mt-6 rounded-lg border p-4">
              <label className="text-sm font-medium text-gray-700">
                Duração da consulta
              </label>

              <select
                value={settings.appointment_duration}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    appointment_duration:
                      Number(event.target.value),
                  })
                }
                className="mt-2 rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
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

            <div className="flex justify-end pt-2">
              <button
                onClick={saveSettings}
                disabled={settingsSaving}
                className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {settingsSaving
                  ? 'Salvando...'
                  : 'Salvar horários'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <div className="mt-6 rounded-xl border bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Nova resposta automática
          </h3>

          <form
            onSubmit={handleSubmit}
            className="mt-5 space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-gray-700">
                Pergunta
              </label>

              <input
                type="text"
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                placeholder="Ex.: Qual o valor da consulta?"
                className="mt-1 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Resposta
              </label>

              <textarea
                value={answer}
                onChange={(event) =>
                  setAnswer(event.target.value)
                }
                placeholder="Digite a resposta que o bot deverá enviar..."
                rows={4}
                className="mt-1 w-full resize-none rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setQuestion('')
                  setAnswer('')
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
                  ? 'Salvando...'
                  : 'Salvar resposta'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Formulário de edição */}
      {editingFAQ && (
        <div className="mt-6 rounded-xl border bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Editar resposta automática
          </h3>

          <form
            onSubmit={handleEdit}
            className="mt-5 space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-gray-700">
                Pergunta
              </label>

              <input
                type="text"
                value={editingFAQ.question}
                onChange={(event) =>
                  setEditingFAQ({
                    ...editingFAQ,
                    question:
                      event.target.value,
                  })
                }
                className="mt-1 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Resposta
              </label>

              <textarea
                value={editingFAQ.answer}
                onChange={(event) =>
                  setEditingFAQ({
                    ...editingFAQ,
                    answer:
                      event.target.value,
                  })
                }
                rows={4}
                className="mt-1 w-full resize-none rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  setEditingFAQ(null)
                }
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
                  ? 'Salvando...'
                  : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de FAQs */}
      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">
            Carregando respostas...
          </p>
        ) : faqs.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">
            Nenhuma resposta automática cadastrada.
          </p>
        ) : (
          <div className="divide-y">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="flex items-start justify-between gap-6 p-5"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">
                    {faq.question}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {faq.answer}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingFAQ(faq)
                      setShowForm(false)
                    }}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() =>
                      toggleFAQ(faq)
                    }
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      faq.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {faq.active
                      ? 'Ativa'
                      : 'Desativada'}
                  </button>

                  <button
                    onClick={() =>
                      deleteFAQ(faq.id)
                    }
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default Configuracoes