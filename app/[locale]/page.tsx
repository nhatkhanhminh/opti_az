// app/page.tsx
import HeroSection from "@/components/section/section.hero";
import FeaturesSection from "@/components/section/section.feature";
import TokenPricesSection from "@/components/section/section.tokenPrice";
import HowItWorksSection from "@/components/section/section.howItWork";
import StakingTiersSection from "@/components/section/section.stakingPlan";
import LazyLoadedSections from "@/components/section/lazyLoaderSection"; // Component mới
import { tokenShow } from "@/Context/token";
// import {useTranslations} from 'next-intl';

async function getInitialData() {
  // Giả lập fetch dữ liệu ban đầu (thay bằng API thực tế nếu có)
  const stats = {
    TotalStaked: "60.1M",
    exchanges: "100+",
    avgReturn: "15.9%",
    totalUsers: "4.5K",
  };
 // Dùng tokenTypes làm dữ liệu ban đầu, giá sẽ được fetch từ API sau
 const initialTokens = tokenShow.map((token) => ({
  symbol: token.symbol,
  name: token.name,
  icon: token.icon,
  price: 0, // Giá mặc định, sẽ cập nhật từ API
  change: "0%", // Giá trị ban đầu
  positive: true, // Giá trị ban đầu
}));

return { stats, initialTokens };
}

export default async function Home() {
  const { stats, initialTokens } = await getInitialData();
//   const t = useTranslations('HomePage');
  return (
    <div className="min-h-screen">
      <HeroSection initialStats={stats} />
      <TokenPricesSection initialTokens={initialTokens} />
      <FeaturesSection />
      <HowItWorksSection />
      <StakingTiersSection />
      <LazyLoadedSections />
    </div>
  );
}