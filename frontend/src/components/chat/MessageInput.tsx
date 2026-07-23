import { useAuthStore } from "@/stores/useAuthStore";
import type { Conversation } from "@/types/chat";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { ImagePlus, Loader2, Send } from "lucide-react";
import { Input } from "../ui/input";
import EmojiPicker from "./EmojiPicker";
import { useChatStore } from "@/stores/useChatStore";
import { useSocketStore } from "@/stores/useSocketStore";
import { userService } from "@/services/userService";
import { toast } from "sonner";

const MessageInput = ({ selectedConvo }: { selectedConvo: Conversation }) => {
  const { user } = useAuthStore();
  const { sendDirectMessage, sendGroupMessage } = useChatStore();
  const { emitTypingStart, emitTypingStop } = useSocketStore();
  const [value, setValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        emitTypingStop(selectedConvo._id);
        isTypingRef.current = false;
      }
    };
  }, [selectedConvo._id, emitTypingStop]);

  if (!user) return null;

  const stopTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (isTypingRef.current) {
      emitTypingStop(selectedConvo._id);
      isTypingRef.current = false;
    }
  };

  const handleTyping = (nextValue: string) => {
    setValue(nextValue);

    if (!nextValue.trim()) {
      stopTyping();
      return;
    }

    if (!isTypingRef.current) {
      emitTypingStart(selectedConvo._id);
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStop(selectedConvo._id);
      isTypingRef.current = false;
    }, 2000);
  };

  const sendMessage = async (content: string, imgUrl?: string) => {
    const text = content.trim();
    if (!text && !imgUrl) return;

    stopTyping();
    setValue("");

    try {
      if (selectedConvo.type === "direct") {
        const otherUser = selectedConvo.participants.find((p) => p._id !== user._id);
        if (!otherUser) return;
        await sendDirectMessage(otherUser._id, text, imgUrl);
      } else {
        await sendGroupMessage(selectedConvo._id, text, imgUrl);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi xảy ra khi gửi tin nhắn. Bạn hãy thử lại!");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void sendMessage(value);
    }
  };

  const handlePickImage = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ hỗ trợ file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh tối đa 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { imgUrl } = await userService.uploadChatImage(formData);
      await sendMessage(value, imgUrl);
    } catch (error) {
      console.error(error);
      toast.error("Không thể upload ảnh. Thử lại!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 min-h-[56px] bg-background">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={uploading}
        onClick={handlePickImage}
        className="hover:bg-primary/10 transition-smooth"
      >
        {uploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ImagePlus className="size-4" />
        )}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleImageChange}
      />

      <div className="flex-1 relative">
        <Input
          onKeyDown={handleKeyPress}
          value={value}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Soạn tin nhắn..."
          disabled={uploading}
          className="pr-20 h-9 bg-white border-border/50 focus:border-primary/50 transition-smooth resize-none"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-8 hover:bg-primary/10 transition-smooth"
          >
            <div>
              <EmojiPicker
                onChange={(emoji: string) => handleTyping(`${value}${emoji}`)}
              />
            </div>
          </Button>
        </div>
      </div>

      <Button
        onClick={() => void sendMessage(value)}
        className="bg-gradient-chat hover:shadow-glow transition-smooth hover:scale-105"
        disabled={uploading || !value.trim()}
      >
        <Send className="size-4 text-white" />
      </Button>
    </div>
  );
};

export default MessageInput;
