import { useAuthStore } from "@/store/authStore";
import { useCallback, useState } from "react";

export interface ProfileFormData {
  username: string;
  email: string;
}

export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface NotificationPrefs {
  orderStatus: boolean;
  walletAlerts: boolean;
  ticketReplies: boolean;
  promotionalOffers: boolean;
}

export function useSettings() {
  const { user, setUser } = useAuthStore();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    orderStatus: true,
    walletAlerts: true,
    ticketReplies: true,
    promotionalOffers: false,
  });

  const saveProfile = useCallback(
    async (data: ProfileFormData): Promise<void> => {
      setIsSavingProfile(true);
      await new Promise((r) => setTimeout(r, 800));
      if (user) {
        setUser({ ...user, username: data.username });
      }
      setIsSavingProfile(false);
    },
    [user, setUser],
  );

  const changePassword = useCallback(
    async (_data: PasswordFormData): Promise<void> => {
      setIsSavingPassword(true);
      await new Promise((r) => setTimeout(r, 900));
      setIsSavingPassword(false);
    },
    [],
  );

  const saveNotifications = useCallback(
    async (prefs: NotificationPrefs): Promise<void> => {
      setIsSavingNotifs(true);
      await new Promise((r) => setTimeout(r, 600));
      setNotifPrefs(prefs);
      setIsSavingNotifs(false);
    },
    [],
  );

  const generateApiKey = useCallback(async (): Promise<string> => {
    setIsGeneratingKey(true);
    await new Promise((r) => setTimeout(r, 700));
    const key = `smm_${Array.from(
      { length: 32 },
      () => Math.random().toString(36)[2],
    ).join("")}`;
    if (user) {
      setUser({ ...user, apiKey: key });
    }
    setIsGeneratingKey(false);
    return key;
  }, [user, setUser]);

  return {
    user,
    notifPrefs,
    isSavingProfile,
    isSavingPassword,
    isSavingNotifs,
    isGeneratingKey,
    saveProfile,
    changePassword,
    saveNotifications,
    generateApiKey,
  };
}
