'use client';
import { useEffect, useState, useCallback } from 'react';
import { Box, TextField, Typography, Button, Snackbar } from '@mui/material';
import useWeb3 from '@/hooks/useWeb3';
import { Pid } from '@/utils';
import { ethers } from 'ethers';

type UserStakeData = {
  stakeAmount: number;
  withdrawAmount: number;
  pendingAmount: number;
};
const initData: UserStakeData = {
  stakeAmount: 0,
  withdrawAmount: 0,
  pendingAmount: 0,
};
export default function Withdraw() {
  const { wallet, stakeContract } = useWeb3();
  const { address, isConnected } = wallet;
  const [messageOpen, setMessageOpen] = useState(false);

  const [unStakeAmount, setUnStakeAmount] = useState('');
  const [withdrawReadyAmount, setWithdrawReadyAmount] = useState('');
  const [userData, setUserData] = useState<UserStakeData>(initData);
  const [loading, setLoading] = useState(false);
  const getUserData = useCallback(async () => {
    if (!stakeContract.current || !address) return;
    const stakeAmount = await stakeContract.current?.getStakeAmount(Pid, address);
    const [withdrawAmount, pendingAmount] = await stakeContract.current?.getWithdrawAmount(Pid);
    console.log(ethers.formatEther(withdrawAmount as bigint), 'withdrawAmount');
    console.log(ethers.formatEther(pendingAmount as bigint), 'pendingAmount');
    setUserData({
      stakeAmount: Number(ethers.formatEther(stakeAmount as bigint)),
      withdrawAmount: Number(ethers.formatEther(withdrawAmount as bigint)),
      pendingAmount: Number(ethers.formatEther(pendingAmount as bigint)),
    });
  }, [stakeContract, address, isConnected]);
  const handleWithdraw = async () => {
    if (!stakeContract || !address) return;
    try {
      setLoading(true);
      const tx = await stakeContract.current?.withdraw(Pid);
      await tx.wait();
      setMessageOpen(true);
      setWithdrawReadyAmount('');
    } catch (err: any) {
      console.log(err, 'err');
    } finally {
      setLoading(false);
    }
  };
  const handleUnStake = async () => {
    if (!stakeContract || !address) return;
    try {
      setLoading(true);
      const tx = await stakeContract.current?.requestUnstake(Pid, ethers.parseEther(unStakeAmount));
      await tx.wait();
      console.log(tx, 'tx');
      setMessageOpen(true);
      setUnStakeAmount('');
      setLoading(false);
      getUserData();
    } catch (err: any) {
      console.log(err, 'err');
    } finally {
      setLoading(false);
    }
  };
  const handleClaim = async () => {
    if (!stakeContract || !address) return;
    const tx = await stakeContract.current?.claim(Pid);
    await tx.wait();
    setMessageOpen(true);
    getUserData();
  };
  const handleCloseMessage = () => {
    setMessageOpen(false);
  };
  useEffect(() => {
    console.log(stakeContract, 'stakeContract');
    if (stakeContract.current && address) {
      getUserData();
    }
  }, [stakeContract, address, getUserData]);
  return (
    <Box className="flex flex-col justify-center items-center pt-16">
      <Box className="flex flex-col items-center justify-center">
        <Typography variant="h2" className="font-bold">
          Chef Stake 👨🏻‍🍳
        </Typography>
        <Typography variant="h6">Stake ETH to earn Chef</Typography>
      </Box>
      <Box className="flex flex-col mt-12 items-center w-1/2 justify-center border border-gray-300 rounded-lg p-4">
        <Box className="flex justify-between w-full">
          <Box>
            <Typography>Stake Amount:</Typography>
            <Typography variant="h6" className="text-center">
              {userData.stakeAmount} ETH
            </Typography>
          </Box>
          <Box className="text-center">
            <Typography>Available To Withdraw</Typography>
            <Typography variant="h6" className="text-center">
              {userData.withdrawAmount} ETH
            </Typography>
          </Box>
          <Box>
            <Typography>Pending To Withdraw</Typography>
            <Typography variant="h6" className="text-center">
              {userData.pendingAmount} Chef
            </Typography>
          </Box>
        </Box>
        <TextField
          className="mt-4"
          label="Amount"
          variant="outlined"
          value={unStakeAmount}
          onChange={(e) => setUnStakeAmount(e.target.value)}
        />
        <Button loading={loading} className="mt-4 font-bold" variant="contained" onClick={handleUnStake}>
          UNSTAKE
        </Button>
        <Typography className="mt-4 text-neutral-500">Ready Amount: {userData.withdrawAmount} ETH</Typography>
        <TextField
          className="mt-4"
          label="Amount"
          variant="outlined"
          value={withdrawReadyAmount}
          onChange={(e) => setWithdrawReadyAmount(e.target.value)}
        />
        <Button
          disabled={!userData.withdrawAmount}
          className="mt-4 font-bold"
          variant="contained"
          onClick={handleWithdraw}
        >
          WITHDRAW
        </Button>
        <Button className="mt-4 font-bold" variant="contained" onClick={handleClaim}>
          CLAIM
        </Button>
      </Box>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={messageOpen}
        onClose={handleCloseMessage}
        message="解质押成功"
      />
    </Box>
  );
}
