import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WALLET_STORAGE_KEY = '@wallet_private_key';

export interface WalletInfo {
  address: string;
  privateKey: string;
  wallet: ethers.Wallet | null;
}

export function useWeb3() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load wallet from storage on mount
  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const storedKey = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
      if (storedKey) {
        const walletInstance = new ethers.Wallet(storedKey);
        setWallet({
          address: walletInstance.address,
          privateKey: storedKey,
          wallet: walletInstance,
        });
      }
    } catch (err) {
      console.error('Error loading wallet:', err);
    }
  };

  const createWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const newWallet = ethers.Wallet.createRandom();
      const walletData = {
        address: newWallet.address,
        privateKey: newWallet.privateKey,
        wallet: newWallet,
      };

      await AsyncStorage.setItem(WALLET_STORAGE_KEY, newWallet.privateKey);
      setWallet(walletData);

      return walletData;
    } catch (err: any) {
      setError(err.message || 'Failed to create wallet');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const importWallet = useCallback(async (privateKey: string) => {
    try {
      setLoading(true);
      setError(null);

      const walletInstance = new ethers.Wallet(privateKey);
      const walletData = {
        address: walletInstance.address,
        privateKey: privateKey,
        wallet: walletInstance,
      };

      await AsyncStorage.setItem(WALLET_STORAGE_KEY, privateKey);
      setWallet(walletData);

      return walletData;
    } catch (err: any) {
      setError('Invalid private key');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(WALLET_STORAGE_KEY);
      setWallet(null);
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
    }
  }, []);

  return {
    wallet,
    loading,
    error,
    createWallet,
    importWallet,
    disconnect,
    isConnected: !!wallet,
  };
}

