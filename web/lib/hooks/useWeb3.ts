'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ethers } from 'ethers';
import { BASE_SEPOLIA_CHAIN_ID, BASE_MAINNET_CHAIN_ID } from '@/lib/constants/config';

interface Web3State {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export function useWeb3() {
  const [state, setState] = useState<Web3State>({
    account: null,
    provider: null,
    signer: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  // Track if listeners are registered to prevent duplicates
  const listenersRegistered = useRef(false);
  // Store handler functions in refs to avoid circular dependencies
  const handleAccountsChangedRef = useRef<((accounts: string[]) => Promise<void>) | null>(null);
  const handleChainChangedRef = useRef<(() => Promise<void>) | null>(null);
  const removeListenersRef = useRef<(() => void) | null>(null);

  // Check if wallet is available
  const isWalletAvailable = useCallback(() => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }, []);

  // Remove all event listeners
  const removeListeners = useCallback(() => {
    if (typeof window !== 'undefined' && window.ethereum && listenersRegistered.current) {
      if (handleAccountsChangedRef.current) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChangedRef.current);
      }
      if (handleChainChangedRef.current) {
        window.ethereum.removeListener('chainChanged', handleChainChangedRef.current);
      }
      listenersRegistered.current = false;
    }
  }, []);

  // Handle account changes
  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected wallet - clean up listeners
      if (removeListenersRef.current) {
        removeListenersRef.current();
      }
      setState({
        account: null,
        provider: null,
        signer: null,
        chainId: null,
        isConnected: false,
        isConnecting: false,
        error: null,
      });
    } else {
      // Account changed, update state
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        setState((prev) => ({
          ...prev,
          account: address,
          provider,
          signer,
          chainId,
          isConnected: true,
        }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.message || 'Failed to update account',
        }));
      }
    }
  }, []);

  // Handle chain changes
  const handleChainChanged = useCallback(async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      setState((prev) => ({
        ...prev,
        provider,
        signer,
        chainId,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to update chain',
      }));
    }
  }, []);

  // Update refs when handlers change
  useEffect(() => {
    handleAccountsChangedRef.current = handleAccountsChanged;
    handleChainChangedRef.current = handleChainChanged;
    removeListenersRef.current = removeListeners;
  }, [handleAccountsChanged, handleChainChanged, removeListeners]);

  // Register event listeners (only once)
  const registerListeners = useCallback(() => {
    if (typeof window !== 'undefined' && window.ethereum && !listenersRegistered.current) {
      if (handleAccountsChangedRef.current) {
        window.ethereum.on('accountsChanged', handleAccountsChangedRef.current);
      }
      if (handleChainChangedRef.current) {
        window.ethereum.on('chainChanged', handleChainChangedRef.current);
      }
      listenersRegistered.current = true;
    }
  }, []);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!isWalletAvailable()) {
      setState((prev) => ({
        ...prev,
        error: 'No Web3 wallet detected. Please install MetaMask or another Web3 wallet.',
      }));
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Get signer
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      setState({
        account: address,
        provider,
        signer,
        chainId,
        isConnected: true,
        isConnecting: false,
        error: null,
      });

      // Register listeners only once when connecting
      registerListeners();
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet',
      }));
    }
  }, [isWalletAvailable, registerListeners]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    removeListeners();
    setState({
      account: null,
      provider: null,
      signer: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  }, [removeListeners]);

  // Switch to Base Sepolia network
  const switchToBaseSepolia = useCallback(async () => {
    if (!isWalletAvailable()) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}` }],
      });
    } catch (error: any) {
      // If chain doesn't exist, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}`,
              chainName: 'Base Sepolia',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://sepolia.base.org'],
              blockExplorerUrls: ['https://sepolia-explorer.base.org'],
            },
          ],
        });
      }
    }
  }, [isWalletAvailable]);

  // Check connection on mount
  useEffect(() => {
    if (isWalletAvailable()) {
      const checkConnection = async () => {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          
          if (accounts.length > 0) {
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const network = await provider.getNetwork();
            const chainId = Number(network.chainId);

            setState({
              account: address,
              provider,
              signer,
              chainId,
              isConnected: true,
              isConnecting: false,
              error: null,
            });

            // Register listeners only once
            registerListeners();
          }
        } catch (error) {
          // Silently fail if wallet is locked
        }
      };

      checkConnection();
    }

    // Cleanup: remove listeners on unmount
    return () => {
      removeListeners();
    };
  }, [isWalletAvailable, registerListeners, removeListeners]);

  return {
    ...state,
    connect,
    disconnect,
    switchToBaseSepolia,
    isWalletAvailable: isWalletAvailable(),
  };
}
