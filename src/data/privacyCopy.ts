// Privacy Policy copy, shared by src/pages/PrivacyPolicy.tsx and the static
// prerender in scripts/prerender-static.ts. Localized across all six supported
// site languages so every locale has an indexable, self-canonical B2B privacy
// notice covering RFQ inquiries, AI Receptionist 90-day chat retention, cookies,
// international data transfers, and buyer data deletion rights.

export const PRIVACY_PATH = '/privacy-policy';
export const PRIVACY_CONTACT_EMAIL = 'sales@bolenmirror.com';
export const PRIVACY_FACTORY_ADDRESS: Record<'en' | 'zh' | 'es' | 'fr' | 'de' | 'it', string> = {
  en: 'No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, China',
  zh: '中国浙江省嘉兴市王店镇创业路1号2幢1号',
  es: 'No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, China',
  fr: 'No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, Chine',
  de: 'No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, China',
  it: 'No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, Cina',
};

export interface PrivacySection {
  title: string;
  body: string;
}

export interface LocalizedPrivacyCopy {
  kicker: string;
  heading: string;
  lastUpdated: string;
  intro: string;
  sections: PrivacySection[];
  contactHeading: string;
  contactLead: string;
  seo: {
    title: string;
    description: string;
  };
}

const PRIVACY_BY_LANG: Record<'en' | 'zh' | 'es' | 'fr' | 'de' | 'it', LocalizedPrivacyCopy> = {
  en: {
    seo: {
      title: 'Privacy Policy | BOLEN Mirror',
      description:
        'BOLEN Mirror B2B privacy policy covering RFQ inquiry records, AI Receptionist email consent and 90-day chat retention, cookies, international transfers, and buyer data deletion rights.',
    },
    kicker: 'Legal & Privacy',
    heading: 'Privacy Policy',
    lastUpdated: 'Last updated: November 18, 2026',
    intro:
      'This Privacy Policy explains how Jiaxing Chengtai Mirror Co., Ltd. (operating the BOLEN Mirror brand at bolenmirror.com, located at No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, China) collects, uses, retains, and protects information submitted by business visitors, importers, distributors, hospitality buyers, and project partners.',
    contactHeading: 'Privacy Inquiries & Data Controller Contact',
    contactLead:
      'To exercise access, correction, export, or deletion rights for RFQ records or AI Receptionist sessions, contact Jiaxing Chengtai Mirror Co., Ltd. (No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, China) at',
    sections: [
      {
        title: '1. B2B RFQ and Commercial Inquiry Data',
        body: 'When you submit a Request for Quotation (RFQ), quick inquiry form, or direct email to our sales team, we collect your contact or company name, business email address, product or model references, target specifications, estimated order quantities, destination market, and message details. We process this information solely to prepare technical specifications, sample plans, factory quotations, compliance documentation, and order fulfillment.',
      },
      {
        title: '2. AI Receptionist Email Consent & 90-Day Conversation Retention',
        body: 'When you interact with the BOLEN AI Assistant, our edge worker stores an automatically redacted copy of the conversation transcript (stripping payment numbers, government IDs, and inline contact credentials) for up to 90 days for technical quality review and session continuity. If you choose to continue beyond the initial free turns, the separate email gate requests your explicit consent before linking your work email address to that session for up to 90 days so authorized administrators and approved sales staff can follow up on your inquiry.',
      },
      {
        title: '3. Essential Storage, Security & Analytics Cookies',
        body: 'We use essential browser storage (such as sessionStorage for AI Assistant turn tracking and language preference routing) to keep the website functional and secure against automated abuse. We also use lightweight performance and traffic analytics to measure aggregate B2B page visits, inquiry conversion events, and regional demand. We never sell personal data or use behavioral ad-network profiling.',
      },
      {
        title: '4. International Data Transfers & Infrastructure Security',
        body: 'Because BOLEN supplies commercial buyers across Europe, the United Kingdom, North America, Australia, the Middle East, and Asia from our manufacturing headquarters in Jiaxing, Zhejiang, China, business inquiry data is processed across secure cloud infrastructure (Cloudflare edge network and access-controlled database storage) and reviewed by authorized export sales personnel in China under TLS encryption and role-based access controls.',
      },
      {
        title: '5. Retention Periods',
        body: 'Redacted AI Assistant transcripts and associated continuation emails are retained for a maximum of 90 days unless converted into an active B2B quotation at your request. Formal RFQ submissions and commercial contract records are retained only as long as necessary to service ongoing OEM/ODM programs, honor our 3-year electrical / 2-year structural warranty commitments, and comply with export, tax, and accounting regulations.',
      },
      {
        title: '6. Buyer Rights & Data Deletion Requests',
        body: 'Depending on your jurisdiction (including GDPR/UK GDPR, CCPA/CPRA, and PIPL), you may request access to, correction of, restriction of, or deletion of the business contact details, RFQ submissions, or AI chat sessions associated with your email address, and you may withdraw email follow-up consent at any time without affecting prior lawful processing.',
      },
    ],
  },
  zh: {
    seo: {
      title: '隐私政策 | BOLEN 镜业',
      description:
        'BOLEN 镜业（嘉兴诚泰镜业有限公司）B2B 隐私政策，涵盖询盘信息处理、AI 助手邮箱授权与 90 天对话留存、Cookie 使用、跨境数据安全及数据删除权利。',
    },
    kicker: '法律与隐私声明',
    heading: '隐私政策',
    lastUpdated: '最后更新：2026 年 11 月 18 日',
    intro:
      '本隐私政策说明嘉兴诚泰镜业有限公司（运营 BOLEN 镜业品牌及网站 bolenmirror.com，工厂地址：中国浙江省嘉兴市王店镇创业路1号2幢1号）如何收集、使用、保存和保护全球采购商、进口商、经销商、酒店及工程项目客户提交的商务信息。',
    contactHeading: '隐私咨询与数据控制者联系方式',
    contactLead:
      '如需查询、更正、导出或删除您的询盘记录及 AI 助手会话数据，请联系嘉兴诚泰镜业有限公司（地址：中国浙江省嘉兴市王店镇创业路1号2幢1号），电子邮箱：',
    sections: [
      {
        title: '一、B2B 询盘（RFQ）与商务沟通信息',
        body: '当您通过网站提交报价申请（RFQ）、首页快速留言或直接向销售团队发送邮件时，我们会收集您的姓名或公司名称、商务电子邮箱、关注的产品型号、尺寸与功能规格、预估采购数量、目的市场及留言内容。上述信息仅用于技术规格评审、打样安排、工厂报价核算、目的国认证核对及订单交付。',
      },
      {
        title: '二、AI 选型助手邮箱授权与 90 天会话留存机制',
        body: '当您使用 BOLEN AI 助手咨询产品、起订量或交期时，系统会对聊天正文进行自动脱敏处理（过滤证件号、支付账户及正文内敏感联系方式），并最长保留 90 天用于会话衔接与服务质量改进。若您在免费轮次后通过独立表单提交工作邮箱以继续咨询，系统仅在获得您明确勾选同意后将该邮箱与当前会话关联保存最长 90 天，且仅限获授权管理员与已审核外贸业务人员查看跟进。',
      },
      {
        title: '三、必要本地存储与统计 Cookie',
        body: '我们使用维持网站正常运行与防滥用安全所必需的浏览器存储（如用于记录 AI 会话轮次的 sessionStorage 及多语种路由状态），并使用精简的访问统计工具分析页面整体访问表现与询盘转化情况。我们绝不出售访客数据，也不接入第三方跨站行为广告追踪网络。',
      },
      {
        title: '四、跨境数据传输与安全防护',
        body: '鉴于 BOLEN 从中国浙江嘉兴生产基地向欧洲、英国、北美、澳大利亚、中东及亚洲等全球市场供应镜类产品，您的商务询盘数据会通过加密传输（TLS）存储在受角色权限控制的云端基础设施（Cloudflare 边缘网络与受控数据库）中，并由获授权的出口业务与工程团队在严格访问控制下处理。',
      },
      {
        title: '五、数据保存期限',
        body: '自动脱敏的 AI 助手对话记录及关联邮箱最长保存 90 天，到期后自动清理（应您要求转为正式商务报价跟进的除外）。正式 RFQ 询盘与订单技术档案仅在履行 OEM/ODM 合作、兑现 3 年电子元件质保 / 2 年镜体结构质保以及满足出口财税法规所必需的期限内保存。',
      },
      {
        title: '六、采购商数据权利与删除申请',
        body: '根据适用的数据保护法律法规（包括《个人信息保护法》、欧盟/英国 GDPR 等），您有权随时申请查询、更正、限制处理或删除与您邮箱关联的商务联系信息、RFQ 记录及 AI 对话日志，并可随时撤回后续邮件跟进授权。',
      },
    ],
  },
  es: {
    seo: {
      title: 'Política de Privacidad | BOLEN Mirror',
      description:
        'Política de privacidad B2B de BOLEN Mirror sobre solicitudes RFQ, consentimiento de correo y retención de 90 días del asistente IA, cookies, transferencias internacionales y eliminación de datos.',
    },
    kicker: 'Aviso legal y privacidad',
    heading: 'Política de Privacidad',
    lastUpdated: 'Última actualización: 18 de noviembre de 2026',
    intro:
      'Esta Política de Privacidad explica cómo Jiaxing Chengtai Mirror Co., Ltd. (operador de la marca BOLEN Mirror en bolenmirror.com, con planta en No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, China) recopila, utiliza, conserva y protege los datos facilitados por compradores profesionales, importadores, distribuidores y responsables de proyectos hoteleros.',
    contactHeading: 'Contacto de Privacidad y Responsable del Tratamiento',
    contactLead:
      'Para solicitar acceso, rectificación, exportación o eliminación de sus consultas RFQ o sesiones del asistente IA, escriba a Jiaxing Chengtai Mirror Co., Ltd. (No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, China) en',
    sections: [
      {
        title: '1. Datos de solicitudes de cotización (RFQ) y consultas comerciales B2B',
        body: 'Al enviar un formulario RFQ, una consulta rápida o un correo comercial, recopilamos su nombre o empresa, correo electrónico profesional, modelos de referencia, dimensiones, funciones requeridas, cantidades estimadas, mercado de destino y detalles del proyecto. Utilizamos estos datos exclusivamente para revisar especificaciones técnicas, preparar muestras, emitir cotizaciones de fábrica y gestionar pedidos OEM/ODM.',
      },
      {
        title: '2. Consentimiento de correo y retención de 90 días en el Asistente IA',
        body: 'Cuando utiliza el Asistente IA de BOLEN, almacenamos una copia redactada automáticamente de la conversación durante un máximo de 90 días para mantener la continuidad de la sesión y supervisar la calidad técnica. Si decide continuar tras las primeras respuestas gratuitas mediante el formulario independiente de correo, su dirección profesional solo se vincula a dicho chat hasta 90 días con su consentimiento expreso y únicamente es accesible para administradores autorizados y personal comercial aprobado.',
      },
      {
        title: '3. Almacenamiento técnico esencial y cookies analíticas',
        body: 'Utilizamos almacenamiento técnico esencial en el navegador (como sessionStorage para el control de turnos del chat y rutas de idioma) para garantizar la seguridad y el funcionamiento del sitio, así como analítica agregada para medir el rendimiento de las páginas B2B y las conversiones de consulta. Nunca vendemos datos personales ni empleamos redes de publicidad conductual.',
      },
      {
        title: '4. Transferencias internacionales y medidas de seguridad',
        body: 'Dado que BOLEN atiende a clientes empresariales en Europa, Reino Unido, Norteamérica, Australia y otros mercados desde su sede industrial en Jiaxing, Zhejiang, China, las consultas comerciales se transmiten mediante cifrado TLS a través de infraestructura segura (red perimetral Cloudflare y base de datos con control de acceso por roles) para su gestión por nuestro equipo de exportación.',
      },
      {
        title: '5. Plazos de conservación',
        body: 'Los registros redactados del chat IA y los correos asociados se conservan un máximo de 90 días, salvo que pasen a formar parte de una cotización activa solicitada por usted. Las solicitudes RFQ y expedientes técnicos de pedidos se conservan durante el tiempo necesario para ejecutar proyectos OEM/ODM, respaldar la garantía (3 años en componentes eléctricos y LED; 2 años en plateado, trasera y marcos sin LED) y cumplir obligaciones legales de exportación.',
      },
      {
        title: '6. Derechos del comprador y solicitud de supresión',
        body: 'Conforme a la normativa aplicable (incluido el RGPD europeo), usted puede solicitar en cualquier momento el acceso, la rectificación, la limitación del tratamiento o la eliminación definitiva de sus datos de contacto, formularios RFQ o sesiones del Asistente IA, así como retirar su consentimiento de seguimiento comercial.',
      },
    ],
  },
  fr: {
    seo: {
      title: 'Politique de Confidentialité | BOLEN Mirror',
      description:
        'Politique de confidentialité B2B de BOLEN Mirror couvrant les demandes de devis RFQ, le consentement e-mail et la conservation 90 jours de l’assistant IA, les cookies et vos droits de suppression.',
    },
    kicker: 'Mentions légales et confidentialité',
    heading: 'Politique de Confidentialité',
    lastUpdated: 'Dernière mise à jour : 18 novembre 2026',
    intro:
      'La présente Politique de Confidentialité décrit la manière dont Jiaxing Chengtai Mirror Co., Ltd. (exploitant la marque BOLEN Mirror sur bolenmirror.com, située au No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, Chine) collecte, utilise, conserve et protège les informations transmises par les acheteurs professionnels, importateurs, distributeurs et prescripteurs hôteliers.',
    contactHeading: 'Contact Confidentialité et Responsable du Traitement',
    contactLead:
      'Pour exercer vos droits d’accès, de rectification, de portabilité ou de suppression concernant vos demandes RFQ ou sessions IA, contactez Jiaxing Chengtai Mirror Co., Ltd. (No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, Chine) à l’adresse',
    sections: [
      {
        title: '1. Données de demandes de devis (RFQ) et d’échanges B2B',
        body: 'Lorsque vous envoyez une demande de devis (RFQ), un formulaire de contact rapide ou un e-mail commercial, nous recueillons le nom de votre société ou contact, votre adresse e-mail professionnelle, les modèles envisagés, les dimensions, les quantités estimées, le marché de destination et votre cahier des charges. Ces données servent exclusivement à l’étude technique, à l’échantillonnage, à l’établissement des devis usine et au suivi des commandes OEM/ODM.',
      },
      {
        title: '2. Assistant IA : consentement e-mail et conservation limitée à 90 jours',
        body: 'Lors de l’utilisation de l’Assistant IA BOLEN, une copie automatiquement anonymisée des échanges est conservée pendant 90 jours maximum afin d’assurer la continuité de session et le contrôle qualité. Si vous choisissez de poursuivre la discussion via le formulaire d’e-mail distinct, votre adresse professionnelle n’est associée à cette conversation (pendant 90 jours maximum) qu’avec votre consentement explicite et n’est visible que par les administrateurs habilités et les commerciaux approuvés.',
      },
      {
        title: '3. Stockage technique essentiel et cookies de mesure d’audience',
        body: 'Nous utilisons un stockage navigateur strictement nécessaire au fonctionnement et à la sécurité du site (notamment sessionStorage pour le suivi de session de l’assistant IA et la sélection linguistique), ainsi que des mesures d’audience agrégées destinées à évaluer la performance de nos pages B2B. Nous ne vendons jamais vos données et n’utilisons aucun ciblage publicitaire tiers.',
      },
      {
        title: '4. Transferts internationaux et sécurité des données',
        body: 'BOLEN accompagnant des acheteurs professionnels en Europe, au Royaume-Uni, en Amérique du Nord, en Australie et au Moyen-Orient depuis son site industriel de Jiaxing (Zhejiang, Chine), les demandes commerciales sont protégées par chiffrement TLS, hébergées sur une infrastructure cloud sécurisée (réseau Cloudflare et base de données à accès restreint par rôle) et traitées par notre équipe export autorisée.',
      },
      {
        title: '5. Durées de conservation',
        body: 'Les transcriptions anonymisées du chat IA et les adresses e-mail associées sont supprimées au bout de 90 jours maximum, sauf demande de devis formelle de votre part. Les dossiers RFQ et documents contractuels sont conservés pour la durée nécessaire au suivi des fabrications OEM/ODM, à l’application de notre garantie (3 ans sur l’éclairage LED et les composants électriques ; 2 ans sur l’argenture, le dos et les cadres non LED) et au respect des obligations comptables et douanières.',
      },
      {
        title: '6. Vos droits d’accès, de rectification et d’effacement',
        body: 'Conformément à la réglementation applicable (dont le RGPD), vous pouvez à tout moment demander l’accès, la rectification, la limitation ou la suppression de vos coordonnées professionnelles, formulaires RFQ et sessions de chat IA, ainsi que retirer votre consentement au suivi par e-mail.',
      },
    ],
  },
  de: {
    seo: {
      title: 'Datenschutzerklärung | BOLEN Mirror',
      description:
        'B2B-Datenschutzerklärung von BOLEN Mirror zu RFQ-Anfragen, E-Mail-Einwilligung und 90-tägiger Speicherung im KI-Assistenten, Cookies, internationalen Datentransfers und Löschrechten.',
    },
    kicker: 'Rechtliches & Datenschutz',
    heading: 'Datenschutzerklärung',
    lastUpdated: 'Zuletzt aktualisiert: 18. November 2026',
    intro:
      'Diese Datenschutzerklärung erläutert, wie die Jiaxing Chengtai Mirror Co., Ltd. (Betreiberin der Marke BOLEN Mirror unter bolenmirror.com mit Werkssitz in No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, China) geschäftliche Kontakt- und Projektdaten von Importeuren, Großhändlern, Marken und Hotelprojekteinkäufern erhebt, verarbeitet, speichert und schützt.',
    contactHeading: 'Datenschutzkontakt & Verantwortliche Stelle',
    contactLead:
      'Zur Ausübung Ihrer Auskunfts-, Berichtigungs-, Datenübertragbarkeits- oder Löschrechte für RFQ-Anfragen und KI-Chat-Sitzungen wenden Sie sich an die Jiaxing Chengtai Mirror Co., Ltd. (No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, China) unter',
    sections: [
      {
        title: '1. B2B-Angebotsanfragen (RFQ) und geschäftliche Kommunikationsdaten',
        body: 'Wenn Sie ein RFQ-Formular, eine Schnellanfrage oder eine E-Mail an unseren Vertrieb senden, erfassen wir Ihren Namen bzw. Firmennamen, Ihre geschäftliche E-Mail-Adresse, ausgewählte Modellreferenzen, Maße, gewünschte Funktionen, geschätzte Bestellmengen, den Zielmarkt sowie Ihre Projektbeschreibung. Diese Angaben werden ausschließlich zur technischen Prüfung, Bemusterung, Erstellung verbindlicher Werksangebote und Abwicklung von OEM/ODM-Aufträgen verarbeitet.',
      },
      {
        title: '2. KI-Assistent: E-Mail-Einwilligung & 90-tägige Chat-Speicherung',
        body: 'Bei Nutzung des BOLEN KI-Assistenten speichert unser System eine automatisch bereinigte Kopie des Gesprächsverlaufs für maximal 90 Tage zur Sitzungsfortführung und technischen Qualitätssicherung. Wenn Sie nach den kostenfreien Erstantworten über das separate Formular Ihre geschäftliche E-Mail-Adresse eingeben, wird diese nur mit Ihrer ausdrücklichen Einwilligung für maximal 90 Tage mit dem Chat verknüpft und ist ausschließlich für autorisierte Administratoren und freigegebene Vertriebsmitarbeitende einsehbar.',
      },
      {
        title: '3. Technisch notwendiger Speicher & Analyse-Cookies',
        body: 'Wir nutzen technisch erforderlichen Browserspeicher (z. B. sessionStorage für die Sitzungsverwaltung des KI-Assistenten sowie Sprachrouting) zum sicheren Betrieb der Website sowie datenschutzfreundliche Reichweitenmessung zur aggregierten Auswertung von Seitenaufrufen und Anfrage-Konversionen. Wir verkaufen keine personenbezogenen Daten und setzen kein verhaltensbasiertes Werbe-Tracking ein.',
      },
      {
        title: '4. Internationale Datenübermittlung & IT-Sicherheit',
        body: 'Da BOLEN Geschäftskunden in Europa, Großbritannien, Nordamerika, Australien und weiteren Exportmärkten von seinem Produktionsstandort in Jiaxing (Zhejiang, China) aus beliefert, werden Anfragedaten TLS-verschlüsselt über gesicherte Cloud-Infrastruktur (Cloudflare-Edge-Netzwerk und rollenbasiert geschützte Datenbanken) übertragen und durch autorisierte Export- und Ingenieurteams bearbeitet.',
      },
      {
        title: '5. Speicherdauer',
        body: 'Bereinigte KI-Chatprotokolle und verknüpfte E-Mail-Adressen werden spätestens nach 90 Tagen gelöscht, sofern daraus auf Ihren Wunsch kein aktives Projektangebot entsteht. Formelle RFQ-Anfragen und Auftragsunterlagen bewahren wir nur solange auf, wie dies für laufende OEM/ODM-Lieferprogramme, unsere Garantiezusagen (3 Jahre auf LED-Beleuchtung, Treiber, Sensoren und Elektronik; 2 Jahre auf Verspiegelung, Rückwand und Rahmen nicht beleuchteter Spiegel) sowie handels- und steuerrechtliche Pflichten erforderlich ist.',
      },
      {
        title: '6. Ihre Datenschutz- und Löschrechte',
        body: 'Nach Maßgabe der geltenden Datenschutzgesetze (einschließlich DSGVO) können Sie jederzeit Auskunft, Berichtigung, Einschränkung der Verarbeitung oder Löschung Ihrer geschäftlichen Kontaktdaten, RFQ-Einträge und KI-Chatsitzungen verlangen sowie eine erteilte E-Mail-Einwilligung mit Wirkung für die Zukunft widerrufen.',
      },
    ],
  },
  it: {
    seo: {
      title: 'Informativa sulla Privacy | BOLEN Mirror',
      description:
        'Informativa sulla privacy B2B di BOLEN Mirror relativa a richieste di preventivo RFQ, consenso e-mail e conservazione di 90 giorni della chat IA, cookie, trasferimenti internazionali e cancellazione dati.',
    },
    kicker: 'Note legali e privacy',
    heading: 'Informativa sulla Privacy',
    lastUpdated: 'Ultimo aggiornamento: 18 novembre 2026',
    intro:
      'La presente Informativa sulla Privacy illustra come Jiaxing Chengtai Mirror Co., Ltd. (titolare del marchio BOLEN Mirror su bolenmirror.com, con sede produttiva in No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, Cina) raccoglie, utilizza, conserva e protegge le informazioni inviate da acquirenti B2B, importatori, distributori, marchi e responsabili di progetti alberghieri.',
    contactHeading: 'Contatti Privacy e Titolare del Trattamento',
    contactLead:
      'Per esercitare i diritti di accesso, rettifica, portabilità o cancellazione relativi a richieste RFQ o sessioni dell’Assistente IA, contatta Jiaxing Chengtai Mirror Co., Ltd. (No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, Cina) all’indirizzo',
    sections: [
      {
        title: '1. Dati delle richieste di preventivo (RFQ) e contatti commerciali B2B',
        body: 'Quando invii un modulo RFQ, una richiesta rapida o un’e-mail al nostro ufficio vendite, raccogliamo nome o ragione sociale, indirizzo e-mail aziendale, codici modello, dimensioni, funzioni richieste, quantitativi stimati, mercato di destinazione e note tecniche. Trattiamo tali dati esclusivamente per verificare le specifiche costruttive, predisporre campionature, emettere preventivi di fabbrica e gestire forniture OEM/ODM.',
      },
      {
        title: '2. Assistente IA: consenso e-mail e conservazione massima di 90 giorni',
        body: 'Durante l’uso dell’Assistente IA BOLEN, memorizziamo una copia automaticamente oscurata della conversazione per un massimo di 90 giorni al fine di garantire la continuità della sessione e il controllo qualità. Se scegli di proseguire oltre le prime risposte gratuite tramite l’apposito modulo separato, il tuo indirizzo e-mail aziendale viene associato alla sessione fino a 90 giorni solo previo tuo consenso esplicito ed è visibile unicamente agli amministratori autorizzati e al personale commerciale approvato.',
      },
      {
        title: '3. Archiviazione tecnica essenziale e cookie analitici',
        body: 'Utilizziamo strumenti di archiviazione tecnica strettamente necessari al funzionamento e alla sicurezza del sito (come sessionStorage per la gestione dei turni della chat IA e delle preferenze di lingua) e analisi statistiche aggregate per valutare le prestazioni delle pagine B2B. Non vendiamo mai dati personali né utilizziamo circuiti pubblicitari di profilazione.',
      },
      {
        title: '4. Trasferimenti internazionali e sicurezza infrastrutturale',
        body: 'Poiché BOLEN fornisce clienti professionali in Europa, Regno Unito, Nord America, Australia e Medio Oriente dallo stabilimento di Jiaxing (Zhejiang, Cina), i dati delle richieste commerciali vengono trasmessi con crittografia TLS su infrastruttura cloud protetta (rete edge Cloudflare e database con controllo degli accessi basato sui ruoli) e gestiti dal personale export autorizzato.',
      },
      {
        title: '5. Periodo di conservazione',
        body: 'Le trascrizioni oscurate della chat IA e le e-mail collegate vengono conservate per non oltre 90 giorni, salvo trasformazione in preventivo commerciale su tua richiesta. Le richieste RFQ e la documentazione tecnica d’ordine vengono conservate per il tempo necessario a gestire i programmi OEM/ODM, garantire l’assistenza post-vendita (3 anni di garanzia su illuminazione LED, driver, sensori touch e componenti elettrici; 2 anni su argentatura, retro e telai non LED) e adempiere agli obblighi fiscali e doganali.',
      },
      {
        title: '6. Diritti dell’acquirente e richiesta di cancellazione',
        body: 'In conformità alla normativa applicabile (incluso il GDPR), puoi richiedere in qualsiasi momento l’accesso, la rettifica, la limitazione o la cancellazione dei tuoi recapiti aziendali, dei moduli RFQ inviati o delle sessioni dell’Assistente IA, nonché revocare il consenso al ricontatto via e-mail.',
      },
    ],
  },
};

export function getPrivacyCopy(lang: string): LocalizedPrivacyCopy {
  return Object.hasOwn(PRIVACY_BY_LANG, lang)
    ? PRIVACY_BY_LANG[lang as keyof typeof PRIVACY_BY_LANG]
    : PRIVACY_BY_LANG.en;
}

export function getPrivacyFactoryAddress(lang: string): string {
  return Object.hasOwn(PRIVACY_FACTORY_ADDRESS, lang)
    ? PRIVACY_FACTORY_ADDRESS[lang as keyof typeof PRIVACY_FACTORY_ADDRESS]
    : PRIVACY_FACTORY_ADDRESS.en;
}

// Key order matters: scripts/prerender-static.ts and react-helmet-async both
// JSON.stringify this object, so identical key order lets Helmet adopt the
// prerendered <script> cleanly on hydration.
export function buildPrivacySchema(lang: string) {
  const normalized = Object.hasOwn(PRIVACY_BY_LANG, lang) ? lang : 'en';
  const copy = getPrivacyCopy(normalized);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: copy.heading,
    description: copy.seo.description,
    url: `https://bolenmirror.com/${normalized}${PRIVACY_PATH}/`,
    inLanguage: normalized,
  } as const;
}
