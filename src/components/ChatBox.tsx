import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, Globe, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useChatHistory } from "@/hooks/useChatHistory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Language = "english" | "hindi" | "marathi" | "tamil" | "telugu";

const LANGUAGES: { value: Language; label: string; greeting: string }[] = [
  { value: "english", label: "English", greeting: "Hello! I'm your health assistant. How can I help you today?" },
  { value: "hindi", label: "हिंदी (Hindi)", greeting: "नमस्ते! मैं आपका स्वास्थ्य सहायक हूं। मैं आज आपकी कैसे मदद कर सकता हूं?" },
  { value: "marathi", label: "मराठी (Marathi)", greeting: "नमस्कार! मी तुमचा आरोग्य सहाय्यक आहे. आज मी तुम्हाला कशी मदत करू शकतो?" },
  { value: "tamil", label: "தமிழ் (Tamil)", greeting: "வணக்கம்! நான் உங்கள் சுகாதார உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?" },
  { value: "telugu", label: "తెలుగు (Telugu)", greeting: "నమస్కారం! నేను మీ ఆరోగ్య సహాయకుడిని. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?" },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-chat`;

// Mock responses for local development when API is not configured
const getMockResponse = (userInput: string, language: Language): string => {
  const responses: Record<Language, Record<string, string>> = {
    english: {
      default: "I'm currently running in local mode. To get full AI responses, please configure your Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY). For now, I can tell you that this is a medical assistant app designed to help with general health inquiries. Remember to always consult with healthcare professionals for serious medical concerns.",
    },
    hindi: {
      default: "मैं वर्तमान में स्थानीय मोड में चल रहा हूं। पूर्ण AI प्रतिक्रियाएं प्राप्त करने के लिए, कृपया अपने Supabase environment variables (VITE_SUPABASE_URL और VITE_SUPABASE_PUBLISHABLE_KEY) कॉन्फ़िगर करें। गंभीर चिकित्सा चिंताओं के लिए हमेशा स्वास्थ्य देखभाल पेशेवरों से परामर्श करना याद रखें।",
    },
    marathi: {
      default: "मी सध्या स्थानिक मोडमध्ये चालत आहे. पूर्ण AI प्रतिसाद मिळवण्यासाठी, कृपया आपले Supabase environment variables (VITE_SUPABASE_URL आणि VITE_SUPABASE_PUBLISHABLE_KEY) कॉन्फ़िगर करा. गंभीर वैद्यकीय चिंतांसाठी नेहमी आरोग्य सेवा व्यावसायिकांशी सल्लामसलत करणे आठवा.",
    },
    tamil: {
      default: "நான் தற்போது உள்ளூர் பயன்முறையில் இயங்குகிறேன். முழு AI பதில்களைப் பெற, உங்கள் Supabase environment variables (VITE_SUPABASE_URL மற்றும் VITE_SUPABASE_PUBLISHABLE_KEY) ஐ உள்ளமைக்கவும். தீவிர மருத்துவ கவலைகளுக்கு எப்போதும் சுகாதார நிபுணர்களுடன் கலந்தாலோசிப்பதை நினைவில் கொள்ளுங்கள்.",
    },
    telugu: {
      default: "నేను ప్రస్తుతం స్థానిక మోడ్‌లో నడుస్తున్నాను. పూర్తి AI ప్రతిస్పందనలను పొందడానికి, దయచేసి మీ Supabase environment variables (VITE_SUPABASE_URL మరియు VITE_SUPABASE_PUBLISHABLE_KEY) ని కాన్ఫిగర్ చేయండి. తీవ్రమైన వైద్య ఆందోళనల కోసం ఎల్లప్పుడూ ఆరోగ్య సంరక్షణ నిపుణులతో సంప్రదించడం గుర్తుంచుకోండి.",
    },
  };
  return responses[language]?.default || responses.english.default;
};

const ChatBox = () => {
  const [language, setLanguage] = useState<Language>("english");
  const langConfig = LANGUAGES.find((l) => l.value === language) || LANGUAGES[0];
  
  const { user } = useAuth();
  const { messages, setMessages, saveMessage, clearHistory, isLoadingHistory } = useChatHistory(
    language,
    langConfig.greeting
  );
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Check if environment variables are configured
  const isApiConfigured = 
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_URL !== "undefined" &&
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY &&
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY !== "undefined";

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    // Save user message if logged in
    if (user) {
      saveMessage(userMessage);
    }

    let assistantContent = "";

    // If API is not configured, use mock response
    if (!isApiConfigured) {
      const mockResponse = getMockResponse(input.trim(), language);
      
      // Simulate API delay and add mock response
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "assistant", content: mockResponse }]);
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages, language }),
      });

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      // Add initial assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return updated;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save assistant message if logged in
      if (user && assistantContent) {
        saveMessage({ role: "assistant", content: assistantContent });
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
      // Remove the empty assistant message if there was an error
      if (assistantContent === "") {
        setMessages((prev) => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClearHistory = async () => {
    await clearHistory();
    toast({
      title: "Chat cleared",
      description: "Your conversation history has been cleared",
    });
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-12rem)] sm:h-[calc(100vh-10rem)] md:h-[75vh] lg:h-[70vh] xl:h-[68vh] 2xl:h-[65vh] bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-[10px] sm:text-xs text-foreground truncate">Medical Assistant</h3>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                {user ? "Chat history saved" : "Sign in to save history"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 sm:h-7 sm:w-7"
                onClick={handleClearHistory}
                title="Clear chat history"
              >
                <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </Button>
            )}
            <Select value={language} onValueChange={(val) => handleLanguageChange(val as Language)}>
              <SelectTrigger className="w-[110px] sm:w-[120px] md:w-[130px] h-6 sm:h-7 text-[10px] sm:text-[11px]">
                <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value} className="text-[10px] sm:text-[11px]">
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3 sm:p-4 md:p-5" ref={scrollRef}>
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 sm:gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%] xl:max-w-[65%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-[11px] sm:text-xs leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.content === "" && (
              <div className="flex gap-2 sm:gap-3 justify-start">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary animate-spin" />
                </div>
                <div className="bg-muted rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5">
                  <p className="text-[11px] sm:text-xs text-muted-foreground">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 sm:p-4 md:p-5 border-t border-border bg-background">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your health question..."
            className="min-h-[38px] sm:min-h-[42px] max-h-32 resize-none text-[11px] sm:text-xs"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0 h-[38px] w-[38px] sm:h-[42px] sm:w-[42px]"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
            ) : (
              <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            )}
          </Button>
        </div>
        <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1.5 sm:mt-2 text-center">
          ⚠️ This is not a substitute for professional medical advice
        </p>
      </div>
    </div>
  );
};

export default ChatBox;
