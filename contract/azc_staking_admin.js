const { ethers } = require("hardhat");
const readline = require('readline');

// Contract address - THAY ĐỊA CHỈ CONTRACT THẬT
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.error("❌ Vui lòng cập nhật CONTRACT_ADDRESS trong script!");
    process.exit(1);
  }

  console.log("🚀 AZC Staking Admin Panel");
  console.log("📍 Contract:", CONTRACT_ADDRESS);

  const AZCStaking = await ethers.getContractFactory("AZCStaking");
  const azcStaking = AZCStaking.attach(CONTRACT_ADDRESS);

  // Kiểm tra thông tin cơ bản
  try {
    const owner = await azcStaking.owner();
    const azcToken = await azcStaking.AZC_TOKEN();
    const azcPrice = await azcStaking.getAZCPrice();
    
    console.log("👑 Owner:", owner);
    console.log("🪙 AZC Token:", azcToken);
    console.log("💵 AZC Price:", ethers.utils.formatEther(azcPrice), "USDT");
  } catch (error) {
    console.error("❌ Lỗi kết nối contract:", error.message);
    process.exit(1);
  }

  while (true) {
    console.log("\n" + "=".repeat(50));
    console.log("📋 MENU ADMIN:");
    console.log("1. 👀 Xem tất cả Staking Plans");
    console.log("2. 💰 Set giá AZC");
    console.log("3. 📊 Tạo Staking Plan mới");
    console.log("4. ✏️  Cập nhật Staking Plan hoàn chỉnh");
    console.log("5. 🔄 Toggle Plan Active/Inactive");
    console.log("6. 📈 Cập nhật % lãi (ROI) của Plan");
    console.log("7. 💵 Cập nhật Min Amount của Plan");
    console.log("8. 💵 Cập nhật Min Amount cho tất cả Plans");
    console.log("9. ⚡ Setup Plans mặc định nhanh (10%, 12%, 16%)");
    console.log("10. 🏦 Cập nhật Wallet Addresses");
    console.log("11. 💸 Cập nhật Fee Percentages");
    console.log("12. 🆘 Emergency Withdraw");
    console.log("0. 🚪 Thoát");
    console.log("=".repeat(50));

    const choice = await question("Chọn chức năng (0-12): ");

    try {
      switch (choice) {
        case "1":
          await viewAllPlans(azcStaking);
          break;
        case "2":
          await setAZCPrice(azcStaking);
          break;
        case "3":
          await createNewPlan(azcStaking);
          break;
        case "4":
          await updatePlan(azcStaking);
          break;
        case "5":
          await togglePlan(azcStaking);
          break;
        case "6":
          await updatePlanROI(azcStaking);
          break;
        case "7":
          await updateSinglePlanMinAmount(azcStaking);
          break;
        case "8":
          await updateAllPlansMinAmount(azcStaking);
          break;
        case "9":
          await setupDefaultPlans(azcStaking);
          break;
        case "10":
          await updateWallets(azcStaking);
          break;
        case "11":
          await updateFees(azcStaking);
          break;
        case "12":
          await emergencyWithdraw(azcStaking);
          break;
        case "0":
          console.log("👋 Tạm biệt!");
          rl.close();
          return;
        default:
          console.log("❌ Lựa chọn không hợp lệ!");
      }
    } catch (error) {
      console.error("❌ Lỗi:", error.message);
    }
  }
}

async function viewAllPlans(azcStaking) {
  console.log("\n📋 THÔNG TIN TẤT CẢ STAKING PLANS:");
  const plans = await azcStaking.getAllStakingPlans();
  
  plans.forEach((plan, index) => {
    console.log(`\n📊 Plan ${index}:`);
    console.log(`   💰 Min: $${ethers.utils.formatEther(plan.minAmount)}`);
    console.log(`   💰 Max: ${plan.maxAmount.eq(ethers.constants.MaxUint256) ? "∞" : "$" + ethers.utils.formatEther(plan.maxAmount)}`);
    console.log(`   📈 ROI: ${plan.monthlyROI / 10}% monthly`);
    console.log(`   ✅ Active: ${plan.active}`);
  });
}

async function setAZCPrice(azcStaking) {
  const currentPrice = await azcStaking.getAZCPrice();
  console.log(`\n💵 Giá hiện tại: ${ethers.utils.formatEther(currentPrice)} USDT`);
  
  const newPrice = await question("Nhập giá mới (USDT): ");
  if (!newPrice || isNaN(parseFloat(newPrice))) {
    console.log("❌ Giá không hợp lệ!");
    return;
  }

  const priceInWei = ethers.utils.parseEther(newPrice);
  const tx = await azcStaking.setAZCPrice(priceInWei);
  await tx.wait();
  
  console.log(`✅ Đã cập nhật giá AZC thành ${newPrice} USDT`);
}

async function createNewPlan(azcStaking) {
  console.log("\n📊 TẠO STAKING PLAN MỚI:");
  
  const minAmount = await question("Min Amount (USDT): ");
  const maxAmount = await question("Max Amount (USDT, Enter để không giới hạn): ");
  const roi = await question("Monthly ROI (%): ");

  if (!minAmount || !roi || isNaN(parseFloat(minAmount)) || isNaN(parseFloat(roi))) {
    console.log("❌ Thông tin không hợp lệ!");
    return;
  }

  const minAmountWei = ethers.utils.parseEther(minAmount);
  const maxAmountWei = maxAmount && !isNaN(parseFloat(maxAmount)) 
    ? ethers.utils.parseEther(maxAmount) 
    : ethers.constants.MaxUint256;
  const roiValue = Math.floor(parseFloat(roi) * 10);

  const tx = await azcStaking.createStakingPlan(minAmountWei, maxAmountWei, roiValue);
  await tx.wait();
  
  console.log("✅ Đã tạo staking plan mới!");
}

async function updatePlan(azcStaking) {
  await viewAllPlans(azcStaking);
  
  const planId = await question("\nNhập Plan ID muốn cập nhật: ");
  if (!planId || isNaN(parseInt(planId))) {
    console.log("❌ Plan ID không hợp lệ!");
    return;
  }

  const plan = await azcStaking.stakingPlans(parseInt(planId));
  console.log(`\nThông tin hiện tại của Plan ${planId}:`);
  console.log(`Min: $${ethers.utils.formatEther(plan.minAmount)}`);
  console.log(`Max: ${plan.maxAmount.eq(ethers.constants.MaxUint256) ? "∞" : "$" + ethers.utils.formatEther(plan.maxAmount)}`);
  console.log(`ROI: ${plan.monthlyROI / 10}%`);
  console.log(`Active: ${plan.active}`);

  const minAmount = await question("Min Amount mới (USDT): ");
  const maxAmount = await question("Max Amount mới (USDT, Enter để không giới hạn): ");
  const roi = await question("Monthly ROI mới (%): ");
  const active = await question("Active (true/false): ");

  if (!minAmount || !roi || !active) {
    console.log("❌ Thông tin không đầy đủ!");
    return;
  }

  const minAmountWei = ethers.utils.parseEther(minAmount);
  const maxAmountWei = maxAmount && !isNaN(parseFloat(maxAmount)) 
    ? ethers.utils.parseEther(maxAmount) 
    : ethers.constants.MaxUint256;
  const roiValue = Math.floor(parseFloat(roi) * 10);
  const isActive = active.toLowerCase() === 'true';

  const tx = await azcStaking.updateStakingPlan(parseInt(planId), minAmountWei, maxAmountWei, roiValue, isActive);
  await tx.wait();
  
  console.log(`✅ Đã cập nhật Plan ${planId}!`);
}

async function togglePlan(azcStaking) {
  await viewAllPlans(azcStaking);
  
  const planId = await question("\nNhập Plan ID muốn toggle: ");
  if (!planId || isNaN(parseInt(planId))) {
    console.log("❌ Plan ID không hợp lệ!");
    return;
  }

  const plan = await azcStaking.stakingPlans(parseInt(planId));
  const newStatus = !plan.active;
  
  const tx = await azcStaking.toggleStakingPlan(parseInt(planId), newStatus);
  await tx.wait();
  
  console.log(`✅ Đã ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} Plan ${planId}!`);
}

async function updatePlanROI(azcStaking) {
  await viewAllPlans(azcStaking);
  
  const planId = await question("\nNhập Plan ID muốn cập nhật ROI: ");
  if (!planId || isNaN(parseInt(planId))) {
    console.log("❌ Plan ID không hợp lệ!");
    return;
  }

  const plan = await azcStaking.stakingPlans(parseInt(planId));
  console.log(`\nROI hiện tại của Plan ${planId}: ${plan.monthlyROI / 10}%`);

  const newROI = await question("Nhập % lãi mới (ví dụ: 15): ");
  if (!newROI || isNaN(parseFloat(newROI))) {
    console.log("❌ ROI không hợp lệ!");
    return;
  }

  const roiValue = Math.floor(parseFloat(newROI) * 10);
  const tx = await azcStaking.updatePlanROI(parseInt(planId), roiValue);
  await tx.wait();
  
  console.log(`✅ Đã cập nhật ROI của Plan ${planId} thành ${newROI}%!`);
}

async function updateSinglePlanMinAmount(azcStaking) {
  await viewAllPlans(azcStaking);
  
  const planId = await question("\nNhập Plan ID muốn cập nhật Min Amount: ");
  if (!planId || isNaN(parseInt(planId))) {
    console.log("❌ Plan ID không hợp lệ!");
    return;
  }

  const plan = await azcStaking.stakingPlans(parseInt(planId));
  console.log(`\nMin Amount hiện tại của Plan ${planId}: $${ethers.utils.formatEther(plan.minAmount)}`);

  const newMinAmount = await question("Nhập Min Amount mới (USDT): ");
  if (!newMinAmount || isNaN(parseFloat(newMinAmount))) {
    console.log("❌ Min Amount không hợp lệ!");
    return;
  }

  const minAmountWei = ethers.utils.parseEther(newMinAmount);
  const tx = await azcStaking.updatePlanMinAmount(parseInt(planId), minAmountWei);
  await tx.wait();
  
  console.log(`✅ Đã cập nhật Min Amount của Plan ${planId} thành $${newMinAmount}!`);
}

async function updateAllPlansMinAmount(azcStaking) {
  const newMinAmount = await question("Nhập Min Amount mới cho tất cả plans (USDT): ");
  if (!newMinAmount || isNaN(parseFloat(newMinAmount))) {
    console.log("❌ Min Amount không hợp lệ!");
    return;
  }

  const minAmountWei = ethers.utils.parseEther(newMinAmount);
  const tx = await azcStaking.updateAllPlansMinAmount(minAmountWei);
  await tx.wait();
  
  console.log(`✅ Đã cập nhật Min Amount thành $${newMinAmount} cho tất cả plans!`);
}

async function setupDefaultPlans(azcStaking) {
  const plansCount = await azcStaking.getStakingPlansCount();
  if (plansCount > 0) {
    console.log(`\n⚠️  Hiện tại đã có ${plansCount} plans. Bạn có muốn tạo thêm?`);
    const confirm = await question("Tiếp tục? (yes/no): ");
    if (confirm.toLowerCase() !== 'yes') {
      console.log("❌ Đã hủy!");
      return;
    }
  }

  const minAmount = await question("Nhập Min Amount cho plans mặc định (mặc định 99): ");
  const minAmountValue = minAmount ? parseFloat(minAmount) : 99;
  
  if (isNaN(minAmountValue)) {
    console.log("❌ Min Amount không hợp lệ!");
    return;
  }

  console.log("\n⚡ Đang tạo 3 plans mặc định...");
  console.log("📊 Plan A: 10% monthly ROI");
  console.log("📊 Plan B: 12% monthly ROI"); 
  console.log("📊 Plan C: 16% monthly ROI");

  const minAmountWei = ethers.utils.parseEther(minAmountValue.toString());
  const maxAmountWei = ethers.constants.MaxUint256; // Không giới hạn

  const minAmounts = [minAmountWei, minAmountWei, minAmountWei];
  const maxAmounts = [maxAmountWei, maxAmountWei, maxAmountWei];
  const monthlyROIs = [100, 120, 160]; // 10%, 12%, 16%

  const tx = await azcStaking.createMultipleStakingPlans(minAmounts, maxAmounts, monthlyROIs);
  await tx.wait();
  
  console.log("✅ Đã tạo 3 plans mặc định thành công!");
  
  // Hiển thị plans vừa tạo
  await viewAllPlans(azcStaking);
}

async function updateWallets(azcStaking) {
  console.log("\n🏦 CẬP NHẬT WALLET ADDRESSES:");
  
  const devWallet = await question("Dev Wallet: ");
  const marketingWallet = await question("Marketing Wallet: ");
  const multiWallet = await question("Multi Wallet: ");
  const poolWallet = await question("Pool Wallet: ");

  if (!devWallet || !marketingWallet || !multiWallet || !poolWallet) {
    console.log("❌ Thông tin wallet không đầy đủ!");
    return;
  }

  const tx = await azcStaking.setWallets(devWallet, marketingWallet, multiWallet, poolWallet);
  await tx.wait();
  
  console.log("✅ Đã cập nhật wallet addresses!");
}

async function updateFees(azcStaking) {
  console.log("\n💸 CẬP NHẬT FEE PERCENTAGES:");
  console.log("Lưu ý: Tổng fees không được vượt quá 100%");
  
  const devFee = await question("Dev Fee (%): ");
  const marketingFee = await question("Marketing Fee (%): ");
  const multiFee = await question("Multi Wallet Fee (%): ");
  const leaderFee = await question("Leader Fee (%): ");
  const ref1Fee = await question("Referral L1 Fee (%): ");
  const ref2Fee = await question("Referral L2 Fee (%): ");
  const ref3Fee = await question("Referral L3 Fee (%): ");

  const fees = [devFee, marketingFee, multiFee, leaderFee, ref1Fee, ref2Fee, ref3Fee];
  if (fees.some(fee => !fee || isNaN(parseInt(fee)))) {
    console.log("❌ Fee percentages không hợp lệ!");
    return;
  }

  const total = fees.reduce((sum, fee) => sum + parseInt(fee), 0);
  if (total > 100) {
    console.log(`❌ Tổng fees (${total}%) vượt quá 100%!`);
    return;
  }

  const tx = await azcStaking.updateFeePercentages(
    parseInt(devFee),
    parseInt(marketingFee),
    parseInt(multiFee),
    parseInt(leaderFee),
    parseInt(ref1Fee),
    parseInt(ref2Fee),
    parseInt(ref3Fee)
  );
  await tx.wait();
  
  console.log("✅ Đã cập nhật fee percentages!");
}

async function emergencyWithdraw(azcStaking) {
  console.log("\n🆘 EMERGENCY WITHDRAW:");
  console.log("⚠️  Cảnh báo: Chức năng này chỉ dùng trong trường hợp khẩn cấp!");
  
  const tokenAddress = await question("Token Address (0x... hoặc 'ETH' cho ETH): ");
  const amount = await question("Amount: ");

  if (!tokenAddress || !amount) {
    console.log("❌ Thông tin không đầy đủ!");
    return;
  }

  const confirm = await question("Bạn có chắc chắn? (yes/no): ");
  if (confirm.toLowerCase() !== 'yes') {
    console.log("❌ Đã hủy!");
    return;
  }

  let tx;
  if (tokenAddress.toLowerCase() === 'eth') {
    const amountWei = ethers.utils.parseEther(amount);
    tx = await azcStaking.emergencyWithdrawETH(amountWei);
  } else {
    const amountWei = ethers.utils.parseEther(amount);
    tx = await azcStaking.emergencyWithdraw(tokenAddress, amountWei);
  }
  
  await tx.wait();
  console.log("✅ Emergency withdraw thành công!");
}

main().catch(console.error); 