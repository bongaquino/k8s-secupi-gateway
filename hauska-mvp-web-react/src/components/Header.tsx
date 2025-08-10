import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, Info } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { DesignGuidelinesDialog } from "./DesignGuidelinesDialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
// } from "./ui/dropdown-menu";

export default function Header({
  setRunTour,
}: {
  setRunTour: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  const handleLogout = async () => {
    await logout();
  };

  const startTour = () => {
    setRunTour(true);
  };

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const currentTheme = document.documentElement.classList.contains("dark");
    setIsDarkMode(currentTheme);
  }, []);

  // const handleNavigateToProfile = () => {
  //   navigate("/profile");
  // };

  return (
    <header className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-2">
        <img
          src="/bongaquino-io-dark.png"
          alt="bongaquino Design API"
          className="w-40 sm:w-48 dark:hidden"
        />
        <img
          src="/bongaquino-io-white.png"
          alt="bongaquino Design API"
          className="w-40 sm:w-48 hidden dark:block"
        />
        {/* <h1 className="block sm:hidden text-2xl  font-bold text-black dark:text-white">
          bongaquino
        </h1>
        <div className="hidden sm:block">
          <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
            bongaquino Design API
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Transform Your Designs with AI
          </p>
        </div> */}
      </div>
      <div className="flex items-center gap-2 header-buttons">
        {/* Tooltip for Theme Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <ThemeToggle
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent className="w-[145px]">
            <p className="text-sm">
              {document.documentElement.classList.contains("dark")
                ? "Toggle Light Mode"
                : "Toggle Dark Mode"}
            </p>
          </TooltipContent>
        </Tooltip>

        {!isAuthenticated && !isAuthPage && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/login")}>
              Log In
            </Button>
            <Button onClick={() => navigate("/register")}>Sign Up</Button>
          </div>
        )}

        {isAuthenticated && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border hover:bg-muted-foreground/5 transition-colors w-10"
                  onClick={startTour}
                >
                  <Info />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="w-[164px]">
                <p className="text-sm">Play Onboarding Tour</p>
              </TooltipContent>
            </Tooltip>
            <DesignGuidelinesDialog />
            <Button
              variant="outline"
              className="flex items-center gap-2 border hover:bg-muted-foreground/5 transition-colors text-red-500"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {user?.first_name || "Profile"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleNavigateToProfile}>
                  <User className="h-4 w-4 mr-2" />
                  My Account
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-500 focus:text-red-500"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </>
        )}
      </div>
    </header>
  );
}
