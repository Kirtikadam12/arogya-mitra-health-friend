import { useState, useRef, useEffect, type ChangeEvent, type KeyboardEvent } from "react";
import { Send, Bot, User, Loader2, Globe, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useChatHistory } from "@/hooks/useChatHistory";
import { supabase } from "@/integrations/supabase/client";
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
  image_url?: string;
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
  const { messages, setMessages, saveMessage, isLoadingHistory } = useChatHistory(
    language,
    langConfig.greeting
  );
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload images. Images are saved securely to your account.",
        variant: "destructive",
      });
      return null;
    }

    // Check if Supabase is configured
    if (!isApiConfigured) {
      toast({
        title: "Supabase not configured",
        description: "Please configure Supabase to upload images. Using local image preview instead.",
        variant: "default",
      });
      // Return a data URL for local preview mode
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }

    // Try to list buckets first to verify access
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      if (listError) {
        console.error("Error listing buckets:", listError);
      } else {
        console.log("Available buckets:", buckets?.map(b => b.id));
        const bucketExists = buckets?.some(b => b.id === 'medical-images');
        if (!bucketExists) {
          console.warn("Bucket 'medical-images' not found in list:", buckets);
        }
      }
    } catch (err) {
      console.warn("Could not list buckets:", err);
    }

    try {
      setIsUploadingImage(true);
      
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      console.log("Attempting to upload file:", fileName);
      console.log("User ID:", user.id);
      console.log("File size:", file.size, "bytes");

      // Try to upload to Supabase storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("medical-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error details:", uploadError);
        
        // Check for bucket not found error
        if (uploadError.message?.includes("bucket") || 
            uploadError.message?.includes("not found") || 
            uploadError.message?.includes("The resource was not found") ||
            uploadError.message?.includes("Bucket not found")) {
          
          // Provide detailed instructions
          const errorMsg = `Storage bucket 'medical-images' not found.

QUICK FIX:
1. Go to: https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/sql/new
2. Copy and run the SQL from CREATE_BUCKET_FIX.sql file
3. Or manually create bucket at: https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets

The SQL will create the bucket and all required policies automatically.`;
          
          toast({
            title: "Bucket Not Found",
            description: errorMsg,
            variant: "destructive",
            duration: 10000, // Show for 10 seconds
          });
          
          throw new Error(errorMsg);
        }
        
        // Check for permission errors
        if (uploadError.message?.includes("policy") || 
            uploadError.message?.includes("permission") || 
            uploadError.message?.includes("row-level security") ||
            uploadError.message?.includes("new row violates")) {
          throw new Error(
            "Permission denied: Storage policies not set up correctly. " +
            "Solution: Run the complete SQL from CREATE_BUCKET_FIX.sql in Supabase SQL Editor. " +
            "This will create all required policies."
          );
        }
        
        // Check for auth errors
        if (uploadError.message?.includes("JWT") || 
            uploadError.message?.includes("auth") || 
            uploadError.message?.includes("token") ||
            uploadError.message?.includes("Unauthorized")) {
          throw new Error("Authentication error: Your session may have expired. Please sign out and sign in again.");
        }
        
        // Show the actual error message
        throw new Error(`Upload failed: ${uploadError.message || JSON.stringify(uploadError)}`);
      }

      // Get signed URL (valid for 1 year)
      const { data: urlData, error: urlError } = await supabase.storage
        .from("medical-images")
        .createSignedUrl(fileName, 31536000); // 1 year in seconds

      if (urlError || !urlData) {
        if (urlError?.message?.includes("bucket") || urlError?.message?.includes("not found")) {
          throw new Error("Storage bucket 'medical-images' not found. Please run the database migration.");
        }
        throw urlError || new Error("Failed to create signed URL");
      }

      return urlData.signedUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      
      // Enhanced error logging for debugging
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      } else if (typeof error === 'object' && error !== null) {
        console.error("Error object:", JSON.stringify(error, null, 2));
        if ('message' in error) console.error("Error message:", error.message);
        if ('code' in error) console.error("Error code:", error.code);
        if ('statusCode' in error) console.error("Status code:", error.statusCode);
      }
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'object' && error !== null && 'message' in error
        ? String(error.message)
        : "Failed to upload image. Please check your Supabase configuration.";
      
      toast({
        title: "Upload failed",
        description: errorMessage + " (Check browser console for details)",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isLoading || isUploadingImage) return;

    // Upload image if selected
    let imageUrl: string | null = null;
    if (selectedImage) {
      imageUrl = await uploadImage(selectedImage);
      if (!imageUrl) {
        // Upload failed - error already shown in toast
        // Don't send message if upload failed
        return;
      }
    }

    const userMessage: Message = { 
      role: "user", 
      content: input.trim() || (selectedImage ? "Please analyze this medical image. Identify any diseases or health conditions visible in the image and provide detailed information about the condition, its symptoms, possible causes, and comprehensive treatment options including medical treatments, home remedies, and cure recommendations." : ""),
      image_url: imageUrl || undefined
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    removeImage();
    setIsLoading(true);

    // Save user message if logged in
    if (user) {
      saveMessage(userMessage);
    }

    let assistantContent = "";

    // If API is not configured, use mock response
    if (!isApiConfigured) {
      const mockResponse = imageUrl 
        ? "I can see you've uploaded an image. To analyze medical images and detect potential diseases, please configure your Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY). This feature uses AI vision capabilities to help identify symptoms visible in images. Remember to always consult with healthcare professionals for proper diagnosis."
        : getMockResponse(input.trim(), language);
      
      // Simulate API delay and add mock response
      setTimeout(() => {
        const assistantMsg = { role: "assistant" as const, content: mockResponse };
        setMessages((prev) => [...prev, assistantMsg]);
        // Save assistant message if logged in
        if (user) {
          saveMessage(assistantMsg);
        }
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
        body: JSON.stringify({ 
          messages: newMessages.map(msg => ({
            role: msg.role,
            content: msg.role === "user" && msg.image_url
              ? [
                  { 
                    type: "text", 
                    text: msg.content || "Please analyze this medical image. Identify any diseases or health conditions visible in the image and provide detailed information about the condition, its symptoms, possible causes, and comprehensive treatment options including medical treatments, home remedies, and cure recommendations." 
                  },
                  {
                    type: "image_url",
                    image_url: { url: msg.image_url }
                  }
                ]
              : msg.content
          })),
          language 
        }),
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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
                  {message.image_url && (
                    <div className="mb-2 rounded-lg overflow-hidden">
                      <img 
                        src={message.image_url} 
                        alt="Medical image" 
                        className="max-w-full h-auto max-h-64 object-contain rounded-lg"
                      />
                    </div>
                  )}
                  {message.content && (
                    <p className="text-[11px] sm:text-xs leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                  )}
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
        {imagePreview && (
          <div className="mb-2 relative inline-block">
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-w-[200px] max-h-[200px] object-contain"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={removeImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 h-[38px] w-[38px] sm:h-[42px] sm:w-[42px]"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isUploadingImage}
          >
            {isUploadingImage ? (
              <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
            ) : (
              <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            )}
          </Button>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedImage ? "Add a description (optional)..." : "Type your health question or upload an image..."}
            className="min-h-[38px] sm:min-h-[42px] max-h-32 resize-none text-[11px] sm:text-xs"
            disabled={isLoading || isUploadingImage}
          />
          <Button
            onClick={sendMessage}
            disabled={(!input.trim() && !selectedImage) || isLoading || isUploadingImage}
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
