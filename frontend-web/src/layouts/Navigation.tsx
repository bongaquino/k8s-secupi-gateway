import {
  ChevronDown,
  UserCog,
  ShieldUser,
  Building2,
  User,
  Check,
  Home,
  Key,
  BarChart3,
  Settings,
  Bell,
  RotateCcw,
  BookOpen,
  Folder,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Drawer, DrawerContent } from "../components/ui/drawer";
import { menuItems, developerMenuItems } from "../lib/constants";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "../assets/images/bongaquino-logo.png";

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Navigation = ({ currentPage, setCurrentPage }: NavigationProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      Folder: <Folder className="h-4 w-4 mr-3" />,
      Home: <Home className="h-4 w-4 mr-3" />,
      Recover: <RotateCcw className="h-4 w-4 mr-3" />,
      Bell: <Bell className="h-4 w-4 mr-3" />,
      Key: <Key className="h-4 w-4 mr-3" />,
      BarChart3: <BarChart3 className="h-4 w-4 mr-3" />,
      Settings: <Settings className="h-4 w-4 mr-3" />,
      Book: <BookOpen className="h-4 w-4 mr-3" />,
    };
    return iconMap[iconName] || <Home className="h-4 w-4 mr-3" />;
  };

  const handleItemClick = (pageName: string) => {
    if (pageName === "api-reference") {
      window.open("https://bongaquino.readme.io/", "_blank");
      return;
    }

    const allMenuItems = [...menuItems, ...developerMenuItems];
    const menuItem = allMenuItems.find((item) => item.id === pageName);

    if (menuItem && menuItem.href) {
      setCurrentPage(pageName);
      navigate(menuItem.href);
    } else if (pageName === "/" || pageName === "file-explorer") {
      setCurrentPage("file-explorer");
      navigate("/");
    }
  };

  const handleLogout = () => {
    logout();
    setShowMobileDrawer(false);
  };

  return (
    <>
      <div className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex">
        <div className="flex items-center px-4 border-b border-gray-200 h-20">
          <img
            src={Logo}
            alt="bongaquino Logo"
            className="w-[180] cursor-pointer"
            onClick={() => handleItemClick("file-explorer")}
          />
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-6 text-xs font-semibold text-gray-500  tracking-wider">
            Menu
          </div>
          <nav className="mt-2 px-2">
            {menuItems.map((item) => (
              <div key={item.id} className="mb-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between px-3 py-2 h-12 text-sm font-medium cursor-pointer",
                    currentPage === item.id
                      ? "bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => {
                    handleItemClick(item.id);
                  }}
                >
                  <div className="flex items-center">
                    {getIcon(item.icon)}
                    {item.label}
                  </div>
                </Button>
              </div>
            ))}
          </nav>

          <div className="px-6 text-xs font-semibold text-gray-500 tracking-wider mt-6">
            Developers
          </div>
          <nav className="mt-2 px-2">
            {developerMenuItems.map((item) => (
              <div key={item.id} className="mb-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between px-3 py-2 h-12 text-sm font-medium cursor-pointer",
                    currentPage === item.id
                      ? "bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => handleItemClick(item.id)}
                >
                  <div className="flex items-center">
                    {getIcon(item.icon)}
                    {item.label}
                  </div>
                </Button>
              </div>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-3">
            <Avatar className="h-8 w-8 bg-blue-100">
              <AvatarFallback className="text-blue-700">
                {user?.first_name.charAt(0)}
                {user?.last_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-2">
              <div className="text-sm font-medium">
                {user?.first_name} {user?.last_name}
              </div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
          </div>

          <div className="relative">
            <Button
              variant="outline"
              className="w-full mb-1  hover:bg-blue-50 justify-between"
              onClick={() => setShowAccountMenu(!showAccountMenu)}
            >
              <div className="flex items-center">
                <UserCog className="h-4 w-4 mr-2" />
                Switch Account
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  showAccountMenu && "rotate-180"
                )}
              />
            </Button>

            {showAccountMenu && (
              <div className="absolute bottom-full mb-1 w-full bg-white border border-gray-200 rounded-md shadow-lg py-1 px-1">
                <Button
                  variant="ghost"
                  className="w-full flex justify-between text-sm px-3 py-2 hover:bg-blue-50 "
                  onClick={() => {
                    setShowAccountMenu(false);
                  }}
                >
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Standard User
                  </div>
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm px-3 py-2 hover:bg-blue-50 cursor-not-allowed"
                  onClick={() => {
                    setShowAccountMenu(false);
                  }}
                >
                  <div className="flex items-center">
                    <ShieldUser className="h-4 w-4 mr-2" />
                    Corporate Manager
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm px-3 py-2 hover:bg-blue-50 cursor-not-allowed"
                  onClick={() => {
                    setShowAccountMenu(false);
                  }}
                >
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    Headquarters Manager
                  </div>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 z-50 h-[4.5rem] w-full bg-white border-t border-gray-200 md:hidden">
        <div className="grid grid-cols-5 h-full">
          <div
            className={cn(
              "flex flex-col gap-1.5 items-center justify-center cursor-pointer transition-colors",
              currentPage === "file-explorer"
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            )}
            onClick={() => handleItemClick("file-explorer")}
          >
            <Folder className="h-5 w-5" />
            <span className="text-xs">Backups</span>
          </div>
          <div
            className={cn(
              "flex flex-col gap-1.5 items-center justify-center cursor-pointer transition-colors",
              currentPage === "api-keys"
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            )}
            onClick={() => handleItemClick("api-keys")}
          >
            <Key className="h-5 w-5" />
            <span className="text-xs">API Keys</span>
          </div>
          <div
            className="flex flex-col gap-1.5 items-center justify-center cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => window.open("https://bongaquino.readme.io/", "_blank")}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs">API Docs</span>
          </div>
          <div
            className={cn(
              "flex flex-col gap-1.5 items-center justify-center cursor-pointer transition-colors",
              currentPage === "settings"
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            )}
            onClick={() => handleItemClick("settings")}
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs">Settings</span>
          </div>
          <div
            className={cn(
              "flex flex-col gap-1.5 items-center justify-center cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
            )}
            onClick={() => setShowMobileDrawer(true)}
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Account</span>
          </div>
        </div>
      </div>

      <Drawer open={showMobileDrawer} onOpenChange={setShowMobileDrawer}>
        <DrawerContent className="md:hidden">
          <div className="px-6 pb-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-2 mt-4">
              <Avatar className="h-12 w-12 bg-blue-100">
                <AvatarFallback className="text-blue-700">
                  {user?.first_name.charAt(0)}
                  {user?.last_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 justify-start text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Navigation;
