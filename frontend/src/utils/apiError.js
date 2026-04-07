/**
 * Normalize axios error payloads from the API (e.g. express-validator).
 * @param {unknown} error
 * @returns {{ message: string; fieldErrors: Record<string, string[]> }}
 */
export function parseApiError(error) {
  const res = error?.response
  const data = res?.data

  const message =
    (typeof data?.message === 'string' && data.message) ||
    error?.message ||
    'Something went wrong. Please try again.'

  /** @type {Record<string, string[]>} */
  const fieldErrors = {}
  const list = data?.errors
  if (Array.isArray(list)) {
    for (const item of list) {
      const path =
        item?.path != null
          ? String(item.path)
          : item?.param != null
            ? String(item.param)
            : null
      if (!path) continue
      const msg =
        typeof item?.msg === 'string'
          ? item.msg
          : typeof item?.message === 'string'
            ? item.message
            : 'Invalid value'
      if (!fieldErrors[path]) fieldErrors[path] = []
      fieldErrors[path].push(msg)
    }
  }

  return { message, fieldErrors }
}

/**
 * @param {Record<string, string[]>} fieldErrors
 * @param {string} field
 */
export function fieldErrorList(fieldErrors, field) {
  return fieldErrors[field] ?? []
}
