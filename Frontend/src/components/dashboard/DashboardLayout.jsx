import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: "🏠",
    },
    {
      title: "Fundraisers",
      href: "/dashboard/fundraisers",
      icon: "💰",
    },
    {
      title: "Donors",
      href: "/dashboard/donors",
      icon: "🤝",
    },
    {
      title: "Admin Panel",
      href: "/dashboard/admin",
      icon: "⚙️",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for larger screens */}
      <aside
        className={cn(
          "hidden md:flex w-64 flex-col fixed inset-y-0 z-50",
          "bg-white border-r border-gray-200"
        )}
      >
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
            <h1 className="text-xl font-bold text-white">Good Deed Hub</h1>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.title}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-[240px] sm:w-[340px]">
          <SheetHeader>
            <SheetTitle>The Good Deed Hub</SheetTitle>
            <SheetDescription>Navigation Menu</SheetDescription>
          </SheetHeader>
          <nav className="flex flex-col gap-2 mt-4">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.title}
              </a>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-col flex-1 md:pl-64">
        {/* Top navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              ☰
            </Button>
            <div className="flex items-center gap-4">
              <Button variant="outline">Profile</Button>
              <Button variant="outline">Logout</Button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
