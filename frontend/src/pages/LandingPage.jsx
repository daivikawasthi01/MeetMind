import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const pipeline = [
  { tag: 'TXT · MD', title: 'Paste a transcript', description: 'Drop in a raw transcript and get it structured in seconds.' },
  { tag: 'TXT · MD · PDF', title: 'Upload a file', description: 'Send a transcript file straight through the same pipeline.' },
  { tag: 'MP3 · WAV · M4A', title: 'Upload audio', description: 'A recording is transcribed, then read the same way.' },
  { tag: 'MP4 · MOV · WEBM', title: 'Upload video', description: 'Audio is pulled from the file and transcribed first.' },
];

const steps = [
  { title: 'Upload', description: 'Paste text, or hand over a file, a recording, or a video of the meeting.' },
  { title: 'Extract', description: 'The transcript is read for its summary, its action items, and its decisions.' },
  { title: 'Review', description: 'Everything lands on the dashboard, ready to edit or hand off.' },
];

const example = [
  { task: 'Ship the onboarding flow', owner: 'Priya', due: 'Fri' },
  { task: 'Send the API spec', owner: 'Marcus', due: 'Wed' },
  { task: 'Handle the design review', owner: 'Carol', due: 'Fri' },
  { task: 'Delay the billing migration', owner: 'Team', due: 'Q4' },
  { task: 'Lock the October 30 launch date', owner: 'Team', due: 'Oct 30' },
];

const LandingPage = () => {
  const { user } = useAuth();
  const primaryTo = user ? '/dashboard' : '/register';

  return (
    <div className="bg-paper text-ink">
      {/* ── Nav ── */}
      <nav className="border-b border-rule">
        <div className="container flex items-center justify-between h-[72px]">
          <Link to="/" aria-label="MeetMind home" className="font-display font-medium text-lg tracking-[-0.02em]">
            Meet<span className="text-accent">Mind</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard" className="btn btn--primary text-sm">Go to dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="text-sm text-muted hover:text-ink transition-colors duration-[var(--dur-short)]">Sign in</Link>
                <Link to="/register" className="btn btn--primary text-sm">Get started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero (Stage) ── */}
      <section className="container min-h-[calc(100dvh-72px)] flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-xl lg:gap-2xl items-center">
          <div className="lg:col-span-5">
            <h1>Meetings, minuted.</h1>
            <p className="lead text-ink-2 mt-md">
              Paste a transcript or upload audio, get the decisions and action items.
            </p>
            <div className="flex items-center gap-sm mt-lg">
              <Link to={primaryTo} className="btn btn--primary">{user ? 'Go to dashboard' : 'Start for free'}</Link>
              <Link to="/login" className="btn">Sign in</Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-card border border-rule bg-paper-2 overflow-hidden">
              <div className="flex items-center justify-between px-lg py-xl border-b border-rule">
                <span className="text-sm text-muted">Example meeting · product sync</span>
                <span className="measured text-ok px-xs py-[2px] rounded-pill bg-ok-soft">processed</span>
              </div>
              <div className="divide-y divide-rule">
                {example.map((row) => (
                  <div key={row.task} className="flex items-center justify-between gap-md px-lg py-xl">
                    <span className="text-sm text-ink-2">{row.task}</span>
                    <div className="flex items-center gap-sm shrink-0">
                      <span className="measured text-accent">{row.owner}</span>
                      <span className="measured text-cool">{row.due}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pipeline (Bento) ── */}
      <section className="container py-2xl">
        <h2>Every format, one pipeline</h2>
        <p className="lead text-muted mt-sm max-w-[52ch]">Whatever a meeting leaves behind, it comes out the other side the same way.</p>

        <div className="panels grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-xl">
          {pipeline.map((item) => (
            <div key={item.title} className="p-lg">
              <span className="measured text-muted">{item.tag}</span>
              <h3 className="mt-md mb-xs">{item.title}</h3>
              <p className="text-sm text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works (Rows) ── */}
      <section className="container py-2xl">
        <h2>Upload, extract, review.</h2>
        <ol className="hm-steps divide-y divide-rule mt-xl">
          {steps.map((step) => (
            <li key={step.title} className="grid grid-cols-1 md:grid-cols-12 gap-sm md:gap-xl py-lg md:items-baseline">
              <div className="md:col-span-5 flex items-baseline gap-md">
                <span className="hm-step-num measured text-muted" />
                <h3>{step.title}</h3>
              </div>
              <p className="md:col-span-7 text-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Close (Band) ── */}
      <section className="bg-paper-2 border-y border-rule py-2xl">
        <div className="container text-center">
          <h2 className="max-w-[20ch] mx-auto">Stop re-reading the transcript.</h2>
          <p className="lead text-muted mt-sm mx-auto">Let the next meeting write its own minutes.</p>
          <Link to={primaryTo} className="btn btn--primary mt-lg">
            {user ? 'Go to dashboard' : "Get started - it's free"}
          </Link>
        </div>
      </section>

      {/* ── Footer (Mast) ── */}
      <footer className="py-2xl">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-md">
          <span className="font-display font-medium">
            Meet<span className="text-accent">Mind</span>
          </span>
          <span className="text-sm text-muted">© {new Date().getFullYear()} MeetMind</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
