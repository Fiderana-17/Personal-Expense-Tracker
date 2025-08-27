import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ExpensesList from './components/Expense/ExpenseList.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <ExpensesList />
  </StrictMode>,
)
