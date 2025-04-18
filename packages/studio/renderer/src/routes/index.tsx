import { createFileRoute } from "@tanstack/react-router";
import viteLogo from "/vite.svg";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <img src={viteLogo} height={40} />
      <h3>Welcome Home!</h3>
    </div>
  );
}
