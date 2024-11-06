// crypto
import crypto from 'crypto-js';

/**
 * 숫자 형태 여부 판단
 * @param value
 * @returns
 */
function isNumber(value: any): value is number {
  if (typeof value === 'number') {
    return true;
  }

  const v = Number(value);
  if (Number.isNaN(v)) {
    return false;
  }
  return true;
}

const ENC_KEY = 'demiansomewillkey!@!2022'; // set random encryption key
const IV = 'demiansomewill!@'; // set random initialisation vector
// ENC_KEY and IV can be generated as crypto.randomBytes(32).toString('hex');

/**
 * 암호화
 *
 * @param {string} val 암호화할 문자열
 */
export const encrypt = (val: string): string => {
  /*
  vite 에서는 crypto 가 일렉트론에서의 호환성 문제때문에 사용불가
  crypto js로 변경
  const cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
  let encrypted = cipher.update(val, 'utf8', 'base64');
  cipher += cipher.final('base64');
  return cipher;
  */
  const wordArray = crypto.enc.Utf8.parse(ENC_KEY);
  const iv = crypto.enc.Utf8.parse(IV);

  const cipher = crypto.AES.encrypt(val, wordArray, {
    iv,
    mode: crypto.mode.CBC,
    keySize: 256,
  });
  return cipher.toString();
};

/**
 * 복호화
 *
 * @param {string} encrypted 암호화된 문자열
 */
export const decrypt = (encrypted: string): string => {
  /*
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV);
  const decrypted = decipher.update(encrypted, 'base64', 'utf8');
  return decrypted + decipher.final('utf8');
  vite 에서는 crypto 가 일렉트론에서의 호환성 문제때문에 사용불가
  crypto js로 변경
  */

  const wordArray = crypto.enc.Utf8.parse(ENC_KEY);
  const iv = crypto.enc.Utf8.parse(IV);
  const decipher = crypto.AES.decrypt(encrypted, wordArray, {
    iv,
    mode: crypto.mode.CBC,
    keySize: 256,
  });

  return decipher.toString(crypto.enc.Utf8);
};

export { isNumber };
