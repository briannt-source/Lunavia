import { hash, genSalt, compare } from 'bcrypt';

export async function hashPassword(plain: string) {
  const salt = await genSalt(10);
  return hash(plain, salt);
}

export async function verifyPassword(plain: string, hashed: string) {
  return compare(plain, hashed);
}
