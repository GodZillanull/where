import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.jsx'
import { db, isFirebaseConfigured } from './services/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

// Firebase接続テスト（設定がある場合のみ）
if (isFirebaseConfigured && db) {
  addDoc(collection(db, 'app_starts'), {
    timestamp: serverTimestamp(),
    userAgent: navigator.userAgent,
    url: window.location.href
  })
    .then(() => console.log('Firebase接続成功'))
    .catch((error) => console.warn('Firebase接続エラー:', error.message))
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
