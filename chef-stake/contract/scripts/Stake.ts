import hre from 'hardhat';
const contractAddress = '0xAC4f14a033E81c5EA704daAf7d0153A102b63af8'
async function main() {
  const rewardToken = '0xcB917D298F762B6993d72D5d81FCEF273CfD731B';
  const stake = await hre.ethers.getContractFactory('CHEFStake');
  console.log('Deploying chefStake...');
  const chefStake = await stake.deploy(rewardToken);
  await chefStake.waitForDeployment();
  console.log('chefStake deployed to:', chefStake.target);
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});
