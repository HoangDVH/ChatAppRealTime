import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import type { SocketState } from "@/types/store";
import { useChatStore } from "./useChatStore";
import { useFriendStore } from "./useFriendStore";
import { toast } from "sonner";

const baseURL = import.meta.env.VITE_SOCKET_URL;

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],
  typingByConvo: {},
  connectSocket: () => {
    const accessToken = useAuthStore.getState().accessToken;
    const existingSocket = get().socket;

    if (existingSocket) return; // tránh tạo nhiều socket

    const socket: Socket = io(baseURL, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    set({ socket });

    socket.on("connect", () => {
      console.log("Đã kết nối với socket");
      void useFriendStore.getState().getAllFriendRequests();
    });

    // online users
    socket.on("online-users", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // new message
    socket.on("new-message", ({ message, conversation, unreadCounts }) => {
      useChatStore.getState().addMessage(message);

      const lastMessage = {
        _id: conversation.lastMessage._id,
        content: conversation.lastMessage.content,
        imgUrl: conversation.lastMessage.imgUrl ?? null,
        createdAt: conversation.lastMessage.createdAt,
        sender: {
          _id: conversation.lastMessage.senderId,
          displayName: "",
          avatarUrl: null,
        },
      };

      const updatedConversation = {
        ...conversation,
        lastMessage,
        unreadCounts,
      };

      if (useChatStore.getState().activeConversationId === message.conversationId) {
        useChatStore.getState().markAsSeen();
      }

      // người gửi tin thì không còn "đang nhập"
      get().clearTypingForConvo(message.conversationId);
      useChatStore.getState().updateConversation(updatedConversation);
    });

    // read message
    socket.on("read-message", ({ conversation, lastMessage }) => {
      const updated = {
        _id: conversation._id,
        lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        unreadCounts: conversation.unreadCounts,
        seenBy: conversation.seenBy,
      };

      useChatStore.getState().updateConversation(updated);
    });

    // new group chat
    socket.on("new-group", (conversation) => {
      useChatStore.getState().addConvo(conversation);
      socket.emit("join-conversation", conversation._id);
    });

    // typing
    socket.on(
      "typing:update",
      ({
        conversationId,
        userId,
        isTyping,
      }: {
        conversationId: string;
        userId: string;
        isTyping: boolean;
      }) => {
        const myId = useAuthStore.getState().user?._id;
        if (!conversationId || !userId || userId === myId) return;

        set((state) => {
          const current = state.typingByConvo[conversationId] ?? [];
          const next = isTyping
            ? current.includes(userId)
              ? current
              : [...current, userId]
            : current.filter((id) => id !== userId);

          return {
            typingByConvo: {
              ...state.typingByConvo,
              [conversationId]: next,
            },
          };
        });
      }
    );

    // lời mời kết bạn mới
    socket.on("friend-request:new", (request) => {
      useFriendStore.getState().addReceivedRequest(request);
      const fromName = request?.from?.displayName || "ai đó";
      toast.info(`${fromName} đã gửi lời mời kết bạn`);
    });

    // lời mời được chấp nhận
    socket.on("friend-request:accepted", ({ requestId, friend }) => {
      useFriendStore.getState().removeSentRequest(requestId);
      if (friend) {
        useFriendStore.getState().addFriendLocal(friend);
      }
      toast.success(
        `${friend?.displayName || "Người dùng"} đã chấp nhận lời mời kết bạn`
      );
    });

    // lời mời bị từ chối
    socket.on("friend-request:declined", ({ requestId }) => {
      useFriendStore.getState().removeSentRequest(requestId);
    });
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, typingByConvo: {} });
    }
  },
  emitTypingStart: (conversationId) => {
    get().socket?.emit("typing:start", { conversationId });
  },
  emitTypingStop: (conversationId) => {
    get().socket?.emit("typing:stop", { conversationId });
  },
  clearTypingForConvo: (conversationId) => {
    set((state) => {
      if (!state.typingByConvo[conversationId]?.length) return state;
      return {
        typingByConvo: {
          ...state.typingByConvo,
          [conversationId]: [],
        },
      };
    });
  },
}));
