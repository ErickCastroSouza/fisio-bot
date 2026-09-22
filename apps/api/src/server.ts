import 'dotenv/config'

import Fastify from 'fastify'
import cors from '@fastify/cors'

import {
  getBotResponse,
  getBotMenu,
} from './bot.js'

import { supabase } from './lib/supabase.js'

export const app = Fastify({
  logger: true,
})

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
]

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(
    process.env.FRONTEND_URL
  )
}

app.register(cors, {
  origin: allowedOrigins,

  methods: [
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ],

  allowedHeaders: [
    'Content-Type',
  ],
})


// ======================================================
// ROOT
// ======================================================

app.get('/', async () => {
  return {
    message: 'FisioBot API funcionando!',
  }
})


// ======================================================
// PATIENTS
// ======================================================

app.get('/patients', async () => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', {
      ascending: false,
    })

  if (error) {
    throw error
  }

  return data
})


app.post('/patients', async (request, reply) => {
  const body = request.body as {
    name: string
    phone: string
    email?: string
  }

  if (!body.name?.trim() || !body.phone?.trim()) {
    return reply.code(400).send({
      error: 'Nome e telefone são obrigatórios',
    })
  }

  const { data, error } = await supabase
    .from('patients')
    .insert({
      name: body.name.trim(),
      phone: body.phone.trim(),
      email: body.email?.trim() || null,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return reply.code(201).send(data)
})


// ======================================================
// CONVERSATIONS
// ======================================================

app.get('/conversations', async () => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      status,
      last_message_at,
      created_at,
      patient:patients (
        id,
        name,
        phone
      )
    `)
    .order('last_message_at', {
      ascending: false,
    })

  if (error) {
    throw error
  }

  return data
})


app.post('/conversations', async (request, reply) => {
  const body = request.body as {
    patient_id: string
  }

  if (!body.patient_id) {
    return reply.code(400).send({
      error: 'Paciente é obrigatório',
    })
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      patient_id: body.patient_id,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return reply.code(201).send(data)
})


app.get(
  '/conversations/:id/messages',
  async (request, reply) => {
    const { id } = request.params as {
      id: string
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', {
        ascending: true,
      })

    if (error) {
      throw error
    }

    return reply.send(data)
  }
)


app.post(
  '/conversations/:id/messages',
  async (request, reply) => {
    const { id } = request.params as {
      id: string
    }

    const body = request.body as {
      sender_type:
        | 'patient'
        | 'bot'
        | 'therapist'
      content: string
    }

    if (!body.content?.trim()) {
      return reply.code(400).send({
        error: 'Mensagem não pode estar vazia',
      })
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: id,
        sender_type: body.sender_type,
        content: body.content.trim(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    await supabase
      .from('conversations')
      .update({
        last_message_at:
          new Date().toISOString(),
      })
      .eq('id', id)

    return reply.code(201).send(data)
  }
)


// ======================================================
// BOT
// ======================================================

app.post(
  '/conversations/:id/bot',
  async (request, reply) => {
    const { id } = request.params as {
      id: string
    }

    const body = request.body as {
      content: string
    }

    if (!body.content?.trim()) {
      return reply.code(400).send({
        error: 'Mensagem não pode estar vazia',
      })
    }

    /*
     * Verifica se a conversa existe.
     */
    const {
      data: conversation,
      error: conversationError,
    } = await supabase
      .from('conversations')
      .select(`
        id,
        status,
        patient_id
      `)
      .eq('id', id)
      .maybeSingle()

    if (conversationError) {
      throw conversationError
    }

    if (!conversation) {
      return reply.code(404).send({
        error: 'Conversa não encontrada',
      })
    }

    /*
     * Verifica se essa conversa já possui mensagens.
     */
    const {
      count: messageCount,
      error: messageCountError,
    } = await supabase
      .from('messages')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('conversation_id', id)

    if (messageCountError) {
      throw messageCountError
    }

    const isFirstMessage =
      (messageCount ?? 0) === 0

    /*
     * Salva a mensagem do paciente.
     */
    const {
      data: patientMessage,
      error: patientMessageError,
    } = await supabase
      .from('messages')
      .insert({
        conversation_id: id,
        sender_type: 'patient',
        content: body.content.trim(),
      })
      .select()
      .single()

    if (patientMessageError) {
      throw patientMessageError
    }

    /*
     * Busca o estado atual da conversa.
     */
    let {
      data: conversationState,
      error: conversationStateError,
    } = await supabase
      .from('conversation_states')
      .select(`
        id,
        state,
        appointment_date,
        appointment_time
      `)
      .eq('conversation_id', id)
      .maybeSingle()

    if (conversationStateError) {
      throw conversationStateError
    }

    /*
     * Se ainda não existe estado,
     * cria um estado inicial.
     */
    if (!conversationState) {
      const {
        data: newState,
        error: newStateError,
      } = await supabase
        .from('conversation_states')
        .insert({
          conversation_id: id,
          state: 'idle',
        })
        .select(`
          id,
          state,
          appointment_date,
          appointment_time
        `)
        .single()

      if (newStateError) {
        throw newStateError
      }

      conversationState = newState
    }

    let botResponse: string
    let shouldTransfer = false

    let nextState =
      conversationState.state

    let appointmentDate =
      conversationState.appointment_date

    let appointmentTime =
      conversationState.appointment_time

    /*
     * Primeira mensagem:
     * mostra o menu configurado no banco.
     */
    if (isFirstMessage) {
      botResponse = await getBotMenu()

      nextState = 'idle'
      appointmentDate = null
      appointmentTime = null
    } else {
      /*
       * Processa a mensagem considerando
       * o estado atual da conversa.
       */
      const bot = await getBotResponse(
        body.content,
        conversationState.state,
        conversationState.appointment_date,
        conversationState.appointment_time
      )

      botResponse = bot.response
      shouldTransfer = bot.shouldTransfer

      nextState =
        bot.nextState ?? 'idle'

      /*
       * O bot pode ter recebido uma nova
       * data durante o fluxo.
       */
      if (
        bot.appointmentDate !==
        undefined
      ) {
        appointmentDate =
          bot.appointmentDate
      }

      /*
       * O bot pode ter recebido um
       * horário durante o fluxo.
       */
      if (
        bot.appointmentTime !==
        undefined
      ) {
        appointmentTime =
          bot.appointmentTime
      }
    }

    /*
     * ==================================================
     * CONFIRMAÇÃO DO AGENDAMENTO
     * ==================================================
     *
     * Se o bot chegou ao estado "idle"
     * depois de uma confirmação e possui
     * data + horário, cria o appointment.
     */

    const wasWaitingConfirmation =
      conversationState.state ===
      'waiting_confirmation'

    const normalizedMessage =
      body.content
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(
          /[\u0300-\u036f]/g,
          ''
        )

    const confirmedAppointment =
      wasWaitingConfirmation &&
      (
        normalizedMessage === '1' ||
        normalizedMessage === 'sim' ||
        normalizedMessage === 's'
      )

    if (
      confirmedAppointment &&
      appointmentDate &&
      appointmentTime
    ) {
      /*
       * Monta os horários no formato
       * utilizado pelo banco.
       *
       * O projeto utiliza o horário
       * local de Pernambuco/Brasil.
       */
      const startAt =
        `${appointmentDate}T${appointmentTime}-03:00`

      /*
       * Busca a duração configurada
       * para calcular o final da consulta.
       */
      const {
        data: clinicSettings,
        error: clinicSettingsError,
      } = await supabase
        .from('clinic_settings')
        .select(
          'appointment_duration'
        )
        .limit(1)
        .maybeSingle()

      if (clinicSettingsError) {
        throw clinicSettingsError
      }

      const duration =
        clinicSettings
          ?.appointment_duration ?? 60

      const startDate = new Date(
        startAt
      )

      const endDate = new Date(
        startDate.getTime() +
          duration * 60 * 1000
      )

      const endAt =
        endDate.toISOString()

      /*
       * Verifica novamente se o horário
       * continua disponível.
       *
       * Isso evita dois pacientes ocuparem
       * o mesmo horário.
       */
      const {
        data: conflictingAppointments,
        error: conflictError,
      } = await supabase
        .from('appointments')
        .select('id')
        .in('status', [
          'scheduled',
          'confirmed',
        ])
        .lt('start_at', endAt)
        .gt('end_at', startAt)

      if (conflictError) {
        throw conflictError
      }

      if (
        conflictingAppointments &&
        conflictingAppointments.length > 0
      ) {
        /*
         * O horário foi ocupado enquanto
         * o paciente estava conversando.
         */
        botResponse = `Esse horário acabou de ser reservado por outro paciente.

Por favor, escolha outro horário ou informe uma nova data.`

        nextState =
          'waiting_date'

        appointmentDate = null
        appointmentTime = null
      } else {
        /*
         * Cria o agendamento.
         */
        const {
          error: appointmentError,
        } = await supabase
          .from('appointments')
          .insert({
            patient_id:
              conversation.patient_id,
            start_at: startAt,
            end_at: endAt,
            status: 'scheduled',
          })

        if (appointmentError) {
          throw appointmentError
        }

        /*
         * Limpa os dados temporários
         * do fluxo de agendamento.
         */
        nextState = 'idle'
        appointmentDate = null
        appointmentTime = null
      }
    }

    /*
     * Salva resposta do bot.
     */
    const {
      data: botMessage,
      error: botMessageError,
    } = await supabase
      .from('messages')
      .insert({
        conversation_id: id,
        sender_type: 'bot',
        content: botResponse.trim(),
      })
      .select()
      .single()

    if (botMessageError) {
      throw botMessageError
    }

    /*
     * Atualiza o estado da conversa.
     */
    const {
      error: stateUpdateError,
    } = await supabase
      .from('conversation_states')
      .update({
        state: nextState,
        appointment_date:
          appointmentDate,
        appointment_time:
          appointmentTime,
        updated_at:
          new Date().toISOString(),
      })
      .eq('conversation_id', id)

    if (stateUpdateError) {
      throw stateUpdateError
    }

    /*
     * Atualiza a conversa.
     */
    const conversationUpdate = {
      last_message_at:
        new Date().toISOString(),
      ...(shouldTransfer
        ? { status: 'human' }
        : {}),
    }

    const {
      error: conversationUpdateError,
    } = await supabase
      .from('conversations')
      .update(conversationUpdate)
      .eq('id', id)

    if (conversationUpdateError) {
      throw conversationUpdateError
    }

    return reply.code(201).send({
      patientMessage,
      botMessage,
      transferredToHuman: shouldTransfer,
      conversationState: nextState,
    })
  }
)


// ======================================================
// BOT SETTINGS
// ======================================================

/*
 * Retorna:
 *
 * - mensagem de boas-vindas
 * - instrução do menu
 * - opções 1 a 6
 */
app.get('/settings/bot', async () => {
  const {
    data: settings,
    error: settingsError,
  } = await supabase
    .from('bot_settings')
    .select('*')
    .limit(1)
    .maybeSingle()

  if (settingsError) {
    throw settingsError
  }

  if (!settings) {
    return {
      settings: null,
      options: [],
    }
  }

  const {
    data: options,
    error: optionsError,
  } = await supabase
    .from('bot_menu_options')
    .select('*')
    .order('option_number', {
      ascending: true,
    })

  if (optionsError) {
    throw optionsError
  }

  return {
    settings,
    options: options ?? [],
  }
})


/*
 * Atualiza as configurações gerais do bot.
 */
app.patch(
  '/settings/bot',
  async (request, reply) => {
    const body = request.body as {
      welcome_message?: string
      menu_instruction?: string
    }

    if (
      body.welcome_message === undefined &&
      body.menu_instruction === undefined
    ) {
      return reply.code(400).send({
        error:
          'Nenhuma configuração foi informada',
      })
    }

    /*
     * Busca a configuração atual.
     */
    const {
      data: currentSettings,
      error: currentError,
    } = await supabase
      .from('bot_settings')
      .select('id')
      .limit(1)
      .maybeSingle()

    if (currentError) {
      throw currentError
    }

    if (!currentSettings) {
      return reply.code(404).send({
        error:
          'Configurações do bot não encontradas',
      })
    }

    /*
     * Monta somente os campos enviados.
     */
    const updates: {
      welcome_message?: string
      menu_instruction?: string
      updated_at: string
    } = {
      updated_at:
        new Date().toISOString(),
    }

    if (
      body.welcome_message !== undefined
    ) {
      if (!body.welcome_message.trim()) {
        return reply.code(400).send({
          error:
            'A mensagem de boas-vindas não pode estar vazia',
        })
      }

      updates.welcome_message =
        body.welcome_message.trim()
    }

    if (
      body.menu_instruction !== undefined
    ) {
      if (!body.menu_instruction.trim()) {
        return reply.code(400).send({
          error:
            'A instrução do menu não pode estar vazia',
        })
      }

      updates.menu_instruction =
        body.menu_instruction.trim()
    }

    const {
      data,
      error,
    } = await supabase
      .from('bot_settings')
      .update(updates)
      .eq('id', currentSettings.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return reply.send(data)
  }
)


/*
 * Atualiza uma opção do menu.
 *
 * Pode alterar:
 *
 * - título
 * - resposta
 * - ativo/inativo
 *
 * A regra de transferência para humano
 * continua definida pelo sistema.
 */
app.patch(
  '/settings/bot/options/:id',
  async (request, reply) => {
    const { id } = request.params as {
      id: string
    }

    const body = request.body as {
      title?: string
      response?: string
      active?: boolean
    }

    if (
      body.title === undefined &&
      body.response === undefined &&
      body.active === undefined
    ) {
      return reply.code(400).send({
        error:
          'Nenhuma alteração foi informada',
      })
    }

    const updates: {
      title?: string
      response?: string
      active?: boolean
      updated_at: string
    } = {
      updated_at:
        new Date().toISOString(),
    }

    if (body.title !== undefined) {
      if (!body.title.trim()) {
        return reply.code(400).send({
          error:
            'O título da opção não pode estar vazio',
        })
      }

      updates.title = body.title.trim()
    }

    if (body.response !== undefined) {
      if (!body.response.trim()) {
        return reply.code(400).send({
          error:
            'A resposta não pode estar vazia',
        })
      }

      updates.response =
        body.response.trim()
    }

    if (body.active !== undefined) {
      updates.active = body.active
    }

    const {
      data,
      error,
    } = await supabase
      .from('bot_menu_options')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return reply.send(data)
  }
)

app.get('/dashboard', async () => {
  const now = new Date()

  const startOfDay = new Date(
    `${now.toISOString().slice(0, 10)}T00:00:00-03:00`
  )

  const startOfTomorrow = new Date(
    startOfDay.getTime() + 24 * 60 * 60 * 1000
  )

  /*
   * Conversas que tiveram atividade hoje.
   */
  const {
    count: conversationsToday,
    error: conversationsTodayError,
  } = await supabase
    .from('conversations')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .gte(
      'last_message_at',
      startOfDay.toISOString()
    )
    .lt(
      'last_message_at',
      startOfTomorrow.toISOString()
    )

  if (conversationsTodayError) {
    throw conversationsTodayError
  }

  /*
   * Conversas atualmente sob responsabilidade do bot.
   */
  const {
    count: resolvedByBot,
    error: resolvedByBotError,
  } = await supabase
    .from('conversations')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('status', 'bot')
    .gte(
      'last_message_at',
      startOfDay.toISOString()
    )
    .lt(
      'last_message_at',
      startOfTomorrow.toISOString()
    )

  if (resolvedByBotError) {
    throw resolvedByBotError
  }

  /*
   * Agendamentos de hoje.
   */
  const {
    count: appointmentsToday,
    error: appointmentsTodayError,
  } = await supabase
    .from('appointments')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .in('status', [
      'scheduled',
      'confirmed',
    ])
    .gte(
      'start_at',
      startOfDay.toISOString()
    )
    .lt(
      'start_at',
      startOfTomorrow.toISOString()
    )

  if (appointmentsTodayError) {
    throw appointmentsTodayError
  }

  /*
   * Próximos agendamentos.
   */
  const {
    data: upcomingAppointments,
    error: upcomingAppointmentsError,
  } = await supabase
    .from('appointments')
    .select(`
      id,
      start_at,
      end_at,
      status,
      patients (
        id,
        name
      )
    `)
    .in('status', [
      'scheduled',
      'confirmed',
    ])
    .gte(
      'start_at',
      now.toISOString()
    )
    .order(
      'start_at',
      {
        ascending: true,
      }
    )
    .limit(5)

  if (upcomingAppointmentsError) {
    throw upcomingAppointmentsError
  }

  const appointments = (
    upcomingAppointments ?? []
  ).map((appointment: any) => {
    const patient = Array.isArray(
      appointment.patients
    )
      ? appointment.patients[0]
      : appointment.patients

    return {
      id: appointment.id,
      patientName:
        patient?.name ??
        'Paciente',
      startAt:
        appointment.start_at,
      endAt:
        appointment.end_at,
      status:
        appointment.status,
    }
  })

  /*
   * Conversas que precisam da atenção
   * da fisioterapeuta.
   */
  const {
    data: waitingHuman,
    error: waitingHumanError,
  } = await supabase
    .from('conversations')
    .select(`
      id,
      status,
      last_message_at,
      patients (
        id,
        name
      ),
      messages (
        id,
        sender_type,
        content,
        created_at
      )
    `)
    .eq('status', 'human')
    .order(
      'last_message_at',
      {
        ascending: false,
      }
    )
    .limit(5)

  if (waitingHumanError) {
    throw waitingHumanError
  }

  const humanConversations = (
    waitingHuman ?? []
  ).map((conversation: any) => {
    const messages =
      conversation.messages ?? []

    const lastMessage =
      [...messages].sort(
        (a, b) =>
          new Date(
            b.created_at
          ).getTime() -
          new Date(
            a.created_at
          ).getTime()
      )[0]

    const patient = Array.isArray(
      conversation.patients
    )
      ? conversation.patients[0]
      : conversation.patients

    return {
      id: conversation.id,
      patientName:
        patient?.name ??
        'Paciente',
      lastMessage:
        lastMessage?.content ??
        'Nenhuma mensagem',
      lastMessageAt:
        conversation.last_message_at,
    }
  })

  /*
   * Busca as conversas mais recentes.
   */
  const {
    data: recentConversations,
    error: recentConversationsError,
  } = await supabase
    .from('conversations')
    .select(`
      id,
      status,
      last_message_at,
      patients (
        id,
        name
      ),
      messages (
        id,
        sender_type,
        content,
        created_at
      )
    `)
    .order(
      'last_message_at',
      {
        ascending: false,
      }
    )
    .limit(5)

  if (recentConversationsError) {
    throw recentConversationsError
  }

  /*
   * Organiza as conversas recentes
   * para o formato que o frontend precisa.
   */
  const conversations = (
    recentConversations ?? []
  ).map((conversation: any) => {
    const messages =
      conversation.messages ?? []

    const lastMessage =
      [...messages].sort(
        (a, b) =>
          new Date(
            b.created_at
          ).getTime() -
          new Date(
            a.created_at
          ).getTime()
      )[0]

    const patient = Array.isArray(
      conversation.patients
    )
      ? conversation.patients[0]
      : conversation.patients

    return {
      id: conversation.id,
      patientName:
        patient?.name ??
        'Paciente',
      lastMessage:
        lastMessage?.content ??
        'Nenhuma mensagem',
      status:
        conversation.status,
      lastMessageAt:
        conversation.last_message_at,
    }
  })

  return {
    conversationsToday:
      conversationsToday ?? 0,

    resolvedByBot:
      resolvedByBot ?? 0,

    appointmentsToday:
      appointmentsToday ?? 0,

    upcomingAppointments:
      appointments,

    waitingHuman:
      humanConversations,

    recentConversations:
      conversations,
  }
})


// ======================================================
// APPOINTMENTS
// ======================================================

app.get('/appointments', async () => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      patient_id,
      start_at,
      end_at,
      status,
      created_at,
      patient:patients (
        id,
        name,
        phone
      )
    `)
    .order('start_at', {
      ascending: true,
    })

  if (error) {
    throw error
  }

  return data
})


app.post(
  '/appointments',
  async (request, reply) => {
    const body = request.body as {
      patient_id: string
      start_at: string
      end_at: string
      status?:
        | 'scheduled'
        | 'confirmed'
    }

    if (
      !body.patient_id ||
      !body.start_at ||
      !body.end_at
    ) {
      return reply.code(400).send({
        error:
          'Paciente, data de início e data de término são obrigatórios',
      })
    }

    const startAt = new Date(
      body.start_at
    )

    const endAt = new Date(
      body.end_at
    )

    if (
      Number.isNaN(startAt.getTime()) ||
      Number.isNaN(endAt.getTime())
    ) {
      return reply.code(400).send({
        error: 'Data ou horário inválido',
      })
    }

    if (endAt <= startAt) {
      return reply.code(400).send({
        error:
          'O horário de término deve ser posterior ao horário de início',
      })
    }

    /*
     * Verifica conflito.
     */
    const {
      data: conflictingAppointments,
      error: conflictError,
    } = await supabase
      .from('appointments')
      .select('id')
      .neq('status', 'cancelled')
      .lt(
        'start_at',
        endAt.toISOString()
      )
      .gt(
        'end_at',
        startAt.toISOString()
      )

    if (conflictError) {
      throw conflictError
    }

    if (
      conflictingAppointments &&
      conflictingAppointments.length > 0
    ) {
      return reply.code(409).send({
        error:
          'Já existe um agendamento nesse horário',
      })
    }

    const {
      data,
      error,
    } = await supabase
      .from('appointments')
      .insert({
        patient_id:
          body.patient_id,
        start_at:
          startAt.toISOString(),
        end_at:
          endAt.toISOString(),
        status:
          body.status ?? 'scheduled',
      })
      .select(`
        id,
        patient_id,
        start_at,
        end_at,
        status,
        created_at,
        patient:patients (
          id,
          name,
          phone
        )
      `)
      .single()

    if (error) {
      throw error
    }

    return reply.code(201).send(data)
  }
)


app.patch(
  '/appointments/:id',
  async (request, reply) => {
    const { id } = request.params as {
      id: string
    }

    const body = request.body as {
      patient_id?: string
      start_at?: string
      end_at?: string
      status?:
        | 'scheduled'
        | 'confirmed'
        | 'cancelled'
        | 'completed'
    }

    /*
     * Busca o agendamento atual.
     */
    const {
      data: currentAppointment,
      error: currentError,
    } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (currentError) {
      console.error(
        'Erro ao buscar agendamento:',
        currentError
      )

      return reply.code(500).send({
        error: currentError.message,
      })
    }

    if (!currentAppointment) {
      return reply.code(404).send({
        error:
          'Agendamento não encontrado',
      })
    }

    /*
     * Mantém os horários atuais
     * quando não foram enviados.
     */
    const startAt = body.start_at
      ? new Date(body.start_at)
      : new Date(
          currentAppointment.start_at
        )

    const endAt = body.end_at
      ? new Date(body.end_at)
      : new Date(
          currentAppointment.end_at
        )

    if (
      Number.isNaN(startAt.getTime()) ||
      Number.isNaN(endAt.getTime())
    ) {
      return reply.code(400).send({
        error: 'Data ou horário inválido',
      })
    }

    if (endAt <= startAt) {
      return reply.code(400).send({
        error:
          'O horário de término deve ser posterior ao horário de início',
      })
    }

    /*
     * Verifica conflito,
     * ignorando o próprio agendamento.
     */
    const {
      data: conflictingAppointments,
      error: conflictError,
    } = await supabase
      .from('appointments')
      .select('id')
      .neq('id', id)
      .neq('status', 'cancelled')
      .lt(
        'start_at',
        endAt.toISOString()
      )
      .gt(
        'end_at',
        startAt.toISOString()
      )

    if (conflictError) {
      console.error(
        'Erro ao verificar conflito:',
        conflictError
      )

      return reply.code(500).send({
        error: conflictError.message,
      })
    }

    if (
      conflictingAppointments &&
      conflictingAppointments.length > 0
    ) {
      return reply.code(409).send({
        error:
          'Já existe um agendamento nesse horário',
      })
    }

    const updates: {
      patient_id?: string
      start_at: string
      end_at: string
      status?: string
    } = {
      start_at:
        startAt.toISOString(),
      end_at:
        endAt.toISOString(),
    }

    if (
      body.patient_id !== undefined
    ) {
      updates.patient_id =
        body.patient_id
    }

    if (body.status !== undefined) {
      updates.status = body.status
    }

    const {
      data,
      error,
    } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select(`
        id,
        patient_id,
        start_at,
        end_at,
        status,
        created_at,
        patient:patients (
          id,
          name,
          phone
        )
      `)
      .single()

    if (error) {
      console.error(
        'Erro ao atualizar agendamento:',
        error
      )

      return reply.code(500).send({
        error: error.message,
        details: error.details,
        hint: error.hint,
      })
    }

    return reply.send(data)
  }
)


app.delete(
  '/appointments/:id',
  async (request, reply) => {
    const { id } = request.params as {
      id: string
    }

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return reply.code(204).send()
  }
)


// ======================================================
// AVAILABLE APPOINTMENTS
// ======================================================

app.get(
  '/appointments/available',
  async (request, reply) => {
    const { date } = request.query as {
      date?: string
    }

    if (!date) {
      return reply.code(400).send({
        error: 'A data é obrigatória',
      })
    }

    /*
     * Busca configurações da clínica.
     */
    const {
      data: settings,
      error: settingsError,
    } = await supabase
      .from('clinic_settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (settingsError) {
      console.error(
        'Erro ao buscar configurações:',
        settingsError
      )

      return reply.code(500).send({
        error: settingsError.message,
      })
    }

    if (!settings) {
      return reply.code(404).send({
        error:
          'Configurações da clínica não encontradas',
      })
    }

    /*
     * Valida a data.
     */
    const selectedDate = new Date(
      `${date}T12:00:00`
    )

    if (
      Number.isNaN(
        selectedDate.getTime()
      )
    ) {
      return reply.code(400).send({
        error: 'Data inválida',
      })
    }

    /*
     * 0 = domingo
     * 1 = segunda
     * 2 = terça
     * 3 = quarta
     * 4 = quinta
     * 5 = sexta
     * 6 = sábado
     */
    const dayOfWeek =
      selectedDate.getDay()

    const daySettings = [
      {
        enabled:
          settings.sunday_enabled,
        start:
          settings.sunday_start,
        end:
          settings.sunday_end,
      },
      {
        enabled:
          settings.monday_enabled,
        start:
          settings.monday_start,
        end:
          settings.monday_end,
      },
      {
        enabled:
          settings.tuesday_enabled,
        start:
          settings.tuesday_start,
        end:
          settings.tuesday_end,
      },
      {
        enabled:
          settings.wednesday_enabled,
        start:
          settings.wednesday_start,
        end:
          settings.wednesday_end,
      },
      {
        enabled:
          settings.thursday_enabled,
        start:
          settings.thursday_start,
        end:
          settings.thursday_end,
      },
      {
        enabled:
          settings.friday_enabled,
        start:
          settings.friday_start,
        end:
          settings.friday_end,
      },
      {
        enabled:
          settings.saturday_enabled,
        start:
          settings.saturday_start,
        end:
          settings.saturday_end,
      },
    ][dayOfWeek]

    /*
     * Não atende nesse dia.
     */
    if (!daySettings.enabled) {
      return reply.send({
        date,
        available: [],
      })
    }

    const duration =
      settings.appointment_duration

    const timeToMinutes = (
      time: string
    ) => {
      const [hours, minutes] =
        time.split(':').map(Number)

      return (
        hours * 60 + minutes
      )
    }

    const minutesToTime = (
      minutes: number
    ) => {
      const hours = Math.floor(
        minutes / 60
      )

      const remainingMinutes =
        minutes % 60

      return `${String(
        hours
      ).padStart(
        2,
        '0'
      )}:${String(
        remainingMinutes
      ).padStart(
        2,
        '0'
      )}`
    }

    const openingMinutes =
      timeToMinutes(
        daySettings.start
      )

    const closingMinutes =
      timeToMinutes(
        daySettings.end
      )

    /*
     * Busca agendamentos do dia.
     */
    const startOfDay =
      `${date}T00:00:00-03:00`

    const endOfDay =
      `${date}T23:59:59-03:00`

    const {
      data: appointments,
      error: appointmentsError,
    } = await supabase
      .from('appointments')
      .select(
        'id, start_at, end_at, status'
      )
      .neq(
        'status',
        'cancelled'
      )
      .gte(
        'start_at',
        startOfDay
      )
      .lte(
        'start_at',
        endOfDay
      )

    if (appointmentsError) {
      console.error(
        'Erro ao buscar agendamentos:',
        appointmentsError
      )

      return reply.code(500).send({
        error:
          appointmentsError.message,
      })
    }

    const available: string[] = []

    /*
     * Gera os horários disponíveis.
     */
    for (
      let start = openingMinutes;
      start + duration <=
        closingMinutes;
      start += duration
    ) {
      const end =
        start + duration

      /*
       * Verifica horário de almoço.
       */
      if (
        settings.lunch_enabled
      ) {
        const lunchStart =
          timeToMinutes(
            settings.lunch_start
          )

        const lunchEnd =
          timeToMinutes(
            settings.lunch_end
          )

        const overlapsLunch =
          start < lunchEnd &&
          end > lunchStart

        if (overlapsLunch) {
          continue
        }
      }

      const slotStart =
        new Date(
          `${date}T${minutesToTime(
            start
          )}:00-03:00`
        )

      const slotEnd =
        new Date(
          `${date}T${minutesToTime(
            end
          )}:00-03:00`
        )

      /*
       * Verifica conflito.
       */
      const hasConflict =
        (appointments ?? []).some(
          (appointment) => {
            const appointmentStart =
              new Date(
                appointment.start_at
              )

            const appointmentEnd =
              new Date(
                appointment.end_at
              )

            return (
              slotStart <
                appointmentEnd &&
              slotEnd >
                appointmentStart
            )
          }
        )

      if (!hasConflict) {
        available.push(
          minutesToTime(start)
        )
      }
    }

    return reply.send({
      date,
      duration,
      available,
    })
  }
)


// ======================================================
// FAQS
// ======================================================

app.get('/faqs', async () => {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('created_at', {
      ascending: false,
    })

  if (error) {
    throw error
  }

  return data
})


app.post(
  '/faqs',
  async (request, reply) => {
    const body = request.body as {
      question: string
      answer: string
    }

    if (
      !body.question?.trim() ||
      !body.answer?.trim()
    ) {
      return reply.code(400).send({
        error:
          'Pergunta e resposta são obrigatórias',
      })
    }

    const question =
      body.question.trim()

    /*
     * Verifica FAQ duplicada.
     */
    const {
      data: existingFAQ,
      error: searchError,
    } = await supabase
      .from('faqs')
      .select('id')
      .ilike(
        'question',
        question
      )
      .maybeSingle()

    if (searchError) {
      throw searchError
    }

    if (existingFAQ) {
      return reply.code(409).send({
        error:
          'Já existe uma FAQ com essa pergunta',
      })
    }

    const {
      data,
      error,
    } = await supabase
      .from('faqs')
      .insert({
        question,
        answer:
          body.answer.trim(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return reply.code(201).send(data)
  }
)


app.patch(
  '/faqs/:id',
  async (request, reply) => {
    const { id } = request.params as {
      id: string
    }

    const body = request.body as {
      question?: string
      answer?: string
      active?: boolean
    }

    const updates: {
      question?: string
      answer?: string
      active?: boolean
    } = {}

    if (
      body.question !== undefined
    ) {
      if (!body.question.trim()) {
        return reply.code(400).send({
          error:
            'A pergunta não pode estar vazia',
        })
      }

      updates.question =
        body.question.trim()
    }

    if (
      body.answer !== undefined
    ) {
      if (!body.answer.trim()) {
        return reply.code(400).send({
          error:
            'A resposta não pode estar vazia',
        })
      }

      updates.answer =
        body.answer.trim()
    }

    if (
      body.active !== undefined
    ) {
      updates.active =
        body.active
    }

    if (
      Object.keys(updates).length === 0
    ) {
      return reply.code(400).send({
        error:
          'Nenhuma alteração foi informada',
      })
    }

    const {
      data,
      error,
    } = await supabase
      .from('faqs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return reply.send(data)
  }
)


app.delete(
  '/faqs/:id',
  async (request, reply) => {
    const { id } = request.params as {
      id: string
    }

    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return reply.code(204).send()
  }
)


// ======================================================
// CLINIC SETTINGS
// ======================================================

app.get(
  '/settings/clinic',
  async (request, reply) => {
    const {
      data,
      error,
    } = await supabase
      .from('clinic_settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error(
        'Erro ao buscar configurações da clínica:',
        error
      )

      return reply.code(500).send({
        error: error.message,
      })
    }

    if (!data) {
      return reply.code(404).send({
        error:
          'Configurações da clínica não encontradas',
      })
    }

    return reply.send(data)
  }
)


app.patch(
  '/settings/clinic',
  async (request, reply) => {
    const body = request.body as {
      monday_enabled?: boolean
      monday_start?: string
      monday_end?: string

      tuesday_enabled?: boolean
      tuesday_start?: string
      tuesday_end?: string

      wednesday_enabled?: boolean
      wednesday_start?: string
      wednesday_end?: string

      thursday_enabled?: boolean
      thursday_start?: string
      thursday_end?: string

      friday_enabled?: boolean
      friday_start?: string
      friday_end?: string

      saturday_enabled?: boolean
      saturday_start?: string
      saturday_end?: string

      sunday_enabled?: boolean
      sunday_start?: string
      sunday_end?: string

      lunch_enabled?: boolean
      lunch_start?: string
      lunch_end?: string

      appointment_duration?: number
    }

    /*
     * Valida duração.
     */
    if (
      body.appointment_duration !==
        undefined &&
      ![
        30,
        45,
        60,
        90,
        120,
      ].includes(
        body.appointment_duration
      )
    ) {
      return reply.code(400).send({
        error:
          'Duração de consulta inválida',
      })
    }

    /*
     * Busca configuração atual.
     */
    const {
      data: currentSettings,
      error: currentError,
    } = await supabase
      .from('clinic_settings')
      .select('id')
      .limit(1)
      .maybeSingle()

    if (currentError) {
      console.error(
        'Erro ao buscar configurações:',
        currentError
      )

      return reply.code(500).send({
        error: currentError.message,
      })
    }

    if (!currentSettings) {
      return reply.code(404).send({
        error:
          'Configurações da clínica não encontradas',
      })
    }

    const updates = {
      ...body,
      updated_at:
        new Date().toISOString(),
    }

    const {
      data,
      error,
    } = await supabase
      .from('clinic_settings')
      .update(updates)
      .eq('id', currentSettings.id)
      .select('*')
      .single()

    if (error) {
      console.error(
        'Erro ao atualizar configurações:',
        error
      )

      return reply.code(500).send({
        error: error.message,
        details: error.details,
        hint: error.hint,
      })
    }

    return reply.send(data)
  }
)


// ======================================================
// START SERVER
// ======================================================

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000

    await app.listen({
      port,
      host: '0.0.0.0',
    })

    console.log(
      `Servidor rodando na porta ${port}`
    )
  } catch (error) {
    app.log.error(error)

    process.exit(1)
  }
}

start()