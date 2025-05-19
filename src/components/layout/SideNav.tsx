
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Settings,
  Menu,
  X,
  LogOut,
  ShoppingCart,
  Ticket,
  UserCircle,
  Users,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  collapsed: boolean;
}

interface SideNavProps {
  onLogout: () => void;
}

const NavItem = ({ icon: Icon, label, path, collapsed }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link 
      to={path}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
        collapsed ? "justify-center px-2" : "justify-start",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
    >
      <Icon className="h-6 w-6" />
      {!collapsed && <span className="text-[15px] font-medium">{label}</span>}
    </Link>
  );
};

const SideNav = ({ onLogout }: SideNavProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Users, label: "Vendors", path: "/vendors" },
    { icon: ShoppingBag, label: "Products", path: "/products" },
    { icon: ShoppingCart, label: "Orders", path: "/orders" },
    { icon: Store, label: "Stores", path: "/stores" },
    { icon: UserCircle, label: "Customers", path: "/customers" },
    { icon: Ticket, label: "Coupons", path: "/coupons" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div 
      className={cn(
        "h-screen fixed top-0 left-0 z-40 transition-all duration-300 flex flex-col bg-[#161a24] border-r border-sidebar-border/50",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <span className="text-xl font-semibold text-sidebar-foreground flex gap-2 items-center">
            <span className="h-6 w-6 rounded bg-primary"></span>
            Admin<span className="text-primary">Pulse</span>
          </span>
        )}
        <Button 
          variant="ghost" 
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <Menu size={22} /> : <X size={22} />}
        </Button>
      </div>
      
      <Separator className="bg-sidebar-border/50" />
      
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem 
            key={item.label} 
            icon={item.icon} 
            label={item.label} 
            path={item.path}
            collapsed={collapsed}
          />
        ))}
      </nav>
      
      <Separator className="bg-sidebar-border/50" />
      
      <div className="p-3">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full flex items-center gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
            collapsed ? "justify-center" : "justify-start"
          )}
          onClick={onLogout}
        >
          <LogOut size={22} />
          {!collapsed && <span className="text-[15px]">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default SideNav;
