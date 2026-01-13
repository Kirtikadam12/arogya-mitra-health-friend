import { Phone, Heart, Home, History, HelpCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmailAuth from "@/components/EmailAuth";

interface HeaderProps {
  onEmergencyClick: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onHospitalsClick?: () => void;
}

const Header = ({ onEmergencyClick, activeTab, onTabChange, onHospitalsClick }: HeaderProps) => {
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

        {/* Auth & Actions */}
        <div className="flex items-center gap-2">
          {/* Email Authentication */}
          <div className="hidden md:block">
            <EmailAuth />
          </div>

          {/* Nearby Hospitals Button */}
          {onHospitalsClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onHospitalsClick}
              className="gap-1.5 shrink-0 hidden sm:flex"
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden md:inline">Hospitals</span>
            </Button>
          )}

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
      </div>
    </header>
  );
};

export default Header;
