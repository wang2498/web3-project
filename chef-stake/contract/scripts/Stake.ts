import hre from 'hardhat';
const contractAddress = '0xd632b100648A19132B315271caDDB8E29CF5A725'
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
