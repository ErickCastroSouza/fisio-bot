import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import ConversationList from '../components/ConversationList'
import ChatWindow from '../components/ChatWindow'
import PatientInfo from '../components/PatientInfo'
import { API_URL } from '../config'

type SelectedConversation = {
  id: string
  patient: {
    id: string
    name: string
    phone: string
  }
}

type Patient = {
  id: string
  name: string
  phone: string
}

function Conversas() {
  const location = useLocation()

  const conversationId =
    location.state?.conversationId

  const [
    selectedConversation,
    setSelectedConversation,
  ] = useState<SelectedConversation | null>(
    null
  )

  const [patients, setPatients] = useState<
    Patient[]
  >([])

  const [showNewConversation, setShowNewConversation] =
    useState(false)

  const [selectedPatientId, setSelectedPatientId] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [showMobileList, setShowMobileList] =
    useState(true)

  const [showMobilePatientInfo, setShowMobilePatientInfo] =
    useState(false)

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    if (conversationId) {
      setShowMobileList(false)
    }
  }, [conversationId])

  async function loadPatients() {
    try {
      const response = await fetch(
        `${API_URL}/patients`
      )

      if (!response.ok) {
        throw new Error(
          'Erro ao carregar pacientes'
        )
      }

      const data = await response.json()

      setPatients(data)
    } catch (error) {
      console.error(error)
    }
  }

  async function createConversation() {
    if (!selectedPatientId) {
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        `${API_URL}/conversations`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            patient_id:
              selectedPatientId,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          'Erro ao criar conversa'
        )
      }

      const conversation =
        await response.json()

      const patient = patients.find(
        (item) =>
          item.id === selectedPatientId
      )

      if (!patient) {
        throw new Error(
          'Paciente não encontrado'
        )
      }

      setSelectedConversation({
        id: conversation.id,
        patient: {
          id: patient.id,
          name: patient.name,
          phone: patient.phone,
        },
      })

      setShowNewConversation(false)
      setSelectedPatientId('')
      setShowMobileList(false)
    } catch (error) {
      console.error(error)

      alert(
        'Não foi possível criar a conversa.'
      )
    } finally {
      setLoading(false)
    }
  }

  function handleBackToList() {
    setShowMobilePatientInfo(false)
    setShowMobileList(true)
  }

  function handleSelectConversation(
    conversation: SelectedConversation
  ) {
    setSelectedConversation(conversation)
    setShowMobileList(false)
    setShowMobilePatientInfo(false)
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[#f8f7f9]">
      {/* Cabeçalho da página */}
      <header className="flex shrink-0 items-center justify-between border-b border-[#e8e3ec] bg-white px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b7aa3]">
            Atendimento
          </p>

          <h1 className="mt-1 text-xl font-bold tracking-tight text-[#3f3a43] sm:text-2xl">
            Conversas
          </h1>

          <p className="mt-1 hidden text-sm text-[#85808b] sm:block">
            Gerencie as conversas e acompanhe
            seus pacientes.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowNewConversation(true)
          }
          className="flex items-center gap-2 rounded-xl bg-[#644498] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#553987] hover:shadow-md active:scale-[0.98] sm:px-4"
        >
          <span className="text-lg leading-none">
            +
          </span>

          <span className="hidden sm:inline">
            Nova conversa
          </span>

          <span className="sm:hidden">
            Nova
          </span>
        </button>
      </header>

      {/* Área das conversas */}
      <div className="min-h-0 flex-1 overflow-hidden p-2 sm:p-4 lg:p-5">
        <div className="flex h-full min-h-0 overflow-hidden rounded-2xl border border-[#e8e3ec] bg-white shadow-[0_3px_15px_rgba(77,52,121,0.05)]">
          {/* Lista de conversas */}
          <div
            className={`h-full min-h-0 w-full shrink-0 lg:flex lg:w-80 ${
              showMobileList
                ? 'flex'
                : 'hidden'
            }`}
          >
            <ConversationList
              onSelectConversation={
                handleSelectConversation
              }
              initialConversationId={
                conversationId
              }
            />
          </div>

          {/* Chat */}
          <div
            className={`h-full min-h-0 min-w-0 flex-1 ${
              showMobileList
                ? 'hidden lg:flex'
                : 'flex'
            }`}
          >
            <ChatWindow
              conversation={
                selectedConversation
              }
              onBack={
                handleBackToList
              }
              onPatientInfo={() =>
                setShowMobilePatientInfo(
                  true
                )
              }
            />
          </div>

          {/* Informações do paciente */}
          <div
            className={`h-full min-h-0 w-72 shrink-0 xl:flex ${
              showMobilePatientInfo
                ? 'fixed inset-0 z-50 flex w-full bg-[#2d2438]/30 p-4 backdrop-blur-sm xl:static xl:w-72 xl:bg-transparent xl:p-0 xl:backdrop-blur-none'
                : 'hidden'
            }`}
          >
            <div
              className={`h-full w-full overflow-hidden bg-white xl:block ${
                showMobilePatientInfo
                  ? 'rounded-2xl xl:rounded-none'
                  : ''
              }`}
            >
              <PatientInfo
                patient={
                  selectedConversation?.patient ??
                  null
                }
              />

              {showMobilePatientInfo && (
                <button
                  type="button"
                  onClick={() =>
                    setShowMobilePatientInfo(
                      false
                    )
                  }
                  className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#625d66] shadow-sm xl:hidden"
                  aria-label="Fechar informações"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal nova conversa */}
      {showNewConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d2438]/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#e8e3ec] bg-white shadow-2xl">
            <div className="border-b border-[#eeeaf0] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eee9f5] text-[#644498]">
                  +
                </div>

                <div>
                  <h2 className="font-semibold text-[#3f3a43]">
                    Nova conversa
                  </h2>

                  <p className="mt-0.5 text-xs text-[#918b96]">
                    Inicie um novo atendimento.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#716a76]">
                Paciente
              </label>

              <select
                value={selectedPatientId}
                onChange={(event) =>
                  setSelectedPatientId(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-[#ddd7e1] bg-[#fcfbfd] px-4 py-3 text-sm text-[#454049] outline-none transition focus:border-[#8b6ab3] focus:ring-4 focus:ring-[#644498]/10"
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
                      {patient.name} —{' '}
                      {patient.phone}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#eeeaf0] bg-[#fcfbfd] px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setShowNewConversation(
                    false
                  )
                  setSelectedPatientId('')
                }}
                className="rounded-xl border border-[#ddd7e1] bg-white px-4 py-2.5 text-sm font-medium text-[#625d66] transition hover:bg-[#f6f4f7]"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  createConversation
                }
                disabled={
                  !selectedPatientId ||
                  loading
                }
                className="rounded-xl bg-[#644498] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#553987] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? 'Criando...'
                  : 'Criar conversa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Conversas