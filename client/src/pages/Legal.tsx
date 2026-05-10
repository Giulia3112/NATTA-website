import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Shield, FileText } from "lucide-react";

type Tab = "privacy" | "terms";

export default function Legal() {
  const [activeTab, setActiveTab] = useState<Tab>("privacy");
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-4 flex items-center gap-3">
          <Link href="/">
            <img src="/natta-logo.png" alt="NATTA" className="h-8 cursor-pointer" />
          </Link>
        </div>
      </div>

      <div className="container py-10 max-w-3xl">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("legal.pageTitle")}</h1>
          <p className="text-gray-500 text-sm">{t("legal.lastUpdated")}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "privacy"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Shield className="w-4 h-4" />
            {t("legal.privacyTab")}
          </button>
          <button
            onClick={() => setActiveTab("terms")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "terms"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="w-4 h-4" />
            {t("legal.termsTab")}
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm prose prose-gray max-w-none">
          {activeTab === "privacy" ? <PrivacyContent /> : <TermsContent />}
        </div>

        {/* Footer contact */}
        <div className="mt-8 text-center text-sm text-gray-500">
          {t("legal.contactNote")}{" "}
          <a href="mailto:contato@natta.pro" className="text-blue-600 hover:underline">
            contato@natta.pro
          </a>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">{title}</h2>
      <div className="text-sm text-gray-700 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function PrivacyContent() {
  const { t, i18n } = useTranslation();
  const isPT = i18n.language === "pt";

  if (isPT) {
    return (
      <>
        <p className="text-sm text-gray-600 mb-8 leading-relaxed">
          Bem-vindo à NATTA. Valorizamos sua privacidade e estamos comprometidos em proteger seus dados pessoais.
          Este documento explica como coletamos, utilizamos, armazenamos e protegemos suas informações ao utilizar
          a plataforma NATTA. Ao utilizar a NATTA, você concorda com os termos desta Política de Privacidade.
        </p>

        <Section title="1. Sobre a NATTA">
          <p>
            A NATTA é uma plataforma AI-first desenvolvida para ajudar usuários a descobrir, organizar e otimizar
            candidaturas para oportunidades como bolsas de estudo, fellowships, grants, programas de aceleração,
            competições, vagas e outras oportunidades acadêmicas e profissionais.
          </p>
        </Section>

        <Section title="2. Informações que Coletamos">
          <p className="font-medium text-gray-800">2.1 Informações fornecidas pelo usuário</p>
          <BulletList items={[
            "Nome completo",
            "Endereço de e-mail",
            "Foto de perfil",
            "Currículo e histórico acadêmico/profissional",
            "Textos, essays, cartas de motivação e documentos enviados",
            "Informações sobre candidaturas e oportunidades salvas",
            "Preferências e interesses",
          ]} />
          <p className="font-medium text-gray-800 mt-3">2.2 Informações coletadas automaticamente</p>
          <BulletList items={[
            "Endereço IP, tipo de navegador e dispositivo, sistema operacional",
            "Dados de uso da plataforma e logs de acesso",
            "Cookies e tecnologias semelhantes",
          ]} />
          <p className="font-medium text-gray-800 mt-3">2.3 Informações de terceiros</p>
          <BulletList items={[
            "Serviços de autenticação (Google, Apple, etc.)",
            "Plataformas parceiras, ferramentas de analytics e bancos públicos de oportunidades",
          ]} />
        </Section>

        <Section title="3. Como Utilizamos suas Informações">
          <BulletList items={[
            "Criar e gerenciar sua conta",
            "Personalizar recomendações de oportunidades",
            "Melhorar o funcionamento da plataforma",
            "Utilizar inteligência artificial para auxiliar na escrita e organização de applications",
            "Processar uploads e documentos",
            "Comunicar novidades, atualizações e oportunidades",
            "Garantir segurança e prevenir fraudes",
            "Cumprir obrigações legais",
          ]} />
        </Section>

        <Section title="4. Inteligência Artificial e Processamento de Documentos">
          <p>A NATTA utiliza sistemas de inteligência artificial para proporcionar uma experiência personalizada e eficiente:</p>
          <BulletList items={[
            "Leitura de editais e documentos",
            "Extração de requisitos e critérios de elegibilidade",
            "Geração de sugestões de escrita",
            "Organização de informações de candidaturas",
            "Personalização de experiências dentro da plataforma",
          ]} />
          <p className="mt-2">
            A NATTA não reivindica propriedade sobre os conteúdos criados ou enviados pelos usuários.
            Os conteúdos enviados poderão ser processados por modelos de IA e provedores parceiros
            estritamente para execução dessas funcionalidades.
          </p>
        </Section>

        <Section title="5. Compartilhamento de Dados">
          <p>Não vendemos dados pessoais dos usuários. Poderemos compartilhar informações com:</p>
          <BulletList items={[
            "Prestadores de serviços e infraestrutura tecnológica",
            "Ferramentas de analytics",
            "Serviços de autenticação",
            "Parceiros necessários para funcionamento da plataforma",
            "Autoridades legais, quando exigido por lei",
          ]} />
          <p className="mt-2">Todos os parceiros são selecionados considerando padrões adequados de segurança e proteção de dados.</p>
        </Section>

        <Section title="6. Armazenamento e Segurança">
          <p>Adotamos medidas técnicas e organizacionais razoáveis para proteger suas informações contra:</p>
          <BulletList items={[
            "Acesso não autorizado",
            "Perda ou alteração indevida de dados",
            "Divulgação não autorizada",
          ]} />
          <p className="mt-2">Apesar disso, nenhum sistema é completamente seguro e não podemos garantir segurança absoluta.</p>
        </Section>

        <Section title="7. Retenção de Dados">
          <p>Manteremos seus dados apenas pelo período necessário para:</p>
          <BulletList items={[
            "Fornecer nossos serviços",
            "Cumprir obrigações legais",
            "Resolver disputas e garantir segurança da plataforma",
          ]} />
          <p className="mt-2">Usuários podem solicitar exclusão de dados conforme aplicável pela legislação vigente.</p>
        </Section>

        <Section title="8. Seus Direitos">
          <p>Dependendo da sua localização e legislação aplicável, você poderá ter direito a:</p>
          <BulletList items={[
            "Acessar seus dados pessoais",
            "Corrigir informações incorretas",
            "Solicitar exclusão de dados",
            "Revogar consentimento",
            "Solicitar portabilidade de dados",
            "Restringir determinados processamentos",
          ]} />
          <p className="mt-2">Solicitações podem ser realizadas através dos canais oficiais de contato da NATTA.</p>
        </Section>

        <Section title="9. Cookies">
          <p>A NATTA poderá utilizar cookies e tecnologias semelhantes para:</p>
          <BulletList items={[
            "Melhorar a experiência do usuário",
            "Manter sessões autenticadas",
            "Analisar tráfego e performance",
            "Personalizar conteúdo",
          ]} />
          <p className="mt-2">Usuários podem desativar cookies nas configurações do navegador, embora algumas funcionalidades possam ser afetadas.</p>
        </Section>

        <Section title="10. Menores de Idade">
          <p>
            A NATTA não coleta intencionalmente dados de menores de idade sem consentimento adequado dos
            responsáveis, quando exigido pela legislação aplicável.
          </p>
        </Section>

        <Section title="11. Alterações nesta Política">
          <p>
            Poderemos atualizar esta Política de Privacidade periodicamente. Alterações relevantes poderão ser
            comunicadas aos usuários através da plataforma ou por e-mail.
          </p>
        </Section>

        <Section title="12. Contato">
          <p>Para dúvidas relacionadas a esta Política de Privacidade, entre em contato:</p>
          <p>E-mail: <a href="mailto:contato@natta.pro" className="text-blue-600 hover:underline">contato@natta.pro</a></p>
          <p>Website: <a href="https://natta.pro" className="text-blue-600 hover:underline">natta.pro</a></p>
        </Section>
      </>
    );
  }

  // English version
  return (
    <>
      <p className="text-sm text-gray-600 mb-8 leading-relaxed">
        Welcome to NATTA. We value your privacy and are committed to protecting your personal data.
        This document explains how we collect, use, store, and protect your information when you use
        the NATTA platform. By using NATTA, you agree to the terms of this Privacy Policy.
      </p>

      <Section title="1. About NATTA">
        <p>
          NATTA is an AI-first platform developed to help users discover, organize, and optimize
          applications for opportunities such as scholarships, fellowships, grants, acceleration
          programs, competitions, jobs, and other academic and professional opportunities.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <p className="font-medium text-gray-800">2.1 Information provided by the user</p>
        <BulletList items={[
          "Full name",
          "Email address",
          "Profile photo",
          "Resume and academic/professional background",
          "Essays, motivation letters, and uploaded documents",
          "Application and saved opportunity information",
          "Preferences and interests",
        ]} />
        <p className="font-medium text-gray-800 mt-3">2.2 Automatically collected information</p>
        <BulletList items={[
          "IP address, browser type and device, operating system",
          "Platform usage data and access logs",
          "Cookies and similar technologies",
        ]} />
        <p className="font-medium text-gray-800 mt-3">2.3 Third-party information</p>
        <BulletList items={[
          "Authentication services (Google, Apple, etc.)",
          "Partner platforms, analytics tools, and public opportunity databases",
        ]} />
      </Section>

      <Section title="3. How We Use Your Information">
        <BulletList items={[
          "Create and manage your account",
          "Personalize opportunity recommendations",
          "Improve platform functionality",
          "Use AI to assist with writing and organizing applications",
          "Process uploads and documents",
          "Communicate news, updates, and opportunities",
          "Ensure security and prevent fraud",
          "Comply with legal obligations",
        ]} />
      </Section>

      <Section title="4. Artificial Intelligence and Document Processing">
        <p>NATTA uses artificial intelligence systems to provide a personalized and efficient experience:</p>
        <BulletList items={[
          "Reading notices and documents",
          "Extracting requirements and eligibility criteria",
          "Generating writing suggestions",
          "Organizing application information",
          "Personalizing experiences within the platform",
        ]} />
        <p className="mt-2">
          NATTA does not claim ownership over content created or submitted by users.
          Submitted content may be processed by AI models and partner providers strictly for
          the execution of these features.
        </p>
      </Section>

      <Section title="5. Data Sharing">
        <p>We do not sell users' personal data. We may share information with:</p>
        <BulletList items={[
          "Service providers and technology infrastructure",
          "Analytics tools",
          "Authentication services",
          "Partners necessary for platform operation",
          "Legal authorities, when required by law",
        ]} />
        <p className="mt-2">All partners are selected considering appropriate security and data protection standards.</p>
      </Section>

      <Section title="6. Storage and Security">
        <p>We adopt reasonable technical and organizational measures to protect your information against:</p>
        <BulletList items={[
          "Unauthorized access",
          "Improper data loss or alteration",
          "Unauthorized disclosure",
        ]} />
        <p className="mt-2">However, no system is completely secure and we cannot guarantee absolute security.</p>
      </Section>

      <Section title="7. Data Retention">
        <p>We will keep your data only for as long as necessary to:</p>
        <BulletList items={[
          "Provide our services",
          "Comply with legal obligations",
          "Resolve disputes and ensure platform security",
        ]} />
        <p className="mt-2">Users may request data deletion as applicable under current legislation.</p>
      </Section>

      <Section title="8. Your Rights">
        <p>Depending on your location and applicable law, you may have the right to:</p>
        <BulletList items={[
          "Access your personal data",
          "Correct inaccurate information",
          "Request data deletion",
          "Revoke consent",
          "Request data portability",
          "Restrict certain processing",
        ]} />
        <p className="mt-2">Requests can be made through NATTA's official contact channels.</p>
      </Section>

      <Section title="9. Cookies">
        <p>NATTA may use cookies and similar technologies to:</p>
        <BulletList items={[
          "Improve user experience",
          "Maintain authenticated sessions",
          "Analyze traffic and performance",
          "Personalize content",
        ]} />
        <p className="mt-2">Users can disable cookies in browser settings, although some features may be affected.</p>
      </Section>

      <Section title="10. Minors">
        <p>
          NATTA does not intentionally collect data from minors without adequate consent from
          guardians, where required by applicable law.
        </p>
      </Section>

      <Section title="11. Changes to This Policy">
        <p>
          We may update this Privacy Policy periodically. Relevant changes may be communicated
          to users through the platform or by email.
        </p>
      </Section>

      <Section title="12. Contact">
        <p>For questions related to this Privacy Policy, please contact us:</p>
        <p>Email: <a href="mailto:contato@natta.pro" className="text-blue-600 hover:underline">contato@natta.pro</a></p>
        <p>Website: <a href="https://natta.pro" className="text-blue-600 hover:underline">natta.pro</a></p>
      </Section>
    </>
  );
}

function TermsContent() {
  const { i18n } = useTranslation();
  const isPT = i18n.language === "pt";

  if (isPT) {
    return (
      <>
        <p className="text-sm text-gray-600 mb-8 leading-relaxed">
          Ao acessar ou utilizar a plataforma NATTA, você concorda com estes Termos de Uso. Leia-os
          cuidadosamente antes de utilizar nossos serviços.
        </p>

        <Section title="1. Aceitação dos Termos">
          <p>
            O uso da plataforma NATTA implica na aceitação integral destes Termos de Uso. Caso não
            concorde com qualquer disposição, recomendamos que não utilize a plataforma.
          </p>
        </Section>

        <Section title="2. Descrição do Serviço">
          <p>
            A NATTA é uma plataforma digital que oferece ferramentas para descoberta de oportunidades
            globais (bolsas, fellowships, grants, aceleradoras, competições, entre outros),
            organização de candidaturas e gestão de prazos, com recursos de inteligência artificial.
          </p>
        </Section>

        <Section title="3. Elegibilidade">
          <p>Para utilizar a NATTA, você deve:</p>
          <BulletList items={[
            "Ter pelo menos 13 anos de idade (ou a idade mínima exigida pela legislação do seu país)",
            "Fornecer informações verdadeiras no momento do cadastro",
            "Ser responsável por toda atividade realizada em sua conta",
          ]} />
        </Section>

        <Section title="4. Conta de Usuário">
          <BulletList items={[
            "Você é responsável por manter a confidencialidade das suas credenciais de acesso",
            "Notifique imediatamente a NATTA em caso de uso não autorizado da sua conta",
            "A NATTA se reserva o direito de suspender ou encerrar contas que violem estes Termos",
          ]} />
        </Section>

        <Section title="5. Uso Permitido">
          <p>Você concorda em utilizar a NATTA apenas para fins lícitos e de acordo com estes Termos. É proibido:</p>
          <BulletList items={[
            "Usar a plataforma para atividades ilegais ou fraudulentas",
            "Tentar acessar sistemas ou dados sem autorização",
            "Publicar conteúdo ofensivo, discriminatório ou que viole direitos de terceiros",
            "Realizar engenharia reversa ou copiar o código da plataforma",
            "Interferir no funcionamento da plataforma ou de outros usuários",
          ]} />
        </Section>

        <Section title="6. Propriedade Intelectual">
          <p>
            Todo o conteúdo da plataforma NATTA — incluindo design, código, textos, logos e funcionalidades —
            é protegido por direitos autorais e demais leis de propriedade intelectual.
            O uso não autorizado é expressamente proibido.
          </p>
          <p className="mt-2">
            Os conteúdos criados pelos usuários permanecem de sua propriedade. Ao enviá-los à plataforma,
            o usuário concede à NATTA uma licença limitada para processá-los no âmbito das funcionalidades oferecidas.
          </p>
        </Section>

        <Section title="7. Isenção de Responsabilidade">
          <p>A NATTA não garante:</p>
          <BulletList items={[
            "A disponibilidade ou elegibilidade do usuário para qualquer oportunidade listada",
            "A precisão ou atualização das informações sobre oportunidades de terceiros",
            "Resultados específicos decorrentes do uso da plataforma",
          ]} />
          <p className="mt-2">
            A plataforma é fornecida no estado em que se encontra, sem garantias expressas ou implícitas.
          </p>
        </Section>

        <Section title="8. Limitação de Responsabilidade">
          <p>
            Na extensão máxima permitida por lei, a NATTA não será responsável por danos indiretos,
            incidentais, especiais ou consequenciais decorrentes do uso ou da impossibilidade de uso
            da plataforma.
          </p>
        </Section>

        <Section title="9. Alterações nos Termos">
          <p>
            A NATTA poderá modificar estes Termos de Uso a qualquer momento. O uso continuado da
            plataforma após as alterações constitui aceitação dos novos termos.
          </p>
        </Section>

        <Section title="10. Lei Aplicável">
          <p>
            Estes Termos são regidos pelas leis brasileiras. Eventuais disputas serão resolvidas
            no foro competente da comarca de São Paulo, Brasil.
          </p>
        </Section>

        <Section title="11. Contato">
          <p>Dúvidas sobre estes Termos de Uso? Entre em contato:</p>
          <p>E-mail: <a href="mailto:contato@natta.pro" className="text-blue-600 hover:underline">contato@natta.pro</a></p>
          <p>Website: <a href="https://natta.pro" className="text-blue-600 hover:underline">natta.pro</a></p>
        </Section>
      </>
    );
  }

  // English version
  return (
    <>
      <p className="text-sm text-gray-600 mb-8 leading-relaxed">
        By accessing or using the NATTA platform, you agree to these Terms of Use. Please read them
        carefully before using our services.
      </p>

      <Section title="1. Acceptance of Terms">
        <p>
          Using the NATTA platform implies full acceptance of these Terms of Use. If you do not
          agree with any provision, we recommend that you do not use the platform.
        </p>
      </Section>

      <Section title="2. Service Description">
        <p>
          NATTA is a digital platform that offers tools for discovering global opportunities
          (scholarships, fellowships, grants, accelerators, competitions, and more),
          organizing applications, and managing deadlines, with artificial intelligence features.
        </p>
      </Section>

      <Section title="3. Eligibility">
        <p>To use NATTA, you must:</p>
        <BulletList items={[
          "Be at least 13 years old (or the minimum age required by the laws of your country)",
          "Provide accurate information when registering",
          "Be responsible for all activity conducted under your account",
        ]} />
      </Section>

      <Section title="4. User Account">
        <BulletList items={[
          "You are responsible for keeping your login credentials confidential",
          "Immediately notify NATTA of any unauthorized use of your account",
          "NATTA reserves the right to suspend or terminate accounts that violate these Terms",
        ]} />
      </Section>

      <Section title="5. Permitted Use">
        <p>You agree to use NATTA only for lawful purposes and in accordance with these Terms. The following are prohibited:</p>
        <BulletList items={[
          "Using the platform for illegal or fraudulent activities",
          "Attempting to access systems or data without authorization",
          "Posting offensive, discriminatory content or content that infringes third-party rights",
          "Reverse engineering or copying the platform code",
          "Interfering with the platform's operation or that of other users",
        ]} />
      </Section>

      <Section title="6. Intellectual Property">
        <p>
          All content on the NATTA platform — including design, code, text, logos, and features —
          is protected by copyright and other intellectual property laws.
          Unauthorized use is expressly prohibited.
        </p>
        <p className="mt-2">
          Content created by users remains their property. By submitting content to the platform,
          the user grants NATTA a limited license to process it within the scope of the features offered.
        </p>
      </Section>

      <Section title="7. Disclaimer">
        <p>NATTA does not guarantee:</p>
        <BulletList items={[
          "The availability or eligibility of any listed opportunity for any user",
          "The accuracy or timeliness of information about third-party opportunities",
          "Specific results from using the platform",
        ]} />
        <p className="mt-2">
          The platform is provided as-is, without express or implied warranties.
        </p>
      </Section>

      <Section title="8. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, NATTA shall not be liable for indirect,
          incidental, special, or consequential damages arising from the use or inability
          to use the platform.
        </p>
      </Section>

      <Section title="9. Changes to Terms">
        <p>
          NATTA may modify these Terms of Use at any time. Continued use of the platform
          after changes constitutes acceptance of the new terms.
        </p>
      </Section>

      <Section title="10. Governing Law">
        <p>
          These Terms are governed by Brazilian law. Any disputes will be resolved in the
          competent court of the district of São Paulo, Brazil.
        </p>
      </Section>

      <Section title="11. Contact">
        <p>Questions about these Terms of Use? Get in touch:</p>
        <p>Email: <a href="mailto:contato@natta.pro" className="text-blue-600 hover:underline">contato@natta.pro</a></p>
        <p>Website: <a href="https://natta.pro" className="text-blue-600 hover:underline">natta.pro</a></p>
      </Section>
    </>
  );
}
