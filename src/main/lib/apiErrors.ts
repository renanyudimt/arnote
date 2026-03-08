export function formatApiError(statusCode: number, body: string): string {
  const lowerBody = body.toLowerCase()

  if (statusCode === 401) {
    return 'API key inválida ou expirada. Verifique sua chave em Settings.'
  }

  if (statusCode === 429) {
    if (lowerBody.includes('insufficient_quota') || lowerBody.includes('quota')) {
      return 'Saldo insuficiente na OpenAI. Adicione créditos em platform.openai.com/settings/organization/billing'
    }
    return 'Limite de requisições atingido. Aguarde alguns segundos e tente novamente.'
  }

  if (statusCode === 403) {
    return 'Acesso negado. Verifique as permissões da sua API key.'
  }

  if (statusCode >= 500 && statusCode < 600) {
    return `Servidor OpenAI indisponível (${statusCode}). Tente novamente em alguns instantes.`
  }

  return `Erro na API OpenAI (${statusCode}): ${body}`
}
