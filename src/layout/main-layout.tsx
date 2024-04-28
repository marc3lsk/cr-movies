import { Outlet } from "react-router-dom";
import TopNavigation from "./components/top-navigation";

export default function MainLayout() {
  return (
    <div className="p-8">
      <header>
        <TopNavigation />
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
