import { createHmac } from 'crypto';

export function validateTelegramWebAppData(initData: string, botToken: string): boolean {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');

  const dataCheckString = Array.from(params.entries())
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = createHmac('sha256', secret).update(dataCheckString).digest('hex');

  return calculatedHash === hash;
}
