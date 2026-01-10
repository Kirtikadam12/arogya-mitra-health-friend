import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const useChatHistory = (language: string, defaultGreeting: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: defaultGreeting },
  ]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Load chat history when user logs in
  useEffect(() => {
    const loadHistory = async () => {
      if (!user) {
        setMessages([{ role: "assistant", content: defaultGreeting }]);
        return;
      }

      setIsLoadingHistory(true);
      try {
        const { data, error } = await supabase
          .from("chat_history")
          .select("role, content")
          .eq("user_id", user.id)
          .eq("language", language)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error loading chat history:", error);
          return;
        }

        if (data && data.length > 0) {
          setMessages(data.map(msg => ({ 
            role: msg.role as "user" | "assistant", 
            content: msg.content 
          })));
        } else {
          setMessages([{ role: "assistant", content: defaultGreeting }]);
        }
      } catch (err) {
        console.error("Error loading history:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [user, language, defaultGreeting]);

  // Save a message to the database
  const saveMessage = useCallback(async (message: Message) => {
    if (!user) return;

    try {
      await supabase.from("chat_history").insert({
        user_id: user.id,
        role: message.role,
        content: message.content,
        language,
      });
    } catch (err) {
      console.error("Error saving message:", err);
    }
  }, [user, language]);

  // Clear chat history for the current language
  const clearHistory = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from("chat_history")
        .delete()
        .eq("user_id", user.id)
        .eq("language", language);

      setMessages([{ role: "assistant", content: defaultGreeting }]);
    } catch (err) {
      console.error("Error clearing history:", err);
    }
  }, [user, language, defaultGreeting]);

  return {
    messages,
    setMessages,
    saveMessage,
    clearHistory,
    isLoadingHistory,
  };
};
