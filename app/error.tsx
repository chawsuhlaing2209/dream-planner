"use client";

import { Page } from "@/components/Page";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <Page eyebrow="Something went wrong" title="Could not load this page">
      <p className="muted">The data could not be read. Check that the database is set up, then try again.</p>
      <p>
        <button type="button" onClick={reset}>
          Try again
        </button>
      </p>
    </Page>
  );
}
