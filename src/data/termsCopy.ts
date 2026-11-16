// Terms and Conditions copy, shared by src/pages/TermsAndConditions.tsx and the
// static prerender in scripts/prerender-static.ts. Localized across all six
// supported site languages so Google indexes each locale under its own
// self-referencing canonical instead of treating non-English routes as
// duplicate English pages.

export const TERMS_PATH = '/terms-and-conditions';
export const TERMS_CONTACT_EMAIL = 'sales@bolenmirror.com';

export interface TermsSection {
  readonly title: string;
  readonly body: string;
}

export interface LocalizedTermsCopy {
  readonly seo: {
    readonly title: string;
    readonly description: string;
  };
  readonly kicker: string;
  readonly heading: string;
  readonly lastUpdated: string;
  readonly intro: string;
  readonly contactHeading: string;
  readonly contactLead: string;
  readonly sections: ReadonlyArray<TermsSection>;
}

const TERMS_BY_LANG: Record<'en' | 'zh' | 'es' | 'fr' | 'de' | 'it', LocalizedTermsCopy> = {
  en: {
    seo: {
      title: 'Terms and Conditions | BOLEN Mirror',
      description:
        'BOLEN Mirror terms and conditions, including refunds or order credits for defective products, spare parts with shipments, and lifetime technical support.',
    },
    kicker: 'Legal',
    heading: 'Terms and Conditions',
    lastUpdated: 'Last updated: November 5, 2026',
    intro:
      'These terms govern your use of the BOLEN Mirror website, operated by Jiaxing Chengtai Mirror Co., Ltd., and describe our return and after-sales support policies. By using this website, you agree to these terms.',
    contactHeading: 'Contact',
    contactLead: 'If you have questions about these terms, contact us at',
    sections: [
      {
        title: 'Use of this website',
        body: 'You may use this website to learn about BOLEN products and services and to contact us about potential business. You must not misuse the website, interfere with its operation, or use its content for unlawful purposes.',
      },
      {
        title: 'Product information and quotations',
        body: 'Product images, specifications, availability, and other information are provided for general reference and may change without notice. Website content does not constitute a binding offer. Prices, minimum order quantities, lead times, specifications, and commercial terms are confirmed in a written quotation or contract.',
      },
      {
        title: 'Return policy',
        body: 'Defective products are eligible for a refund or a credit toward your next order. To arrange a refund or order credit, contact us at sales@bolenmirror.com with your order details and a description of the issue.',
      },
      {
        title: 'Spare parts',
        body: 'Spare parts are included with your shipment to support product maintenance and repairs.',
      },
      {
        title: 'Lifetime technical support',
        body: 'We provide technical support throughout the entire lifespan of our products, including assistance with installation, use, troubleshooting, and maintenance. Contact us at sales@bolenmirror.com for technical support.',
      },
      {
        title: 'Intellectual property',
        body: 'The BOLEN name, website design, text, images, videos, product materials, and other content are owned by or licensed to Jiaxing Chengtai Mirror Co., Ltd. You may not copy, republish, distribute, or commercially exploit this content without prior written permission.',
      },
      {
        title: 'Third-party services and links',
        body: 'This website may contain links to or use services provided by third parties. We are not responsible for the availability, content, security, or privacy practices of third-party websites or services.',
      },
      {
        title: 'Disclaimer and liability',
        body: 'We aim to keep this website accurate and available, but it is provided on an “as is” and “as available” basis. To the extent permitted by applicable law, Jiaxing Chengtai Mirror Co., Ltd. is not liable for indirect, incidental, or consequential loss arising from use of, or inability to use, this website.',
      },
      {
        title: 'Changes to these terms',
        body: 'We may update these terms from time to time. Changes take effect when the revised terms are published on this page. Continued use of the website after an update means you accept the revised terms.',
      },
    ],
  },
  zh: {
    seo: {
      title: '条款与条件 | BOLEN 镜业',
      description: 'BOLEN 镜业网站条款与条件，涵盖瑕疵产品退款或订单抵扣、随货备件政策以及产品全生命周期技术支持说明。',
    },
    kicker: '法律声明',
    heading: '条款与条件',
    lastUpdated: '最后更新：2026 年 11 月 5 日',
    intro:
      '本条款适用于您对嘉兴诚泰镜业有限公司运营的 BOLEN 镜业网站的使用，并说明我们的退换及售后支持政策。使用本网站即表示您同意遵守本条款。',
    contactHeading: '联系方式',
    contactLead: '如果您对本条款有任何疑问，请通过以下邮箱联系我们：',
    sections: [
      {
        title: '网站使用规范',
        body: '您可通过本网站了解 BOLEN 的产品与服务并就潜在业务与我们联系。您不得滥用本网站、干扰网站正常运行或将网站内容用于任何非法用途。',
      },
      {
        title: '产品信息与报价',
        body: '网站展示的产品图片、规格参数、供应状态及其他信息仅供一般参考，如有变更恕不另行通知。网站内容不构成具有约束力的要约；具体价格、起订量（MOQ）、交期、技术规格及商务条款均以书面报价单或正式合同为准。',
      },
      {
        title: '退换与赔付政策',
        body: '如产品存在质量瑕疵，您可申请退款或折算为下一笔订单的抵扣额度。如需办理退款或订单抵扣，请将订单信息及问题描述发送至 sales@bolenmirror.com。',
      },
      {
        title: '随货备件',
        body: '我们在出货时随附常用备件，以便于日常维护与售后更换。',
      },
      {
        title: '终身技术支持',
        body: '我们在产品整个使用周期内提供技术支持，包括安装指导、使用咨询、故障排查与维护建议。如需技术支持，请联系 sales@bolenmirror.com。',
      },
      {
        title: '知识产权',
        body: 'BOLEN 品牌名称、网站设计、文字、图片、视频、产品资料及其他内容均归嘉兴诚泰镜业有限公司所有或经合法授权使用。未经事先书面许可，不得复制、转载、分发或用于商业用途。',
      },
      {
        title: '第三方服务与链接',
        body: '本网站可能包含第三方链接或使用第三方服务。我们不对第三方网站或服务的可用性、内容、安全性或隐私惯例承担责任。',
      },
      {
        title: '免责声明与责任限制',
        body: '我们尽力确保本网站信息准确且访问顺畅，但本网站按“现状”和“现有”基础提供。在适用法律允许的范围内，嘉兴诚泰镜业有限公司不对因使用或无法使用本网站而产生的间接、附带或衍生损失承担责任。',
      },
      {
        title: '条款更新',
        body: '我们可能会不定期更新本条款。修订后的条款自发布于本页面起生效；您在条款更新后继续使用本网站即视为接受修订后的条款。',
      },
    ],
  },
  es: {
    seo: {
      title: 'Términos y Condiciones | BOLEN Mirror',
      description:
        'Términos y condiciones de BOLEN Mirror, incluidos reembolsos o créditos de pedido por productos defectuosos, repuestos incluidos en el envío y soporte técnico de por vida.',
    },
    kicker: 'Aviso legal',
    heading: 'Términos y Condiciones',
    lastUpdated: 'Última actualización: 5 de noviembre de 2026',
    intro:
      'Estos términos regulan el uso del sitio web de BOLEN Mirror, operado por Jiaxing Chengtai Mirror Co., Ltd., y describen nuestras políticas de devolución y soporte posventa. Al utilizar este sitio web, usted acepta estos términos.',
    contactHeading: 'Contacto',
    contactLead: 'Si tiene preguntas sobre estos términos, contáctenos en',
    sections: [
      {
        title: 'Uso de este sitio web',
        body: 'Puede utilizar este sitio web para conocer los productos y servicios de BOLEN y ponerse en contacto con nosotros sobre posibles oportunidades comerciales. No debe hacer un uso indebido del sitio web, interferir en su funcionamiento ni utilizar su contenido con fines ilícitos.',
      },
      {
        title: 'Información de productos y cotizaciones',
        body: 'Las imágenes, especificaciones, disponibilidad y demás información de los productos se ofrecen como referencia general y pueden cambiar sin previo aviso. El contenido del sitio web no constituye una oferta vinculante. Los precios, cantidades mínimas de pedido (MOQ), plazos de entrega, especificaciones y condiciones comerciales se confirman mediante cotización escrita o contrato.',
      },
      {
        title: 'Política de devoluciones',
        body: 'Los productos defectuosos tienen derecho a un reembolso o a un crédito aplicable a su próximo pedido. Para gestionar un reembolso o crédito de pedido, escríbanos a sales@bolenmirror.com indicando los datos de su pedido y una descripción de la incidencia.',
      },
      {
        title: 'Piezas de repuesto',
        body: 'Se incluyen piezas de repuesto junto con su envío para facilitar el mantenimiento y las reparaciones del producto.',
      },
      {
        title: 'Soporte técnico de por vida',
        body: 'Ofrecemos soporte técnico durante toda la vida útil de nuestros productos, incluida asistencia con la instalación, el uso, la resolución de problemas y el mantenimiento. Escríbanos a sales@bolenmirror.com para recibir asistencia técnica.',
      },
      {
        title: 'Propiedad intelectual',
        body: 'El nombre BOLEN, el diseño del sitio web, los textos, imágenes, videos, materiales de producto y demás contenidos son propiedad de Jiaxing Chengtai Mirror Co., Ltd. o cuentan con licencia para su uso. Queda prohibido copiar, republicar, distribuir o explotar comercialmente este contenido sin autorización previa por escrito.',
      },
      {
        title: 'Servicios y enlaces de terceros',
        body: 'Este sitio web puede contener enlaces o utilizar servicios proporcionados por terceros. No somos responsables de la disponibilidad, el contenido, la seguridad ni las prácticas de privacidad de sitios web o servicios de terceros.',
      },
      {
        title: 'Exención y limitación de responsabilidad',
        body: 'Procuramos mantener este sitio web actualizado y disponible, pero se ofrece “tal cual” y “según disponibilidad”. En la medida permitida por la legislación aplicable, Jiaxing Chengtai Mirror Co., Ltd. no será responsable de daños indirectos, incidentales o consecuentes derivados del uso o de la imposibilidad de uso de este sitio web.',
      },
      {
        title: 'Modificaciones de estos términos',
        body: 'Podemos actualizar estos términos periódicamente. Los cambios entran en vigor en el momento de su publicación en esta página. El uso continuado del sitio web tras una actualización implica la aceptación de los términos revisados.',
      },
    ],
  },
  fr: {
    seo: {
      title: 'Conditions Générales | BOLEN Mirror',
      description:
        'Conditions générales de BOLEN Mirror, incluant le remboursement ou avoir sur commande pour les produits défectueux, les pièces de rechange fournies et l’assistance technique à vie.',
    },
    kicker: 'Mentions légales',
    heading: 'Conditions Générales',
    lastUpdated: 'Dernière mise à jour : 5 novembre 2026',
    intro:
      'Les présentes conditions régissent votre utilisation du site web BOLEN Mirror, exploité par Jiaxing Chengtai Mirror Co., Ltd., et décrivent nos politiques de retour et de service après-vente. En utilisant ce site, vous acceptez ces conditions.',
    contactHeading: 'Contact',
    contactLead: 'Si vous avez des questions concernant ces conditions, contactez-nous à l’adresse',
    sections: [
      {
        title: 'Utilisation de ce site web',
        body: 'Vous pouvez utiliser ce site pour découvrir les produits et services BOLEN et nous contacter dans le cadre de projets commerciaux. Vous ne devez pas détourner le site de son usage, perturber son fonctionnement ni utiliser son contenu à des fins illégales.',
      },
      {
        title: 'Informations sur les produits et devis',
        body: 'Les visuels, spécifications, disponibilités et autres informations produits sont fournis à titre indicatif et peuvent être modifiés sans préavis. Le contenu du site ne constitue pas une offre contractuelle. Les prix, quantités minimales de commande (MOQ), délais de livraison, spécifications et conditions commerciales sont confirmés dans un devis écrit ou un contrat.',
      },
      {
        title: 'Politique de retour',
        body: 'Les produits défectueux donnent droit à un remboursement ou à un avoir valable sur votre prochaine commande. Pour organiser un remboursement ou un avoir, contactez-nous à sales@bolenmirror.com en précisant les références de votre commande et la nature du problème.',
      },
      {
        title: 'Pièces de rechange',
        body: 'Des pièces de rechange sont incluses dans votre expédition afin de faciliter l’entretien et les réparations des produits.',
      },
      {
        title: 'Assistance technique à vie',
        body: 'Nous assurons une assistance technique pendant toute la durée de vie de nos produits, y compris pour l’installation, l’utilisation, le dépannage et la maintenance. Contactez sales@bolenmirror.com pour toute demande d’assistance technique.',
      },
      {
        title: 'Propriété intellectuelle',
        body: 'La marque BOLEN, la conception du site, les textes, images, vidéos, documentations produits et autres contenus sont la propriété de Jiaxing Chengtai Mirror Co., Ltd. ou font l’objet d’une licence. Toute reproduction, diffusion ou exploitation commerciale sans autorisation écrite préalable est interdite.',
      },
      {
        title: 'Services et liens tiers',
        body: 'Ce site peut contenir des liens vers des sites tiers ou recourir à des services tiers. Nous déclinons toute responsabilité quant à la disponibilité, au contenu, à la sécurité ou aux pratiques de confidentialité de ces sites ou services tiers.',
      },
      {
        title: 'Clause de non-responsabilité',
        body: 'Nous nous efforçons de maintenir ce site exact et accessible, mais il est fourni « en l’état » et « selon disponibilité ». Dans les limites autorisées par la loi applicable, Jiaxing Chengtai Mirror Co., Ltd. ne saurait être tenue responsable des dommages indirects ou consécutifs liés à l’utilisation ou à l’impossibilité d’utiliser ce site.',
      },
      {
        title: 'Modification des présentes conditions',
        body: 'Nous pouvons mettre à jour ces conditions à tout moment. Les modifications prennent effet dès leur publication sur cette page. La poursuite de l’utilisation du site après mise à jour vaut acceptation des conditions révisées.',
      },
    ],
  },
  de: {
    seo: {
      title: 'Allgemeine Geschäftsbedingungen | BOLEN Mirror',
      description:
        'Allgemeine Geschäftsbedingungen von BOLEN Mirror – einschließlich Rückerstattung oder Bestellgutschrift bei fehlerhaften Produkten, mitgelieferter Ersatzteile und lebenslangem technischem Support.',
    },
    kicker: 'Rechtliches',
    heading: 'Allgemeine Geschäftsbedingungen',
    lastUpdated: 'Zuletzt aktualisiert: 5. November 2026',
    intro:
      'Diese Bedingungen regeln Ihre Nutzung der Website von BOLEN Mirror, betrieben von der Jiaxing Chengtai Mirror Co., Ltd., und beschreiben unsere Rückgabe- sowie Kundendienstrichtlinien. Mit der Nutzung dieser Website erklären Sie sich mit diesen Bedingungen einverstanden.',
    contactHeading: 'Kontakt',
    contactLead: 'Bei Fragen zu diesen Bedingungen erreichen Sie uns unter',
    sections: [
      {
        title: 'Nutzung dieser Website',
        body: 'Sie dürfen diese Website nutzen, um sich über Produkte und Dienstleistungen von BOLEN zu informieren und uns bezüglich geschäftlicher Anfragen zu kontaktieren. Sie dürfen die Website nicht missbräuchlich verwenden, ihren Betrieb beeinträchtigen oder Inhalte für rechtswidrige Zwecke nutzen.',
      },
      {
        title: 'Produktinformationen und Angebote',
        body: 'Produktbilder, technische Daten, Verfügbarkeiten und sonstige Angaben dienen der allgemeinen Orientierung und können ohne vorherige Ankündigung geändert werden. Website-Inhalte stellen kein verbindliches Angebot dar. Preise, Mindestbestellmengen (MOQ), Lieferzeiten, Spezifikationen und Handelsbedingungen werden in einem schriftlichen Angebot oder Vertrag bestätigt.',
      },
      {
        title: 'Rückgaberichtlinie',
        body: 'Für mangelhafte Produkte besteht Anspruch auf eine Rückerstattung oder eine Gutschrift für Ihre nächste Bestellung. Um eine Rückerstattung oder Gutschrift zu veranlassen, kontaktieren Sie uns bitte unter sales@bolenmirror.com mit Ihren Bestelldaten und einer Beschreibung des Mangels.',
      },
      {
        title: 'Ersatzteile',
        body: 'Ihrer Lieferung liegen passende Ersatzteile bei, um Wartung und eventuelle Reparaturen der Produkte zu unterstützen.',
      },
      {
        title: 'Lebenslanger technischer Support',
        body: 'Wir bieten technischen Support über die gesamte Lebensdauer unserer Produkte hinweg, einschließlich Unterstützung bei Montage, Betrieb, Fehlersuche und Wartung. Für technischen Support kontaktieren Sie uns unter sales@bolenmirror.com.',
      },
      {
        title: 'Geistiges Eigentum',
        body: 'Der Name BOLEN, das Website-Design, Texte, Bilder, Videos, Produktunterlagen und sonstige Inhalte sind Eigentum der Jiaxing Chengtai Mirror Co., Ltd. oder an diese lizenziert. Eine Vervielfältigung, Weiterverbreitung oder kommerzielle Nutzung ohne vorherige schriftliche Zustimmung ist untersagt.',
      },
      {
        title: 'Dienste und Links von Drittanbietern',
        body: 'Diese Website kann Links zu Drittanbietern enthalten oder deren Dienste nutzen. Wir übernehmen keine Verantwortung für Verfügbarkeit, Inhalte, Sicherheit oder Datenschutzpraktiken externer Websites oder Dienste.',
      },
      {
        title: 'Haftungsausschluss',
        body: 'Wir sind bemüht, diese Website aktuell und verfügbar zu halten, stellen sie jedoch ohne Gewähr („wie besehen“) bereit. Soweit gesetzlich zulässig, haftet die Jiaxing Chengtai Mirror Co., Ltd. nicht für indirekte Schäden oder Folgeschäden, die aus der Nutzung oder Nichtverfügbarkeit dieser Website entstehen.',
      },
      {
        title: 'Änderungen dieser Bedingungen',
        body: 'Wir können diese Bedingungen von Zeit zu Zeit aktualisieren. Änderungen treten mit ihrer Veröffentlichung auf dieser Seite in Kraft. Durch die weitere Nutzung der Website nach einer Aktualisierung stimmen Sie den geänderten Bedingungen zu.',
      },
    ],
  },
  it: {
    seo: {
      title: 'Termini e Condizioni | BOLEN Mirror',
      description:
        'Termini e condizioni di BOLEN Mirror, inclusi rimborsi o crediti d’ordine per prodotti difettosi, parti di ricambio incluse nella spedizione e supporto tecnico a vita.',
    },
    kicker: 'Note legali',
    heading: 'Termini e Condizioni',
    lastUpdated: 'Ultimo aggiornamento: 5 novembre 2026',
    intro:
      'I presenti termini disciplinano l’utilizzo del sito web BOLEN Mirror, gestito da Jiaxing Chengtai Mirror Co., Ltd., e descrivono le nostre politiche di reso e assistenza post-vendita. Utilizzando questo sito web, l’utente accetta i presenti termini.',
    contactHeading: 'Contatti',
    contactLead: 'Per qualsiasi domanda relativa ai presenti termini, contattaci all’indirizzo',
    sections: [
      {
        title: 'Utilizzo del sito web',
        body: 'È consentito utilizzare questo sito web per conoscere i prodotti e i servizi BOLEN e per contattarci in merito a potenziali collaborazioni commerciali. Non è consentito fare un uso improprio del sito, interferire con il suo funzionamento o utilizzarne i contenuti per scopi illeciti.',
      },
      {
        title: 'Informazioni sui prodotti e preventivi',
        body: 'Immagini dei prodotti, specifiche tecniche, disponibilità e altre informazioni sono fornite a scopo puramente indicativo e possono variare senza preavviso. I contenuti del sito non costituiscono un’offerta vincolante. Prezzi, quantitativi minimi d’ordine (MOQ), tempi di consegna, specifiche e condizioni commerciali vengono confermati in un preventivo scritto o in un contratto.',
      },
      {
        title: 'Politica di reso',
        body: 'I prodotti difettosi danno diritto a un rimborso o a un credito utilizzabile per il prossimo ordine. Per richiedere un rimborso o un credito d’ordine, contattaci all’indirizzo sales@bolenmirror.com indicando i dettagli dell’ordine e una descrizione del problema.',
      },
      {
        title: 'Parti di ricambio',
        body: 'Le parti di ricambio sono incluse nella spedizione per agevolare la manutenzione e le eventuali riparazioni dei prodotti.',
      },
      {
        title: 'Supporto tecnico a vita',
        body: 'Forniamo supporto tecnico per l’intero ciclo di vita dei nostri prodotti, inclusa assistenza per installazione, utilizzo, risoluzione dei problemi e manutenzione. Contattaci all’indirizzo sales@bolenmirror.com per ricevere supporto tecnico.',
      },
      {
        title: 'Proprietà intellettuale',
        body: 'Il marchio BOLEN, il design del sito web, i testi, le immagini, i video, la documentazione di prodotto e gli altri contenuti sono di proprietà di Jiaxing Chengtai Mirror Co., Ltd. o concessi in licenza. È vietato copiare, ripubblicare, distribuire o sfruttare commercialmente tali contenuti senza previa autorizzazione scritta.',
      },
      {
        title: 'Servizi e link di terze parti',
        body: 'Questo sito web può contenere link o utilizzare servizi forniti da terze parti. Non siamo responsabili per la disponibilità, i contenuti, la sicurezza o le pratiche sulla privacy di siti o servizi di terze parti.',
      },
      {
        title: 'Limitazione di responsabilità',
        body: 'Ci impegniamo a mantenere questo sito web accurato e accessibile, ma esso viene fornito “così com’è” e “secondo disponibilità”. Nei limiti consentiti dalla legge applicabile, Jiaxing Chengtai Mirror Co., Ltd. non è responsabile per danni indiretti, incidentali o consequenziali derivanti dall’uso o dall’impossibilità di utilizzare questo sito web.',
      },
      {
        title: 'Modifiche ai presenti termini',
        body: 'Potremmo aggiornare periodicamente i presenti termini. Le modifiche entrano in vigore al momento della pubblicazione su questa pagina. L’uso continuato del sito dopo un aggiornamento comporta l’accettazione dei termini revisionati.',
      },
    ],
  },
};

export function getTermsCopy(lang: string): LocalizedTermsCopy {
  return Object.hasOwn(TERMS_BY_LANG, lang)
    ? TERMS_BY_LANG[lang as keyof typeof TERMS_BY_LANG]
    : TERMS_BY_LANG.en;
}

// Key order matters: the prerender and react-helmet-async both JSON.stringify
// this object, and Helmet only adopts a prerendered <script> whose serialized
// text is byte-identical to its own.
export function buildTermsSchema(lang: string) {
  const copy = getTermsCopy(lang);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: copy.heading,
    description: copy.seo.description,
  } as const;
}

export const TERMS_SEO = TERMS_BY_LANG.en.seo;
export const TERMS_SCHEMA = buildTermsSchema('en');
export const TERMS_KICKER = TERMS_BY_LANG.en.kicker;
export const TERMS_HEADING = TERMS_BY_LANG.en.heading;
export const TERMS_LAST_UPDATED = TERMS_BY_LANG.en.lastUpdated;
export const TERMS_INTRO = TERMS_BY_LANG.en.intro;
export const TERMS_CONTACT_HEADING = TERMS_BY_LANG.en.contactHeading;
export const TERMS_CONTACT_LEAD = TERMS_BY_LANG.en.contactLead;
export const TERMS_SECTIONS = TERMS_BY_LANG.en.sections;
