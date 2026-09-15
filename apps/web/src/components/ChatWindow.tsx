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

  /*
   * Carrega as mensagens sempre que
   * uma nova conversa é selecionada.
   */
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
          throw new Error(
            'Erro ao buscar mensagens'
          )
        }

        const data: Message[] =
          await response.json()

        setMessages(data)
      } catch (error) {
        console.error(
          'Erro ao carregar mensagens:',
          error
        )

        setMessages([])
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [conversation])

  /*
   * Envia uma mensagem para o backend.
   *
   * O backend:
   * 1. Salva a mensagem do paciente
   * 2. Processa a resposta do bot
   * 3. Salva a resposta do bot
   * 4. Retorna as duas mensagens
   */
  const handleSend = async () => {
    if (
      !input.trim() ||
      !conversation ||
      sending
    ) {
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
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            content: message,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          'Erro ao enviar mensagem'
        )
      }

      const data = await response.json()

      /*
       * O backend retorna:
       *
       * data.patientMessage
       * data.botMessage
       */
      setMessages((current) => [
        ...current,
        data.patientMessage,
        data.botMessage,
      ])

      setInput('')
    } catch (error) {
      console.error(
        'Erro ao enviar mensagem:',
        error
      )
    } finally {
      setSending(false)
    }
  }

  /*
   * Permite enviar pressionando Enter.
   */
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSend()
    }
  }

  /*
   * Nenhuma conversa selecionada.
   */
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
      {/* Cabeçalho da conversa */}
      <div className="border-b bg-white px-6 py-4">
        <h2 className="font-semibold text-gray-900">
          {conversation.patient.name}
        </h2>

        <p className="text-sm text-gray-500">
          {conversation.patient.phone}
        </p>
      </div>

      {/* Área das mensagens */}
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
              message.sender_type ===
              'patient'

            const isTherapist =
              message.sender_type ===
              'therapist'

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
                      : isTherapist
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-900 text-white'
                  }`}
                >
                  {/* Identificação da mensagem */}
                  {!isPatient && (
                    <p className="mb-1 text-xs font-medium opacity-70">
                      {isTherapist
                        ? 'Fisioterapeuta'
                        : 'FisioBot'}
                    </p>
                  )}

                  <p className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </p>

                  <p
                    className={`mt-1 text-xs ${
                      isPatient
                        ? 'text-gray-400'
                        : 'text-gray-300'
                    }`}
                  >
                    {new Date(
                      message.created_at
                    ).toLocaleTimeString(
                      'pt-BR',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
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
            onKeyDown={handleKeyDown}
            disabled={sending}
            placeholder="Digite uma mensagem..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={
              sending || !input.trim()
            }
            className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending
              ? 'Enviando...'
              : 'Enviar'}
          </button>
        </div>
      </div>
    </section>
  )
}

export default ChatWindow