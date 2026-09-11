import Navbar from "@/components/supervisor/Navbar";
import Topbar from "@/components/supervisor/Topbar";

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div>
      {/*<Topbar />*/}
      {children}
      <Navbar />
    </div>
  );
}
