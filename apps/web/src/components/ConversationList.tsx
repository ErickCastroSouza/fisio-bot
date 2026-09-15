import { useEffect, useState } from 'react'

type Patient = {
  id: string
  name: string
  phone: string
}

type Conversation = {
  id: string
  status: 'bot' | 'human' | 'closed'
  last_message_at: string
  patient: Patient
}

type ConversationListProps = {
  onSelectConversation: (
    conversation: Conversation
  ) => void
  initialConversationId?: string
}

function ConversationList({
  onSelectConversation,
  initialConversationId,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<
    Conversation[]
  >([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await fetch(
          'http://localhost:3000/conversations'
        )

        if (!response.ok) {
          throw new Error(
            'Erro ao buscar conversas'
          )
        }

        const data = await response.json()

        setConversations(data)

        // Seleciona automaticamente a conversa
        // enviada pelo Dashboard
        if (initialConversationId) {
          const conversation = data.find(
            (item: Conversation) =>
              item.id === initialConversationId
          )

          if (conversation) {
            onSelectConversation(conversation)
          }
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadConversations()
  }, [
    initialConversationId,
    onSelectConversation,
  ])

  return (
    <div className="w-80 border-r bg-white">
      <div className="border-b px-5 py-4">
        <h2 className="font-semibold text-gray-900">
          Conversas
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {conversations.length} conversas recentes
        </p>
      </div>

      <div>
        {loading ? (
          <p className="p-5 text-sm text-gray-500">
            Carregando conversas...
          </p>
        ) : conversations.length === 0 ? (
          <p className="p-5 text-sm text-gray-500">
            Nenhuma conversa encontrada.
          </p>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() =>
                onSelectConversation(conversation)
              }
              className="flex w-full gap-3 border-b px-4 py-4 text-left hover:bg-gray-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 font-semibold">
                {conversation.patient.name.charAt(0)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">
                    {conversation.patient.name}
                  </p>

                  <span className="text-xs text-gray-400">
                    {new Date(
                      conversation.last_message_at
                    ).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="mt-1 truncate text-sm text-gray-500">
                  Atendimento {conversation.status}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default ConversationList