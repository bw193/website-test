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
        'BOLEN Mirror commercial terms and unified warranty policy: 3-year warranty on LED lighting, drivers, touch sensors, and electrical components; 2-year warranty on non-LED mirror silvering, backing, and frames.',
    },
    kicker: 'Legal',
    heading: 'Terms and Conditions',
    lastUpdated: 'Last updated: November 18, 2026',
    intro:
      'These terms govern your use of the BOLEN Mirror website, operated by Jiaxing Chengtai Mirror Co., Ltd. (No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, China), and describe our commercial quotation, unified warranty, return, and after-sales support policies. By using this website, you agree to these terms.',
    contactHeading: 'Contact',
    contactLead: 'If you have questions about these terms or a warranty claim, contact Jiaxing Chengtai Mirror Co., Ltd. at',
    sections: [
      {
        title: 'Use of this website',
        body: 'You may use this website to learn about BOLEN products and manufacturing capabilities and to contact us about B2B commercial programs. You must not misuse the website, interfere with its operation, or use its content for unlawful purposes.',
      },
      {
        title: 'Product information and quotations',
        body: 'Product images, specifications, indicative price ranges, and certification references are provided for general commercial guidance and may change without notice. Website content does not constitute a binding retail offer. Final unit prices, minimum order quantities (MOQ), sample fees, production lead times, market-specific certifications, and commercial terms are confirmed in a written proforma invoice, quotation, or supply contract.',
      },
      {
        title: 'Unified product warranty policy',
        body: 'BOLEN provides a unified factory warranty from the bill-of-lading shipment date under normal indoor installation and use: (1) a 3-year warranty on LED lighting strips, constant-voltage drivers, touch sensors, anti-fog heating pads, Bluetooth/display modules, and electrical components; and (2) a 2-year warranty on non-LED mirror silvering, safety backing, and structural frames (aluminum, steel, wood, or cabinet carcasses). Physical breakage from improper transit handling outside agreed Incoterms, unauthorized electrical modification, or abrasive chemical misuse is excluded.',
      },
      {
        title: 'Return, replacement, and credit policy',
        body: 'Verified manufacturing defects within the applicable warranty period are eligible for free replacement components/units, a refund, or an agreed credit toward your next production order. To submit a claim, contact sales@bolenmirror.com with your order/proforma number, model code, batch photos or video evidence, and a description of the issue.',
      },
      {
        title: 'Spare parts',
        body: 'Agreed critical spare parts (such as LED drivers, touch sensors, and mounting hardware) are included with bulk shipments to support rapid on-site project maintenance and after-sales service.',
      },
      {
        title: 'Lifetime technical support',
        body: 'We provide engineering and technical support throughout the operational lifespan of our products, including assistance with wiring diagrams, mounting templates, troubleshooting, and maintenance. Contact us at sales@bolenmirror.com for technical support.',
      },
      {
        title: 'Intellectual property',
        body: 'The BOLEN name, website design, text, technical drawings, photographs, videos, product materials, and other content are owned by or licensed to Jiaxing Chengtai Mirror Co., Ltd. Buyer-supplied OEM trademarks and drawings remain the property of the respective buyer.',
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
      description:
        'BOLEN 镜业商务条款与统一质保政策：LED 灯带、电源驱动、触控开关及电气元件享 3 年质保；非 LED 镜面银层、背膜及外框结构享 2 年质保。',
    },
    kicker: '法律声明',
    heading: '条款与条件',
    lastUpdated: '最后更新：2026 年 11 月 18 日',
    intro:
      '本条款适用于您对嘉兴诚泰镜业有限公司（地址：中国浙江省嘉兴市王店镇创业路1号2幢1号）运营的 BOLEN 镜业网站的使用，并明确说明我们的商务报价、统一质保期限、退换赔付及售后技术支持政策。使用本网站即表示您同意遵守本条款。',
    contactHeading: '联系方式',
    contactLead: '如果您对本条款或售后质保事宜有任何疑问，请通过以下邮箱联系嘉兴诚泰镜业有限公司：',
    sections: [
      {
        title: '网站使用规范',
        body: '您可通过本网站了解 BOLEN 的产品与制造能力，并就 B2B 采购与定制业务与我们联系。您不得滥用本网站、干扰网站正常运行或将网站内容用于任何非法用途。',
      },
      {
        title: '产品信息与书面报价',
        body: '网站展示的产品图片、技术参数、参考价格区间及认证信息仅供商务选型参考，如有变更恕不另行通知。网站内容不构成具有法律约束力的零售要约；具体单价、起订量（MOQ）、样品费、量产交期、目的市场认证范围及贸易条款均以正式书面报价单或购销合同为准。',
      },
      {
        title: '统一产品质量保证政策',
        body: '自提单出运之日起，在正常室内安装与使用条件下，BOLEN 执行全站统一的分项工厂质保标准：（1）LED 照明灯带、恒压驱动电源、触摸/感应传感器、电热防雾膜、蓝牙与数显模块等电子电气元件提供 3 年质保；（2）非 LED 镜面镀银层、安全防爆背膜及镜框/柜体结构（铝合金、钢材、实木及防潮板材）提供 2 年质保。因超出约定贸易条款的野蛮装卸破损、私自改装电路或强腐蚀性化学品清洁造成的损坏不在质保范围内。',
      },
      {
        title: '退换、补发与订单抵扣政策',
        body: '在相应质保期内经核实确属制造质量瑕疵的产品，您可申请免费补发配件/整机、退款或折算为下一笔订单的货款抵扣额度。如需办理质保理赔，请将订单号、产品型号、照片或视频说明发送至 sales@bolenmirror.com。',
      },
      {
        title: '随货备件',
        body: '我们在大货出运时按约定比例随附关键易损备件（如驱动电源、触控开关及挂装五金），便于工程现场及渠道客户快速维护更换。',
      },
      {
        title: '终身技术支持',
        body: '我们在产品整个使用周期内提供工程与技术支持，包括接线指引、安装开孔图、故障排查与日常维护建议。如需技术支持，请联系 sales@bolenmirror.com。',
      },
      {
        title: '知识产权',
        body: 'BOLEN 品牌名称、网站设计、文字、工程图纸、图片、视频及产品资料均归嘉兴诚泰镜业有限公司所有或经合法授权使用；客户在 OEM/ODM 项目中提供的自有商标与专属设计图归客户所有。',
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
        'Términos comerciales y garantía unificada de BOLEN Mirror: 3 años de garantía en iluminación LED, drivers, sensores táctiles y componentes eléctricos; 2 años en plateado, trasera y marcos sin LED.',
    },
    kicker: 'Aviso legal',
    heading: 'Términos y Condiciones',
    lastUpdated: 'Última actualización: 18 de noviembre de 2026',
    intro:
      'Estos términos regulan el uso del sitio web de BOLEN Mirror, operado por Jiaxing Chengtai Mirror Co., Ltd. (No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, China), y describen nuestras políticas de cotización B2B, garantía unificada, devolución y soporte posventa. Al utilizar este sitio web, usted acepta estos términos.',
    contactHeading: 'Contacto',
    contactLead: 'Si tiene preguntas sobre estos términos o una solicitud de garantía, contáctenos en',
    sections: [
      {
        title: 'Uso de este sitio web',
        body: 'Puede utilizar este sitio web para conocer los productos y capacidades de fabricación de BOLEN y ponerse en contacto con nosotros sobre proyectos comerciales B2B. No debe hacer un uso indebido del sitio web, interferir en su funcionamiento ni utilizar su contenido con fines ilícitos.',
      },
      {
        title: 'Información de productos y cotizaciones',
        body: 'Las imágenes, especificaciones, rangos orientativos de precios y referencias de certificación se ofrecen con carácter informativo y pueden cambiar sin previo aviso. El contenido web no constituye una oferta vinculante. Los precios definitivos, cantidades mínimas de pedido (MOQ), plazos de entrega, certificaciones por mercado y condiciones comerciales se confirman mediante cotización escrita o contrato.',
      },
      {
        title: 'Política unificada de garantía de producto',
        body: 'BOLEN aplica una garantía de fábrica unificada desde la fecha de embarque en condiciones normales de instalación y uso interior: (1) 3 años de garantía para tiras de iluminación LED, drivers de tensión constante, sensores táctiles, láminas calefactoras antivaho y componentes eléctricos; y (2) 2 años de garantía para el plateado del espejo sin LED, respaldo de seguridad y marcos estructurales (aluminio, acero, madera o cuerpo de armario). Quedan excluidos daños por manipulación indebida fuera de los Incoterms acordados, modificaciones eléctricas no autorizadas o uso de productos químicos abrasivos.',
      },
      {
        title: 'Política de devoluciones, reposición y créditos',
        body: 'Los productos con defectos de fabricación verificados dentro del período de garantía tienen derecho a piezas o unidades de reposición, reembolso o crédito aplicable a su próximo pedido. Para gestionar una reclamación, escriba a sales@bolenmirror.com indicando su referencia de pedido, código de modelo y evidencia fotográfica o en video.',
      },
      {
        title: 'Piezas de repuesto',
        body: 'Se incluyen repuestos esenciales acordados junto con los envíos mayoristas para facilitar el mantenimiento rápido en obra y las reparaciones posventa.',
      },
      {
        title: 'Soporte técnico de por vida',
        body: 'Ofrecemos soporte técnico durante toda la vida útil de nuestros productos, incluida asistencia con esquemas de conexión, instalación, resolución de incidencias y mantenimiento. Escríbanos a sales@bolenmirror.com para recibir asistencia técnica.',
      },
      {
        title: 'Propiedad intelectual',
        body: 'El nombre BOLEN, el diseño del sitio web, los textos, planos, imágenes, videos y materiales de producto son propiedad de Jiaxing Chengtai Mirror Co., Ltd. o cuentan con licencia. Las marcas y planos OEM aportados por el comprador siguen siendo propiedad exclusiva de dicho comprador.',
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
        'Conditions générales et garantie unifiée BOLEN Mirror : garantie de 3 ans sur l’éclairage LED, les drivers, capteurs tactiles et composants électriques ; garantie de 2 ans sur l’argenture, le dos et les cadres non LED.',
    },
    kicker: 'Mentions légales',
    heading: 'Conditions Générales',
    lastUpdated: 'Dernière mise à jour : 18 novembre 2026',
    intro:
      'Les présentes conditions régissent votre utilisation du site web BOLEN Mirror, exploité par Jiaxing Chengtai Mirror Co., Ltd. (No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, Chine), et décrivent nos conditions de devis B2B, notre politique de garantie unifiée et notre service après-vente. En utilisant ce site, vous acceptez ces conditions.',
    contactHeading: 'Contact',
    contactLead: 'Pour toute question concernant ces conditions ou une demande de garantie, contactez-nous à l’adresse',
    sections: [
      {
        title: 'Utilisation de ce site web',
        body: 'Vous pouvez utiliser ce site pour découvrir les produits et capacités industrielles BOLEN et nous contacter dans le cadre de projets commerciaux B2B. Vous ne devez pas détourner le site de son usage, perturber son fonctionnement ni utiliser son contenu à des fins illégales.',
      },
      {
        title: 'Informations sur les produits et devis',
        body: 'Les visuels, spécifications, fourchettes de prix indicatives et références de certification sont fournis à titre d’information générale et peuvent évoluer sans préavis. Le contenu du site ne constitue pas une offre contractuelle. Les prix unitaires fermes, quantités minimales de commande (MOQ), délais de fabrication, certifications par marché et conditions commerciales sont confirmés dans un devis écrit ou un contrat.',
      },
      {
        title: 'Politique de garantie produit unifiée',
        body: 'BOLEN applique une garantie usine unifiée à compter de la date d’expédition dans des conditions normales d’installation et d’usage intérieur : (1) une garantie de 3 ans sur les rubans LED, drivers d’alimentation, capteurs tactiles, films chauffants antibuée et composants électriques ; et (2) une garantie de 2 ans sur l’argenture des miroirs non LED, le film de sécurité dorsal et les cadres structurels (aluminium, acier, bois ou caissons d’armoires). Sont exclus la casse liée à une manutention hors Incoterms convenus, toute modification électrique non autorisée ou l’usage de produits chimiques abrasifs.',
      },
      {
        title: 'Politique de retour, remplacement et avoir',
        body: 'Les défauts de fabrication avérés pendant la période de garantie donnent droit au remplacement des composants ou produits, à un remboursement ou à un avoir valable sur votre prochaine commande. Pour toute réclamation, écrivez à sales@bolenmirror.com avec votre référence de commande, le code modèle et des photos ou vidéos justificatives.',
      },
      {
        title: 'Pièces de rechange',
        body: 'Des pièces de rechange essentielles convenues à la commande sont incluses dans les expéditions en volume afin de faciliter la maintenance sur site et les réparations.',
      },
      {
        title: 'Assistance technique à vie',
        body: 'Nous assurons une assistance technique pendant toute la durée de vie de nos produits, y compris pour les schémas électriques, l’installation, le dépannage et la maintenance. Contactez sales@bolenmirror.com pour toute demande technique.',
      },
      {
        title: 'Propriété intellectuelle',
        body: 'La marque BOLEN, la conception du site, les textes, plans, images, vidéos et documentations produits sont la propriété de Jiaxing Chengtai Mirror Co., Ltd. ou font l’objet d’une licence. Les marques et plans OEM fournis par l’acheteur demeurent la propriété de ce dernier.',
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
        'AGB und einheitliche Garantierichtlinie von BOLEN Mirror: 3 Jahre Garantie auf LED-Beleuchtung, Treiber, Touch-Sensoren und Elektronik; 2 Jahre Garantie auf Verspiegelung, Rückwand und Rahmen nicht beleuchteter Spiegel.',
    },
    kicker: 'Rechtliches',
    heading: 'Allgemeine Geschäftsbedingungen',
    lastUpdated: 'Zuletzt aktualisiert: 18. November 2026',
    intro:
      'Diese Bedingungen regeln Ihre Nutzung der Website von BOLEN Mirror, betrieben von der Jiaxing Chengtai Mirror Co., Ltd. (No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, China), und beschreiben unsere B2B-Angebots-, Garantie-, Rückgabe- sowie Kundendienstrichtlinien. Mit der Nutzung dieser Website erklären Sie sich mit diesen Bedingungen einverstanden.',
    contactHeading: 'Kontakt',
    contactLead: 'Bei Fragen zu diesen Bedingungen oder im Garantiefall erreichen Sie uns unter',
    sections: [
      {
        title: 'Nutzung dieser Website',
        body: 'Sie dürfen diese Website nutzen, um sich über Produkte und Fertigungskapazitäten von BOLEN zu informieren und uns bezüglich geschäftlicher B2B-Anfragen zu kontaktieren. Sie dürfen die Website nicht missbräuchlich verwenden, ihren Betrieb beeinträchtigen oder Inhalte für rechtswidrige Zwecke nutzen.',
      },
      {
        title: 'Produktinformationen und Angebote',
        body: 'Produktbilder, technische Daten, unverbindliche Preisspannen und Zertifizierungshinweise dienen der allgemeinen Orientierung und können ohne vorherige Ankündigung geändert werden. Website-Inhalte stellen kein verbindliches Angebot dar. Verbindliche Stückpreise, Mindestbestellmengen (MOQ), Lieferzeiten, Zielmarktzertifikate und Handelsbedingungen werden in einem schriftlichen Angebot oder Liefervertrag bestätigt.',
      },
      {
        title: 'Einheitliche Produktgarantie',
        body: 'BOLEN gewährt ab Versanddatum bei sachgemäßer Innenraummontage und normalem Gebrauch eine einheitliche Werksgarantie: (1) 3 Jahre Garantie auf LED-Lichtbänder, Konstantspannungstreiber, Touch-Sensoren, Antibeschlag-Heizmatten sowie elektronische und elektrische Bauteile; und (2) 2 Jahre Garantie auf die Verspiegelung nicht beleuchteter Spiegel, Sicherheitsrückseiten und Rahmenkonstruktionen (Aluminium, Stahl, Holz oder Spiegelschrankkorpus). Ausgeschlossen sind Transportschäden außerhalb der vereinbarten Incoterms, eigenmächtige Eingriffe in die Elektrik oder Schäden durch scheuernde Chemikalien.',
      },
      {
        title: 'Rückgabe-, Ersatz- und Gutschriftsrichtlinie',
        body: 'Nachgewiesene Fertigungsmängel innerhalb der Garantiezeit berechtigen zu kostenlosen Ersatzteilen bzw. Austauscheinheiten, einer Rückerstattung oder einer Gutschrift für Ihre nächste Bestellung. Senden Sie Ihre Reklamation mit Bestellnummer, Modellcode und Foto-/Videonachweis an sales@bolenmirror.com.',
      },
      {
        title: 'Ersatzteile',
        body: 'Vereinbarte Verschleiß- und Elektronik-Ersatzteile liegen Großlieferungen bei, um eine schnelle Wartung und Instandhaltung im Projektbetrieb zu unterstützen.',
      },
      {
        title: 'Lebenslanger technischer Support',
        body: 'Wir bieten technischen Support über die gesamte Lebensdauer unserer Produkte hinweg, einschließlich Unterstützung bei Anschlussplänen, Montage, Fehlersuche und Wartung. Für technischen Support kontaktieren Sie uns unter sales@bolenmirror.com.',
      },
      {
        title: 'Geistiges Eigentum',
        body: 'Der Name BOLEN, das Website-Design, Texte, Zeichnungen, Bilder, Videos und Produktunterlagen sind Eigentum der Jiaxing Chengtai Mirror Co., Ltd. oder an diese lizenziert. Vom Käufer bereitgestellte OEM-Marken und Konstruktionszeichnungen verbleiben im Eigentum des jeweiligen Käufers.',
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
        'Termini commerciali e garanzia unificata BOLEN Mirror: 3 anni di garanzia su illuminazione LED, driver, sensori touch e componenti elettrici; 2 anni su argentatura, retro e telai non LED.',
    },
    kicker: 'Note legali',
    heading: 'Termini e Condizioni',
    lastUpdated: 'Ultimo aggiornamento: 18 novembre 2026',
    intro:
      'I presenti termini disciplinano l’utilizzo del sito web BOLEN Mirror, gestito da Jiaxing Chengtai Mirror Co., Ltd. (No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, Cina), e descrivono le nostre condizioni di preventivo B2B, la politica di garanzia unificata e l’assistenza post-vendita. Utilizzando questo sito web, l’utente accetta i presenti termini.',
    contactHeading: 'Contatti',
    contactLead: 'Per qualsiasi domanda relativa ai presenti termini o per richieste di garanzia, contattaci all’indirizzo',
    sections: [
      {
        title: 'Utilizzo del sito web',
        body: 'È consentito utilizzare questo sito web per conoscere i prodotti e le capacità produttive BOLEN e per contattarci in merito a forniture commerciali B2B. Non è consentito fare un uso improprio del sito, interferire con il suo funzionamento o utilizzarne i contenuti per scopi illeciti.',
      },
      {
        title: 'Informazioni sui prodotti e preventivi',
        body: 'Immagini dei prodotti, specifiche tecniche, fasce di prezzo indicative e riferimenti alle certificazioni sono forniti a scopo orientativo e possono variare senza preavviso. I contenuti del sito non costituiscono un’offerta vincolante. Prezzi definitivi, quantitativi minimi d’ordine (MOQ), tempi di produzione, certificazioni per mercato e condizioni commerciali vengono confermati in un preventivo scritto o in un contratto.',
      },
      {
        title: 'Politica di garanzia unificata sui prodotti',
        body: 'BOLEN applica una garanzia di fabbrica unificata dalla data di spedizione in normali condizioni di installazione e uso interno: (1) 3 anni di garanzia su strisce luminose LED, driver di alimentazione, sensori touch, tappetini riscaldanti antiappannamento e componenti elettrici/elettronici; e (2) 2 anni di garanzia su argentatura dello specchio non LED, pellicola posteriore di sicurezza e telai strutturali (alluminio, acciaio, legno o scocche di armadietti). Sono esclusi danni da movimentazione impropria fuori dagli Incoterms concordati, modifiche elettriche non autorizzate o detergenti chimici abrasivi.',
      },
      {
        title: 'Politica di reso, sostituzione e credito d’ordine',
        body: 'I prodotti con difetti di fabbricazione accertati entro il periodo di garanzia danno diritto a parti o unità sostitutive gratuite, rimborso o credito utilizzabile per il prossimo ordine. Per avviare una pratica, scrivi a sales@bolenmirror.com indicando riferimento d’ordine, codice modello e documentazione fotografica o video.',
      },
      {
        title: 'Parti di ricambio',
        body: 'Parti di ricambio essenziali concordate sono incluse nelle spedizioni all’ingrosso per agevolare la manutenzione rapida in cantiere e le eventuali riparazioni.',
      },
      {
        title: 'Supporto tecnico a vita',
        body: 'Forniamo supporto tecnico per l’intero ciclo di vita dei nostri prodotti, inclusa assistenza su schemi elettrici, installazione, risoluzione dei problemi e manutenzione. Contattaci all’indirizzo sales@bolenmirror.com per ricevere supporto tecnico.',
      },
      {
        title: 'Proprietà intellettuale',
        body: 'Il marchio BOLEN, il design del sito web, i testi, i disegni tecnici, le immagini, i video e la documentazione di prodotto sono di proprietà di Jiaxing Chengtai Mirror Co., Ltd. o concessi in licenza. I marchi e i disegni OEM forniti dal committente restano di proprietà esclusiva del committente stesso.',
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
