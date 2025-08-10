import { useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  return (
    <footer
      className={`border-t border-border relative z-10 bg-background ${
        isAuthPage ? "py-4" : "py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground order-2 md:order-1">
            © {new Date().getFullYear()} Hauska. All rights reserved.
          </div>

          <div className="flex items-center order-1 md:order-2">
            <div className="hidden sm:block text-sm text-muted-foreground mr-3">
              Premier Partner:
            </div>
            <a
              href="https://aibd.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              aria-label="American Institute of Building Design"
            >
              <img
                src="/aibd-logo-black.png"
                alt="American Institute of Building Design"
                className={`dark:hidden ${isAuthPage ? "h-16" : "h-16"} w-auto`}
              />
              <img
                src="/aibd-logo-white.png"
                alt="American Institute of Building Design"
                className={`hidden dark:block ${
                  isAuthPage ? "h-16" : "h-16"
                } w-auto`}
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
