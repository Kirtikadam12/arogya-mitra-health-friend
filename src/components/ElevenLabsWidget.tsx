import { useEffect } from "react";

const ElevenLabsWidget = () => {
  useEffect(() => {
    // Load the ElevenLabs script
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
    script.async = true;
    script.type = "text/javascript";
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* @ts-ignore - Custom element from ElevenLabs */}
      <elevenlabs-convai agent-id="agent_3901kek7045aes9rvnzgb880169r"></elevenlabs-convai>
    </div>
  );
};

export default ElevenLabsWidget;
