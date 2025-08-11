export const HTTP_ERROR_MESSAGES = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to access this resource.',
  404: 'The requested resource was not found.',
  409: 'A conflict occurred. The resource may have been modified.',
  422: 'The submitted data could not be processed.',
  429: 'Too many requests. Please wait a moment before trying again.',
  500: 'An internal server error occurred. Please try again later.',
  502: 'Service temporarily unavailable. Please try again later.',
  503: 'Service temporarily unavailable. Please try again later.',
  504: 'Request timeout. Please check your connection and try again.',
  DEFAULT: 'An unexpected error occurred. Please try again.'
} as const;


export const AUTH_CONFIG = {
  TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  BEARER_PREFIX: 'Bearer',
  SKIP_TOKEN_URLS: ['/validate-token', '/refresh-token', '/public']
} as const;


export const HTTP_HEADERS = {
  AUTHORIZATION: 'Authorization',
  CONTENT_TYPE: 'Content-Type',
  ACCEPT: 'Accept',
  X_REQUESTED_WITH: 'X-Requested-With'
} as const;


export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded'
} as const;
