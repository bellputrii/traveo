// utils/idGenerator.ts
import { v5 as uuidv5, v4 as uuidv4 } from 'uuid';

// Namespace untuk UUID v5 (gunakan UUID v4 yang konstan)
const UUID_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';

/**
 * Generate secret ID dari documentId
 * @param documentId - Original document ID
 * @returns Secret ID yang aman untuk URL
 */
export function generateSecretId(documentId: string): string {
  return uuidv5(documentId, UUID_NAMESPACE);
}

/**
 * Generate random secret ID (untuk artikel baru)
 * @returns Random secret ID
 */
export function generateRandomSecretId(): string {
  return uuidv4();
}

/**
 * Validate jika secret ID valid format
 */
export function isValidSecretId(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}