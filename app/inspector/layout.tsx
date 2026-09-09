import Navbar from "@/components/inspector/Navbar";
import Topbar from "@/components/inspector/Topbar";

export default function InspectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Topbar/>
      {children}    
      <Navbar/>
    </div>
  );
}
