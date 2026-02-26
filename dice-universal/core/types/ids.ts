import * as Crypto from "expo-crypto";

export async function newId(): Promise<string> {
  return await Crypto.randomUUID();
}