import { LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocketStore } from "@/stores/useSocketStore";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

const Logout = () => {
  const signOut = useAuthStore((s) => s.signOut);
  const disconnectSocket = useSocketStore((s) => s.disconnectSocket);

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      disconnectSocket();
      window.location.assign("/signin");
    }
  };

  return (
    <DropdownMenuItem
      className="cursor-pointer"
      variant="destructive"
      onClick={() => {
        void handleLogout();
      }}
    >
      <LogOut />
      Log out
    </DropdownMenuItem>
  );
};

export default Logout;
