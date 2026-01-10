const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying InvoiceNFT contract...");

  // Deploy contract
  const InvoiceNFT = await hre.ethers.getContractFactory("InvoiceNFT");
  const invoiceNFT = await InvoiceNFT.deploy();

  await invoiceNFT.waitForDeployment();

  const address = await invoiceNFT.getAddress();

  console.log("✅ InvoiceNFT deployed to:", address);
  console.log("📝 Save this address to your .env file:");
  console.log(`NFT_CONTRACT_ADDRESS=${address}`);

  // Verify on Etherscan (if not localhost)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("⏳ Waiting for block confirmations...");
    await invoiceNFT.deploymentTransaction().wait(6);
    
    console.log("🔍 Verifying contract on Etherscan...");
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("✅ Contract verified!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
