import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  Kanban,
  Keyboard,
  Filter,
  Bell,
  MessageSquare,
  CalendarRange,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const features = [
  { icon: Kanban, title: 'Board, list & timeline', desc: 'Switch between views to plan, triage, and ship.' },
  { icon: Keyboard, title: 'Keyboard-first', desc: 'Press C to create, / to search. Stay in flow.' },
  { icon: Filter, title: 'Powerful filters', desc: 'Slice by assignee, priority, status, or label.' },
  { icon: CalendarRange, title: 'Cycle planning', desc: 'Plan sprints and track progress over time.' },
  { icon: Bell, title: 'Notifications inbox', desc: 'Stay on top of mentions and updates.' },
  { icon: MessageSquare, title: 'Comment threads', desc: 'Discuss issues in context with your team.' },
];

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="h-7 w-7 rounded-md bg-primary" />
            <span>Palace</span>
          </Link>
          <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#workflow" className="hover:text-foreground">Workflow</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild size="sm">
                <Link to="/app">Open app</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/auth">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.15),_transparent_60%)]" />
        <div className="container mx-auto px-6 py-24 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Built for modern product teams
          </div>
          <h1 className="mx-auto max-w-3xl text-5xl font-semibold tracking-tight md:text-6xl">
            The issue tracker your team will actually use.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Plan cycles, triage work, and ship faster with a fast, keyboard-friendly tracker
            designed for engineers.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to={user ? '/app' : '/auth'}>
                {user ? 'Open app' : 'Start for free'} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#features">See features</a>
            </Button>
          </div>

          {/* Preview card */}
          <div className="mx-auto mt-16 max-w-5xl rounded-xl border border-border/60 bg-card p-2 shadow-2xl">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-8">
              <div className="grid grid-cols-3 gap-4">
                {['Backlog', 'In Progress', 'Done'].map((col) => (
                  <div key={col} className="rounded-md border border-border/60 bg-background p-3 text-left">
                    <div className="mb-3 text-xs font-medium text-muted-foreground">{col}</div>
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <div key={i} className="rounded border border-border/60 bg-card p-3">
                          <div className="mb-2 h-2 w-3/4 rounded bg-muted" />
                          <div className="h-2 w-1/2 rounded bg-muted/60" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-border/60 py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Everything you need to ship.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Built with the workflows of high-performing product teams in mind.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-lg border border-border/60 bg-card p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-medium">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="border-b border-border/60 py-24">
        <div className="container mx-auto grid items-center gap-12 px-6 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Designed for speed.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Every interaction is tuned for keyboard-first power users. Create issues in a keystroke,
              drag between columns, and search instantly.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                'Press C to create an issue from anywhere',
                'Press / to focus search instantly',
                'Drag issues across statuses on the board',
                'Plan cycles and track sprint velocity',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-6">
            <div className="space-y-3">
              {[
                { k: 'C', v: 'Create issue' },
                { k: '/', v: 'Search' },
                { k: '⌘K', v: 'Command menu' },
                { k: 'Esc', v: 'Close panel' },
              ].map((s) => (
                <div key={s.k} className="flex items-center justify-between rounded-md border border-border/60 bg-background px-4 py-3">
                  <span className="text-sm text-muted-foreground">{s.v}</span>
                  <kbd className="rounded border border-border/60 bg-muted px-2 py-1 font-mono text-xs">
                    {s.k}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Ready to ship faster?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Sign up and create your first issue in under a minute.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link to={user ? '/app' : '/auth'}>
              {user ? 'Open app' : 'Get started free'} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Palace. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
