import { Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../assets/images/bongaquino-logo.png";

const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { logout } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <header className="bg-white border-b border-gray-200 h-20 px-4 flex items-center">
      <div className="flex justify-between md:justify-end items-center w-full">
        <div className="items-center border-b border-gray-200 h-20 flex md:hidden">
          <img
            src={Logo}
            alt="bongaquino Logo"
            className="w-[150px] cursor-pointer"
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="items-center flex">
            <Clock className="h-5 w-5 text-gray-600 mr-1" />
            <span className="ml-1 text-sm">{formattedTime}</span>
          </div>

          <Button
            variant="outline"
            onClick={logout}
            className="text-red-400 hover:text-red-500 hidden md:flex"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
