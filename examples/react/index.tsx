import React from 'react'
import ReactDOM from 'react-dom'
import { MetaplexProvider, ConnectButton, useMetaplex } from '@metaplex/react'
import { getPhantomWallet } from '@solana/wallet-adapter-wallets'
import { Card } from 'antd'

const Root = () => {
  const { connection, addWallet } = useMetaplex()

  addWallet(getPhantomWallet())
  console.log(connection)

  return (
    <Card title='Card' style={{ width: 300 }}>
      <ConnectButton />
    </Card>
  )
}

const App = () => {
  return (
    <MetaplexProvider>
      <Root />
    </MetaplexProvider>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
)
