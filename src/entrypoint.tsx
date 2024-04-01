import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App.tsx'
import './index.css'
import { store } from './app/store'
import { LucidProvider } from './components/LucidProvider.tsx'
import { WalletProvider } from './components/WalletProvider.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <LucidProvider>
        <WalletProvider>
          <App />
        </WalletProvider>
      </LucidProvider>
    </Provider>
  </React.StrictMode>,
)
