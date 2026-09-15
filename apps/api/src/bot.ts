import { supabase } from './lib/supabase.js'

type BotResponse = {
  response: string
  shouldTransfer: boolean
}

export async function getBotResponse(
  message: string
): Promise<BotResponse> {
  const text = message
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  const { data: faqs, error } = await supabase
    .from('faqs')
    .select('id, question, answer')
    .eq('active', true)

  if (error) {
    throw error
  }

  for (const faq of faqs ?? []) {
    const question = faq.question
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    const keywords = question
      .split(/\s+/)
      .filter((word) => word.length >= 4)

    const matches = keywords.filter((keyword) =>
      text.includes(keyword)
    )

    if (
      matches.length >= Math.min(2, keywords.length)
    ) {
      return {
        response: faq.answer,
        shouldTransfer: false,
      }
    }
  }

  return {
    response:
      'Não consegui encontrar uma resposta para essa pergunta. Vou encaminhar sua mensagem para a fisioterapeuta, que poderá te ajudar melhor.',
    shouldTransfer: true,
  }
}