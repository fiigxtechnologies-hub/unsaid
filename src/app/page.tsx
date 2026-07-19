import Link from "next/link";

const scenarios = [
  {
    title: "Ask my manager for a raise",
    description:
      "Request a compensation review without the conversation stalling.",
    label: "Workplace",
  },
  {
    title: "Set a boundary with a friend",
    description:
      "Address repeated last-minute cancellations without a blow-up.",
    label: "Relationship",
  },
  {
    title: "Address a missed deadline",
    description:
      "Understand the delay and rebuild accountability with a teammate.",
    label: "Teamwork",
  },
] as const;

const steps = [
  "Describe the conversation",
  "Rehearse realistic pushback",
  "Replay the turning point",
] as const;

export default function Home() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <nav className="site-nav" aria-label="Primary navigation">
          <Link className="wordmark" href="/">
            Unsaid
          </Link>
          <span className="product-label">AI conversation practice</span>
        </nav>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-heading">
          <p className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            Conversation rehearsal and replay
          </p>
          <h1 id="hero-heading">
            Practice the conversation
            <br />
            before it matters.
          </h1>
          <p className="hero-copy">
            Rehearse a hard conversation with a realistic AI counterpart, find
            the moment that changed everything, and try it again.
          </p>
          <div className="hero-action">
            <Link className="primary-cta" href="/setup">
              Start a rehearsal
              <span aria-hidden="true">→</span>
            </Link>
            <p>No account required.</p>
          </div>
        </section>

        <section className="scenario-section" aria-labelledby="scenario-heading">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Practice library</p>
              <h2 id="scenario-heading">Start with a common conversation</h2>
            </div>
            <p>Choose a starting point or describe your own situation.</p>
          </div>

          <div className="scenario-grid">
            {scenarios.map((scenario) => (
              <Link className="scenario-card" href="/setup" key={scenario.title}>
                <span className="scenario-label">{scenario.label}</span>
                <h3>{scenario.title}</h3>
                <p>{scenario.description}</p>
                <span className="card-action">
                  Practice this conversation
                  <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="process-section" aria-labelledby="process-heading">
          <div className="process-heading">
            <p className="section-kicker">A clearer way forward</p>
            <h2 id="process-heading">How it works</h2>
          </div>
          <ol className="process-list">
            {steps.map((step, index) => (
              <li key={step}>
                <span aria-hidden="true">0{index + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <aside className="privacy-notice" aria-labelledby="privacy-heading">
          <div className="privacy-mark" aria-hidden="true">
            i
          </div>
          <div>
            <h2 id="privacy-heading">Privacy &amp; simulation notice</h2>
            <p>
              Unsaid creates possible conversational scenarios for practice. It
              cannot predict a real person&apos;s response and is not a substitute
              for professional, legal, medical, HR, or mental-health advice.
              Avoid entering passwords, financial details, or confidential
              information.
            </p>
          </div>
        </aside>
      </main>

      <footer className="site-footer">
        <span className="wordmark">Unsaid</span>
        <span>Built for OpenAI Build Week</span>
      </footer>
    </div>
  );
}
