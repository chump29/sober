interface IEnv {
  SOBER_API_TIMEOUT: number
  SOBER_DEBUG: boolean
  SOBER_JWT_AUDIENCE: string
  SOBER_JWT_EXPIRE_TIME: string | number | Date
  VITE_API_URL: string
  VITE_TITLE: string
}

export { type IEnv }
