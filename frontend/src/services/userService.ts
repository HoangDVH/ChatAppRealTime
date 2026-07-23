import api from "@/lib/axios";

export const userService = {
  uploadAvatar: async (formData: FormData) => {
    const res = await api.post("/users/uploadAvatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (res.status === 400) {
      throw new Error(res.data.message);
    }

    return res.data;
  },

  uploadChatImage: async (formData: FormData): Promise<{ imgUrl: string }> => {
    const res = await api.post("/users/uploadImage", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },
};
