import { supabase } from './lib/supabase.js'

type BotResponse = {
  response: string
  shouldTransfer: boolean
  nextState?: string
  appointmentDate?: string
  appointmentTime?: string
}

type BotSettings = {
  welcome_message: string
  menu_instruction: string
}

type BotMenuOption = {
  option_number: number
  title: string
  response: string
  active: boolean
  transfer_to_human: boolean
}

async function getBotSettings() {
  const {
    data: settings,
    error: settingsError,
  } = await supabase
    .from('bot_settings')
    .select(
      'welcome_message, menu_instruction'
    )
    .limit(1)
    .maybeSingle()

  if (settingsError) {
    throw settingsError
  }

  if (!settings) {
    throw new Error(
      'Configurações do bot não encontradas'
    )
  }

  const {
    data: options,
    error: optionsError,
  } = await supabase
    .from('bot_menu_options')
    .select(`
      option_number,
      title,
      response,
      active,
      transfer_to_human
    `)
    .eq('active', true)
    .order('option_number', {
      ascending: true,
    })

  if (optionsError) {
    throw optionsError
  }

  return {
    settings: settings as BotSettings,
    options:
      (options ?? []) as BotMenuOption[],
  }
}

export async function getBotMenu() {
  const {
    settings,
    options,
  } = await getBotSettings()

  const menuOptions = options
    .map(
      (option) =>
        `${option.option_number}️⃣ ${option.title}`
    )
    .join('\n')

  return `${settings.welcome_message}

Como podemos ajudar?

${menuOptions}

${settings.menu_instruction}`
}

function normalizeText(text: string) {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/**
 * Valida uma data no formato DD/MM ou DD/MM/AAAA.
 */
function parseDate(
  value: string
): string | null {
  const normalized = value
    .trim()
    .replace(/-/g, '/')

  const parts = normalized.split('/')

  if (
    parts.length !== 2 &&
    parts.length !== 3
  ) {
    return null
  }

  const day = Number(parts[0])
  const month = Number(parts[1])

  let year =
    parts.length === 3
      ? Number(parts[2])
      : new Date().getFullYear()

  if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    !Number.isInteger(year)
  ) {
    return null
  }

  if (year < 100) {
    year += 2000
  }

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  )

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  const today = new Date()
  const todayUtc = new Date(
    Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )
  )

  if (date < todayUtc) {
    return null
  }

  return `${year.toString().padStart(4, '0')}-${month
    .toString()
    .padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}`
}

/**
 * Valida horário no formato HH:MM.
 */
function parseTime(
  value: string
): string | null {
  const match =
    value
      .trim()
      .match(
        /^([01]\d|2[0-3]):([0-5]\d)$/
      )

  if (!match) {
    return null
  }

  return `${match[1]}:${match[2]}`
}

function formatDate(
  date: string
) {
  const [
    year,
    month,
    day,
  ] = date.split('-')

  return `${day}/${month}/${year}`
}

function formatTime(
  time: string
) {
  return time.slice(0, 5)
}

async function getAvailableTimes(
  date: string
) {
  const response = await fetch(
    `${process.env.API_URL || 'http://localhost:3000'}/appointments/available?date=${date}`
  )

  if (!response.ok) {
    throw new Error(
      'Erro ao consultar horários disponíveis'
    )
  }

  return response.json() as Promise<{
    available: string[]
  }>
}

export async function getBotResponse(
  message: string,
  state: string = 'idle',
  appointmentDate?: string | null,
  appointmentTime?: string | null
): Promise<BotResponse> {
  const text = normalizeText(message)

  // ==================================================
  // MENU
  // ==================================================

  if (
    text === '0' ||
    text === 'menu' ||
    text === 'inicio'
  ) {
    return {
      response: await getBotMenu(),
      shouldTransfer: false,
      nextState: 'idle',
    }
  }

  // ==================================================
  // AGENDAMENTO — DATA
  // ==================================================

  if (state === 'waiting_date') {
    const date = parseDate(message)

    if (!date) {
      return {
        response: `Não consegui identificar essa data.

Por favor, informe no formato DD/MM.

Exemplo: 20/09`,
        shouldTransfer: false,
        nextState: 'waiting_date',
      }
    }

    const availability =
      await getAvailableTimes(date)

    if (
      !availability.available ||
      availability.available.length === 0
    ) {
      return {
        response: `Não temos horários disponíveis para ${formatDate(date)}.

Por favor, informe outra data.`,
        shouldTransfer: false,
        nextState: 'waiting_date',
      }
    }

    const times =
      availability.available

    const formattedTimes = times
      .map(
        (time, index) =>
          `${index + 1}️⃣ ${formatTime(time)}`
      )
      .join('\n')

    return {
      response: `📅 Horários disponíveis para ${formatDate(date)}:

${formattedTimes}

Digite o número do horário desejado.`,
      shouldTransfer: false,
      nextState: 'waiting_time',
      appointmentDate: date,
    }
  }

  // ==================================================
  // AGENDAMENTO — HORÁRIO
  // ==================================================

  if (
    state === 'waiting_time' &&
    appointmentDate
  ) {
    const availability =
      await getAvailableTimes(
        appointmentDate
      )

    if (
      !availability.available ||
      availability.available.length === 0
    ) {
      return {
        response: `Infelizmente os horários para ${formatDate(
          appointmentDate
        )} não estão mais disponíveis.

Vamos escolher outra data.

Informe o dia desejado no formato DD/MM.`,
        shouldTransfer: false,
        nextState: 'waiting_date',
      }
    }

    const optionNumber = Number(text)

    if (
      !Number.isInteger(optionNumber) ||
      optionNumber < 1 ||
      optionNumber >
        availability.available.length
    ) {
      return {
        response: `Não reconheci esse horário.

Por favor, escolha uma das opções disponíveis.`,
        shouldTransfer: false,
        nextState: 'waiting_time',
        appointmentDate,
      }
    }

    const selectedTime =
      availability.available[
        optionNumber - 1
      ]

    return {
      response: `📅 Você escolheu:

${formatDate(appointmentDate)} às ${formatTime(
        selectedTime
      )}

Deseja confirmar o agendamento?

1️⃣ Sim
2️⃣ Não`,
      shouldTransfer: false,
      nextState:
        'waiting_confirmation',
      appointmentDate,
      appointmentTime:
        selectedTime,
    }
  }

  // ==================================================
  // AGENDAMENTO — CONFIRMAÇÃO
  // ==================================================

  if (
    state === 'waiting_confirmation' &&
    appointmentDate &&
    appointmentTime
  ) {
    if (
      text === '1' ||
      text === 'sim' ||
      text === 's'
    ) {
      return {
        response: `Perfeito! Seu horário foi confirmado.

📅 Data: ${formatDate(
          appointmentDate
        )}
🕐 Horário: ${formatTime(
          appointmentTime
        )}

Estamos aguardando você. 😊`,
        shouldTransfer: false,
        nextState: 'idle',
        appointmentDate,
        appointmentTime,
      }
    }

    if (
      text === '2' ||
      text === 'nao' ||
      text === 'n'
    ) {
      return {
        response: `Tudo bem! O agendamento não foi realizado.

${await getBotMenu()}`,
        shouldTransfer: false,
        nextState: 'idle',
      }
    }

    return {
      response: `Por favor, escolha uma opção:

1️⃣ Sim
2️⃣ Não`,
      shouldTransfer: false,
      nextState:
        'waiting_confirmation',
      appointmentDate,
      appointmentTime,
    }
  }

  // ==================================================
  // OPÇÕES DO MENU
  // ==================================================

  const {
    options,
  } = await getBotSettings()

  const optionNumber = Number(text)

  if (
    Number.isInteger(optionNumber) &&
    optionNumber >= 1 &&
    optionNumber <= 6
  ) {
    const option = options.find(
      (item) =>
        item.option_number ===
        optionNumber
    )

    if (option) {
      // Opção 5 inicia o agendamento
      if (optionNumber === 5) {
        return {
          response:
            option.response,
          shouldTransfer: false,
          nextState:
            'waiting_date',
        }
      }

      return {
        response:
          option.response,
        shouldTransfer:
          option.transfer_to_human,
        nextState: 'idle',
      }
    }
  }

  // ==================================================
  // FAQ
  // ==================================================

  const {
    data: faqs,
    error: faqError,
  } = await supabase
    .from('faqs')
    .select(
      'id, question, answer'
    )
    .eq('active', true)

  if (faqError) {
    throw faqError
  }

  for (const faq of faqs ?? []) {
    const question =
      normalizeText(
        faq.question
      )

    const keywords = question
      .split(/\s+/)
      .filter(
        (word) => word.length >= 4
      )

    const matches =
      keywords.filter(
        (keyword) =>
          text.includes(keyword)
      )

    if (
      matches.length >=
      Math.min(
        2,
        keywords.length
      )
    ) {
      return {
        response: faq.answer,
        shouldTransfer: false,
        nextState: 'idle',
      }
    }
  }

  // ==================================================
  // NÃO ENTENDIDO
  // ==================================================

  return {
    response: `Não consegui entender sua solicitação.

${await getBotMenu()}`,
    shouldTransfer: false,
    nextState: 'idle',
  }
}