import { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react';
import { ethers, BigNumberish } from 'ethers';
import { stakeAbi } from '@/assets/stake';
import { contractAddress } from '@/utils';

const Web3Context = createContext({});

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [address, setAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState<bigint | null>(null);
  const [chainName, setChainName] = useState<string>('');
  const [balance, setBalance] = useState<BigNumberish>();

  const provider = useRef<ethers.BrowserProvider | undefined>(undefined);
  const signer = useRef<ethers.Signer | undefined>(undefined);
  const stakeContract = useRef<ethers.Contract | undefined>(undefined);

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
      signer.current = await provider.current.getSigner();
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
  const initContract = async () => {
    const contract = new ethers.Contract(contractAddress, stakeAbi, signer.current);
    console.log(contract, 'initContract');
    stakeContract.current = contract;
  };
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

  const value = {
    wallet: {
      address,
      balance,
      chainId,
      chainName,
      isConnected,
      connect,
      disconnect,
      getCurrentAccountInfo,
      initContract,
    },
    provider,
    signer,
    stakeContract,
  };
  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
export default function useWeb3() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useContext(Web3Context) as any;
}
