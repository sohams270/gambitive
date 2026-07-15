import { SITE } from "./site";

export type SignupVariant = "inline" | "end" | "home" | "landing";

const COPY: Record<SignupVariant, { heading: string; body: string }> = {
  inline: {
    heading: "Get the next one in your inbox",
    body: `One sharp email a week on ${SITE.niche}. No fluff, no press releases rewritten.`,
  },
  end: {
    heading: "If this was worth your time, the newsletter will be too",
    body: `One email a week: what happened, why it matters, and the stories founders don't usually tell. Free.`,
  },
  home: {
    heading: "One sharp email a week",
    body: `The week's news explained, one deep dive, and no press releases rewritten. Unsubscribe any time.`,
  },
  landing: {
    heading: "The email that keeps you a move ahead",
    body: `Every week: what actually happened in ${SITE.niche}, why it matters, and one story a founder told us straight. No fluff, no spin, free.`,
  },
};

/**
 * Single source of truth for signup markup. Used by NewsletterSignup.astro
 * and by the rehype plugin that injects the mid-article block, so every
 * variant is genuinely the same component with different copy.
 */
export function signupHtml(variant: SignupVariant): string {
  const { heading, body } = COPY[variant];
  return `
<aside class="signup signup--${variant}" aria-label="Newsletter signup">
  <h2 class="signup-heading">${heading}</h2>
  <p class="signup-body">${body}</p>
  <form class="signup-form" action="${SITE.newsletterAction}" method="post">
    <label class="sr-only" for="signup-email-${variant}">Email address</label>
    <input
      id="signup-email-${variant}"
      type="email"
      name="email"
      required
      placeholder="you@company.com"
      autocomplete="email"
    />
    <button type="submit" class="btn">Subscribe</button>
  </form>
</aside>`.trim();
}
