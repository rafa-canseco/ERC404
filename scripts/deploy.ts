import {ethers,run} from "hardhat"
import * as dotenv from "dotenv"
import {Enigma404__factory} from "../typechain-types"
const hre = require("hardhat");
dotenv.config()

function setUpProvider () {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_TESTNET ?? "");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_TESTNET ?? "", provider);
    return {provider, wallet}
}

async function deployment() {
    const {provider,wallet} = setUpProvider()
    const walletAddress = await wallet.getAddress()
    console.log("Deploying Token")
    const tokenFactory = new Enigma404__factory(wallet)
    const token = await tokenFactory.deploy(walletAddress)
    const deploymentTokenTransaction = token.deploymentTransaction();
    await deploymentTokenTransaction?.wait(10)
    await token.waitForDeployment();
    const tokenContractAddress = await token.getAddress()
    console.log("Token deployed at:", tokenContractAddress)
    console.log("Verifying Token Contract")
    try{
        await hre.run("verify:verify", {
            address: tokenContractAddress,
            constructorArguments: [walletAddress],
        });
        console.log("Token Contract Verified succesfully")
    } catch (error) {
        console.log("Error verifying Token Contract", error)
    }


}

deployment()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
