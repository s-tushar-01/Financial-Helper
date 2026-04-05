/**
 * Utility for decoding JWT tokens (handles Base64URL encoding)
 * @param {string} token - The JWT token
 * @returns {object|null} - The decoded payload or null if invalid
 */
export const decodeToken = (token) => {
  try {
    // Split the token and get the payload part
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    // Replace URL-safe characters and add padding
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')

    // Decode and parse
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode token:', error)
    return null
  }
}
