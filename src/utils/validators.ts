export function validatePhone(phone: string): boolean {
  return /^\+?[1-9]\d{8,14}$/.test(phone.replace(/\s+/g, ''));
}
