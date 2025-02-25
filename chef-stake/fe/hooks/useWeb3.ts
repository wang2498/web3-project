import { useState, useRef, useEffect, useCallback } from 'react';
import { ethers, BigNumberish } from 'ethers';

const useWeb3 = () => {
  const [address, setAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState<bigint | null>(null);
  const [chainName, setChainName] = useState<string>('');
  const [balance, setBalance] = useState<BigNumberish>();
  const provider = useRef<ethers.BrowserProvider | undefined>(undefined);
  const signer = useRef<ethers.Signer | undefined>(undefined);

  const resetAll = () => {
    setAddress('');
    setIsConnected(false);
    setChainId(null);
    setChainName('');
    setBalance('');
  };
  const connect = async () => {
    if (window.ethereum) {
      provider.current = new ethers.BrowserProvider(window.ethereum);
      console.log('provider', provider);
      signer.current = provider.current.getSigner();
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log(account, 'account-----');
      setAddress(account);
      setIsConnected(true);
    } else {
      throw new Error('Please install MetaMask');
    }
  };

  const disconnect = () => {
    resetAll();
  };
  const getCurrentAccountInfo = useCallback(async () => {
    const network = await provider.current?.getNetwork();
    const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!account || !network) return;
    const balance = await provider.current?.getBalance(account);
    console.log(network, balance, 'network-----');
    setAddress(account);
    setBalance(balance);
    setChainId(network.chainId);
    setChainName(network.name);
    setIsConnected(true);
  }, [provider]);

  // const changeAccount = useCallback(() => {
  //   provider.send('wallet_requestPermissions', [{ eth_accounts: {} }]);
  // },[]);

  useEffect(() => {
    window.ethereum?.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        setAddress('');
        setIsConnected(false);
      } else {
        setAddress(accounts[0]);
        setIsConnected(true);
      }
    });

    // window.ethereum?.on('chainChanged', (chainId: string) => {
    //   console.log(chainId, 'chainId-----');
    //   setChainId(parseInt(chainId, 16));
    // });

    return () => {
      if (
        typeof window !== 'undefined' &&
        typeof window.ethereum !== 'undefined' &&
        window.ethereum.off === 'function'
      ) {
        window.ethereum.off('accountsChanged', () => {});
        window.ethereum.off('chainChanged', () => {});
      }
    };
  }, []);

  return {
    wallet: {
      address,
      balance,
      chainId,
      chainName,
      isConnected,
      connect,
      disconnect,
      // changeAccount,
      getCurrentAccountInfo,
    },
    provider,
    signer,
  };
};

export default useWeb3;
