export const env = {
  backendUrl: process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL,
  socketUrl:
    process.env.NEXT_PUBLIC_SOCKET_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.BACKEND_URL,
  keycloak: {
    baseUrl:
      process.env.KEYCLOAK_BASE_URL ?? process.env.NEXT_PUBLIC_KEYCLOAK_URL,
    realm: process.env.KEYCLOAK_REALM ?? process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
    clientId:
      process.env.KEYCLOAK_CLIENT_ID ??
      process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
    secret: process.env.KEYCLOAK_CLIENT_SECRET,
  },
} as const
