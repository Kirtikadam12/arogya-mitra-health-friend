import { useState } from "react";
import Header from "@/components/Header";
import LanguageSelector from "@/components/LanguageSelector";
import ElevenLabsWidget from "@/components/ElevenLabsWidget";
import ChatBox from "@/components/ChatBox";
import NearbyHospitals from "@/components/NearbyHospitals";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("hi");
  const [activeTab, setActiveTab] = useState("home");
  const [showHospitals, setShowHospitals] = useState(false);
  const { toast } = useToast();

  const handleEmergencyClick = () => {
    toast({
      title: "Emergency Call",
      description: "Calling ambulance: 108",
      variant: "destructive",
    });
    // Directly initiate phone call to 108 (Ambulance number in India)
    window.location.href = "tel:108";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Navigation & Emergency Button */}
      <Header 
        onEmergencyClick={handleEmergencyClick}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onHospitalsClick={() => setShowHospitals(true)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-3 sm:py-4 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 pb-20 sm:pb-24 pr-0 md:pr-56 lg:pr-72 xl:pr-80 2xl:pr-96">
        {/* Language Selector */}
        <div className="mb-3 sm:mb-4 w-full max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        </div>

        {/* Chat Box - Centered with space for ElevenLabs widget on the right */}
        <div className="w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl px-0">
          <ChatBox />
        </div>
      </main>

      {/* ElevenLabs Widget - Bottom right default position */}
      <ElevenLabsWidget />

      {/* Nearby Hospitals Dialog */}
      <NearbyHospitals 
        isOpen={showHospitals} 
        onOpenChange={setShowHospitals} 
      />
    </div>
  );
};

export default Index;
