import "server-only";

import type {
  ConversationState,
  PersonaBlueprint,
} from "@/types";

export function createGoldenPathScenarioFixture(): {
  blueprint: PersonaBlueprint;
  initialState: ConversationState;
  openingMessageContent: string;
} {
  return {
    blueprint: {
      counterpartRole: "Manager",
      communicationStyle:
        "Professional, concise, skeptical, and time-conscious without being hostile.",
      primaryMotivation:
        "Protect team fairness and operate within compensation and budget constraints.",
      concerns: [
        "The current quarter's budget is largely fixed.",
        "Compensation discussions need evidence and process.",
        "The conversation could become a comparison with other employees.",
      ],
      triggers: [
        "Claims that colleagues are contributing less.",
        "Demands framed as accusations or unfair treatment.",
      ],
      opennessConditions: [
        "Specific evidence about expanded responsibilities.",
        "A calm and direct request.",
        "A reasonable next step when an immediate adjustment is unavailable.",
      ],
      knownFacts: [
        "The user reports managing two additional projects for six months.",
        "The user reports strong performance feedback.",
        "The user wants a compensation review or a clear timeline.",
      ],
      boundaries: [
        "Cannot discuss other employees' compensation.",
        "Cannot promise an immediate salary change.",
        "Should not invent company policy or private facts.",
      ],
      likelyObjections: [
        "The budget is fixed this quarter.",
        "A compensation outcome cannot be promised during this meeting.",
        "A formal review may require additional approval.",
      ],
    },
    initialState: {
      receptivity: 55,
      defensiveness: 25,
      trust: 60,
      askClarity: 0,
      resolutionLikelihood: 40,
    },
    openingMessageContent:
      "Hi Amara, thanks for grabbing time. I've got about fifteen minutes before my next meeting — what did you want to talk through?",
  };
}
