import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import { ChatProvider } from "./context/ChatContext"
import Chat from "./pages/Chat"
import "./App.css"
import "./styles/toastify.css"

function App() {
  return (
    <Router>
      <ChatProvider>
        <Routes>
          <Route path="/chat" element={<Chat />} />
          <Route path="/" element={<Navigate to="/chat" replace />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </ChatProvider>
    </Router>
  )
}

export default App
