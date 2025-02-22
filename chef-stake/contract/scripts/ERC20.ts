const hre = require('hardhat')

async function main() {
    const Contract = await hre.ethers.getContractFactory('ERC20');
    const token = await Contract.deploy('CHEF', 'CHEF');

    await token.waitForDeployment;

    console.log('成功部署合约：', token.target);
}

main().catch((error) => {
  console.log(error)
  process.exitCode = 1
})
