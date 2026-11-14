import { Page } from "@/components/Page";
import { authConfig, safeNext } from "@/lib/auth/session";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <Page eyebrow="Private" title="Dream Planner ♡" lede="This planner is just for the family. Enter the passcode to open it.">
      <LoginForm next={safeNext(next)} ready={authConfig() !== null} />
    </Page>
  );
}
