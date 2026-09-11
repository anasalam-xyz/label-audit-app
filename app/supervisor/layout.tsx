import Navbar from "@/components/supervisor/Navbar";

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div>
      {children}
      <Navbar />
    </div>
  );
}
