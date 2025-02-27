import Header from "./Header";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen">
      <Header />
      <div className="h-screen">{children}</div>
    </div>
  );
}

export default Layout;
