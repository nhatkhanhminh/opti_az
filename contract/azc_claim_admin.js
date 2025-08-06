const { ethers } = require("hardhat");
const readline = require("readline");

// Contract address - cập nhật sau khi deploy
const AZC_CLAIM_CONTRACT_ADDRESS = "0x..."; // Thay bằng địa chỉ thực tế

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    console.log("🎯 AZC CLAIM CONTRACT ADMIN PANEL");
    console.log("=".repeat(50));
    
    const [deployer] = await ethers.getSigners();
    console.log("👑 Admin address:", deployer.address);
    console.log("💰 Balance:", ethers.utils.formatEther(await deployer.getBalance()), "BNB\n");

    if (AZC_CLAIM_CONTRACT_ADDRESS === "0x...") {
        console.log("❌ Please update AZC_CLAIM_CONTRACT_ADDRESS in this script first!");
        process.exit(1);
    }

    const azcClaimContract = await ethers.getContractAt("AZCClaimContract", AZC_CLAIM_CONTRACT_ADDRESS);
    
    while (true) {
        console.log("\n📋 ADMIN MENU:");
        console.log("1.  📊 View Contract Status");
        console.log("2.  💰 Set AZC Price");
        console.log("3.  📈 Update Token Distribution");
        console.log("4.  📅 Update Plan Durations");
        console.log("5.  📊 Update Principal Claim Percentages");
        console.log("6.  🎯 Update Upline Reward Percentages");
        console.log("7.  🏆 Update Level Requirements");
        console.log("8.  🔧 Update Contract Addresses");
        console.log("9.  📊 View Claim Information");
        console.log("10. 💳 Fund Contract with Tokens");
        console.log("11. 🚨 Emergency Withdraw");
        console.log("12. 📋 View Timeline for Stake");
        console.log("0.  🚪 Exit");
        
        const choice = await question("\n👉 Select option (0-12): ");

        try {
            switch(choice) {
                case "1":
                    await viewContractStatus(azcClaimContract);
                    break;
                case "2":
                    await setAZCPrice(azcClaimContract);
                    break;
                case "3":
                    await updateTokenDistribution(azcClaimContract);
                    break;
                case "4":
                    await updatePlanDurations(azcClaimContract);
                    break;
                case "5":
                    await updatePrincipalClaimPercentages(azcClaimContract);
                    break;
                case "6":
                    await updateUplineRewardPercentages(azcClaimContract);
                    break;
                case "7":
                    await updateLevelRequirements(azcClaimContract);
                    break;
                case "8":
                    await updateContractAddresses(azcClaimContract);
                    break;
                case "9":
                    await viewClaimInformation(azcClaimContract);
                    break;
                case "10":
                    await fundContract(azcClaimContract);
                    break;
                case "11":
                    await emergencyWithdraw(azcClaimContract);
                    break;
                case "12":
                    await viewStakeTimeline(azcClaimContract);
                    break;
                case "0":
                    console.log("👋 Goodbye!");
                    rl.close();
                    return;
                default:
                    console.log("❌ Invalid option! Please try again.");
            }
        } catch (error) {
            console.log("❌ Error:", error.message);
        }

        await question("\nPress Enter to continue...");
    }
}

async function viewContractStatus(contract) {
    console.log("\n📊 CONTRACT STATUS");
    console.log("=".repeat(30));
    
    try {
        const owner = await contract.owner();
        const azcToken = await contract.AZC_TOKEN();
        const azcPrice = await contract.azcPriceInUSDT();
        const azcPercent = await contract.azcTokenPercent();
        const usdtPercent = await contract.usdtTokenPercent();
        const deepLevel = await contract.deepLevel();
        
        console.log("👑 Owner:", owner);
        console.log("🪙 AZC Token:", azcToken);
        console.log("💰 AZC Price:", ethers.utils.formatEther(azcPrice), "USDT");
        console.log("📊 Token Distribution:");
        console.log("  - AZC:", azcPercent.toString() + "%");
        console.log("  - USDT:", usdtPercent.toString() + "%");
        console.log("🔢 Deep Level:", deepLevel.toString());

        console.log("\n📅 Plan Durations:");
        for (let i = 0; i < 5; i++) {
            try {
                const duration = await contract.planDurations(i);
                if (duration.gt(0)) {
                    console.log(`  - Plan ${i}:`, duration.toString(), "months");
                }
            } catch (e) {
                // Plan không tồn tại
            }
        }

        console.log("\n📈 Principal Claim Schedule:");
        for (let i = 0; i < 3; i++) {
            const percent = await contract.principalClaimPercents(i);
            console.log(`  - Phase ${i + 1}:`, percent.toString() + "%");
        }

        console.log("\n💰 Upline Reward Percentages:");
        for (let i = 0; i < 10; i++) {
            const percent = await contract.uplineRewardPercents(i);
            console.log(`  - Level ${i + 1}:`, (percent.toNumber() / 100).toFixed(1) + "%");
        }

    } catch (error) {
        console.log("❌ Error reading contract status:", error.message);
    }
}

async function setAZCPrice(contract) {
    console.log("\n💰 SET AZC PRICE");
    console.log("=".repeat(20));
    
    const currentPrice = await contract.azcPriceInUSDT();
    console.log("Current AZC Price:", ethers.utils.formatEther(currentPrice), "USDT");
    
    const newPrice = await question("Enter new AZC price in USDT (e.g. 2.5): ");
    
    if (isNaN(newPrice) || parseFloat(newPrice) <= 0) {
        console.log("❌ Invalid price!");
        return;
    }

    const priceInWei = ethers.utils.parseEther(newPrice);
    
    console.log("📤 Setting AZC price to:", newPrice, "USDT...");
    const tx = await contract.setAZCPrice(priceInWei);
    console.log("⏳ Transaction hash:", tx.hash);
    
    await tx.wait();
    console.log("✅ AZC price updated successfully!");
}

async function updateTokenDistribution(contract) {
    console.log("\n📈 UPDATE TOKEN DISTRIBUTION");
    console.log("=".repeat(35));
    
    const currentAzcPercent = await contract.azcTokenPercent();
    const currentUsdtPercent = await contract.usdtTokenPercent();
    
    console.log("Current Distribution:");
    console.log("- AZC:", currentAzcPercent.toString() + "%");
    console.log("- USDT:", currentUsdtPercent.toString() + "%");
    
    const azcPercent = await question("Enter AZC percentage (0-100): ");
    const usdtPercent = await question("Enter USDT percentage (0-100): ");
    
    if (isNaN(azcPercent) || isNaN(usdtPercent) || 
        parseInt(azcPercent) + parseInt(usdtPercent) !== 100) {
        console.log("❌ Invalid percentages! Must add up to 100%");
        return;
    }

    console.log("📤 Updating token distribution...");
    const tx = await contract.updateTokenDistribution(azcPercent, usdtPercent);
    console.log("⏳ Transaction hash:", tx.hash);
    
    await tx.wait();
    console.log("✅ Token distribution updated successfully!");
}

async function updatePlanDurations(contract) {
    console.log("\n📅 UPDATE PLAN DURATIONS");
    console.log("=".repeat(30));
    
    console.log("Current Plan Durations:");
    for (let i = 0; i < 5; i++) {
        try {
            const duration = await contract.planDurations(i);
            if (duration.gt(0)) {
                console.log(`  - Plan ${i}:`, duration.toString(), "months");
            }
        } catch (e) {
            // Plan không tồn tại
        }
    }
    
    const planId = await question("Enter plan ID to update: ");
    const duration = await question("Enter new duration in months: ");
    
    if (isNaN(planId) || isNaN(duration) || parseInt(duration) <= 0) {
        console.log("❌ Invalid input!");
        return;
    }

    console.log("📤 Updating plan duration...");
    const tx = await contract.updatePlanDuration(planId, duration);
    console.log("⏳ Transaction hash:", tx.hash);
    
    await tx.wait();
    console.log("✅ Plan duration updated successfully!");
}

async function updatePrincipalClaimPercentages(contract) {
    console.log("\n📊 UPDATE PRINCIPAL CLAIM PERCENTAGES");
    console.log("=".repeat(45));
    
    console.log("Current Principal Claim Schedule:");
    for (let i = 0; i < 3; i++) {
        const percent = await contract.principalClaimPercents(i);
        console.log(`  - Phase ${i + 1}:`, percent.toString() + "%");
    }
    
    const phase1 = await question("Enter Phase 1 percentage: ");
    const phase2 = await question("Enter Phase 2 percentage: ");
    const phase3 = await question("Enter Phase 3 percentage: ");
    
    if (isNaN(phase1) || isNaN(phase2) || isNaN(phase3) ||
        parseInt(phase1) + parseInt(phase2) + parseInt(phase3) !== 100) {
        console.log("❌ Invalid percentages! Must add up to 100%");
        return;
    }

    console.log("📤 Updating principal claim percentages...");
    const tx = await contract.updatePrincipalClaimPercents([phase1, phase2, phase3]);
    console.log("⏳ Transaction hash:", tx.hash);
    
    await tx.wait();
    console.log("✅ Principal claim percentages updated successfully!");
}

async function updateUplineRewardPercentages(contract) {
    console.log("\n🎯 UPDATE UPLINE REWARD PERCENTAGES");
    console.log("=".repeat(40));
    
    console.log("Current Upline Reward Percentages:");
    const currentPercents = [];
    for (let i = 0; i < 10; i++) {
        const percent = await contract.uplineRewardPercents(i);
        currentPercents.push(percent.toNumber());
        console.log(`  - Level ${i + 1}:`, (percent.toNumber() / 100).toFixed(1) + "%");
    }
    
    const updateMode = await question("Update (1) single level or (2) all levels? ");
    
    if (updateMode === "1") {
        const level = await question("Enter level to update (1-10): ");
        const percent = await question("Enter new percentage (in basis points, e.g. 2000 = 20%): ");
        
        if (isNaN(level) || isNaN(percent) || level < 1 || level > 10) {
            console.log("❌ Invalid input!");
            return;
        }
        
        // Update single level
        currentPercents[level - 1] = parseInt(percent);
        
    } else if (updateMode === "2") {
        console.log("Enter all 10 percentages (in basis points):");
        for (let i = 0; i < 10; i++) {
            const percent = await question(`Level ${i + 1} (current: ${currentPercents[i]}): `);
            if (!isNaN(percent)) {
                currentPercents[i] = parseInt(percent);
            }
        }
    } else {
        console.log("❌ Invalid option!");
        return;
    }

    console.log("📤 Updating upline reward percentages...");
    const tx = await contract.updateUplineRewardPercents(currentPercents);
    console.log("⏳ Transaction hash:", tx.hash);
    
    await tx.wait();
    console.log("✅ Upline reward percentages updated successfully!");
}

async function updateLevelRequirements(contract) {
    console.log("\n🏆 UPDATE LEVEL REQUIREMENTS");
    console.log("=".repeat(35));
    
    console.log("Current Level Requirements:");
    for (let i = 0; i < 5; i++) {
        try {
            const levelInfo = await contract.levelRequirements(i);
            console.log(`Level ${i + 1}:`);
            console.log(`  - Direct Volume: ${ethers.utils.formatEther(levelInfo.directVolume)} USDT`);
            console.log(`  - Team Volume: ${ethers.utils.formatEther(levelInfo.teamVolume)} USDT`);
            console.log(`  - Reward Percent: ${levelInfo.rewardPercent.toNumber() / 100}%`);
        } catch (e) {
            console.log(`Level ${i + 1}: Not set`);
        }
    }
    
    const level = await question("Enter level to update (0-4): ");
    if (isNaN(level) || level < 0 || level > 4) {
        console.log("❌ Invalid level!");
        return;
    }
    
    const directVolume = await question("Enter direct volume requirement (USDT): ");
    const teamVolume = await question("Enter team volume requirement (USDT): ");
    const rewardPercent = await question("Enter reward percentage (in basis points, e.g. 300 = 3%): ");
    
    if (isNaN(directVolume) || isNaN(teamVolume) || isNaN(rewardPercent)) {
        console.log("❌ Invalid input!");
        return;
    }

    const directVolumeWei = ethers.utils.parseEther(directVolume);
    const teamVolumeWei = ethers.utils.parseEther(teamVolume);

    console.log("📤 Updating level requirement...");
    const tx = await contract.updateLevelRequirement(level, directVolumeWei, teamVolumeWei, rewardPercent);
    console.log("⏳ Transaction hash:", tx.hash);
    
    await tx.wait();
    console.log("✅ Level requirement updated successfully!");
}

async function updateContractAddresses(contract) {
    console.log("\n🔧 UPDATE CONTRACT ADDRESSES");
    console.log("=".repeat(35));
    
    const option = await question("Update (1) Data Contract, (2) Member Contract, or (3) Staking Contract? ");
    
    let tx;
    const newAddress = await question("Enter new contract address: ");
    
    if (!ethers.utils.isAddress(newAddress)) {
        console.log("❌ Invalid address!");
        return;
    }
    
    switch(option) {
        case "1":
            console.log("📤 Updating Data Contract address...");
            tx = await contract.setDataContract(newAddress);
            break;
        case "2":
            console.log("📤 Updating Member Contract address...");
            tx = await contract.setMemberContract(newAddress);
            break;
        case "3":
            console.log("📤 Updating Staking Contract address...");
            tx = await contract.setStakingContract(newAddress);
            break;
        default:
            console.log("❌ Invalid option!");
            return;
    }
    
    console.log("⏳ Transaction hash:", tx.hash);
    await tx.wait();
    console.log("✅ Contract address updated successfully!");
}

async function viewClaimInformation(contract) {
    console.log("\n📊 VIEW CLAIM INFORMATION");
    console.log("=".repeat(35));
    
    const stakeId = await question("Enter stake ID to check: ");
    
    if (isNaN(stakeId)) {
        console.log("❌ Invalid stake ID!");
        return;
    }

    try {
        // Check claimable interest
        const [azcAmount, usdtAmount, canClaim] = await contract.getClaimableInterest(stakeId);
        console.log("\n💰 Claimable Interest:");
        console.log("- AZC Amount:", ethers.utils.formatEther(azcAmount));
        console.log("- USDT Amount:", ethers.utils.formatEther(usdtAmount));
        console.log("- Can Claim:", canClaim ? "Yes" : "No");

        // Check claimable principal
        const [principalAzc, phase, canClaimPrincipal, timeUntilClaim] = await contract.getClaimablePrincipal(stakeId);
        console.log("\n🏦 Claimable Principal:");
        console.log("- AZC Amount:", ethers.utils.formatEther(principalAzc));
        console.log("- Current Phase:", phase.toString());
        console.log("- Can Claim:", canClaimPrincipal ? "Yes" : "No");
        if (!canClaimPrincipal && timeUntilClaim.gt(0)) {
            console.log("- Time Until Claim:", timeUntilClaim.toString(), "seconds");
        }

    } catch (error) {
        console.log("❌ Error getting claim information:", error.message);
    }
}

async function fundContract(contract) {
    console.log("\n💳 FUND CONTRACT");
    console.log("=".repeat(20));
    
    console.log("Note: You need to manually transfer tokens to the contract");
    console.log("Contract Address:", contract.address);
    
    const azcAmount = await question("Enter AZC amount to transfer: ");
    const usdtAmount = await question("Enter USDT amount to transfer: ");
    
    if (isNaN(azcAmount) || isNaN(usdtAmount)) {
        console.log("❌ Invalid amounts!");
        return;
    }
    
    console.log("\n📋 Instructions:");
    console.log("1. Transfer", azcAmount, "AZC to", contract.address);
    console.log("2. Transfer", usdtAmount, "USDT to", contract.address);
    console.log("\nUse your wallet or another script to make these transfers.");
}

async function emergencyWithdraw(contract) {
    console.log("\n🚨 EMERGENCY WITHDRAW");
    console.log("=".repeat(25));
    
    const option = await question("Withdraw (1) Token or (2) ETH/BNB? ");
    
    if (option === "1") {
        const tokenAddress = await question("Enter token address: ");
        const amount = await question("Enter amount to withdraw (in wei, or 'all' for full balance): ");
        
        if (!ethers.utils.isAddress(tokenAddress)) {
            console.log("❌ Invalid token address!");
            return;
        }
        
        let tx;
        if (amount.toLowerCase() === "all") {
            console.log("📤 Withdrawing all tokens...");
            tx = await contract.emergencyWithdrawToken(tokenAddress, 0); // 0 for all
        } else if (!isNaN(amount)) {
            console.log("📤 Withdrawing", amount, "tokens...");
            tx = await contract.emergencyWithdrawToken(tokenAddress, amount);
        } else {
            console.log("❌ Invalid amount!");
            return;
        }
        
        console.log("⏳ Transaction hash:", tx.hash);
        await tx.wait();
        console.log("✅ Tokens withdrawn successfully!");
        
    } else if (option === "2") {
        const amount = await question("Enter amount to withdraw (in ETH/BNB): ");
        
        if (isNaN(amount)) {
            console.log("❌ Invalid amount!");
            return;
        }
        
        const amountWei = ethers.utils.parseEther(amount);
        
        console.log("📤 Withdrawing", amount, "ETH/BNB...");
        const tx = await contract.emergencyWithdrawETH(amountWei);
        console.log("⏳ Transaction hash:", tx.hash);
        
        await tx.wait();
        console.log("✅ ETH/BNB withdrawn successfully!");
        
    } else {
        console.log("❌ Invalid option!");
    }
}

async function viewStakeTimeline(contract) {
    console.log("\n📋 VIEW STAKE TIMELINE");
    console.log("=".repeat(30));
    
    const stakeId = await question("Enter stake ID: ");
    
    if (isNaN(stakeId)) {
        console.log("❌ Invalid stake ID!");
        return;
    }

    try {
        const [startTime, interestEndTime, phase1Time, phase2Time, phase3Time, planDuration] = 
            await contract.getStakeTimeline(stakeId);
        
        console.log("\n📅 Stake Timeline:");
        console.log("- Start Time:", new Date(startTime.toNumber() * 1000).toLocaleString());
        console.log("- Interest End Time:", new Date(interestEndTime.toNumber() * 1000).toLocaleString());
        console.log("- Principal Phase 1:", new Date(phase1Time.toNumber() * 1000).toLocaleString());
        console.log("- Principal Phase 2:", new Date(phase2Time.toNumber() * 1000).toLocaleString());
        console.log("- Principal Phase 3:", new Date(phase3Time.toNumber() * 1000).toLocaleString());
        console.log("- Plan Duration:", planDuration.toString(), "months");

    } catch (error) {
        console.log("❌ Error getting timeline:", error.message);
    }
}

// Run the admin panel
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        rl.close();
        process.exit(1);
    }); 