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
      <div className="flex h-screen max-h-screen overflow-hidden bg-[#f8f7f9]">
        <Sidebar />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#e8e3ec] bg-[#fbfafc]/95 px-4 backdrop-blur-md lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#644498] shadow-sm">
                <span className="text-base font-semibold text-white">
                  F
                </span>
              </div>

              <div>
                <h1 className="text-base font-bold tracking-tight text-[#4d3479]">
                  FisioBot
                </h1>

                <p className="text-[10px] text-[#85808b]">
                  Atendimento inteligente
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7fa77c] opacity-50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#7fa77c]" />
              </span>

              <span className="hidden text-xs font-medium text-[#557153] sm:block">
                Bot ativo
              </span>
            </div>
          </header>

          <main className="flex min-h-0 min-w-0 flex-1 overflow-hidden pb-20 lg:pb-0">
            <Routes>
              <Route
                path="/"
                element={<Dashboard />}
              />

              <Route
                path="/conversas"
                element={<Conversas />}
              />

              <Route
                path="/agenda"
                element={<Agenda />}
              />

              <Route
                path="/pacientes"
                element={<Pacientes />}
              />

              <Route
                path="/configuracoes"
                element={<Configuracoes />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App