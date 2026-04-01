import { requireSession } from "@/lib/auth-helper";

async function HomePage() {
  const session = await requireSession();

  return <div>HomePage</div>;
}

export default HomePage;
