import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { getBotResponse } from './bot.js'

import { supabase } from './lib/supabase.js'

const app = Fastify({
  logger: true,
})

app.get('/', async () => {
  return {
    message: 'FisioBot API funcionando!',
  }
})

app.get('/patients', async () => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })

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

  const { data, error } = await supabase
    .from('patients')
    .insert({
      name: body.name,
      phone: body.phone,
      email: body.email ?? null,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return reply.code(201).send(data)
})

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
    .order('last_message_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
})

app.post('/conversations', async (request, reply) => {
  const body = request.body as {
    patient_id: string
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

app.get('/conversations/:id/messages', async (request) => {
  const { id } = request.params as {
    id: string
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return data
})

app.post('/conversations/:id/messages', async (request, reply) => {
  const { id } = request.params as {
    id: string
  }

  const body = request.body as {
    sender_type: 'patient' | 'bot' | 'therapist'
    content: string
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: id,
      sender_type: body.sender_type,
      content: body.content,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  await supabase
    .from('conversations')
    .update({
      last_message_at: new Date().toISOString(),
    })
    .eq('id', id)

  return reply.code(201).send(data)
})

app.post('/conversations/:id/bot', async (request, reply) => {
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

  // Salva a mensagem do paciente
  const { error: patientMessageError } = await supabase
    .from('messages')
    .insert({
      conversation_id: id,
      sender_type: 'patient',
      content: body.content.trim(),
    })

  if (patientMessageError) {
    throw patientMessageError
  }

  // Processa a mensagem
  const bot = await getBotResponse(body.content)

  // Salva a resposta do bot
  const { data: botMessage, error: botMessageError } =
    await supabase
      .from('messages')
      .insert({
        conversation_id: id,
        sender_type: 'bot',
        content: bot.response,
      })
      .select()
      .single()

  if (botMessageError) {
    throw botMessageError
  }

  // Se o bot não souber responder,
  // muda a conversa para atendimento humano
  if (bot.shouldTransfer) {
    await supabase
      .from('conversations')
      .update({
        status: 'human',
        last_message_at: new Date().toISOString(),
      })
      .eq('id', id)
  } else {
    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
      })
      .eq('id', id)
  }

  return reply.code(201).send({
    botMessage,
    transferredToHuman: bot.shouldTransfer,
  })
})

// =========================
// APPOINTMENTS
// =========================

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
    .order('start_at', { ascending: true })

  if (error) {
    throw error
  }

  return data
})


app.post('/appointments', async (request, reply) => {
  const body = request.body as {
    patient_id: string
    start_at: string
    end_at: string
    status?: 'scheduled' | 'confirmed'
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

  const startAt = new Date(body.start_at)
  const endAt = new Date(body.end_at)

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

  // Verifica conflito de horário
  const { data: conflictingAppointments, error: conflictError } =
    await supabase
      .from('appointments')
      .select('id')
      .neq('status', 'cancelled')
      .lt('start_at', endAt.toISOString())
      .gt('end_at', startAt.toISOString())

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

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: body.patient_id,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      status: body.status ?? 'scheduled',
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
})


app.patch('/appointments/:id', async (request, reply) => {
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

  // Busca o agendamento atual
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
      error: 'Agendamento não encontrado',
    })
  }

  // Mantém os horários atuais caso não tenham sido enviados
  const startAt = body.start_at
    ? new Date(body.start_at)
    : new Date(currentAppointment.start_at)

  const endAt = body.end_at
    ? new Date(body.end_at)
    : new Date(currentAppointment.end_at)

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

  // Verifica conflito de horário
  const {
    data: conflictingAppointments,
    error: conflictError,
  } = await supabase
    .from('appointments')
    .select('id')
    .neq('id', id)
    .neq('status', 'cancelled')
    .lt('start_at', endAt.toISOString())
    .gt('end_at', startAt.toISOString())

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

  // Monta os dados que serão alterados
  const updates: {
    patient_id?: string
    start_at: string
    end_at: string
    status?: string
  } = {
    start_at: startAt.toISOString(),
    end_at: endAt.toISOString(),
  }

  if (body.patient_id !== undefined) {
    updates.patient_id = body.patient_id
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
})


app.delete('/appointments/:id', async (request, reply) => {
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
})

app.get('/appointments/available', async (request, reply) => {
  const { date } = request.query as {
    date?: string
  }

  if (!date) {
    return reply.code(400).send({
      error: 'A data é obrigatória',
    })
  }

  // Buscar configurações da clínica
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
      error: 'Configurações da clínica não encontradas',
    })
  }

  // Validar data
  const selectedDate = new Date(
    `${date}T12:00:00`
  )

  if (Number.isNaN(selectedDate.getTime())) {
    return reply.code(400).send({
      error: 'Data inválida',
    })
  }

  // 0 = domingo
  // 1 = segunda
  // 2 = terça
  // 3 = quarta
  // 4 = quinta
  // 5 = sexta
  // 6 = sábado
  const dayOfWeek = selectedDate.getDay()

  const daySettings = [
    {
      enabled: settings.sunday_enabled,
      start: settings.sunday_start,
      end: settings.sunday_end,
    },
    {
      enabled: settings.monday_enabled,
      start: settings.monday_start,
      end: settings.monday_end,
    },
    {
      enabled: settings.tuesday_enabled,
      start: settings.tuesday_start,
      end: settings.tuesday_end,
    },
    {
      enabled: settings.wednesday_enabled,
      start: settings.wednesday_start,
      end: settings.wednesday_end,
    },
    {
      enabled: settings.thursday_enabled,
      start: settings.thursday_start,
      end: settings.thursday_end,
    },
    {
      enabled: settings.friday_enabled,
      start: settings.friday_start,
      end: settings.friday_end,
    },
    {
      enabled: settings.saturday_enabled,
      start: settings.saturday_start,
      end: settings.saturday_end,
    },
  ][dayOfWeek]

  // Não atende neste dia
  if (!daySettings.enabled) {
    return reply.send({
      date,
      available: [],
    })
  }

  const duration =
    settings.appointment_duration

  const timeToMinutes = (time: string) => {
    const [hours, minutes] =
      time.split(':').map(Number)

    return hours * 60 + minutes
  }

  const minutesToTime = (minutes: number) => {
    const hours = Math.floor(
      minutes / 60
    )

    const remainingMinutes =
      minutes % 60

    return `${String(hours).padStart(
      2,
      '0'
    )}:${String(
      remainingMinutes
    ).padStart(2, '0')}`
  }

  const openingMinutes =
    timeToMinutes(daySettings.start)

  const closingMinutes =
    timeToMinutes(daySettings.end)

  // Buscar agendamentos do dia
  const startOfDay = `${date}T00:00:00-03:00`
  const endOfDay = `${date}T23:59:59-03:00`

  const {
    data: appointments,
    error: appointmentsError,
  } = await supabase
    .from('appointments')
    .select(
      'id, start_at, end_at, status'
    )
    .neq('status', 'cancelled')
    .gte('start_at', startOfDay)
    .lte('start_at', endOfDay)

  if (appointmentsError) {
    console.error(
      'Erro ao buscar agendamentos:',
      appointmentsError
    )

    return reply.code(500).send({
      error: appointmentsError.message,
    })
  }

  const available: string[] = []

  for (
    let start = openingMinutes;
    start + duration <= closingMinutes;
    start += duration
  ) {
    const end = start + duration

    // Verificar intervalo
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

    const slotStart = new Date(
      `${date}T${minutesToTime(
        start
      )}:00-03:00`
    )

    const slotEnd = new Date(
      `${date}T${minutesToTime(
        end
      )}:00-03:00`
    )

    // Verificar conflito com agendamentos
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
})

app.get('/faqs', async () => {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
})

app.post('/faqs', async (request, reply) => {
  const body = request.body as {
    question: string
    answer: string
  }

  if (!body.question?.trim() || !body.answer?.trim()) {
    return reply.code(400).send({
      error: 'Pergunta e resposta são obrigatórias',
    })
  }

  const question = body.question.trim()

  const { data: existingFAQ, error: searchError } =
    await supabase
      .from('faqs')
      .select('id')
      .ilike('question', question)
      .maybeSingle()

  if (searchError) {
    throw searchError
  }

  if (existingFAQ) {
    return reply.code(409).send({
      error: 'Já existe uma FAQ com essa pergunta',
    })
  }

  const { data, error } = await supabase
    .from('faqs')
    .insert({
      question,
      answer: body.answer.trim(),
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return reply.code(201).send(data)
})

app.patch('/faqs/:id', async (request, reply) => {
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

  if (body.question !== undefined) {
    updates.question = body.question.trim()
  }

  if (body.answer !== undefined) {
    updates.answer = body.answer.trim()
  }

  if (body.active !== undefined) {
    updates.active = body.active
  }

  const { data, error } = await supabase
    .from('faqs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
})

app.delete('/faqs/:id', async (request, reply) => {
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
})

app.get('/settings/clinic', async (request, reply) => {
  const { data, error } = await supabase
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
      error: 'Configurações da clínica não encontradas',
    })
  }

  return reply.send(data)
})

app.patch('/settings/clinic', async (request, reply) => {
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

  if (
    body.appointment_duration !== undefined &&
    (![30, 45, 60, 90, 120].includes(
      body.appointment_duration
    ))
  ) {
    return reply.code(400).send({
      error: 'Duração de consulta inválida',
    })
  }

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
      error: 'Configurações da clínica não encontradas',
    })
  }

  const updates = {
    ...body,
    updated_at: new Date().toISOString(),
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
})

const start = async () => {
  try {
    await app.register(cors, {
  origin: 'http://localhost:5174',
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

    await app.listen({
      port: 3000,
      host: '0.0.0.0',
    })

    console.log('Servidor rodando em http://localhost:3000')
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

start()