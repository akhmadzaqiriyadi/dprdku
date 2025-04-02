"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Menu, X, Bell, User, LogOut, Home, LayoutDashboard, FileText, ChevronDown } from "lucide-react"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface NavbarProps {
  user: any;
  userRole: string | null;
  onLogout: () => void;
}

// Mock notifications - in a real app, this would come from props or a state management solution
const mockNotifications = [
  { id: 1, message: "Laporan Anda telah ditanggapi", time: "5 menit yang lalu", read: false },
  { id: 2, message: "Status laporan telah diperbarui", time: "1 jam yang lalu", read: false },
  { id: 3, message: "Komentar baru pada laporan Anda", time: "3 jam yang lalu", read: true },
];

export default function Navbar({ user, userRole, onLogout }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const router = useRouter();
  const username = Cookies.get("username"); // Get username from cookies

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const navItems = [
    { href: "/", label: "Beranda", icon: <Home className="h-4 w-4 mr-2" /> },
    ...(user && (userRole === "masyarakat" || userRole === "admin" || userRole === "dprd")
      ? [
          { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
          { href: "/dashboard/reports/create", label: "Buat Laporan", icon: <FileText className="h-4 w-4 mr-2" /> },
        ]
      : []),
  ];

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <nav className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold flex items-center gap-2">
            DPRDku <span className="text-secondary">🚀</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium hover:text-secondary transition-colors duration-200 flex items-center"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Section - Desktop View */}
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-medium">Notifikasi</h4>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                        Tandai semua dibaca
                      </Button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-4 border-b hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-muted/20' : ''}`}
                        >
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-medium">{notification.message}</p>
                            {!notification.read && <Badge className="h-2 w-2 rounded-full bg-blue-500 p-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Tidak ada notifikasi
                      </div>
                    )}
                  </div>
                  <div className="p-2 border-t text-center">
                    <Button variant="ghost" size="sm" className="w-full text-sm" onClick={() => router.push("/notifications")}>
                      Lihat semua notifikasi
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(username || user.name || "User")}</AvatarFallback>
                      {user.profileImage && <AvatarImage src={user.profileImage} alt={username || user.name} />}
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium line-clamp-1">{username || user.name || "User"}</p>
                      <p className="text-xs opacity-70 capitalize">{userRole || "Pengguna"}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{username || user.name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{user.email || ""}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil Saya</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-red-500 focus:text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/login")}
                  className="hover:bg-primary-foreground/10"
                >
                  Login
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push("/register")}
                >
                  Daftar
                </Button>
              </div>
            )}
          </div>

          {/* Right Section - Mobile View (Just Menu Toggle and Simple Notification) */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Button variant="ghost" size="icon" className="relative" onClick={() => router.push("/notifications")}>
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-red-500">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            )}
            
            <button
              className="p-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Improved */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-1 pb-3 animate-in slide-in-from-top duration-200 bg-primary border-t border-primary-foreground/10">
            {/* Mobile Navigation Links */}
            <div className="py-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center py-3 px-1 text-sm font-medium hover:text-secondary transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
            
            {/* Mobile User Section */}
            {user ? (
              <div className="mt-2 pt-2 border-t border-primary-foreground/10">
                <div className="px-1 py-2">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getInitials(username || user.name || "User")}</AvatarFallback>
                      {user.profileImage && <AvatarImage src={user.profileImage} alt={username || user.name} />}
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{username || user.name || "User"}</p>
                      <p className="text-xs opacity-70 capitalize">{userRole || "Pengguna"}</p>
                    </div>
                  </div>
                  
                  <Link
                    href="/profile"
                    className="flex items-center py-3 text-sm font-medium hover:text-secondary transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profil Saya
                  </Link>
                  
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="mt-1 w-full justify-start py-3 text-sm text-red-500 hover:text-red-500 hover:bg-primary-foreground/10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-2 pt-2 px-1 border-t border-primary-foreground/10">
                <div className="grid grid-cols-2 gap-2 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      router.push("/login");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Login
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      router.push("/register");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Daftar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}