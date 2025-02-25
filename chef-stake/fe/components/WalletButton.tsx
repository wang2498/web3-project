import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Box, Button, IconButton, Typography, Dialog, DialogTitle, DialogContent, Text } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ethers } from 'ethers';
import useWeb3 from '@/hooks/useWeb3';
import { BigNumberish } from 'ethers';

const walletList = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '/metamask.svg',
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    icon: '/okx.png',
  },
];
function WalletButton() {
  const [walletOpen, setWalletOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [randomAvatar, setRandomAvatar] = useState('');
  const { wallet, provider, signer } = useWeb3();
  const { address, balance, isConnected, chainId, chainName, connect, disconnect, getCurrentAccountInfo } = wallet;
  const simpleAddress = useMemo(() => (address ? address?.slice(0, 6) + '...' + address?.slice(-4) : ''), [address]);
  const balanceFormatted = useMemo(() => (balance ? ethers.formatEther(balance as BigNumberish) : '0'), [balance]);
  // const {} = useWallet()
  const handleOpenConnect = () => {
    setConnectOpen(true);
  };
  const handleCloseConnect = () => {
    setConnectOpen(false);
  };
  const handleOpenWallet = () => {
    setWalletOpen(true);
  };
  const handleCloseWallet = () => {
    setWalletOpen(false);
  };

  const handleConnectWallet = async (wallet: 'metamask' | 'okx') => {
    try {
      if (wallet === 'metamask') {
        await connect();
        setConnectOpen(false);
        getCurrentAccountInfo();
      }
    } catch (err) {
      console.log(err, 'err----');
    }
  };
  const handleDisconnect = () => {
    disconnect();
    setWalletOpen(false);
  };
  const getRandomAvatar = async () => {
    const response = await fetch('https://api.thecatapi.com/v1/images/search');
    const data = await response.json();
    return data[0].url || '';
  };
  useEffect(() => {
    if (simpleAddress) {
      const fetchAvatar = async () => {
        const avatar: string = await getRandomAvatar();
        console.log(avatar, 'avatar----');
        setRandomAvatar(avatar);
      };
      fetchAvatar();
    }
  }, [simpleAddress]);
  return (
    <>
      <Box component="section" className="flex justify-between items-center w-full h-16">
        {isConnected ? (
          <Button className="rounded-lg bg-sky-500" variant="contained" color="primary" onClick={handleOpenWallet}>
            账号{simpleAddress}
          </Button>
        ) : (
          <Button className="rounded-lg bg-sky-500" variant="contained" color="primary" onClick={handleOpenConnect}>
            连接钱包
          </Button>
        )}
      </Box>
      <Dialog open={connectOpen} onClose={handleCloseConnect}>
        <DialogTitle sx={{ m: 0, p: 2 }}>请选择钱包</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleCloseConnect}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent className="w-[400px] px-4 pt-0">
          <Box className="flex flex-col gap-4">
            {walletList.map((item) => (
              <Box
                key={item.id}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleConnectWallet(item.id as 'metamask' | 'okx')}
              >
                <Image src={item.icon} alt={item.name} width={40} height={40} />
                <Typography className="ml-2 font-bold">{item.name}</Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog open={walletOpen} onClose={handleCloseWallet}>
        <DialogTitle className="flex items-center">
          <Image className="rounded-full w-16 h-16" src={randomAvatar} alt="avatar" width={64} height={64} />
          <span className="ml-2 font-bold">账号：{simpleAddress}</span>
        </DialogTitle>
        <DialogContent>
          <Box>
            <Typography>
              余额：<span className="font-bold">{balanceFormatted}</span> ETH
            </Typography>
          </Box>
          <Box>
            <Typography>链：{chainName}</Typography>
            <Typography>链ID：{chainId}</Typography>
          </Box>
          <Box className="flex gap-4 mt-4">
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigator.clipboard.writeText(address as string)}
            >
              复制地址
            </Button>
            <Button variant="contained" color="primary" onClick={handleDisconnect}>
              断开链接
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default WalletButton;
