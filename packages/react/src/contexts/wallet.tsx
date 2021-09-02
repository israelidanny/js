import { WalletAdapter, WalletProvider } from '@solana/wallet-base'
import { Button } from 'antd'
import React, {
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { notify } from './../utils/notifications'
import { useConnectionConfig } from './connection'
import { useLocalStorageState } from '../utils'
import { WalletName } from '@metaplex/wallets'
import { useLocation } from 'react-router'
import { MetaplexModal } from '../components/MetaplexModal'
import { useMetaplex } from './metaplex'

const WalletContext = React.createContext<{
  wallet: WalletAdapter | undefined
  connected: boolean
  select: () => void
  provider: WalletProvider | undefined
}>({
  wallet: undefined,
  connected: false,
  select() {},
  provider: undefined,
})

export function WalletProvider({ children }: PropsWithChildren<{}>) {
  const { endpoint } = useConnectionConfig()
  const location = useLocation()
  const [autoConnect, setAutoConnect] = useState(location.pathname.indexOf('result=') >= 0 || false)
  const [providerName, setProviderName] = useLocalStorageState('walletProvider')
  const { api } = useMetaplex()

  const provider = useMemo(
    () => WALLET_PROVIDERS.find(({ name }) => name === providerName),
    [providerName],
  )

  const wallet = useMemo(
    function () {
      if (provider) {
        return new (provider.adapter || Wallet)(providerName, endpoint) as WalletAdapter
      }
    },
    [provider, providerName, endpoint],
  )

  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (wallet?.publicKey && connected) {
      const walletPublicKey = wallet.publicKey.toBase58()
      const keyToDisplay =
        walletPublicKey.length > 20
          ? `${walletPublicKey.substring(0, 7)}.....${walletPublicKey.substring(
              walletPublicKey.length - 7,
              walletPublicKey.length,
            )}`
          : walletPublicKey
      notify({
        message: 'Wallet update',
        description: 'Connected to wallet ' + keyToDisplay,
      })
    }
  }, [connected])

  useEffect(() => {
    if (wallet) {
      wallet.on('connect', () => {
        if (wallet.publicKey) {
          setConnected(true)
        }
      })

      wallet.on('disconnect', () => {
        setConnected(false)
        notify({
          message: 'Wallet update',
          description: 'Disconnected from wallet',
        })
      })
    }

    return () => {
      setConnected(false)
      if (wallet) {
        wallet.disconnect()
      }
    }
  }, [wallet])

  useEffect(() => {
    if (wallet && autoConnect) {
      wallet.connect()
      setAutoConnect(false)
    }

    return () => {}
  }, [wallet, autoConnect])

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [showProviders, setShowProviders] = useState(false)

  const select = useCallback(() => setIsModalVisible(true), [])
  const close = useCallback(() => {
    setIsModalVisible(false)
    setShowProviders(false)
  }, [])

  const pp = WALLET_PROVIDERS.find((wp) => wp.name === 'Phantom')

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connected,
        select,
        provider,
      }}
    >
      {children}
      <MetaplexModal visible={isModalVisible} onCancel={close}>
        <div
          style={{
            background: 'linear-gradient(180deg, #D329FC 0%, #8F6DDE 49.48%, #19E6AD 100%)',
            borderRadius: 36,
            width: 50,
            height: 50,
            textAlign: 'center',
            verticalAlign: 'middle',
            fontWeight: 700,
            fontSize: '1.3rem',
            lineHeight: 2.4,
            marginBottom: 10,
          }}
        >
          M
        </div>

        <h2>{provider ? 'Change provider' : 'Welcome to Metaplex'}</h2>
        <p>
          {provider
            ? 'Feel free to switch wallet provider'
            : 'You must be signed in to place a bid'}
        </p>

        <br />

        {provider || showProviders ? (
          <>
            {WALLET_PROVIDERS.map((provider, idx) => {
              if (providerName === provider.name) return null

              const onClick = function () {
                setProviderName(provider.name)
                setAutoConnect(true)
                close()
              }
              return (
                <Button
                  key={idx}
                  size='large'
                  type={providerName === provider.name ? 'primary' : 'ghost'}
                  onClick={onClick}
                  icon={
                    <img
                      alt={`${provider.name}`}
                      width={20}
                      height={20}
                      src={provider.icon}
                      style={{ marginRight: 8 }}
                    />
                  }
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    marginBottom: 8,
                  }}
                >
                  {provider.name}
                </Button>
              )
            })}
          </>
        ) : (
          <>
            <Button
              className='metaplex-button'
              style={{
                width: '80%',
                fontWeight: 'unset',
              }}
              onClick={(_) => {
                setProviderName(pp?.name)
                setAutoConnect(true)
                close()
              }}
            >
              <span>
                <img src={pp?.icon} style={{ width: '1.2rem' }} />
                &nbsp;Sign in with Phantom
              </span>
              <span>&gt;</span>
            </Button>
            <p onClick={(_) => setShowProviders(true)} style={{ cursor: 'pointer', marginTop: 10 }}>
              Select a different Solana wallet
            </p>
          </>
        )}
      </MetaplexModal>
    </WalletContext.Provider>
  )
}

export const useWallet = () => {
  const { wallet, connected, provider, select } = useContext(WalletContext)
  return {
    wallet,
    connected,
    provider,
    select,
    connect() {
      wallet ? wallet.connect() : select()
    },
    disconnect() {
      wallet?.disconnect()
    },
  }
}
