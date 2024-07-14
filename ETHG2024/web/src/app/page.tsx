import { api } from "~/trpc/server";
import { HomeScreen } from "~/components/home/home-screen";

export default async function Landing() {
  const companies = await api.company.getAllPublic();

  return (
    <div className="flex min-h-dvh flex-col">
      <HomeScreen companies={companies} />
    </div>
  );
}
