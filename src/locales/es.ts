export const es = {
  translation: {
    // Page-level <title>/<meta description> for the four static routes.
    // scripts/prerender-static.ts reads these same values, so the tags baked
    // into the static HTML and the tags react-helmet-async writes on mount
    // cannot drift. Previously the pages passed hardcoded English, which
    // overwrote the correctly-localized prerendered meta on 5 locales.
    seo: {
      homeTitle: "BOLEN Mirror | Fabricante de Espejos LED y Fábrica OEM de Espejos Inteligentes",
      homeDesc: "BOLEN Mirror es un fabricante líder de espejos LED especializado en espejos LED OEM, espejos inteligentes, espejos de tocador y espejos de baño para marcas globales.",
      catalogTitle: "Catálogo de Productos de Espejos LED | Fabricante BOLEN Mirror",
      catalogDesc: "Explore nuestra amplia gama de espejos LED OEM, espejos inteligentes, espejos de tocador y espejos de baño de un fabricante líder de espejos LED. Fabricación de alta calidad para marcas globales.",
      categoryTitle: "{{category}} | Fabricante BOLEN Mirror",
      categoryDesc: "Explore {{category}} de BOLEN para mayoristas OEM/ODM. Espejos LED, de tocador y de baño de fábrica para marcas globales y proyectos hoteleros.",
      storyTitle: "Nuestra Historia | Fabricante de Espejos LED BOLEN",
      storyDesc: "Conozca la historia y la capacidad de fabricación de BOLEN (Jiaxing Chengtai Mirror Co., Ltd.), fabricante de espejos LED e inteligentes OEM fundado en 2005.",
      rfqTitle: "Solicitud de Cotización | Fabricante de Espejos LED BOLEN",
      rfqDesc: "Contacte a BOLEN, un fabricante líder de espejos LED, para consultas OEM/ODM, fabricación de espejos personalizados y pedidos al por mayor."
    },
    navbar: {
      home: "Inicio",
      catalog: "Catálogo",
      ourStory: "Nuestra Historia",
      blog: "Perspectivas",
      videos: "Videos",
      adminDashboard: "Panel de Administración",
      logout: "Cerrar sesión",
      employeeLogin: "Acceso Empleados"
    },
    footer: {
      description: "Fabricante y exportador de espejos premium. Suministramos espejos de tocador modernos y de alta calidad a empresas de todo el mundo.",
      contact: "Contacto",
      quickLinks: "Enlaces rápidos",
      rights: "Todos los derechos reservados."
    },
    accessibility: {
      skipToContent: "Saltar al contenido"
    },
    aiReceptionist: {
      title: "Asistente IA de BOLEN",
      available: "Disponible",
      subtitle: "Selección de productos y cotizaciones",
      closeLabel: "Cerrar el asistente de IA",
      greeting: "¡Hola! Soy el asistente de IA de BOLEN para la selección de productos y las cotizaciones. Puedo ayudarte con productos, cantidades mínimas, personalización, certificaciones y plazos de entrega.",
      quickQuestionsLabel: "Preguntas sugeridas",
      quickQuestions: "Preguntas rápidas",
      quickProduct: "¿Qué espejo es adecuado para mi proyecto?",
      quickMoq: "¿Cuál es la cantidad mínima de pedido?",
      quickCustomization: "¿Qué opciones puedo personalizar?",
      quickLeadTime: "¿Cuáles son los plazos para muestras y producción?",
      youLabel: "Tú",
      assistantLabel: "Asistente de IA",
      thinking: "Pensando…",
      timeoutError: "La respuesta está tardando demasiado. Inténtalo de nuevo.",
      error: "No he podido responder en este momento. Inténtalo de nuevo.",
      retry: "Reintentar",
      humanCta: "Solicitar un presupuesto a nuestro equipo comercial",
      inputLabel: "Escribe al asistente de IA",
      placeholder: "Pregunta sobre productos, cantidades mínimas o personalización…",
      sendLabel: "Enviar mensaje",
      emailInvalid: "Introduce una dirección de correo válida.",
      emailConsentRequired: "Confirma que podemos usar tu correo para responder a esta consulta.",
      emailTimeoutError: "Se tardó demasiado en guardar tu correo. Inténtalo de nuevo.",
      emailSubmitError: "No pudimos guardar tu correo. Inténtalo de nuevo.",
      emailGateTitle: "Continuar la conversación",
      emailGateDescription: "Ya recibiste la primera respuesta de la IA. Introduce tu correo para continuar.",
      emailGateDescriptionWithLimit: "Ya recibiste la primera respuesta de la IA. Introduce tu correo para continuar, con hasta {{maxTurns}} preguntas en esta sesión.",
      emailLabel: "Correo electrónico",
      emailCompactPlaceholder: "Correo de trabajo para continuar",
      emailPlaceholder: "tu@empresa.com",
      emailConsentCompact: "Acepto el seguimiento por correo y vincularlo a este chat durante un máximo de 90 días.",
      emailConsent: "Acepto que BOLEN use este correo para dar seguimiento a mi consulta y lo asocie con este chat durante un máximo de 90 días.",
      emailSubmitting: "Guardando…",
      emailContinueShort: "Continuar",
      emailContinue: "Continuar con correo",
      turnLimitReached: "Has alcanzado el límite de preguntas de IA para esta sesión. Nuestro equipo comercial puede seguir ayudándote.",
      turnLimitTitle: "Límite de preguntas alcanzado",
      turnLimitDescription: "Contacta con nuestro equipo comercial para continuar.",
      turnLimitDescriptionWithLimit: "Esta sesión permite hasta {{maxTurns}} preguntas de IA. Contacta con ventas para obtener más ayuda.",
      turnUsage: "Preguntas de IA utilizadas: {{completedTurns}} de {{maxTurns}}.",
      privacyNote: "Guardamos una copia redactada automáticamente de este chat durante un máximo de 90 días. No escribas datos de contacto, identidad, pago o cuenta en el chat. El correo enviado mediante el formulario separado se guarda con tu consentimiento y solo es visible para administradores autorizados.",
      privacyNoteCompact: "El chat redactado se guarda hasta 90 días. No introduzcas datos sensibles.",
      privacyContact: "Solicitud de privacidad",
      openLabel: "Abrir el asistente de IA de BOLEN",
      buttonText: "Preguntar a la IA"
    },
    ourStoryPage: {
      title: "Nuestra Historia",
      subtitle: "Jiaxing Chengtai Mirror Co., Ltd. (BOLEN)",
      hero: {
        kicker: "Fabricación de espejos LED en Jiaxing desde 2005",
        titleLine1: "Fabricados aquí.",
        titleLine2: "Confianza más allá de nuestras fronteras.",
        description: "Desde la confirmación de los requisitos hasta el embalaje para el envío, BOLEN integra el desarrollo de espejos a medida, la producción, la inspección y la preparación de marca propia en nuestra planta de Jiaxing.",
        tourCta: "Visitar la fábrica",
        factsCta: "Ver datos de la empresa",
        city: "Jiaxing, China",
        facilitySuffix: "m² de instalaciones de producción",
        productsSuffix: "productos en el catálogo actualizado"
      },
      chapters: {
        company: "Empresa",
        factory: "Fábrica",
        making: "Fabricación",
        quality: "Calidad",
        partnership: "Colaboración"
      },
      company: {
        eyebrow: "La empresa de un vistazo",
        titleLine1: "Un fabricante especializado en espejos.",
        titleLine2: "Preparado para colaboraciones de producción duraderas.",
        description: "Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) se fundó en 2005. En la actualidad, más de 200 especialistas trabajan en una planta de producción de 46.800 m² en Jiaxing y respaldan programas de espejos a medida desde la especificación hasta el envío.",
        foundedLabel: "Fundación",
        foundedNote: "En actividad desde 2005.",
        facilityLabel: "Superficie de producción",
        facilityNote: "46.800 m² en Jiaxing.",
        teamLabel: "Especialistas",
        teamNote: "Más de 200 personas en las áreas de producción y apoyo.",
        catalogLabel: "Catálogo actualizado",
        catalogNote: "El recuento actual de productos procede de la base de datos del sitio web.",
        snapshotLabel: "Instantánea de datos",
        snapshotNote: "Los recuentos actuales del catálogo y del contenido multimedia se actualizan desde la base de datos del sitio web."
      },
      process: {
        eyebrow: "De los requisitos al envío",
        titleLine1: "Un proceso conectado.",
        titleLine2: "Seis etapas con responsables definidos.",
        description: "Cada programa sigue una secuencia definida para mantener visibles los requisitos, las aprobaciones, los controles de producción, el embalaje y los detalles de entrega.",
        steps: {
          brief: {
            label: "01 · Requisitos",
            title: "Los requisitos son el punto de partida",
            description: "Comenzamos por aclarar qué debe hacer el espejo, dónde se venderá o instalará y cómo debe entregarse el pedido.",
            check1: "Uso previsto, mercado de destino y volumen del pedido",
            check2: "Tamaño, forma, funciones y acabado deseados",
            check3: "Plazos y necesidades de embalaje y documentación"
          },
          specification: {
            label: "02 · Especificación",
            title: "Diseño a medida confirmado",
            description: "Los requisitos acordados se convierten en una especificación lista para producción antes de iniciar la fabricación.",
            check1: "Planos, dimensiones, tolerancias y detalles de montaje",
            check2: "Opciones de iluminación, electricidad, materiales y controles",
            check3: "Aprobación de muestras y confirmación documentada de cambios"
          },
          manufacturing: {
            label: "03 · Fabricación",
            title: "Fabricación de precisión",
            description: "El vidrio, los marcos, la iluminación, los componentes eléctricos y las funciones inteligentes se integran mediante etapas de producción coordinadas.",
            check1: "Corte del vidrio, acabado de cantos y preparación de superficies",
            check2: "Integración de marcos, LED, componentes eléctricos y funciones",
            check3: "Montaje controlado conforme a la especificación confirmada"
          },
          inspection: {
            label: "04 · Inspección",
            title: "Inspección en puntos de control clave",
            description: "Antes del embalaje, se revisan la apariencia, el funcionamiento y la calidad de fabricación conforme a los requisitos aprobados.",
            check1: "Acabado visible, superficie del espejo, dimensiones y ajuste",
            check2: "Iluminación, controles, función antivaho y demás funciones especificadas",
            check3: "Detalles de montaje, accesorios y uniformidad del pedido"
          },
          packaging: {
            label: "05 · Embalaje",
            title: "Embalaje de marca propia",
            description: "Los detalles del embalaje se preparan de acuerdo con el producto, la marca y los requisitos de entrega confirmados para el pedido.",
            check1: "Etiquetas de marca, manuales, accesorios e insertos",
            check2: "Materiales protectores adecuados para el espejo y la caja",
            check3: "Verificación de la información de la caja y las marcas de envío"
          },
          logistics: {
            label: "06 · Logística",
            title: "Envío y logística",
            description: "Las cantidades finales, la información de embalaje y los detalles de expedición se coordinan antes de que el pedido salga de la planta.",
            check1: "Confirmación final de cantidades y palés",
            check2: "Coordinación de los documentos de envío del pedido",
            check3: "Entrega a transporte y actualizaciones del envío"
          }
        }
      },
      gallery: {
        eyebrow: "Dentro de la fábrica",
        title: "Trabajo, equipos y personas, de cerca.",
        description: "Explore imágenes actuales de la fábrica gestionadas desde la base de datos del sitio web. Cuando están disponibles, los pies de foto identifican el trabajo mostrado.",
        previous: "Imagen anterior de la fábrica",
        next: "Imagen siguiente de la fábrica",
        selectImage: "Seleccionar imagen de la fábrica",
        activeImage: "Imagen actual de la fábrica"
      },
      film: {
        eyebrow: "Vídeo de la fábrica",
        title: "Vea el proceso en movimiento.",
        description: "Vea imágenes publicadas de la fábrica y los productos seleccionadas de la videoteca del sitio web.",
        play: "Reproducir el vídeo de la fábrica",
        watchFilm: "Ver el vídeo de la fábrica",
        allVideos: "Ver todos los vídeos",
        videoCountSuffix: "vídeos publicados"
      },
      quality: {
        eyebrow: "Calidad y adecuación al mercado",
        titleLine1: "Pruebas antes que afirmaciones.",
        titleLine2: "Alcance confirmado para cada pedido.",
        description: "Los registros de inspección y la documentación de producto disponible ayudan a los compradores a evaluar el modelo adecuado para el mercado previsto.",
        documentsLabel: "Documentos y controles",
        scopeNote: "La cobertura de certificaciones y documentos varía según el modelo y el mercado de destino, y se confirma durante la cotización."
      },
      partnership: {
        eyebrow: "Inicie un proyecto",
        titleLine1: "Comparta sus requisitos.",
        titleLine2: "Definiremos el siguiente paso.",
        description: "Indique el producto, el volumen, el mercado de destino y los plazos que tiene en mente. Nuestro equipo revisará los requisitos y responderá con los puntos necesarios para avanzar.",
        primaryCta: "Solicitar cotización",
        secondaryCta: "Explorar el catálogo",
        emailLabel: "Correo electrónico",
        phoneLabel: "Teléfono"
      },
      accessibility: {
        chapterNavigation: "Navegación por capítulos de la historia",
        processTabs: "Etapas del proceso de fabricación",
        processPanel: "Detalles del proceso de fabricación",
        factoryGallery: "Galería de imágenes de la fábrica"
      }
    },
    home: {
      companyName: "Jiaxing Chengtai Mirror Co., Ltd.",
      heroKicker: "Fabricante de espejos LED · Socio OEM/ODM",
      heroTitle1: "Espejos de alta gama,",
      heroTitle2: "hechos a medida para su marca.",
      heroDesc: "<1>BOLEN</1> ayuda a marcas de todo el mundo a llevar al mercado colecciones de espejos con identidad propia. Desde el diseño y la personalización hasta la producción con rigurosos controles de calidad y la entrega en todo el mundo, hacemos que la fabricación de alta gama sea sencilla, fiable y escalable.",
      heroPrimaryCta: "Solicitar precio y MOQ",
      heroSecondaryCta: "Explore nuestros productos",
      stats: {
        sqMeters: "Planta de producción",
        artisans: "Profesionales especializados",
        styles: "Diseños de espejos",
        global: "Entrega mundial"
      },
      about: {
        heritage: "Nuestra Herencia",
        title1: "Alcance Global:",
        title2: "De Shanghái al Mundo",
        desc1: "Con sede en Jiaxing, Zhejiang, China —a solo 60 kilómetros de Shanghái—, hemos consolidado una sólida presencia global, con mercados principales en Europa (España, los Países Bajos, Noruega, Dinamarca, el Reino Unido y Rumanía), Norteamérica y Australia.",
        desc2: "Operamos dos sedes empresariales y dos plantas de producción de última generación. Nuestra dedicada fuerza laboral gestiona múltiples líneas de producción de espejos LED y de prueba, junto con talleres especializados personalizados, todo en estricto cumplimiento de las normas de gestión de calidad ISO 9001.",
        backedBy: "Respaldado por más de 200 profesionales",
        quote: "\"La Calidad Primero, Los Clientes Primero\"",
        corePrinciple: "Nuestro Principio Fundamental"
      },
      collections: {
        subtitle: "Colecciones",
        title: "Versátil y Personalizado",
        desc: "Fabricamos espejos LED, espejos de baño, espejos de vestidor y armarios con espejo, ofreciendo miles de estilos y soluciones totalmente a medida.",
        viewAll: "Ver Todos los Productos",
        smart: {
          tag: "Insignia",
          title: "Espejos Inteligentes y LED",
          desc: "Espejos de baño retroiluminados con interruptores táctiles, función antivaho y altavoces Bluetooth.",
          explore: "Explorar Categoría"
        },
        vanity: {
          title: "Decorativos y de Tocador",
          desc: "Espejos de tocador de grado hotelero con controles de sensor y aumento.",
          explore: "Explorar"
        },
        oem: {
          title: "Servicios OEM / ODM",
          desc: "Personalice tamaño, material, función, logotipo y embalaje según las necesidades del cliente.",
          partner: "Asóciese con Nosotros"
        }
      },
      certificates: {
        subtitle: "Nuestras Cualificaciones",
        title: "Certificaciones Globales"
      },
      factoryShowcase: {
        subtitle: "Dentro de la Fábrica",
        title: "Donde Nace Cada Espejo",
        desc: "Un recorrido por nuestra planta de 46.800 m² en Jiaxing: producción verticalmente integrada de espejos LED, inteligentes, de tocador y de baño, desde el vidrio crudo hasta el palé listo para enviar.",
        empty: "Fotos de la fábrica próximamente."
      },
      featuredVideo: {
        subtitle: "Video Destacado",
        nowPlaying: "Reproduciendo",
        title: "Vea Nuestros Espejos en Movimiento",
        desc: "Un clic para entrar en la planta: vea cómo se fabrican, acaban y prueban los espejos LED, inteligentes y de tocador de BOLEN antes de enviarlos.",
        watch: "Ver el video completo",
        viewAll: "Todos los videos",
        playAria: "Reproducir video: {{title}}",
        pauseAria: "Pausar el video de fondo",
        soundOn: "Activar el sonido",
        soundOff: "Silenciar el video"
      },
      advantage: {
        subtitle: "La Ventaja BOLEN",
        title: "Ventaja de Fabricación",
        desc: "Veintiún años de producción verticalmente integrada, una planta de 46.800 m² y una ubicación logísticamente privilegiada cerca de los puertos de Shanghái y Ningbo.",
        features: {
          f1: { title: "Capacidad de Fabricación Demostrada", desc: "Con 21 años de trayectoria, nuestra planta de 46.800 m² cuenta con más de 200 trabajadores cualificados, garantizando una cadena de suministro estable y plazos de entrega fiables." },
          f2: { title: "Ubicación Estratégica", desc: "Situados cerca de los puertos de Shanghái y Ningbo, disfrutamos de una ubicación privilegiada que asegura una logística cómoda y eficiente." },
          f3: { title: "Fábrica Directa y Rentable", desc: "Como fábrica directa, eliminamos los costes de intermediarios para ofrecer precios altamente competitivos sin comprometer la calidad, asegurando el mejor valor para su negocio." }
        }
      },
      manufacturingProcess: {
        subtitle: "Del Brief al Palé",
        title: "Proceso de Fabricación",
        desc: "Seis fases estrechamente controladas llevan cada pedido de la especificación al envío.",
        steps: {
          s1: { title: "Análisis de Requisitos", desc: "Soluciones a medida según su visión específica y las necesidades del mercado." },
          s2: { title: "Diseño Personalizado", desc: "Confirmamos cada detalle antes de la producción, asegurando que el producto final cumpla sus expectativas." },
          s3: { title: "Fabricación de Precisión", desc: "Integramos líneas automatizadas con precisión manual para una calidad y eficiencia óptimas." },
          s4: { title: "Inspección de Calidad al 100%", desc: "Controles de calidad estrictos sobre la apariencia, función y artesanía del espejo." },
          s5: { title: "Embalaje Personalizado", desc: "Marca totalmente personalizable para impulsar su competitividad en el mercado." },
          s6: { title: "Plazo Estable", desc: "Planificación fiable y logística eficiente para garantizar la entrega a tiempo." }
        }
      },
      whyUs: {
        title1: "¿Por qué Asociarse con",
        title2: "Bolen?",
        features: [
          { title: "Acceso Global y Calidad Certificada" },
          { title: "Fábrica Directa y Rentable" },
          { title: "Control de Calidad Riguroso y Garantía" },
          { title: "Personalización Integral" }
        ],
        paragraphs: [
          "Hemos establecido alianzas profundas en Europa (NL, RO, UK, ES, NO, DK), Oriente Medio, Norteamérica, Australia y Sudamérica. Nuestros productos cumplen plenamente con los estándares internacionales, contando con certificaciones CE, CB, RoHS, IP44, SAA, entre otras.",
          "Como fabricante directo, ofrecemos precios altamente competitivos. Nos comprometemos a entregar una calidad premium que se ajuste perfectamente a sus requisitos de presupuesto.",
          "Nuestro sistema de aseguramiento de la calidad está a la altura de nuestro compromiso postventa. Cada producto pasa por una inspección al 100% antes del envío, respaldada por una garantía integral de 2 años en componentes electrónicos.",
          "Desde el cristal del espejo hasta el embalaje, ofrecemos servicios integrales de personalización OEM/ODM diseñados para ayudarle a ampliar su alcance de mercado y construir su marca."
        ]
      },
      cta: {
        title: "¿Listo para Elevar su Espacio?",
        desc: "Contáctenos hoy para discutir sus requisitos personalizados o explore nuestro extenso catálogo de espejos premium.",
        viewCatalog: "Ver Catálogo",
        contactSales: "Contactar Ventas"
      }
    },
    products: {
      catalog: "Catálogo de Productos",
      kicker: "OEM · ODM · Precio de fábrica",
      desc: "Explore nuestra extensa colección de espejos premium, con tecnología LED inteligente, elegantes diseños de tocador y opciones personalizables.",
      noProducts: "No se encontraron productos que coincidan con sus criterios.",
      emptyTitle: "No se encontraron productos",
      emptySearch: "No encontramos nada que coincida con “{{query}}”. Pruebe a ajustar la búsqueda o los filtros.",
      clearFilters: "Borrar todos los filtros",
      viewDetails: "Ver Detalles",
      searchLabel: "Buscar productos",
      searchPlaceholder: "Buscar productos...",
      resultCount: "{{count}} productos encontrados",
      showMore: "Mostrar más",
      allCategories: "Todas las Categorías",
      categoriesNav: "Categorías de productos",
      categoryIntro: "{{category}} de fábrica para proyectos OEM/ODM y mayoristas: tamaños, iluminación y acabados a medida desde Jiaxing.",
      categories: {
        "New Arrival": "Novedades",
        "Hot Sale": "En Oferta",
        "Led Lighted Mirror": "Espejo con Luz LED",
        "Bathroom Mirror without led": "Espejo de Baño sin LED",
        "Full Length Dressing Mirror": "Espejo de Cuerpo Entero",
        "Irregular Mirror": "Espejo Irregular"
      },
      priceRange: "Rango de Precios",
      priceRangeLabel: "Rango orientativo de fábrica",
      priceQualifier: "El precio final depende de la cantidad y las especificaciones",
      msrp: "Precio de Venta Sugerido"
    },
    productDetail: {
      backToCatalog: "Volver al Catálogo",
      specifications: "Especificaciones",
      productDetails: "Detalles del Producto",
      requestQuote: "Solicitar Presupuesto (RFQ)",
      companyName: "Empresa / Nombre de Contacto",
      email: "Correo Electrónico",
      inquiryDetails: "Detalles de la Consulta (Cantidad, Personalización, etc.)",
      submitRfq: "Enviar RFQ",
      submitting: "Enviando...",
      rfqSuccess: "¡RFQ enviado con éxito! Nos pondremos en contacto con usted pronto.",
      rfqError: "Error al enviar RFQ. Por favor, inténtelo de nuevo.",
      relatedVideos: "Videos relacionados",
      description: "Descripción",
      buyerSummary: "Espejos directos de fábrica para proyectos mayoristas y OEM/ODM. El precio se calcula según sus especificaciones; consulte MOQ, muestras, tamaños y funciones personalizados, certificaciones y plazo de producción.",
      factoryQuoteCta: "Solicitar precio de fábrica",
      quoteBasis: "Precio según especificación · Consulte MOQ, muestras y plazo de producción.",
      productReference: "Referencia del producto",
      rfqIntro: "Indíquenos la cantidad y las especificaciones. Confirmaremos precio de fábrica, MOQ, opciones de muestra y plazo de producción en un máximo de 24 horas.",
      successTitle: "¡Consulta enviada correctamente!",
      sendAnother: "Enviar otra consulta",
      mobileFactoryPricing: "Precio de fábrica",
      mobileQuoteMeta: "MOQ · Muestras · Plazo",
      mobileQuoteLabel: "Acceso rápido al precio de fábrica",
      inquiryPlaceholder: "Me interesa {{title}}. Cotice para la cantidad estimada e incluya MOQ, opciones de muestra y plazo de producción.",
      notFound: "Producto no encontrado.",
      previousImage: "Imagen anterior",
      nextImage: "Imagen siguiente",
      galleryView: "{{title}} — vista {{index}}",
      premiumQuality: "Calidad superior",
      globalShipping: "Envío mundial",
      fastTurnaround: "Producción ágil",
      oemAvailable: "OEM/ODM disponible",
      keySpecs: "Datos clave",
      viewAllSpecs: "Ver especificaciones completas",
      quotingFor: "Solicitud de cotización para",
      brandSuffix: "| BOLEN Mirror",
      descTemplate: "{title} de primera calidad, fabricado por BOLEN Mirror (Jiaxing Chengtai Mirror Co., Ltd.) — espejos LED, inteligentes, de tocador y de baño OEM/ODM. Solicite una cotización para precios al por mayor."
    },
    rfq: {
      intro: "¿Busca precios al por mayor, pedidos personalizados o servicios OEM/ODM? Envíenos su consulta y nuestro equipo comercial responderá en un máximo de 24 horas.",
      quoteIncludesTitle: "Su cotización incluirá",
      quoteIncludesMoq: "MOQ y base del precio unitario",
      quoteIncludesLeadTime: "Plazos de muestra y producción",
      quoteIncludesOptions: "Opciones de personalización y conformidad para el mercado de destino",
      prefillMessage: "Me interesa {{reference}}. Cotice para la cantidad estimada e incluya MOQ, base del precio unitario, plazos de muestra y producción, personalización y opciones de conformidad.",
      contactInformation: "Información de contacto",
      emailUs: "Enviar correo",
      callUs: "Llamar",
      visitUs: "Visítenos",
      successTitle: "¡Consulta enviada correctamente!",
      sendAnother: "Enviar otra consulta",
      productInterest: "Producto de interés (opcional)",
      productPlaceholder: "p. ej., espejos LED de baño o espejos de tocador personalizados",
      messagePlaceholder: "Incluya cantidad estimada, dimensiones, funciones, mercado de destino y necesidades de personalización.",
      backupTitle: "¿No puede enviar el formulario?",
      backupText: "Escríbanos o llámenos directamente y le ayudaremos con su solicitud.",
      emailDirectly: "Enviar correo",
      callDirectly: "Llamar",
      emailSubject: "Consulta sobre espejos BOLEN",
      emailSubjectProduct: "Solicitud de cotización: {{reference}}",
      errors: {
        nameRequired: "El nombre es obligatorio",
        emailRequired: "El correo electrónico es obligatorio",
        invalidEmail: "Dirección de correo no válida",
        messageRequired: "Los detalles de la consulta son obligatorios"
      }
    },
    blog: {
      metaTitle: "Perspectivas BOLEN | Compra y Fabricación de Espejos LED",
      metaDescription: "Guías prácticas de compra, explicaciones técnicas y perspectivas de fabricación OEM/ODM para espejos LED, inteligentes y a medida.",
      schemaName: "Perspectivas de BOLEN Mirror",
      kicker: "Orientación práctica desde la fábrica",
      titleLead: "Perspectivas para la compra de",
      titleAccent: "espejos",
      intro: "Consejos de compra, explicaciones técnicas y conocimientos de fabricación para espejos LED, inteligentes y programas OEM/ODM.",
      featured: "Perspectiva destacada",
      readArticle: "Leer perspectiva",
      allPosts: "Todos",
      empty: "Aún no hay perspectivas publicadas. Vuelva pronto.",
      readingTime: "{{minutes}} min de lectura",
      ctaTitle: "¿Busca un espejo fabricado a su medida?",
      ctaDesc: "BOLEN fabrica espejos LED, inteligentes, de tocador y de baño para marcas globales: OEM y ODM, desde una fábrica verticalmente integrada.",
      ctaCatalog: "Explorar el catálogo",
      ctaQuote: "Solicitar presupuesto",
      related: "Más perspectivas",
      viewAll: "Ver todo",
      notFound: "Perspectiva no encontrada",
      notFoundDescription: "No se pudo encontrar la perspectiva de BOLEN solicitada.",
      backToJournal: "Volver a perspectivas",
      relatedProducts: "Productos de esta perspectiva",
      latestHeading: "Últimas perspectivas",
      latestIntro: "Filtre por tema o explore todas las guías publicadas.",
      filterLabel: "Filtrar perspectivas por tema",
      noMoreInTopic: "Aún no hay más perspectivas en esta vista.",
      nextStepTitle: "Convierta la información útil en una especificación lista para fábrica",
      nextStepDescription: "Compare rutas de fabricación y envíe medidas, cantidad, mercado y funciones requeridas para obtener una cotización precisa.",
      categories: {
        "Buying Guide": "Guía de compra",
        "Bolen Story": "Historia de BOLEN",
        "Technology": "Tecnología",
        "Manufacturing": "Fabricación",
        "Design": "Diseño"
      }
    },
    videos: {
      metaTitle: "Videos de espejos LED: demos, recorridos de fábrica e instalación | BOLEN",
      metaDescription: "Vea los videos de espejos LED de BOLEN: demostraciones de espejos inteligentes, recorridos por la fábrica de 46.800 m², control de calidad y guías de instalación de un fabricante OEM/ODM con 21 años de experiencia.",
      kicker: "Videoteca",
      titleLead: "Videos de espejos LED:",
      titleAccent: "demos de producto, recorridos de fábrica e instalación",
      intro: "Descubra cómo se fabrican, prueban e instalan los espejos LED, inteligentes, de tocador y de baño BOLEN: clips breves grabados en nuestra propia fábrica de Jiaxing que responden a sus dudas de compra antes de especificar un producto.",
      heroPrimaryCta: "Solicitar presupuesto",
      heroSecondaryCta: "Ver productos",
      stats: {
        videos: "Videos",
        topics: "Temas",
        runtime: "Minutos de metraje",
        updated: "Última actualización"
      },
      spotlightLabel: "Último video",
      watchNow: "Ver ahora",
      libraryHeading: "Todos los videos",
      libraryIntro: "Filtre por tema o busque en la videoteca.",
      resultsCount: "{{count}} videos",
      search: "Buscar videos...",
      searchLabel: "Buscar videos",
      clearSearch: "Borrar búsqueda",
      filterLabel: "Filtrar videos por tema",
      allVideos: "Todos los videos",
      clearFilters: "Quitar filtros",
      noResults: "Ningún video coincide con su búsqueda.",
      noResultsHint: "Pruebe otra palabra clave o quite los filtros.",
      empty: "Aún no hay videos publicados. Vuelva pronto.",
      cardLabel: "Video",
      latest: "Reciente",
      watchLabel: "Ver: {{title}}",
      playLabel: "Reproducir video: {{title}}",
      unavailable: "Este video no está disponible temporalmente.",
      duration: "Duración",
      tagsLabel: "Temas",
      upNext: "A continuación",
      share: {
        label: "Compartir",
        copy: "Copiar enlace",
        copied: "Enlace copiado",
        copyPrompt: "Copie este enlace",
        linkedin: "Compartir en LinkedIn",
        whatsapp: "Compartir en WhatsApp",
        email: "Compartir por correo",
        more: "Más opciones para compartir"
      },
      notFound: "Video no encontrado",
      notFoundDescription: "No se pudo encontrar el video de BOLEN solicitado.",
      backToVideos: "Volver a videos",
      sidebarKicker: "Especifique este espejo",
      ctaTitle: "¿Necesita este espejo para su línea?",
      ctaDesc: "Envíe el video o la referencia del producto a BOLEN y nuestro equipo podrá cotizar opciones OEM/ODM, embalaje y plazo de entrega.",
      ctaQuote: "Solicitar presupuesto",
      ctaCatalog: "Ver productos",
      relatedProductsKicker: "Del catálogo",
      relatedProducts: "Productos en este video",
      relatedVideos: "Más videos",
      viewAll: "Ver todo",
      guide: {
        kicker: "Grabado en nuestra propia fábrica",
        heading: "Qué cubre la videoteca",
        intro: "Cada clip se filma con unidades de producción BOLEN y dentro de la planta de 46.800 m² de Jiaxing, sin metraje de archivo: lo que ve es lo que se envía.",
        demos: {
          title: "Demostraciones de producto",
          desc: "Modos de color LED, regulación continua, antivaho, sensores táctiles y funciones inteligentes mostrados en unidades reales de producción, no en renders.",
          cta: "Ver demostraciones"
        },
        factory: {
          title: "Fábrica y control de calidad",
          desc: "Corte de vidrio, ensamblaje LED, pruebas IP44 y embalaje dentro de la planta de 46.800 m² de Jiaxing que envía su pedido.",
          cta: "Ver la fábrica"
        },
        install: {
          title: "Instalación y especificaciones",
          desc: "Detalles de montaje, cableado y manipulación que ayudan a instaladores, minoristas y compradores de proyectos a planificar.",
          cta: "Videos de instalación"
        }
      },
      closing: {
        title: "¿Ha visto un espejo que quiere especificar?",
        desc: "Envíenos el video o la referencia del producto. Respondemos con opciones OEM/ODM, MOQ, embalaje y plazo de entrega, y podemos grabar una demostración a medida de su especificación."
      },
      categories: {
        "Factory Tour": "Recorrido de fábrica",
        "Product Demo": "Demostración de producto",
        "Installation": "Instalación",
        "Smart Features": "Funciones inteligentes",
        "Technology": "Tecnología",
        "Quality Control": "Control de calidad"
      }
    },
    admin: {
      dashboard: {
        title: "Panel de Administración",
        addProduct: "Añadir Producto",
        tabs: {
          products: "Productos",
          rfqs: "Solicitudes (RFQ)",
          employees: "Empleados",
          settings: "Configuración"
        },
        products: {
          uncategorized: "Sin categoría",
          active: "Activo",
          inactive: "Inactivo",
          noProducts: "No se encontraron productos.",
          deleteConfirm: "¿Está seguro de que desea eliminar este producto?",
          deleteError: "Error al eliminar el producto."
        },
        rfqs: {
          new: "Nuevo",
          replyEmail: "Responder por Correo Electrónico",
          noRfqs: "Aún no se han recibido solicitudes (RFQ)."
        },
        employees: {
          status: "Estado:",
          approve: "Aprobar",
          reject: "Rechazar",
          noEmployees: "No se encontraron cuentas de empleados.",
          updateError: "Error al actualizar el estado del empleado.",
          roles: {
            admin: "ADMIN",
            pending: "PENDIENTE",
            rejected: "RECHAZADO"
          }
        },
        settings: {
          title: "Configuración del Sitio",
          heroBgLabel: "Imágenes Promocionales de la Página de Inicio",
          heroBgPlaceholder: "https://example.com/image.jpg",
          heroBgHelp: "Añada URLs de imágenes o suba imágenes. La primera imagen será la predeterminada si no se proporciona ninguna.",
          preview: "Vista previa:",
          save: "Guardar Configuración",
          saving: "Guardando...",
          saveSuccess: "¡Configuración guardada con éxito!",
          setupRequired: "Configuración de Base de Datos Requerida",
          setupDesc: "Para habilitar la configuración del sitio, ejecute el siguiente comando SQL en su Editor SQL de Supabase:",
          setupBtn: "He ejecutado el comando SQL",
          addImage: "Añadir Imagen",
          removeImage: "Eliminar"
        }
      },
      login: {
        title: "Portal de Empleados",
        subtitleRegister: "Cree una cuenta de empleado para solicitar acceso.",
        subtitleLogin: "Inicie sesión para gestionar el catálogo de productos y ver las solicitudes (RFQ).",
        pendingTitle: "¡Pendiente de Aprobación!",
        pendingDesc: "Su cuenta ({{email}}) está esperando la aprobación del administrador principal.",
        deniedTitle: "¡Acceso Denegado!",
        deniedDesc: "Su cuenta ({{email}}) no tiene privilegios de administrador.",
        email: "Dirección de correo electrónico",
        password: "Contraseña",
        registerBtn: "Registrar Cuenta",
        signInBtn: "Iniciar Sesión",
        quickLogin: "Acceso Rápido (Administrador Principal)",
        orContinueWith: "O continúe con",
        googleLogin: "Google (Administrador Principal)",
        alreadyHaveAccount: "¿Ya tiene una cuenta? Inicie sesión",
        needAccount: "¿Necesita una cuenta de empleado? Regístrese",
        errors: {
          loginFailed: "Ocurrió un error durante el inicio de sesión.",
          generalError: "Ocurrió un error."
        }
      },
      productForm: {
        backToDashboard: "Volver al Panel",
        supabaseSetupTitle: "Configuración de Supabase Requerida",
        supabaseSetupDesc: "Para habilitar la carga de imágenes, añada VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY a sus Variables de Entorno (o Secretos de AI Studio) y reconstruya la aplicación.",
        editProduct: "Editar Producto",
        addProduct: "Añadir Nuevo Producto",
        visibility: "Visibilidad",
        active: "Activo",
        inactive: "Inactivo",
        activeHelp: "Visible en el catálogo y en su URL de producto.",
        inactiveHelp: "Oculto del sitio público y sin publicar en su URL de producto.",
        productTitle: "Título del Producto",
        category: "Categoría",
        priceRange: "Rango de Precios",
        msrp: "PVPR",
        shortDesc: "Descripción Corta",
        longDetails: "Detalles Largos (Texto Enriquecido / HTML permitido)",
        images: "Imágenes",
        uploading: "Subiendo...",
        uploadImages: "Subir Imágenes",
        addUrl: "Añadir URL",
        specifications: "Especificaciones",
        addSpec: "Añadir Especificación",
        cancel: "Cancelar",
        saveProduct: "Guardar Producto",
        errors: {
          titleRequired: "El título es obligatorio",
          descRequired: "La descripción es obligatoria",
          urlRequired: "La URL es obligatoria"
        },
        placeholders: {
          specKey: "p. ej., Dimensiones",
          specValue: "p. ej., 24x36 pulgadas"
        },
        alerts: {
          supabaseNotConfigured: "Supabase no está configurado. Añada VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY a sus Variables de Entorno y reconstruya.",
          bucketNotFound: "No se encontró el bucket de almacenamiento \"product-images\". Créelo en su panel de Supabase y configúrelo como Público.",
          uploadFailed: "Error al subir imágenes: {{message}}",
          saveFailed: "Error al guardar el producto. Consulte la consola para más detalles."
        }
      }
    }
  }
};
