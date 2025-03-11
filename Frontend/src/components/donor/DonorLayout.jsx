import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/slices/userSlice";
import {
  LayoutDashboard,
  Heart,
  BookmarkCheck,
  UserCircle,
  LogOut,
  Menu,
  X,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const navigation = [
  { name: "Dashboard", href: "/donor", icon: LayoutDashboard },
  { name: "My Donations", href: "/donor/donations", icon: Heart },
  { name: "Saved Causes", href: "/donor/saved", icon: BookmarkCheck },
  { name: "My Reviews", href: "/donor/reviews", icon: Star },
  { name: "Profile", href: "/donor/profile", icon: UserCircle },
  { name: "Logout", href: "#", icon: LogOut },
];

export default function DonorLayout({ children }) {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const currentPage = navigation.find((item) => item.href === location.pathname)?.name || "Dashboard";

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-card border-r">
        {/* Logo */}
        <div className="flex h-16 items-center gap-x-3 px-6 border-b">
          <Heart className="h-8 w-8 text-primary" fill="currentColor" />
          <span className="text-lg font-semibold">The Good Deed Hub</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            if (item.name === "Logout") {
              return (
                <button
                  key={item.name}
                  onClick={handleLogout}
                  className={cn(
                    "flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </button>
              );
            }
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile navigation */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <div className="flex items-center gap-x-3">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <span className="text-lg font-semibold">Good Deed Hub</span>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImage} />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="border-b">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              if (item.name === "Logout") {
                return (
                  <button
                    key={item.name}
                    onClick={handleLogout}
                    className="flex w-full items-center gap-x-3 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </button>
                );
              }
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-x-3 px-4 py-2 text-sm font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background border-b">
          <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold">{currentPage}</h1>
              {location.pathname === "/donor" && (
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  Welcome back, {user?.name?.split(" ")[0]}!
                </Badge>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
} 