// deploy_luckywheel.js
const { ethers } = require("hardhat");

async function main() {
  console.log("🎰 Deploying LuckyWheel Contract...");

  // Get the contract factory
  const LuckyWheel = await ethers.getContractFactory("LuckyWheel");

  // Contract addresses (update these with actual deployed addresses)
  const MEMBER_CONTRACT = "0xBbaA0fB84386d80465994FaEA9d4e954CB45bC8d";
  const AZC_TOKEN = "0x88F7246f4Df4dd4E9D1d5bd1fC7A13E89a43a7F9";

  console.log("Using addresses:");
  console.log("Member Contract:", MEMBER_CONTRACT);
  console.log("AZC Token:", AZC_TOKEN);

  // Deploy the contract
  const luckyWheel = await LuckyWheel.deploy(
    MEMBER_CONTRACT,
    AZC_TOKEN
  );

  await luckyWheel.deployed();

  console.log("✅ LuckyWheel contract deployed to:", luckyWheel.address);

  // Verify contract configuration
  console.log("\n🔍 Verifying contract configuration...");
  
  try {
    const gameConfig = await luckyWheel.gameConfig();
    console.log("Game Config:");
    console.log("- Min Bet:", ethers.utils.formatEther(gameConfig.minBet), "AZC");
    console.log("- Max Bet:", ethers.utils.formatEther(gameConfig.maxBet), "AZC");
    console.log("- Burn Rate:", gameConfig.burnRate.toNumber() / 100, "%");
    console.log("- Game Active:", gameConfig.gameActive);

    // Check wheel segments
    const wheelSegments = await luckyWheel.getWheelSegments();
    console.log("\nWheel Segments:");
    wheelSegments.forEach((segment, index) => {
      console.log(`- Segment ${index}: x${segment.multiplier.toNumber() / 100} (${segment.probability.toNumber() / 100}% chance)`);
    });

    // Check game stats
    const stats = await luckyWheel.getGameStats();
    console.log("\nInitial Game Stats:");
    console.log("- Total Spins:", stats[0].toNumber());
    console.log("- Total Bet Amount:", ethers.utils.formatEther(stats[1]), "AZC");
    console.log("- Total Rewards:", ethers.utils.formatEther(stats[2]), "AZC");
    console.log("- Total Burned:", ethers.utils.formatEther(stats[3]), "AZC");
    console.log("- Pool Balance:", ethers.utils.formatEther(stats[4]), "AZC");

  } catch (error) {
    console.error("Error verifying contract:", error.message);
  }

  console.log("\n📋 Next Steps:");
  console.log("1. Update LUCKY_WHEEL address in Context/listaddress.ts:");
  console.log(`   export const LUCKY_WHEEL = "${luckyWheel.address}";`);
  console.log("\n2. Fund the contract pool with AZC tokens");
  console.log("3. Grant necessary roles if needed");
  console.log("4. Verify contract on BSCScan");

  console.log("\n🎯 Contract is ready for testing!");
  
  return {
    address: luckyWheel.address,
    contract: luckyWheel
  };
}

async function fundPool(contractAddress, amount) {
  console.log(`\n💰 Funding pool with ${amount} AZC...`);
  
  const LuckyWheel = await ethers.getContractFactory("LuckyWheel");
  const luckyWheel = LuckyWheel.attach(contractAddress);
  
  const AZC = await ethers.getContractFactory("ERC20"); // Assuming standard ERC20
  const azcToken = AZC.attach("0x88F7246f4Df4dd4E9D1d5bd1fC7A13E89a43a7F9");
  
  const [signer] = await ethers.getSigners();
  
  // Check balance
  const balance = await azcToken.balanceOf(signer.address);
  console.log("Current AZC balance:", ethers.utils.formatEther(balance));
  
  const fundAmount = ethers.utils.parseEther(amount);
  
  if (balance.lt(fundAmount)) {
    console.error("❌ Insufficient AZC balance");
    return;
  }
  
  // Approve tokens
  console.log("Approving AZC tokens...");
  const approveTx = await azcToken.approve(contractAddress, fundAmount);
  await approveTx.wait();
  
  // Fund pool
  console.log("Funding pool...");
  const fundTx = await luckyWheel.fundPool(fundAmount);
  await fundTx.wait();
  
  console.log("✅ Pool funded successfully!");
}

async function testSpin(contractAddress, betAmount = "10") {
  console.log(`\n🎲 Testing spin with ${betAmount} AZC...`);
  
  const LuckyWheel = await ethers.getContractFactory("LuckyWheel");
  const luckyWheel = LuckyWheel.attach(contractAddress);
  
  const AZC = await ethers.getContractFactory("ERC20");
  const azcToken = AZC.attach("0x88F7246f4Df4dd4E9D1d5bd1fC7A13E89a43a7F9");
  
  const [signer] = await ethers.getSigners();
  
  const spinAmount = ethers.utils.parseEther(betAmount);
  
  // Check balance
  const balance = await azcToken.balanceOf(signer.address);
  if (balance.lt(spinAmount)) {
    console.error("❌ Insufficient AZC balance for spin");
    return;
  }
  
  // Approve tokens
  console.log("Approving AZC tokens for spin...");
  const approveTx = await azcToken.approve(contractAddress, spinAmount);
  await approveTx.wait();
  
  // Spin
  console.log("Spinning...");
  const spinTx = await luckyWheel.spin(spinAmount, "test_tx_hash");
  const receipt = await spinTx.wait();
  
  // Get events
  const events = receipt.events?.filter(e => e.event === "SpinCompleted");
  if (events && events.length > 0) {
    const event = events[0];
    console.log("✅ Spin completed!");
    console.log("- Spin ID:", event.args.spinId.toString());
    console.log("- Segment Index:", event.args.segmentIndex.toString());
    console.log("- Multiplier:", event.args.multiplier.toNumber() / 100);
    console.log("- Reward Amount:", ethers.utils.formatEther(event.args.rewardAmount), "AZC");
  }
}

// Export for use in other scripts
module.exports = {
  main,
  fundPool,
  testSpin
};

// Run deployment if this script is executed directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} 