import { Phone, Heart, Home, History, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onEmergencyClick: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header = ({ onEmergencyClick, activeTab, onTabChange }: HeaderProps) => {
  const navItems = [
    { icon: Home, label: "Home", id: "home" },
    { icon: History, label: "History", id: "history" },
    { icon: HelpCircle, label: "Help", id: "help" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3">
      <div className="container flex items-center justify-between gap-4">
        {/* App Name */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-bold leading-tight text-foreground">
              Health Assistant
            </h1>
            <p className="text-xs text-muted-foreground">स्वास्थ्य सहायक</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? "text-primary bg-secondary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              aria-label={item.label}
              aria-current={activeTab === item.id ? "page" : undefined}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Emergency Button */}
        <Button
          variant="emergency"
          size="sm"
          onClick={onEmergencyClick}
          className="gap-1.5 shrink-0"
        >
          <Phone className="w-4 h-4" />
          <span className="hidden sm:inline">Emergency</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
