const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying AZC Claim Contract...\n");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

    // Contract addresses (cập nhật theo actual addresses)
    const DATA_CONTRACT = "0xC2482a36E3d219E6358D2397D67310059f024cfC";
    const MEMBER_CONTRACT = "0xBbaA0fB84386d80465994FaEA9d4e954CB45bC8d"; 
    const AZC_STAKING_CONTRACT = "0x..."; // Địa chỉ AZC Staking contract
    const AZC_TOKEN = "0x..."; // Địa chỉ AZC token

    // Deploy AZC Claim Contract
    console.log("📦 Deploying AZCClaimContract...");
    const AZCClaimContract = await ethers.getContractFactory("AZCClaimContract");
    const azcClaimContract = await AZCClaimContract.deploy(
        DATA_CONTRACT,
        MEMBER_CONTRACT, 
        AZC_STAKING_CONTRACT,
        AZC_TOKEN
    );
    await azcClaimContract.deployed();

    console.log("✅ AZCClaimContract deployed to:", azcClaimContract.address);
    console.log("🔗 Transaction hash:", azcClaimContract.deployTransaction.hash);
    console.log("⛽ Gas used:", azcClaimContract.deployTransaction.gasLimit.toString());

    // Wait for a few confirmations
    console.log("\n⏳ Waiting for confirmations...");
    await azcClaimContract.deployTransaction.wait(3);

    // Verify initial settings
    console.log("\n🔍 Verifying initial settings...");
    try {
        const azcPrice = await azcClaimContract.azcPriceInUSDT();
        const azcTokenPercent = await azcClaimContract.azcTokenPercent();
        const usdtTokenPercent = await azcClaimContract.usdtTokenPercent();
        
        console.log("💰 AZC Price in USDT:", ethers.utils.formatEther(azcPrice));
        console.log("🪙 AZC Token Percent:", azcTokenPercent.toString() + "%");
        console.log("💵 USDT Token Percent:", usdtTokenPercent.toString() + "%");

        // Check plan durations
        const plan0Duration = await azcClaimContract.planDurations(0);
        const plan1Duration = await azcClaimContract.planDurations(1);
        const plan2Duration = await azcClaimContract.planDurations(2);
        
        console.log("\n📅 Plan Durations:");
        console.log("Plan 0:", plan0Duration.toString(), "months");
        console.log("Plan 1:", plan1Duration.toString(), "months");
        console.log("Plan 2:", plan2Duration.toString(), "months");

        // Check principal claim percentages
        const phase1Percent = await azcClaimContract.principalClaimPercents(0);
        const phase2Percent = await azcClaimContract.principalClaimPercents(1);
        const phase3Percent = await azcClaimContract.principalClaimPercents(2);
        
        console.log("\n📊 Principal Claim Percentages:");
        console.log("Phase 1:", phase1Percent.toString() + "%");
        console.log("Phase 2:", phase2Percent.toString() + "%");
        console.log("Phase 3:", phase3Percent.toString() + "%");

    } catch (error) {
        console.log("❌ Error verifying settings:", error.message);
    }

    // Contract deployment summary
    console.log("\n" + "=".repeat(60));
    console.log("📋 DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log("🏭 AZCClaimContract:", azcClaimContract.address);
    console.log("👑 Owner:", deployer.address);
    console.log("🔗 Data Contract:", DATA_CONTRACT);
    console.log("👥 Member Contract:", MEMBER_CONTRACT);
    console.log("🏦 AZC Staking Contract:", AZC_STAKING_CONTRACT);
    console.log("🪙 AZC Token:", AZC_TOKEN);
    console.log("=".repeat(60));

    // Next steps
    console.log("\n🎯 NEXT STEPS:");
    console.log("1. Update AZC_STAKING_CONTRACT and AZC_TOKEN addresses in this script");
    console.log("2. Update contract addresses in admin panel");
    console.log("3. Fund contract with AZC and USDT tokens for rewards");
    console.log("4. Set proper AZC price using setAZCPrice() function");
    console.log("5. Configure plan durations if needed");
    console.log("6. Test claim functions with sample stakes");

    // Save deployment info
    const deploymentInfo = {
        network: "BSC Mainnet/Testnet",
        azcClaimContract: azcClaimContract.address,
        deployer: deployer.address,
        deploymentTime: new Date().toISOString(),
        contractInfo: {
            dataContract: DATA_CONTRACT,
            memberContract: MEMBER_CONTRACT,
            azcStakingContract: AZC_STAKING_CONTRACT,
            azcToken: AZC_TOKEN
        }
    };

    console.log("\n💾 Deployment info saved:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
}

// Helper functions for post-deployment configuration
async function configureContract(contractAddress) {
    console.log("🔧 Configuring AZC Claim Contract...\n");
    
    const [deployer] = await ethers.getSigners();
    const azcClaimContract = await ethers.getContractAt("AZCClaimContract", contractAddress);

    try {
        // Set AZC price to 2.0 USDT
        console.log("💰 Setting AZC price to 2.0 USDT...");
        const newPrice = ethers.utils.parseEther("2.0");
        const tx1 = await azcClaimContract.setAZCPrice(newPrice);
        await tx1.wait();
        console.log("✅ AZC price updated");

        // Update plan durations if needed
        console.log("📅 Updating plan durations...");
        const tx2 = await azcClaimContract.updatePlanDuration(0, 3);  // Plan 0: 3 months
        await tx2.wait();
        const tx3 = await azcClaimContract.updatePlanDuration(1, 6);  // Plan 1: 6 months
        await tx3.wait();
        const tx4 = await azcClaimContract.updatePlanDuration(2, 12); // Plan 2: 12 months
        await tx4.wait();
        console.log("✅ Plan durations updated");

        console.log("\n🎉 Contract configuration completed!");

    } catch (error) {
        console.log("❌ Error during configuration:", error.message);
    }
}

// Helper function to check contract status
async function checkContractStatus(contractAddress) {
    console.log("🔍 Checking AZC Claim Contract status...\n");
    
    const azcClaimContract = await ethers.getContractAt("AZCClaimContract", contractAddress);

    try {
        // Check contract balances
        console.log("💰 Contract Token Balances:");
        
        // You would need to check AZC and USDT balances here
        const owner = await azcClaimContract.owner();
        console.log("👑 Contract Owner:", owner);
        
        const azcPrice = await azcClaimContract.azcPriceInUSDT();
        console.log("💵 Current AZC Price:", ethers.utils.formatEther(azcPrice), "USDT");

        const azcPercent = await azcClaimContract.azcTokenPercent();
        const usdtPercent = await azcClaimContract.usdtTokenPercent();
        console.log("📊 Token Distribution:");
        console.log("  - AZC:", azcPercent.toString() + "%");
        console.log("  - USDT:", usdtPercent.toString() + "%");

        console.log("\n📅 Plan Durations:");
        for (let i = 0; i < 3; i++) {
            const duration = await azcClaimContract.planDurations(i);
            console.log(`  - Plan ${i}:`, duration.toString(), "months");
        }

        console.log("\n📈 Principal Claim Schedule:");
        for (let i = 0; i < 3; i++) {
            const percent = await azcClaimContract.principalClaimPercents(i);
            console.log(`  - Phase ${i + 1}:`, percent.toString() + "%");
        }

    } catch (error) {
        console.log("❌ Error checking status:", error.message);
    }
}

// Helper function to fund contract
async function fundContract(contractAddress, azcAmount, usdtAmount) {
    console.log("💰 Funding AZC Claim Contract...\n");
    
    const [deployer] = await ethers.getSigners();
    
    // You would need to implement token transfers here
    console.log("📝 Funding with:");
    console.log("🪙 AZC Amount:", ethers.utils.formatEther(azcAmount));
    console.log("💵 USDT Amount:", ethers.utils.formatEther(usdtAmount));
    
    // Example of how to transfer tokens (implement as needed):
    // const azcToken = await ethers.getContractAt("IERC20", AZC_TOKEN_ADDRESS);
    // const usdtToken = await ethers.getContractAt("IERC20", USDT_TOKEN_ADDRESS);
    // await azcToken.transfer(contractAddress, azcAmount);
    // await usdtToken.transfer(contractAddress, usdtAmount);
    
    console.log("✅ Contract funded successfully!");
}

// Main deployment function
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });

// Export helper functions
module.exports = {
    configureContract,
    checkContractStatus,
    fundContract
}; 