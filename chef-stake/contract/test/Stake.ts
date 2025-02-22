import hre from 'hardhat';
import { expect } from 'chai';

let owner: any;
let user: any;
let chef: any;
let stake: any;
// 基础测试案例（使用Hardhat）
describe('ChefStake', function () {
  before(async () => {
    [owner, user] = await hre.ethers.getSigners();
    // 部署ERC20测试代币
    const CHEF = await hre.ethers.getContractFactory('ERC20');
    chef = await CHEF.deploy('CHEF', 'CHEF');
    // 部署质押合约
    const Stake = await hre.ethers.getContractFactory('Stake');
    stake = await Stake.deploy(chef.address);
  });

  it('应正确创建质押池', async () => {
    await stake.connect(owner).addPool(
      hre.ethers.ZeroAddress, // 使用ETH
      100,
      hre.ethers.parseEther('0.1'),
      100
    );
    const pool = await stake.pools(0);
    expect(pool.poolWeight).to.equal(100);
  });
  it('应正确处理ETH质押', async () => {
    await stake.connect(user).deposit(0, hre.ethers.parseEther('1'), {
      value: hre.ethers.parseEther('1'),
    });
    const userInfo = await stake.userInfo(0, user.address);
    expect(userInfo.stAmount).to.equal(hre.ethers.parseEther('1'));
  });
});
