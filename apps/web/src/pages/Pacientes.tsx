import { useEffect, useState } from 'react'

type Patient = {
  id: string
  name: string
  phone: string
  email: string | null
  created_at: string
}

function Pacientes() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  const [saving, setSaving] = useState(false)

  const loadPatients = async () => {
    try {
      const response = await fetch('http://localhost:3000/patients')

      if (!response.ok) {
        throw new Error('Erro ao buscar pacientes')
      }

      const data = await response.json()

      setPatients(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!name.trim() || !phone.trim()) {
      return
    }

    setSaving(true)

    try {
      const response = await fetch('http://localhost:3000/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          phone,
          email: email || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao cadastrar paciente')
      }

      setName('')
      setPhone('')
      setEmail('')
      setShowForm(false)

      await loadPatients()
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-w-0 flex-1 p-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Pacientes
          </h2>

          <p className="mt-1 text-gray-500">
            Pacientes cadastrados no FisioBot.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Novo paciente
        </button>
      </div>

      {showForm && (
        <div className="mt-6 rounded-xl border bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Novo paciente
          </h3>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Nome
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nome completo"
                className="mt-1 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Telefone
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="(81) 99999-9999"
                className="mt-1 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                E-mail
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@exemplo.com"
                className="mt-1 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">
            Carregando pacientes...
          </p>
        ) : patients.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">
            Nenhum paciente cadastrado.
          </p>
        ) : (
          <div className="divide-y">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center justify-between p-5"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {patient.name}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {patient.phone}
                  </p>
                </div>

                <span className="text-sm text-gray-400">
                  {patient.email ?? 'Sem e-mail'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default Pacientes