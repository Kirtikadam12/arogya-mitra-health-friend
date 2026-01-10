import { useState } from "react";
import Header from "@/components/Header";
import LanguageSelector from "@/components/LanguageSelector";
import BottomNav from "@/components/BottomNav";
import ElevenLabsWidget from "@/components/ElevenLabsWidget";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("hi");
  const [activeTab, setActiveTab] = useState("home");
  const { toast } = useToast();

  const handleEmergencyClick = () => {
    toast({
      title: "Emergency Help",
      description: "Connecting to emergency helpline: 112",
      variant: "destructive",
    });
    window.location.href = "tel:112";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Emergency Button */}
      <Header onEmergencyClick={handleEmergencyClick} />

      {/* Main Content - Minimal with widget as focus */}
      <main className="flex-1 flex flex-col items-center pt-6 px-4">
        {/* Language Selector - Compact */}
        <div className="mb-3">
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        </div>

        {/* Simple prompt text */}
        <p className="text-center text-muted-foreground text-base">
          Tap to talk • बोलने के लिए दबाएं
        </p>
      </main>

      {/* ElevenLabs Widget - Fixed center via CSS */}
      <ElevenLabsWidget />

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
