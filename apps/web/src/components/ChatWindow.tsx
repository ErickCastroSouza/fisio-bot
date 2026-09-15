import { useEffect, useState } from 'react'

type Conversation = {
  id: string
  patient: {
    id: string
    name: string
    phone: string
  }
}

type Message = {
  id: string
  sender_type: 'patient' | 'bot' | 'therapist'
  content: string
  created_at: string
}

type ChatWindowProps = {
  conversation: Conversation | null
}

function ChatWindow({
  conversation,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!conversation) {
      setMessages([])
      return
    }

    const loadMessages = async () => {
      setLoading(true)

      try {
        const response = await fetch(
          `http://localhost:3000/conversations/${conversation.id}/messages`
        )

        if (!response.ok) {
          throw new Error('Erro ao buscar mensagens')
        }

        const data = await response.json()

        setMessages(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [conversation])

const handleSend = async () => {
  if (!input.trim() || !conversation || sending) {
    return
  }

  const message = input.trim()

  setSending(true)

  try {
    const response = await fetch(
      `http://localhost:3000/conversations/${conversation.id}/bot`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Erro ao enviar mensagem')
    }

    const data = await response.json()

    // Adiciona a mensagem do paciente
    const patientMessage = {
      id: crypto.randomUUID(),
      sender_type: 'patient' as const,
      content: message,
      created_at: new Date().toISOString(),
    }

    // Adiciona a resposta do bot
    setMessages((current) => [
      ...current,
      patientMessage,
      data.botMessage,
    ])

    setInput('')
  } catch (error) {
    console.error(error)
  } finally {
    setSending(false)
  }
}

  if (!conversation) {
    return (
      <section className="flex min-w-0 flex-1 items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="font-semibold text-gray-700">
            Nenhuma conversa selecionada
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Selecione uma conversa para começar.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-gray-50">
      {/* Cabeçalho */}
      <div className="border-b bg-white px-6 py-4">
        <h2 className="font-semibold text-gray-900">
          {conversation.patient.name}
        </h2>

        <p className="text-sm text-gray-500">
          {conversation.patient.phone}
        </p>
      </div>

      {/* Mensagens */}
      <div className="flex-1 space-y-3 overflow-y-auto p-6">
        {loading ? (
          <p className="text-sm text-gray-500">
            Carregando mensagens...
          </p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nenhuma mensagem ainda.
          </p>
        ) : (
          messages.map((message) => {
            const isPatient =
              message.sender_type === 'patient'

            return (
              <div
                key={message.id}
                className={`flex ${
                  isPatient
                    ? 'justify-start'
                    : 'justify-end'
                }`}
              >
                <div
                  className={`max-w-md rounded-2xl px-4 py-3 ${
                    isPatient
                      ? 'bg-white text-gray-900'
                      : 'bg-gray-900 text-white'
                  }`}
                >
                  <p className="text-sm">
                    {message.content}
                  </p>

                  <p
                    className={`mt-1 text-xs ${
                      isPatient
                        ? 'text-gray-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {new Date(
                      message.created_at
                    ).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Campo de mensagem */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSend()
              }
            }}
            placeholder="Digite uma mensagem..."
            className="flex-1 rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
          />

          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
    </section>
  )
}

export default ChatWindow