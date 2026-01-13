export default function SobreNos() {
  return (
    <div className="landing-page">
      <section
        className="
    h-screen
    bg-[url('https://prefeituradeitacoatiara.com.br/wp-content/uploads/2024/01/TUNEL-VERDE-GALERIA.jpg')]
    bg-cover
    bg-center
    bg-no-repeat
    flex
    items-center
    justify-center
    text-center
    px-4
  "
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
            Conecta Amazônia
          </h1>

          <p className="text-base md:text-xl text-zinc-200">
            Turismo e Integração Cultural na Amazônia
          </p>
        </div>
      </section>

      <section className="sobre w-full py-16 px-4">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <img
            src="https://jornal.usp.br/wp-content/uploads/2023/08/20230822_amazonia_floresta_1200X630.jpg"
            alt="Amazônia"
            className="sobre-img md:h-80 object-cover rounded-2xl"
          />
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#0b3d2e]">
              O que é o Conecta Amazônia?
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              O Conecta Amazônia é uma plataforma que aproxima visitantes,
              comunidades e gestores locais, promovendo o turismo sustentável e
              valorizando a diversidade cultural da maior floresta tropical do
              planeta.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 text-center">
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#0b3d2e]">
            Por que usar o Conecta Amazônia?
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-[#f0f7f4] p-6 rounded-xl transition-transform duration-300 hover:-translate-y-1">
            <h3 className="text-lg font-semibold">🌱 Turismo Sustentável</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Apoia iniciativas que protegem a natureza e fortalecem
              comunidades.
            </p>
          </div>

          <div className="bg-[#f0f7f4] p-6 rounded-xl transition-transform duration-300 hover:-translate-y-1">
            <h3 className="text-lg font-semibold">🛶 Rotas Comunitárias</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore trilhas, rios e percursos organizados por moradores
              locais.
            </p>
          </div>

          <div className="bg-[#f0f7f4] p-6 rounded-xl transition-transform duration-300 hover:-translate-y-1">
            <h3 className="text-lg font-semibold">🎭 Eventos Culturais</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Conheça manifestações artísticas e celebrações tradicionais.
            </p>
          </div>

          <div className="bg-[#f0f7f4] p-6 rounded-xl transition-transform duration-300 hover:-translate-y-1">
            <h3 className="text-lg font-semibold">📍 Mapas Interativos</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Navegue pela região com informações geográficas confiáveis.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#e6f2ed] text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-10 text-[#0b3d2e]">
          Como funciona?
        </h2>

        <div className="flex flex-wrap justify-center gap-10">
          {[
            'O gestor local acessa a plataforma.',
            'Cadastra rotas, eventos e serviços.',
            'Visitantes exploram e interagem.',
            'A comunidade ganha visibilidade e renda.',
          ].map((text, index) => (
            <div key={index} className="w-36 space-y-3">
              <span className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-[#0b3d2e] text-white text-2xl font-bold">
                {index + 1}
              </span>
              <p className="text-sm">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#0b3d2e]">
          Pronto para começar?
        </h2>

        <p className="mt-3 text-muted-foreground">
          Acesse agora o painel do gestor e publique suas rotas e eventos.
        </p>

        <a
          href="/login"
          className="
      inline-block
      mt-6
      px-7
      py-3.5
      rounded-lg
      bg-[#0b3d2e]
      text-white
      font-semibold
      transition-colors
      hover:bg-[#136b50]
    "
        >
          Entrar no Sistema
        </a>
      </section>
    </div>
  );
}
