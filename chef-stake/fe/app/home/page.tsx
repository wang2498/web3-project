'use client';
import { useEffect, useState, useCallback } from 'react';
import { Box, TextField, Typography, Button, Snackbar } from '@mui/material';
import useWeb3 from '@/hooks/useWeb3';
import {  Pid } from '@/utils';
import { ethers } from 'ethers';
export default function Home() {
  const { wallet, stakeContract } = useWeb3();
  const { address, isConnected } = wallet;
  const [amount, setAmount] = useState('');
  const [messageOpen, setMessageOpen] = useState(false);
  const [stakedAmount, setStakedAmount] = useState('0');
  const [loading, setLoading] = useState(false);
  const getStakeAmount = useCallback(async () => {
    if (address && isConnected) {
      const stakeAmount = await stakeContract.current?.getStakeAmount(Pid, address);
      console.log(stakeAmount, 'stakeAmount');
      setStakedAmount(ethers.formatEther(stakeAmount as bigint));
    }
  }, [stakeContract, address, isConnected]);
  const handleStake = async () => {
    console.log(stakeContract, 'handleStake');
    if (!stakeContract || !address || !amount) return;
    try {
      setLoading(true);
      const tx = await stakeContract.current?.deposit(Pid, ethers.parseEther(amount), {
        value: ethers.parseEther(amount),
      });
      await tx.wait();
      setMessageOpen(true);
      setAmount('');
      getStakeAmount();
    } catch (err) {
      console.log(err, 'err');
    } finally {
      setLoading(false);
    }
  };
  const handleCloseMessage = () => {
    setMessageOpen(false);
  };
  useEffect(() => {
    if (stakeContract.current && address) {
      getStakeAmount();
    }
  }, [stakeContract, address, getStakeAmount]);
  return (
    <Box className="flex flex-col justify-center items-center pt-16">
      <Box className="flex flex-col items-center justify-center">
        <Typography variant="h2" className="font-bold">
          Chef Stake 👨🏻‍🍳
        </Typography>
        <Typography variant="h6">Stake ETH to earn Chef</Typography>
      </Box>
      <Box className="flex flex-col mt-12 items-center w-1/2 justify-center border border-gray-300 rounded-lg p-4">
        <Typography variant="h6">Stake Amount: {stakedAmount} ETH</Typography>
        <TextField
          className="mt-4"
          label="Amount"
          variant="outlined"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button loading={loading} className="mt-4 font-bold" variant="contained" onClick={handleStake}>
          STAKE
        </Button>
      </Box>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={messageOpen}
        onClose={handleCloseMessage}
        message="质押成功"
      />
    </Box>
  );
}
