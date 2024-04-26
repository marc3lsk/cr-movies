import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div>
      <header>Main Header</header>
      <main>
        <Outlet />
      </main>
      <footer>Main Footer</footer>
    </div>
  );
}
