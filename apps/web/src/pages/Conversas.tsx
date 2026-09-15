import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import ConversationList from '../components/ConversationList'
import ChatWindow from '../components/ChatWindow'
import PatientInfo from '../components/PatientInfo'

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
  ] = useState<SelectedConversation | null>(null)

  const [patients, setPatients] = useState<
    Patient[]
  >([])

  const [showNewConversation, setShowNewConversation] =
    useState(false)

  const [selectedPatientId, setSelectedPatientId] =
    useState('')

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPatients()
  }, [])

  async function loadPatients() {
    try {
      const response = await fetch(
        'http://localhost:3000/patients'
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
        'http://localhost:3000/conversations',
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
    } catch (error) {
      console.error(error)
      alert(
        'Não foi possível criar a conversa.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-w-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Conversas
            </h1>

            <p className="text-sm text-gray-500">
              Atendimento e mensagens
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowNewConversation(true)
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            + Nova conversa
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
        <ConversationList
          onSelectConversation={
            setSelectedConversation
          }
          initialConversationId={
            conversationId
          }
        />

          <ChatWindow
            conversation={
              selectedConversation
            }
          />

          <PatientInfo
            patient={
              selectedConversation?.patient ??
              null
            }
          />
        </div>
      </div>

      {/* Modal nova conversa */}
      {showNewConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Nova conversa
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Selecione o paciente para
                iniciar uma conversa.
              </p>
            </div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Paciente
            </label>

            <select
              value={selectedPatientId}
              onChange={(event) =>
                setSelectedPatientId(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Selecione um paciente
              </option>

              {patients.map((patient) => (
                <option
                  key={patient.id}
                  value={patient.id}
                >
                  {patient.name} —{' '}
                  {patient.phone}
                </option>
              ))}
            </select>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowNewConversation(false)
                  setSelectedPatientId('')
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={createConversation}
                disabled={
                  !selectedPatientId ||
                  loading
                }
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? 'Criando...'
                  : 'Criar conversa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Conversas