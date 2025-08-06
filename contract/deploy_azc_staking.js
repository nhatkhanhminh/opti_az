const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Đang deploy AZC Staking Contract...");

  // Lấy signer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // AZC Token address - CẦN CẬP NHẬT ĐỊA CHỈ THỰC TẾ
  const AZC_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"; // ⚠️ THAY ĐỊA CHỈ AZC TOKEN THẬT

  if (AZC_TOKEN_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.error("❌ CẢNH BÁO: Vui lòng cập nhật địa chỉ AZC Token trong script!");
    console.error("📍 Tìm dòng: const AZC_TOKEN_ADDRESS = ...");
    process.exit(1);
  }

  // Deploy AZCStaking contract
  console.log("\n📦 Đang deploy AZCStaking contract...");
  const AZCStaking = await ethers.getContractFactory("AZCStaking");
  const azcStaking = await AZCStaking.deploy(AZC_TOKEN_ADDRESS);
  
  await azcStaking.deployed();
  console.log("✅ AZCStaking deployed to:", azcStaking.address);

  // Verify deployment
  console.log("\n🔍 Kiểm tra thông tin contract:");
  console.log("📍 Contract address:", azcStaking.address);
  console.log("🪙 AZC Token:", await azcStaking.AZC_TOKEN());
  console.log("💵 AZC Price (USDT):", ethers.utils.formatEther(await azcStaking.getAZCPrice()));
  console.log("👑 Owner:", await azcStaking.owner());

  // Hiển thị thông tin staking plans
  console.log("\n📋 Staking Plans:");
  const plansCount = await azcStaking.getStakingPlansCount();
  if (plansCount === 0) {
    console.log("📝 Chưa có plans nào - Admin cần tạo plans sau khi deploy");
  } else {
    for (let i = 0; i < plansCount; i++) {
      try {
        const plan = await azcStaking.stakingPlans(i);
        console.log(`📊 Plan ${i}:`);
        console.log(`   💰 Min: $${ethers.utils.formatEther(plan.minAmount)}`);
        console.log(`   💰 Max: ${plan.maxAmount.eq(ethers.constants.MaxUint256) ? "∞" : "$" + ethers.utils.formatEther(plan.maxAmount)}`);
        console.log(`   📈 ROI: ${plan.monthlyROI / 10}% monthly`);
        console.log(`   ✅ Active: ${plan.active}`);
      } catch (error) {
        break;
      }
    }
  }

  // Hiển thị Fee structure
  console.log("\n💸 Fee Structure:");
  console.log("🔧 Dev:", await azcStaking.devFeePercent() + "%");
  console.log("📢 Marketing:", await azcStaking.marketingFeePercent() + "%");
  console.log("🏦 Multi Wallet:", await azcStaking.multiWalletFeePercent() + "%");
  console.log("👑 Leader:", await azcStaking.leaderFeePercent() + "%");
  console.log("🤝 Referral L1:", await azcStaking.referralLevelOnePercent() + "%");
  console.log("🤝 Referral L2:", await azcStaking.referralLevelTwoPercent() + "%");
  console.log("🤝 Referral L3:", await azcStaking.referralLevelThreePercent() + "%");

  // Hiển thị wallet addresses
  console.log("\n🏦 Wallet Addresses:");
  console.log("🔧 Dev Wallet:", await azcStaking.devWallet());
  console.log("📢 Marketing Wallet:", await azcStaking.marketingWallet());
  console.log("🏦 Multi Wallet:", await azcStaking.multiWallet());
  console.log("🏊 Pool Wallet:", await azcStaking.poolWallet());

  console.log("\n🎉 Deploy thành công!");
  console.log("📝 Lưu địa chỉ contract này để sử dụng trong frontend:");
  console.log("📍 AZC_STAKING_CONTRACT =", azcStaking.address);

  // Verification instructions
  console.log("\n📋 Các bước tiếp theo:");
  console.log("1. 🔄 Cập nhật địa chỉ contract trong frontend");
  console.log("2. 🎯 Verify contract trên BSCScan:");
  console.log(`   npx hardhat verify --network bsc ${azcStaking.address} ${AZC_TOKEN_ADDRESS}`);
  console.log("3. 💰 Set giá AZC nếu cần (mặc định 1.5 USDT):");
  console.log("   const { setAZCPrice } = require('./deploy_azc_staking');");
  console.log("   await setAZCPrice('CONTRACT_ADDRESS', 2.0);");
  console.log("4. ⚡ TẠO PLANS NHANH (recommended):");
  console.log("   const { setupDefaultPlans } = require('./deploy_azc_staking');");
  console.log("   await setupDefaultPlans('CONTRACT_ADDRESS', 99); // 3 plans: 10%, 12%, 16%");
  console.log("5. 📊 Hoặc quản lý Plans thủ công:");
  console.log("   const { createStakingPlan, updatePlanROI, viewAllPlans } = require('./deploy_azc_staking');");
  console.log("   await createStakingPlan('CONTRACT_ADDRESS', 50, Infinity, 8.0); // Plan 8%");
  console.log("   await updatePlanROI('CONTRACT_ADDRESS', 0, 15); // Đổi plan 0 thành 15%");
  console.log("   await viewAllPlans('CONTRACT_ADDRESS'); // Xem tất cả plans");

  return {
    azcStaking: azcStaking.address,
    azcToken: AZC_TOKEN_ADDRESS
  };
}

// Function để set giá AZC (helper)
async function setAZCPrice(contractAddress, newPrice) {
  console.log(`\n💰 Đang set giá AZC thành ${newPrice} USDT...`);
  
  const AZCStaking = await ethers.getContractFactory("AZCStaking");
  const azcStaking = AZCStaking.attach(contractAddress);
  
  const priceInWei = ethers.utils.parseEther(newPrice.toString());
  const tx = await azcStaking.setAZCPrice(priceInWei);
  await tx.wait();
  
  console.log("✅ Giá AZC đã được cập nhật!");
  console.log("💵 Giá mới:", ethers.utils.formatEther(await azcStaking.getAZCPrice()), "USDT");
}

// Function để tạo staking plan mới (helper)
async function createStakingPlan(contractAddress, minAmount, maxAmount, monthlyROI) {
  console.log(`\n📊 Đang tạo staking plan mới...`);
  
  const AZCStaking = await ethers.getContractFactory("AZCStaking");
  const azcStaking = AZCStaking.attach(contractAddress);
  
  const minAmountWei = ethers.utils.parseEther(minAmount.toString());
  const maxAmountWei = maxAmount === Infinity ? ethers.constants.MaxUint256 : ethers.utils.parseEther(maxAmount.toString());
  const roiValue = Math.floor(monthlyROI * 10); // Convert to basis points
  
  const tx = await azcStaking.createStakingPlan(minAmountWei, maxAmountWei, roiValue);
  await tx.wait();
  
  console.log("✅ Staking plan mới đã được tạo!");
}

// Function để cập nhật minimum amount cho tất cả plans
async function updateAllPlansMinAmount(contractAddress, newMinAmount) {
  console.log(`\n💰 Đang cập nhật minimum amount thành $${newMinAmount} cho tất cả plans...`);
  
  const AZCStaking = await ethers.getContractFactory("AZCStaking");
  const azcStaking = AZCStaking.attach(contractAddress);
  
  const minAmountWei = ethers.utils.parseEther(newMinAmount.toString());
  const tx = await azcStaking.updateAllPlansMinAmount(minAmountWei);
  await tx.wait();
  
  console.log("✅ Minimum amount đã được cập nhật cho tất cả plans!");
}

// Function để toggle plan active/inactive
async function toggleStakingPlan(contractAddress, planId, active) {
  console.log(`\n🔄 Đang ${active ? 'kích hoạt' : 'vô hiệu hóa'} plan ${planId}...`);
  
  const AZCStaking = await ethers.getContractFactory("AZCStaking");
  const azcStaking = AZCStaking.attach(contractAddress);
  
  const tx = await azcStaking.toggleStakingPlan(planId, active);
  await tx.wait();
  
  console.log(`✅ Plan ${planId} đã được ${active ? 'kích hoạt' : 'vô hiệu hóa'}!`);
}

// Function để xem tất cả plans
async function viewAllPlans(contractAddress) {
  console.log(`\n📋 Thông tin tất cả Staking Plans:`);
  
  const AZCStaking = await ethers.getContractFactory("AZCStaking");
  const azcStaking = AZCStaking.attach(contractAddress);
  
  const plans = await azcStaking.getAllStakingPlans();
  
  if (plans.length === 0) {
    console.log("📝 Chưa có plans nào - cần tạo plans mới");
    return;
  }
  
  plans.forEach((plan, index) => {
    console.log(`📊 Plan ${index}:`);
    console.log(`   💰 Min: $${ethers.utils.formatEther(plan.minAmount)}`);
    console.log(`   💰 Max: ${plan.maxAmount.eq(ethers.constants.MaxUint256) ? "∞" : "$" + ethers.utils.formatEther(plan.maxAmount)}`);
    console.log(`   📈 ROI: ${plan.monthlyROI / 10}% monthly`);
    console.log(`   ✅ Active: ${plan.active}`);
    console.log('');
  });
}

// Function để cập nhật ROI của một plan
async function updatePlanROI(contractAddress, planId, newROI) {
  console.log(`\n📈 Đang cập nhật ROI của plan ${planId} thành ${newROI}%...`);
  
  const AZCStaking = await ethers.getContractFactory("AZCStaking");
  const azcStaking = AZCStaking.attach(contractAddress);
  
  const roiValue = Math.floor(newROI * 10); // Convert to basis points
  const tx = await azcStaking.updatePlanROI(planId, roiValue);
  await tx.wait();
  
  console.log(`✅ ROI của plan ${planId} đã được cập nhật thành ${newROI}%!`);
}

// Function để cập nhật min amount của một plan  
async function updatePlanMinAmount(contractAddress, planId, newMinAmount) {
  console.log(`\n💰 Đang cập nhật min amount của plan ${planId} thành $${newMinAmount}...`);
  
  const AZCStaking = await ethers.getContractFactory("AZCStaking");
  const azcStaking = AZCStaking.attach(contractAddress);
  
  const minAmountWei = ethers.utils.parseEther(newMinAmount.toString());
  const tx = await azcStaking.updatePlanMinAmount(planId, minAmountWei);
  await tx.wait();
  
  console.log(`✅ Min amount của plan ${planId} đã được cập nhật thành $${newMinAmount}!`);
}

// Function để tạo nhiều plans cùng lúc
async function createMultipleStakingPlans(contractAddress, plansData) {
  console.log(`\n📊 Đang tạo ${plansData.length} staking plans...`);
  
  const AZCStaking = await ethers.getContractFactory("AZCStaking");
  const azcStaking = AZCStaking.attach(contractAddress);
  
  const minAmounts = plansData.map(plan => ethers.utils.parseEther(plan.minAmount.toString()));
  const maxAmounts = plansData.map(plan => 
    plan.maxAmount === Infinity ? ethers.constants.MaxUint256 : ethers.utils.parseEther(plan.maxAmount.toString())
  );
  const monthlyROIs = plansData.map(plan => Math.floor(plan.monthlyROI * 10));
  
  const tx = await azcStaking.createMultipleStakingPlans(minAmounts, maxAmounts, monthlyROIs);
  await tx.wait();
  
  console.log("✅ Đã tạo tất cả staking plans!");
  
  // Hiển thị thông tin plans vừa tạo
  plansData.forEach((plan, index) => {
    console.log(`📊 Plan ${index}: $${plan.minAmount}+ với ${plan.monthlyROI}% ROI`);
  });
}

// Function để setup plans mặc định nhanh (10%, 12%, 16%)
async function setupDefaultPlans(contractAddress, minAmount = 99) {
  console.log(`\n⚡ Setup plans mặc định với min amount $${minAmount}...`);
  
  const defaultPlans = [
    { minAmount: minAmount, maxAmount: Infinity, monthlyROI: 10 },
    { minAmount: minAmount, maxAmount: Infinity, monthlyROI: 12 },
    { minAmount: minAmount, maxAmount: Infinity, monthlyROI: 16 }
  ];
  
  await createMultipleStakingPlans(contractAddress, defaultPlans);
  console.log("✅ Setup plans mặc định hoàn tất!");
}

// Export functions
main.setAZCPrice = setAZCPrice;
main.createStakingPlan = createStakingPlan;
main.updateAllPlansMinAmount = updateAllPlansMinAmount;
main.toggleStakingPlan = toggleStakingPlan;
main.viewAllPlans = viewAllPlans;
main.updatePlanROI = updatePlanROI;
main.updatePlanMinAmount = updatePlanMinAmount;
main.createMultipleStakingPlans = createMultipleStakingPlans;
main.setupDefaultPlans = setupDefaultPlans;

// Handle deployment
main()
  .then((result) => {
    console.log("\n🎯 Contract deployed successfully!");
    console.log("📍 AZC Staking:", result.azcStaking);
    console.log("🪙 AZC Token:", result.azcToken);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

module.exports = main; 