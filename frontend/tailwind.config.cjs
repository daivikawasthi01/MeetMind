/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: 'var(--color-paper)',
        'paper-2': 'var(--color-paper-2)',
        'paper-3': 'var(--color-paper-3)',
        ink: 'var(--color-ink)',
        'ink-2': 'var(--color-ink-2)',
        muted: 'var(--color-muted)',
        rule: 'var(--color-rule)',
        'rule-2': 'var(--color-rule-2)',
        accent: 'var(--color-accent)',
        'accent-ink': 'var(--color-accent-ink)',
        'accent-soft': 'var(--color-accent-soft)',
        cool: 'var(--color-cool)',
        'cool-soft': 'var(--color-cool-soft)',
        ok: 'var(--color-ok)',
        'ok-soft': 'var(--color-ok-soft)',
        bad: 'var(--color-bad)',
        'bad-soft': 'var(--color-bad-soft)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
        mono: 'var(--font-outlier)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
        pill: 'var(--radius-pill)',
      },
      spacing: {
        '3xs': 'var(--space-3xs)',
        '2xs': 'var(--space-2xs)',
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)',
        '2xl': 'var(--space-2xl)',
        '3xl': 'var(--space-3xl)',
        '4xl': 'var(--space-4xl)',
      },
    },
  },
  plugins: [],
}
