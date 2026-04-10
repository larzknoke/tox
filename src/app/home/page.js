import { requireSession } from "@/lib/auth-helper";

async function HomePage() {
  const session = await requireSession();

  return <div>HomePage1</div>;
}

export default HomePage;
