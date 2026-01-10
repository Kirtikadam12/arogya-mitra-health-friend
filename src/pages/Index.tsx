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

      {/* Main Content - Centered Voice Agent */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Language Selector */}
        <div className="mb-8">
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        </div>

        {/* Voice Agent Prompt */}
        <div className="text-center space-y-3 mb-12">
          <h1 className="text-2xl font-semibold text-foreground">
            Tap the button below to talk
          </h1>
          <p className="text-lg text-muted-foreground">
            बोलने के लिए नीचे बटन दबाएं
          </p>
        </div>

        {/* Visual indicator pointing to widget */}
        <div className="flex flex-col items-center text-muted-foreground">
          <svg
            className="w-8 h-8 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ElevenLabs Conversational AI Widget */}
      <ElevenLabsWidget />
    </div>
  );
};

export default Index;
