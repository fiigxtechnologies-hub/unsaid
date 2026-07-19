import { randomUUID } from "node:crypto";
import { createGoldenPathScenarioFixture } from "@/fixtures/server/golden-path-scenario";
import { sealSimulationToken } from "@/lib/server/simulation-token";
import { scenarioRequestSchema } from "@/schemas";
import type {
  ApiErrorCode,
  ApiErrorResponse,
  CanonicalMessage,
  ScenarioResponse,
  SimulationTokenPayload,
} from "@/types";

export const runtime = "nodejs";

const UNAVAILABLE_MESSAGE =
  "The rehearsal engine is not available yet. Please try again shortly.";
const VALIDATION_MESSAGE =
  "Please check the scenario details and try again.";

function apiError(code: ApiErrorCode, message: string, status: number) {
  const body: ApiErrorResponse = { error: { code, message } };
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return apiError("validation_failed", VALIDATION_MESSAGE, 400);
  }

  const validatedRequest = scenarioRequestSchema.safeParse(requestBody);

  if (!validatedRequest.success) {
    return apiError("validation_failed", VALIDATION_MESSAGE, 400);
  }

  if (process.env.USE_FIXTURES !== "true") {
    return apiError("unavailable", UNAVAILABLE_MESSAGE, 503);
  }

  try {
    const fixture = createGoldenPathScenarioFixture();
    const sessionId = randomUUID();
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + 24 * 60 * 60 * 1000);
    const canonicalOpeningMessage: CanonicalMessage = {
      id: "msg-0",
      role: "counterpart",
      content: fixture.openingMessageContent,
      turnNumber: 0,
      order: 0,
    };
    const payload: SimulationTokenPayload = {
      schemaVersion: 1,
      sessionId,
      blueprint: fixture.blueprint,
      canonicalMessages: [canonicalOpeningMessage],
      snapshots: [
        {
          afterMessageId: canonicalOpeningMessage.id,
          state: fixture.initialState,
          phase: "opening",
        },
      ],
      currentState: fixture.initialState,
      phase: "opening",
      turnCount: 0,
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    const response: ScenarioResponse = {
      sessionId,
      openingMessage: {
        id: canonicalOpeningMessage.id,
        role: canonicalOpeningMessage.role,
        content: canonicalOpeningMessage.content,
        turnNumber: canonicalOpeningMessage.turnNumber,
      },
      visiblePressureLabel: "Guarded",
      turnCount: 0,
      simulationToken: sealSimulationToken(payload),
    };

    return Response.json(response);
  } catch {
    return apiError("unavailable", UNAVAILABLE_MESSAGE, 503);
  }
}
