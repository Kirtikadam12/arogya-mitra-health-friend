import { useState } from "react";
import Header from "@/components/Header";
import ElevenLabsWidget from "@/components/ElevenLabsWidget";
import ChatBox from "@/components/ChatBox";
import NearbyHospitals from "@/components/NearbyHospitals";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
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
      <main className="flex-1 flex flex-col items-center justify-center p-4 pb-20 sm:pb-24 pr-0 md:pr-56 lg:pr-72 xl:pr-80 2xl:pr-96">
        {/* Chat Box - Almost full screen */}
        <div className="w-full h-full max-w-full px-0">
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
