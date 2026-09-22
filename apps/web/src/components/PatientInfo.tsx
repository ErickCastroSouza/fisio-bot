type Patient = {
  id: string
  name: string
  phone: string
}

type PatientInfoProps = {
  patient: Patient | null
  mobileOpen?: boolean
  onClose?: () => void
}

function PatientInfo({
  patient,
  mobileOpen = false,
  onClose,
}: PatientInfoProps) {
  if (!patient) {
    return null
  }

  return (
    <>
      {/* =================================================
          DESKTOP
      ================================================== */}
      <aside className="hidden w-72 shrink-0 border-l border-[#e8e3ec] bg-white xl:block">
        <div className="border-b border-[#eeeaf0] px-5 py-5">
          <h3 className="text-sm font-semibold text-[#3f3a43]">
            Dados do paciente
          </h3>
        </div>

        <div className="px-5 py-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#d9c9df] text-2xl font-bold text-[#644498]">
              {patient.name
                .charAt(0)
                .toUpperCase()}
            </div>

            <h4 className="mt-4 text-base font-semibold text-[#3f3a43]">
              {patient.name}
            </h4>

            <div className="mt-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7fa77c]" />

              <span className="text-xs text-[#63845f]">
                Atendimento ativo
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#aaa4af]">
                Telefone
              </p>

              <p className="mt-1.5 text-sm text-[#5f5963]">
                {patient.phone}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#aaa4af]">
                Paciente desde
              </p>

              <p className="mt-1.5 text-sm text-[#5f5963]">
                Cadastro no sistema
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-[#e8e3ec] bg-[#fcfbfd] p-4">
            <p className="text-xs font-semibold text-[#5f5963]">
              Informações
            </p>

            <p className="mt-1.5 text-xs leading-5 text-[#918b96]">
              Os dados do paciente ficam disponíveis durante o atendimento.
            </p>
          </div>
        </div>
      </aside>

      {/* =================================================
          MOBILE
      ================================================== */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] flex items-end bg-[#2d2438]/35 backdrop-blur-sm xl:hidden">
          <div className="w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl">
            {/* Indicador */}
            <div className="flex justify-center pt-3">
              <div className="h-1 w-10 rounded-full bg-[#ddd7e1]" />
            </div>

            {/* Cabeçalho */}
            <div className="flex items-center justify-between border-b border-[#eeeaf0] px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b7aa3]">
                  Paciente
                </p>

                <h3 className="mt-0.5 font-semibold text-[#3f3a43]">
                  Dados do paciente
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3f0f5] text-[#625d66] transition hover:bg-[#eee9f5] hover:text-[#644498]"
                aria-label="Fechar informações"
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            {/* Conteúdo */}
            <div className="px-5 pb-8 pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#d9c9df] text-xl font-bold text-[#644498]">
                  {patient.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0">
                  <h4 className="truncate text-base font-semibold text-[#3f3a43]">
                    {patient.name}
                  </h4>

                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#7fa77c]" />

                    <span className="text-xs text-[#63845f]">
                      Atendimento ativo
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-4">
                <div className="rounded-xl border border-[#e8e3ec] bg-[#fcfbfd] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#aaa4af]">
                    Telefone
                  </p>

                  <p className="mt-1.5 text-sm text-[#5f5963]">
                    {patient.phone}
                  </p>
                </div>

                <div className="rounded-xl border border-[#e8e3ec] bg-[#fcfbfd] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#aaa4af]">
                    Paciente desde
                  </p>

                  <p className="mt-1.5 text-sm text-[#5f5963]">
                    Cadastro no sistema
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#dcebd9] bg-[#eef5ec] p-4">
                <p className="text-xs font-semibold text-[#557153]">
                  Informações
                </p>

                <p className="mt-1.5 text-xs leading-5 text-[#63845f]">
                  Os dados do paciente ficam disponíveis durante o atendimento.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PatientInfo