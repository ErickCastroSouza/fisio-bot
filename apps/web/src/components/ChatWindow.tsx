import {
  useEffect,
  useRef,
  useState,
} from 'react'

type Patient = {
  id: string
  name: string
  phone: string
}

type Conversation = {
  id: string
  patient: Patient
}

type Message = {
  id: string
  sender_type:
    | 'patient'
    | 'bot'
    | 'therapist'
  content: string
  created_at: string
}

type ChatWindowProps = {
  conversation: Conversation | null
  onBack?: () => void
  onPatientInfo?: () => void
}

function ChatWindow({
  conversation,
  onBack,
  onPatientInfo,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<
    Message[]
  >([])

  const [input, setInput] = useState('')

  const [loading, setLoading] =
    useState(false)

  const [sending, setSending] =
    useState(false)

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!conversation) {
      setMessages([])
      return
    }

    loadMessages()
  }, [conversation?.id])

  useEffect(() => {
    scrollToBottom()
  }, [
    messages,
    conversation?.id,
    loading,
  ])

  async function loadMessages() {
    if (!conversation) {
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        `http://localhost:3000/conversations/${conversation.id}/messages`
      )

      if (!response.ok) {
        throw new Error(
          'Erro ao carregar mensagens'
        )
      }

      const data = await response.json()

      setMessages(data)
    } catch (error) {
      console.error(error)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'auto',
        block: 'end',
      })
    })
  }

async function handleSend() {
  if (
    !conversation ||
    !input.trim() ||
    sending
  ) {
    return
  }

  const content = input.trim()

  try {
    setSending(true)

    const response = await fetch(
      `http://localhost:3000/conversations/${conversation.id}/bot`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(
        'Erro ao enviar mensagem'
      )
    }

    const data = await response.json()

    console.log('RESPOSTA DO BOT:', data)

    if (data.patientMessage) {
      setMessages((current) => [
        ...current,
        data.patientMessage,
      ])
    }

    if (data.botMessage) {
      setMessages((current) => [
        ...current,
        data.botMessage,
      ])
    }

    setInput('')
  } catch (error) {
    console.error(error)

    alert(
      'Não foi possível enviar a mensagem.'
    )
  } finally {
    setSending(false)
  }
}

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSend()
    }
  }

  function formatTime(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!conversation) {
    return (
      <section className="hidden h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white lg:flex">
        <div className="flex h-full items-center justify-center px-6 text-center">
          <div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eee9f5] text-2xl">
              💬
            </div>

            <h3 className="mt-4 text-sm font-semibold text-[#4a454e]">
              Nenhuma conversa selecionada
            </h3>

            <p className="mt-1 max-w-xs text-xs leading-5 text-[#918b96]">
              Selecione uma conversa ao lado
              para iniciar o atendimento.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#f8f7f9]">
      {/* Cabeçalho */}
      <header className="flex h-[73px] shrink-0 items-center justify-between border-b border-[#e8e3ec] bg-white px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-[#625d66] transition hover:bg-[#f3eff6] lg:hidden"
              aria-label="Voltar para conversas"
            >
              ←
            </button>
          )}

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d9c9df] text-sm font-bold text-[#644498]">
            {conversation.patient.name
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-[#3f3a43] sm:text-base">
              {conversation.patient.name}
            </h2>

            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7fa77c]" />

              <span className="text-[10px] text-[#63845f] sm:text-xs">
                FisioBot
              </span>
            </div>
          </div>
        </div>

        {onPatientInfo && (
          <button
            type="button"
            onClick={onPatientInfo}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#644498] transition hover:bg-[#f3eff6] xl:hidden"
            aria-label="Informações do paciente"
          >
            <span className="text-base">
              ⓘ
            </span>
          </button>
        )}
      </header>

      {/* Histórico */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 pb-32 sm:px-6 sm:py-6 lg:pb-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-[#644498]/20 border-t-[#644498]" />

                <p className="mt-3 text-xs text-[#918b96]">
                  Carregando mensagens...
                </p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eee9f5] text-[#644498]">
                  💬
                </div>

                <p className="mt-3 text-sm font-medium text-[#5f5963]">
                  Nenhuma mensagem
                </p>

                <p className="mt-1 text-xs text-[#918b96]">
                  Envie uma mensagem para
                  iniciar a conversa.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isPatient =
                message.sender_type ===
                'patient'

              const isBot =
                message.sender_type ===
                'bot'

              return (
                <div
                  key={message.id}
                  className={`flex w-full ${
                    isPatient
                      ? 'justify-start'
                      : 'justify-end'
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] ${
                      isPatient
                        ? 'items-start'
                        : 'items-end'
                    }`}
                  >
                    <div
                      className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-5 shadow-sm ${
                        isPatient
                          ? 'rounded-tl-md border border-[#e8e3ec] bg-white text-[#4d4850]'
                          : isBot
                            ? 'rounded-tr-md bg-[#eee9f5] text-[#4d3479]'
                            : 'rounded-tr-md bg-[#dcebd9] text-[#465a43]'
                      }`}
                    >
                      {message.content}
                    </div>

                    <div
                      className={`mt-1 px-1 text-[10px] text-[#aaa4af] ${
                        isPatient
                          ? 'text-left'
                          : 'text-right'
                      }`}
                    >
                      {formatTime(
                        message.created_at
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}

          <div
            ref={messagesEndRef}
            className="h-px w-full"
          />
        </div>
      </div>

      {/* Campo de mensagem */}
      <div
        className="
          fixed
          bottom-20
          left-0
          right-0
          z-30
          border-t
          border-[#e8e3ec]
          bg-white
          px-3
          py-2.5
          shadow-[0_-4px_12px_rgba(77,52,121,0.05)]
          sm:px-5
          sm:py-4
          lg:static
          lg:z-auto
          lg:shrink-0
          lg:border-t
          lg:bg-white
          lg:px-5
          lg:py-4
          lg:shadow-none
        "
      >
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex items-center gap-2 rounded-xl border border-[#ddd7e1] bg-[#fcfbfd] p-1.5 transition focus-within:border-[#9b82b8] focus-within:ring-4 focus-within:ring-[#644498]/10">
            <input
              type="text"
              value={input}
              onChange={(event) =>
                setInput(
                  event.target.value
                )
              }
              onKeyDown={handleKeyDown}
              disabled={sending}
              placeholder="Digite uma mensagem..."
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[#454049] outline-none placeholder:text-[#aaa4af] disabled:opacity-50"
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={
                sending ||
                !input.trim()
              }
              className="flex h-9 shrink-0 items-center justify-center rounded-lg bg-[#644498] px-3 text-sm font-semibold text-white transition hover:bg-[#553987] disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
            >
              {sending
                ? '...'
                : 'Enviar'}
            </button>
          </div>

          <p className="mx-auto mt-2 hidden px-1 text-[10px] text-[#aaa4af] sm:block lg:hidden">
            Pressione Enter para enviar
          </p>

          <p className="mx-auto mt-2 hidden px-1 text-[10px] text-[#aaa4af] lg:block">
            Pressione Enter para enviar
          </p>
        </div>
      </div>
    </section>
  )
}

export default ChatWindow