type Patient = {
  id: string
  name: string
  phone: string
}

type PatientInfoProps = {
  patient: Patient | null
}

function PatientInfo({
  patient,
}: PatientInfoProps) {
  if (!patient) {
    return (
      <aside className="w-72 border-l bg-white p-6">
        <p className="text-sm text-gray-500">
          Selecione uma conversa para visualizar os dados.
        </p>
      </aside>
    )
  }

  return (
    <aside className="w-72 border-l bg-white p-6">
      <h3 className="font-semibold text-gray-900">
        Dados do paciente
      </h3>

      <div className="mt-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xl font-semibold">
          {patient.name.charAt(0)}
        </div>

        <h4 className="mt-4 font-semibold text-gray-900">
          {patient.name}
        </h4>

        <p className="mt-1 text-sm text-gray-500">
          {patient.phone}
        </p>
      </div>
    </aside>
  )
}

export default PatientInfo