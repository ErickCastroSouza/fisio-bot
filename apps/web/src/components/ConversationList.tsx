import { useEffect, useState } from 'react'
import { API_URL } from '../config'

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
  const [conversations, setConversations] =
    useState<Conversation[]>([])

  const [selectedId, setSelectedId] =
    useState<string | undefined>(
      initialConversationId
    )

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await fetch(
          `${API_URL}/conversations`
        )

        if (!response.ok) {
          throw new Error(
            'Erro ao buscar conversas'
          )
        }

        const data: Conversation[] =
          await response.json()

        setConversations(data)

        if (initialConversationId) {
          const conversation = data.find(
            (item) =>
              item.id ===
              initialConversationId
          )

          if (conversation) {
            setSelectedId(
              conversation.id
            )

            onSelectConversation(
              conversation
            )
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

  function handleSelect(
    conversation: Conversation
  ) {
    setSelectedId(conversation.id)
    onSelectConversation(conversation)
  }

  function getStatusLabel(
    status: Conversation['status']
  ) {
    if (status === 'human') {
      return 'Atendimento humano'
    }

    if (status === 'closed') {
      return 'Encerrada'
    }

    return 'FisioBot'
  }

  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-r border-[#e8e3ec] bg-[#fcfbfd] lg:w-80">
      {/* Cabeçalho */}
      <div className="border-b border-[#eeeaf0] px-5 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[#3f3a43]">
              Conversas
            </h2>

            <p className="mt-1 text-xs text-[#918b96]">
              {conversations.length}{' '}
              conversas recentes
            </p>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eee9f5] text-[#644498]">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 0 1 4 11.5 8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center">
            <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-[#644498]/20 border-t-[#644498]" />

            <p className="mt-3 text-xs text-[#918b96]">
              Carregando conversas...
            </p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-6 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#eee9f5] text-[#644498]">
              —
            </div>

            <p className="mt-3 text-sm font-medium text-[#5f5963]">
              Nenhuma conversa
            </p>

            <p className="mt-1 text-xs text-[#918b96]">
              As novas conversas aparecerão aqui.
            </p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const isSelected =
              selectedId === conversation.id

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() =>
                  handleSelect(conversation)
                }
                className={`group relative flex w-full gap-3 border-b border-[#eeeaf0] px-4 py-4 text-left transition active:bg-[#eee9f5] ${
                  isSelected
                    ? 'bg-[#eee9f5]'
                    : 'hover:bg-white'
                }`}
              >
                {isSelected && (
                  <span className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-[#644498]" />
                )}

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    isSelected
                      ? 'bg-[#644498] text-white'
                      : 'bg-[#d9c9df] text-[#644498]'
                  }`}
                >
                  {conversation.patient.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`truncate text-sm font-semibold ${
                        isSelected
                          ? 'text-[#4d3479]'
                          : 'text-[#454049]'
                      }`}
                    >
                      {conversation.patient.name}
                    </p>

                    <span className="shrink-0 text-[10px] text-[#aaa4af]">
                      {new Date(
                        conversation.last_message_at
                      ).toLocaleTimeString(
                        'pt-BR',
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        conversation.status ===
                        'human'
                          ? 'bg-[#c98b62]'
                          : conversation.status ===
                              'closed'
                            ? 'bg-[#aaa4af]'
                            : 'bg-[#7fa77c]'
                      }`}
                    />

                    <p className="truncate text-xs text-[#918b96]">
                      {getStatusLabel(
                        conversation.status
                      )}
                    </p>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </aside>
  )
}

export default ConversationList