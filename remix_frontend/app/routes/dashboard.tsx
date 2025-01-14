import Button from "~/components/Button";
import type { Route } from "./+types/dashboard";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Dashboard" },
    { name: "description", content: "Graph Table: Dashboard page" },
  ];
}

export default function Home() {
  return <div>dashboard
    <Button onClick={console.log}>
      test
    </Button>
  </div>;
}
