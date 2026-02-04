import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.jsx'

// Firebase接続テスト
import { db } from './services/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const testFirebaseConnection = async () => {
  try {
    await addDoc(collection(db, 'app_starts'), {
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })
    console.log('✅ Firebase接続成功！')
  } catch (error) {
    console.error('❌ Firebase接続エラー:', error.message)
  }
}
testFirebaseConnection()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
