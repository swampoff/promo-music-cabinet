/**
 * KV Store utilities with retry logic for network errors
 * This file provides wrapper functions around the base kv_store with improved error handling
 */

import * as kv from './kv_store.tsx';

/**
 * Retry a kv operation with exponential backoff
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = 3
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err: any) {
      lastError = err;
      
      // Check if it's a network/connection error
      const isNetworkError = 
        err.message?.includes('connection') ||
        err.message?.includes('network') ||
        err.message?.includes('reset') ||
        err.message?.includes('timeout') ||
        err.message?.includes('ECONNRESET');
      
      if (isNetworkError && attempt < maxRetries - 1) {
        const delay = 1000 * (attempt + 1); // Exponential backoff: 1s, 2s, 3s
        console.log(`KV ${operationName}: Network error on attempt ${attempt + 1}/${maxRetries}, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If it's not a network error or we're out of retries, throw
      throw err;
    }
  }
  
  // This shouldn't be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Get with retry logic
 */
export async function get(key: string): Promise<any> {
  try {
    return await retryOperation(
      () => kv.get(key),
      `get("${key}")`,
      3
    );
  } catch (err: any) {
    console.error(`KV get("${key}") failed after all retries:`, err.message);
    // Return null instead of throwing to allow graceful degradation
    return null;
  }
}

/**
 * Set with retry logic
 */
export async function set(key: string, value: any): Promise<void> {
  return await retryOperation(
    () => kv.set(key, value),
    `set("${key}")`,
    3
  );
}

/**
 * Del with retry logic
 */
export async function del(key: string): Promise<void> {
  return await retryOperation(
    () => kv.del(key),
    `del("${key}")`,
    3
  );
}

/**
 * Mget with retry logic
 */
export async function mget(keys: string[]): Promise<any[]> {
  try {
    return await retryOperation(
      () => kv.mget(keys),
      `mget(${keys.length} keys)`,
      3
    );
  } catch (err: any) {
    console.error(`KV mget failed after all retries:`, err.message);
    // Return empty array instead of throwing to allow graceful degradation
    return [];
  }
}

/**
 * Mset with retry logic
 */
export async function mset(keys: string[], values: any[]): Promise<void> {
  return await retryOperation(
    () => kv.mset(keys, values),
    `mset(${keys.length} keys)`,
    3
  );
}

/**
 * Mdel with retry logic
 */
export async function mdel(keys: string[]): Promise<void> {
  return await retryOperation(
    () => kv.mdel(keys),
    `mdel(${keys.length} keys)`,
    3
  );
}

/**
 * GetByPrefix with retry logic
 */
export async function getByPrefix(prefix: string): Promise<any[]> {
  try {
    return await retryOperation(
      () => kv.getByPrefix(prefix),
      `getByPrefix("${prefix}")`,
      3
    );
  } catch (err: any) {
    console.error(`KV getByPrefix("${prefix}") failed after all retries:`, err.message);
    // Return empty array instead of throwing to allow graceful degradation
    return [];
  }
}
