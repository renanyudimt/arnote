export class IpcError extends Error {
  code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'IpcError'
    this.code = code
  }
}

export function serializeError(error: unknown): IpcError {
  if (error instanceof Error) {
    return new IpcError(
      error.message,
      error.name === 'Error' ? 'UNKNOWN_ERROR' : error.name,
    )
  }

  return new IpcError(String(error), 'UNKNOWN_ERROR')
}

export function formatApiError(statusCode: number, body: string, provider = 'OpenAI'): string {
  const lowerBody = body.toLowerCase()

  if (statusCode === 401) {
    return 'API key inválida ou expirada. Verifique sua chave em Settings.'
  }

  if (statusCode === 429) {
    if (lowerBody.includes('insufficient_quota') || lowerBody.includes('quota')) {
      return `Saldo insuficiente na ${provider}. Adicione créditos em platform.openai.com/settings/organization/billing`
    }
    return 'Limite de requisições atingido. Aguarde alguns segundos e tente novamente.'
  }

  if (statusCode === 403) {
    return 'Acesso negado. Verifique as permissões da sua API key.'
  }

  if (statusCode >= 500 && statusCode < 600) {
    return `Servidor ${provider} indisponível (${statusCode}). Tente novamente em alguns instantes.`
  }

  return `Erro na API ${provider} (${statusCode}): ${body}`
}
