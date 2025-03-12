import React, { useMemo, ReactNode } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletProvider as WalletProviderBase } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { ConnectionProvider } from '@solana/wallet-adapter-react';

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  // You can change this to WalletAdapterNetwork.Mainnet for production
  const network = WalletAdapterNetwork.Devnet;

  // Generate the endpoint using clusterApiUrl
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Initialize the wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProviderBase 
        wallets={wallets} 
        autoConnect 
        onError={(error) => {
          console.error('Wallet error:', error);
        }}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProviderBase>
    </ConnectionProvider>
  );
};

export default WalletProvider;