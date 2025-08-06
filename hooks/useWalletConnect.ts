import { useConnectModal } from "thirdweb/react";
import { client } from "@/lib/client";
import { bsc } from "thirdweb/chains";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { createWallet } from "thirdweb/wallets";

export function useWalletConnect() {
  const { connect, isConnecting } = useConnectModal();
  const { theme } = useTheme();
  const locales = useLocale();
  const t = useTranslations("Navbar"); // Sử dụng namespace Navbar cho tiêu đề modal
  
  // Danh sách các ví được hỗ trợ
  const wallets = [
    createWallet("com.safepal"),
    createWallet("com.trustwallet.app"),
    createWallet("io.metamask"),
    createWallet("walletConnect"),
  ];
  
  // Ví được đề xuất
  const recommendedWallets = [createWallet("com.trustwallet.app")];

  // Hàm xử lý kết nối ví
  const handleConnect = async (customTitle?: string) => {
    try {
      await connect({
        client: client,
        walletConnect: {
          projectId: "2cc3b582e661c7ec31cd320aa4b1e11e",
        },
        showAllWallets: false,
        wallets: wallets,
        recommendedWallets: recommendedWallets,
        chain: bsc,
        title: customTitle || t("connect.title"),
        size: "compact",
        showThirdwebBranding: false,
        termsOfServiceUrl: "https://optifund.app/about/term-of-service",
        privacyPolicyUrl: "https://optifund.app/about/privacy-policy",
        theme: theme === "light" ? "light" : "dark",
        locale:
          locales === "vi"
            ? "vi_VN"
            : locales === "jp"
            ? "ja_JP"
            : locales === "kr"
            ? "ko_KR"
            : "en_US",
      });
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  return {
    handleConnect,
    isConnecting,
    wallets,
    recommendedWallets
  };
} 