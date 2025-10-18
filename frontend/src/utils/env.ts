const resolveBackendHost = () => {
  if (typeof window === 'undefined') {
    return {
      api: 'http://localhost:8000',
      ws: 'ws://localhost:8000'
    }
  }

  const { protocol, host } = window.location
  const isHttps = protocol === 'https:'

  // Production Railway: replace `frontend` prefix with `web`
  if (host.includes('frontend')) {
    const backendHost = host.replace('frontend', 'web')
    return {
      api: `${isHttps ? 'https' : 'http'}://${backendHost}`,
      ws: `${isHttps ? 'wss' : 'ws'}://${backendHost}`
    }
  }

  // Local development fallback
  return {
    api: 'http://localhost:8000',
    ws: 'ws://localhost:8000'
  }
}

const inferred = resolveBackendHost()

export const API_URL = import.meta.env.VITE_API_URL ?? inferred.api
export const WS_URL = import.meta.env.VITE_WS_URL ?? inferred.ws
