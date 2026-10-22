import AuthForm from "@/components/AuthForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="wrap py-12">
      <AuthForm kind="login" next={next ?? "/"} />
    </main>
  );
}
