import Link from "next/link";
import type { Scenario } from "@/types";
import { ScenarioSetupForm } from "./scenario-setup-form";

const blankScenario: Scenario = {
  counterpart: "",
  topic: "",
  desiredOutcome: "",
  fearedReaction: "",
  additionalContext: "",
};

const presetScenarios = {
  raise: {
    counterpart: "My manager",
    topic:
      "I want to ask for a salary adjustment based on the two additional projects I've taken on over the last six months.",
    desiredOutcome: "A compensation review, or a clear timeline for one.",
    fearedReaction:
      "That budgets are frozen, and that they'll dismiss the request.",
    additionalContext:
      "I've managed two extra projects for six months and had strong performance feedback in my last review.",
  },
  boundary: {
    counterpart: "A close friend",
    topic:
      "I need to address repeated last-minute cancellations and explain how they affect me.",
    desiredOutcome:
      "A clearer boundary and more reliable communication about plans.",
    fearedReaction:
      "That they'll become defensive or say I'm making the issue bigger than it is.",
    additionalContext:
      "This has happened several times recently, and I usually avoid raising it because I don't want an argument.",
  },
  deadline: {
    counterpart: "A teammate",
    topic:
      "I need to discuss a missed project deadline and understand what caused the delay.",
    desiredOutcome:
      "A realistic recovery plan and clearer accountability for the next deadline.",
    fearedReaction:
      "That they'll make excuses, blame other people, or avoid committing to a new plan.",
    additionalContext:
      "The missed deadline has affected work that other team members were waiting to begin.",
  },
} satisfies Record<string, Scenario>;

type PresetKey = keyof typeof presetScenarios;

function isPresetKey(value: string): value is PresetKey {
  return value in presetScenarios;
}

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string | string[] }>;
}) {
  const requestedPreset = (await searchParams).preset;
  const preset =
    typeof requestedPreset === "string" && isPresetKey(requestedPreset)
      ? requestedPreset
      : null;
  const initialScenario = preset ? presetScenarios[preset] : blankScenario;

  return (
    <div className="setup-shell">
      <header className="site-header setup-header">
        <nav className="site-nav" aria-label="Setup navigation">
          <Link className="wordmark" href="/">
            Unsaid
          </Link>
          <span className="product-label">Scenario setup</span>
        </nav>
      </header>

      <main className="setup-main">
        <section className="setup-intro" aria-labelledby="setup-heading">
          <p className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            Prepare your rehearsal
          </p>
          <h1 id="setup-heading">What conversation do you need to have?</h1>
          <p>
            Give Unsaid enough context to create a realistic counterpart. You
            can edit every detail before starting.
          </p>
        </section>

        <ScenarioSetupForm
          initialScenario={initialScenario}
          key={preset ?? "blank"}
        />
      </main>
    </div>
  );
}
