import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { simulationTokenPayloadSchema } from "@/schemas";
import type { SimulationTokenPayload } from "@/types";

const TOKEN_VERSION = "v1";
const IV_LENGTH_BYTES = 12;
const AUTH_TAG_LENGTH_BYTES = 16;
const MAX_TOKEN_BYTES = 48 * 1024;
const TOKEN_PART_PATTERN = /^[A-Za-z0-9_-]+$/;

export type SimulationTokenErrorCode =
  | "configuration_error"
  | "invalid_token"
  | "expired_token";

export class SimulationTokenError extends Error {
  readonly code: SimulationTokenErrorCode;

  constructor(code: SimulationTokenErrorCode) {
    super("The simulation token could not be processed.");
    this.name = "SimulationTokenError";
    this.code = code;
  }
}

function getEncryptionKey() {
  const secret = process.env.UNSAID_TOKEN_SECRET;

  if (!secret || secret.length < 32) {
    throw new SimulationTokenError("configuration_error");
  }

  return createHash("sha256").update(secret, "utf8").digest();
}

function invalidToken(): never {
  throw new SimulationTokenError("invalid_token");
}

function decodeTokenPart(part: string) {
  if (!part || !TOKEN_PART_PATTERN.test(part)) {
    invalidToken();
  }

  const decoded = Buffer.from(part, "base64url");

  if (decoded.toString("base64url") !== part) {
    invalidToken();
  }

  return decoded;
}

export function sealSimulationToken(payload: SimulationTokenPayload): string {
  const validated = simulationTokenPayloadSchema.safeParse(payload);

  if (!validated.success || Date.parse(validated.data.expiresAt) <= Date.now()) {
    invalidToken();
  }

  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  cipher.setAAD(Buffer.from(TOKEN_VERSION, "utf8"));

  const plaintext = Buffer.from(JSON.stringify(validated.data), "utf8");
  const ciphertext = Buffer.concat([
    cipher.update(plaintext),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  const token = [
    TOKEN_VERSION,
    iv.toString("base64url"),
    ciphertext.toString("base64url"),
    authTag.toString("base64url"),
  ].join(".");

  if (Buffer.byteLength(token, "utf8") > MAX_TOKEN_BYTES) {
    invalidToken();
  }

  return token;
}

export function openSimulationToken(token: string): SimulationTokenPayload {
  if (
    typeof token !== "string" ||
    Buffer.byteLength(token, "utf8") > MAX_TOKEN_BYTES
  ) {
    invalidToken();
  }

  const parts = token.split(".");

  if (parts.length !== 4 || parts[0] !== TOKEN_VERSION) {
    invalidToken();
  }

  try {
    const iv = decodeTokenPart(parts[1]);
    const ciphertext = decodeTokenPart(parts[2]);
    const authTag = decodeTokenPart(parts[3]);

    if (
      iv.length !== IV_LENGTH_BYTES ||
      ciphertext.length === 0 ||
      authTag.length !== AUTH_TAG_LENGTH_BYTES
    ) {
      invalidToken();
    }

    const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);
    decipher.setAAD(Buffer.from(TOKEN_VERSION, "utf8"));
    decipher.setAuthTag(authTag);

    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString("utf8");
    const parsedPayload: unknown = JSON.parse(plaintext);
    const validated = simulationTokenPayloadSchema.safeParse(parsedPayload);

    if (!validated.success) {
      invalidToken();
    }

    if (Date.parse(validated.data.expiresAt) <= Date.now()) {
      throw new SimulationTokenError("expired_token");
    }

    return validated.data;
  } catch (error) {
    if (error instanceof SimulationTokenError) {
      throw error;
    }

    invalidToken();
  }
}
