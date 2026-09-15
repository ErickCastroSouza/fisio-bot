import { NavLink } from 'react-router-dom'

function Sidebar() {
  const menuItems = [
    {
      label: 'Dashboard',
      icon: '🏠',
      path: '/',
    },
    {
      label: 'Conversas',
      icon: '💬',
      path: '/conversas',
    },
    {
      label: 'Agenda',
      icon: '📅',
      path: '/agenda',
    },
    {
      label: 'Pacientes',
      icon: '👥',
      path: '/pacientes',
    },
    {
      label: 'Configurações',
      icon: '⚙️',
      path: '/configuracoes',
    },
  ]

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="border-b px-6 py-5">
        <h1 className="text-xl font-bold text-gray-900">
          FisioBot
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Atendimento inteligente
        </p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <span>{item.icon}</span>

                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-semibold">
            A
          </div>

          <div>
            <p className="text-sm font-medium">
              Dra. Beatriz
            </p>

            <p className="text-xs text-gray-500">
              Fisioterapeuta
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar