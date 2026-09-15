import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Sidebar from './components/Sidebar'

import Dashboard from './pages/Dashboard'
import Conversas from './pages/Conversas'
import Agenda from './pages/Agenda'
import Pacientes from './pages/Pacientes'
import Configuracoes from './pages/Configuracoes'

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/conversas" element={<Conversas />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App