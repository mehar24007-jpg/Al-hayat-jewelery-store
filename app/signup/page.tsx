import AuthForm from "@/components/AuthForm";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="wrap py-12">
      <AuthForm kind="signup" next={next ?? "/"} />
    </main>
  );
}
