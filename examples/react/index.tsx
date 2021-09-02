import React from 'react'
import ReactDOM from 'react-dom'
import { MetaplexProvider, ConnectButton } from '@metaplex/react'
import { Card } from 'antd'

const Root = () => {
  const { connection } = useMetaplex()

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
