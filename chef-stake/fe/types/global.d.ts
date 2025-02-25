declare global {
  interface window {
    ethereum?: import('ethers').providers.ExternalProvider;
  }
}
