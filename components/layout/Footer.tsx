import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark-100 border-t border-dark-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo e Descrição */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-3">
              🎰 Casino
            </h3>
            <p className="text-dark-400 text-sm">
              O melhor cassino online do Brasil. Jogue com segurança e
              responsabilidade. Proibido para menores de 18 anos.
            </p>
          </div>

          {/* Links Úteis */}
          <div>
            <h4 className="font-semibold text-white mb-3">Links Úteis</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/home"
                  className="text-dark-400 hover:text-white text-sm transition"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  href="/home"
                  className="text-dark-400 hover:text-white text-sm transition"
                >
                  Ajuda
                </Link>
              </li>
              <li>
                <Link
                  href="/home"
                  className="text-dark-400 hover:text-white text-sm transition"
                >
                  Jogo Responsável
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/home"
                  className="text-dark-400 hover:text-white text-sm transition"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/home"
                  className="text-dark-400 hover:text-white text-sm transition"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/home"
                  className="text-dark-400 hover:text-white text-sm transition"
                >
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-dark-200 pt-6 text-center">
          <p className="text-dark-400 text-sm">
            © {currentYear} Casino. Todos os direitos reservados.
          </p>
          <p className="text-dark-500 text-xs mt-2">
            Jogue com responsabilidade. Conheça seus limites.
          </p>
        </div>
      </div>
    </footer>
  )
}

