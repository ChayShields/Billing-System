const COMMON_PASSWORDS = new Set([
  "password", "password1", "password123", "12345678", "123456789",
  "qwerty123", "letmein1", "admin123", "welcome1", "iloveyou1", "changeme1",
])

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 10) {
    return "Password must be at least 10 characters."
  }

  const classes = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length
  if (classes < 3) {
    return "Password must include at least 3 of: uppercase letters, lowercase letters, numbers, symbols."
  }

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return "That password is too common. Choose something harder to guess."
  }

  return null
}
