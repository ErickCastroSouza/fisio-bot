import { useState } from 'react'
import { NavLink } from 'react-router-dom'

function Sidebar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const menuItems = [
    {
      label: 'Dashboard',
      icon: '⌂',
      path: '/',
    },
    {
      label: 'Conversas',
      icon: '◌',
      path: '/conversas',
    },
    {
      label: 'Agenda',
      icon: '□',
      path: '/agenda',
    },
    {
      label: 'Pacientes',
      icon: '♧',
      path: '/pacientes',
    },
    {
      label: 'Configurações',
      icon: '⚙',
      path: '/configuracoes',
    },
  ]

  function closeMobileMenu() {
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* =====================================================
          SIDEBAR DESKTOP
      ====================================================== */}
      <aside className="relative hidden h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-[#e8e3ec] bg-[#fbfafc] lg:flex">
        {/* Elemento decorativo */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#dcebd9]/60" />

        {/* Logo */}
        <div className="relative border-b border-[#e8e3ec] px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#644498] shadow-sm">
              <span className="text-xl font-semibold text-white">
                F
              </span>
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-[#4d3479]">
                FisioBot
              </h1>

              <p className="mt-0.5 text-xs text-[#85808b]">
                Atendimento inteligente
              </p>
            </div>
          </div>
        </div>

        {/* Navegação */}
        <nav className="relative flex-1 px-3 py-6">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#aaa4af]">
            Menu principal
          </p>

          <ul className="space-y-1.5">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#644498] text-white shadow-sm'
                        : 'text-[#625d66] hover:bg-[#f0edf4] hover:text-[#4d3479]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg transition ${
                          isActive
                            ? 'bg-white/15 text-white'
                            : 'bg-[#f0edf4] text-[#756a82] group-hover:bg-white group-hover:text-[#644498]'
                        }`}
                      >
                        {item.icon}
                      </span>

                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Status */}
        <div className="relative px-4 pb-4">
          <div className="mb-4 rounded-xl border border-[#dcebd9] bg-[#eef5ec] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7fa77c] opacity-50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#7fa77c]" />
              </span>

              <span className="text-xs font-medium text-[#557153]">
                Atendimento automático ativo
              </span>
            </div>
          </div>
        </div>

        {/* Perfil */}
        <div className="border-t border-[#e8e3ec] px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d9c9df] font-semibold text-[#644498]">
              A
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#3f3a43]">
                Dra. Beatriz
              </p>

              <p className="mt-0.5 text-xs text-[#85808b]">
                Fisioterapeuta
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* =====================================================
          MENU MOBILE
      ====================================================== */}

      {/* Fundo escuro */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-[#38353a]/35 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Menu lateral mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[285px] max-w-[85vw] flex-col overflow-hidden border-r border-[#e8e3ec] bg-[#fbfafc] shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          mobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >
        {/* Elemento decorativo */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#dcebd9]/60" />

        {/* Cabeçalho */}
        <div className="relative flex items-center justify-between border-b border-[#e8e3ec] px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#644498] shadow-sm">
              <span className="text-lg font-semibold text-white">
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

          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Fechar menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-xl text-[#85808b] transition hover:bg-[#f0edf4] hover:text-[#4d3479]"
          >
            ×
          </button>
        </div>

        {/* Navegação */}
        <nav className="relative flex-1 overflow-y-auto px-3 py-6">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#aaa4af]">
            Menu principal
          </p>

          <ul className="space-y-1.5">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `group flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#644498] text-white shadow-sm'
                        : 'text-[#625d66] active:bg-[#f0edf4]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ${
                          isActive
                            ? 'bg-white/15 text-white'
                            : 'bg-[#f0edf4] text-[#756a82]'
                        }`}
                      >
                        {item.icon}
                      </span>

                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Status mobile */}
        <div className="px-4 pb-4">
          <div className="rounded-xl border border-[#dcebd9] bg-[#eef5ec] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7fa77c] opacity-50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#7fa77c]" />
              </span>

              <span className="text-xs font-medium text-[#557153]">
                Atendimento automático ativo
              </span>
            </div>
          </div>
        </div>

        {/* Perfil mobile */}
        <div className="border-t border-[#e8e3ec] px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d9c9df] font-semibold text-[#644498]">
              A
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#3f3a43]">
                Dra. Beatriz
              </p>

              <p className="mt-0.5 text-xs text-[#85808b]">
                Fisioterapeuta
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* =====================================================
          NAVEGAÇÃO INFERIOR MOBILE
      ====================================================== */}

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e8e3ec] bg-[#fbfafc]/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-4px_20px_rgba(77,52,121,0.06)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {menuItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 py-1"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-10 items-center justify-center rounded-xl text-lg transition ${
                      isActive
                        ? 'bg-[#eee9f5] text-[#644498]'
                        : 'text-[#918b96]'
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span
                    className={`text-[10px] font-medium ${
                      isActive
                        ? 'text-[#644498]'
                        : 'text-[#918b96]'
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          {/* Botão Mais */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex min-w-0 flex-1 flex-col items-center gap-1 py-1"
          >
            <span className="flex h-8 w-10 items-center justify-center rounded-xl text-lg text-[#918b96]">
              ⋯
            </span>

            <span className="text-[10px] font-medium text-[#918b96]">
              Mais
            </span>
          </button>
        </div>
      </nav>

      {/* Botão flutuante para abrir menu */}
      <button
        type="button"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Abrir menu"
        className="fixed right-4 top-[13px] z-40 hidden h-10 w-10 items-center justify-center rounded-xl border border-[#e8e3ec] bg-white text-[#644498] shadow-sm transition active:scale-95 lg:hidden"
      >
        ☰
      </button>
    </>
  )
}

export default Sidebar