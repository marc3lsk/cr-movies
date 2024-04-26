import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="p-8">
      <header className="py-8">Main Header</header>
      <main>
        <Outlet />
      </main>
      <footer className="py-8">Main Footer</footer>
    </div>
  );
}
