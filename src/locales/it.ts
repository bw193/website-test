export const it = {
  translation: {
    // Page-level <title>/<meta description> for the four static routes.
    // scripts/prerender-static.ts reads these same values, so the tags baked
    // into the static HTML and the tags react-helmet-async writes on mount
    // cannot drift. Previously the pages passed hardcoded English, which
    // overwrote the correctly-localized prerendered meta on 5 locales.
    seo: {
      homeTitle: "BOLEN Mirror | Produttore di Specchi LED e Fabbrica OEM di Specchi Smart",
      homeDesc: "BOLEN Mirror è un produttore leader di specchi LED specializzato in specchi LED OEM, specchi smart, specchi da toeletta e specchi da bagno per marchi globali.",
      catalogTitle: "Catalogo Prodotti Specchi LED | Produttore BOLEN Mirror",
      catalogDesc: "Esplora la nostra ampia gamma di specchi LED OEM, specchi smart, specchi da toeletta e specchi da bagno da un produttore leader di specchi LED. Produzione di alta qualità per marchi globali.",
      storyTitle: "La Nostra Storia | Produttore di Specchi LED BOLEN",
      storyDesc: "Scopri la storia e la capacità produttiva di BOLEN (Jiaxing Chengtai Mirror Co., Ltd.), produttore di specchi LED e smart OEM fondato nel 2005.",
      rfqTitle: "Richiesta di Preventivo | Produttore di Specchi LED BOLEN",
      rfqDesc: "Contatta BOLEN, un produttore leader di specchi LED, per richieste OEM/ODM, produzione personalizzata di specchi e ordini all'ingrosso."
    },
    navbar: {
      home: "Home",
      catalog: "Catalogo",
      ourStory: "La Nostra Storia",
      blog: "Blog",
      videos: "Video",
      adminDashboard: "Pannello di Controllo",
      logout: "Esci",
      employeeLogin: "Accesso Dipendenti"
    },
    footer: {
      description: "Produttore ed esportatore di specchi premium. Forniamo specchi da toeletta moderni e di alta qualità ad aziende in tutto il mondo.",
      contact: "Contatti",
      quickLinks: "Link rapidi",
      rights: "Tutti i diritti riservati."
    },
    accessibility: {
      skipToContent: "Vai al contenuto"
    },
    ourStoryPage: {
      title: "La Nostra Storia",
      subtitle: "Jiaxing Chengtai Mirror Co., Ltd.",
      paragraphs: [
        "Con oltre 20 anni di esperienza dedicata alla produzione di specchi dal 2005, Jiaxing Chengtai Mirror Co., Ltd. ha costruito una reputazione che va ben oltre qualsiasi singolo canale di vendita. Il nostro complesso produttivo di 46.800 metri quadrati, due stabilimenti indipendenti e un team di oltre 200 lavoratori qualificati ci offrono la capacità e la flessibilità per gestire ordini di praticamente qualsiasi entità, dai progetti boutique di interior design ai grandi sviluppi alberghieri e immobiliari.",
        "Gestiamo internamente l'intero processo produttivo. Dalla lavorazione del vetro grezzo e l'integrazione dei LED alla fabbricazione delle cornici e all'assemblaggio delle funzioni smart, ogni fase della produzione è gestita sotto un unico tetto e supervisionata da ispettori QA/QC dedicati. Questa integrazione verticale significa che controlliamo la qualità in ogni fase, eliminiamo i ritardi di terzi e manteniamo tempi di consegna competitivi.",
        "I nostri oltre 200 stili di prodotto in molteplici serie principali non sono modelli standard: rappresentano anni di iterazione progettuale ispirati sia dalle tendenze estetiche europee sia dai feedback reali degli acquirenti. Per i clienti che necessitano di qualcosa di unico, le nostre capacità OEM e ODM consentono la personalizzazione completa di dimensioni, forma, illuminazione, funzioni smart, materiali e branding.",
        "Supportati da certificazioni internazionali tra cui CE e RoHS, oltre a gradi IP e certificazioni di mercato specifici per prodotto, i nostri prodotti possono essere configurati per i requisiti di conformità di Europa, Nord America, Medio Oriente e altri mercati. Non ci limitiamo a produrre specchi: costruiamo partnership a lungo termine con importatori, distributori, interior designer e sviluppatori che esigono coerenza, precisione e un fornitore affidabile."
      ]
    },
    home: {
      companyName: "Jiaxing Chengtai Mirror Co., Ltd.",
      heroKicker: "Produttore di specchi LED · Partner OEM/ODM",
      heroTitle1: "Specchi di alta gamma,",
      heroTitle2: "realizzati su misura per il tuo brand.",
      heroDesc: "<1>BOLEN</1> aiuta brand di tutto il mondo a portare sul mercato collezioni di specchi dal carattere distintivo. Dalla progettazione e personalizzazione alla produzione con rigorosi controlli di qualità e alla consegna in tutto il mondo, rendiamo la produzione di alta gamma semplice, affidabile e scalabile.",
      heroPrimaryCta: "Richiedi prezzi e MOQ",
      heroSecondaryCta: "Scopri i prodotti",
      stats: {
        sqMeters: "Stabilimento produttivo",
        artisans: "Specialisti qualificati",
        styles: "Design di specchi",
        global: "Consegna globale"
      },
      about: {
        heritage: "Il Nostro Patrimonio",
        title1: "Portata Globale:",
        title2: "Da Shanghai al Mondo",
        desc1: "Con sede a Jiaxing, Zhejiang, Cina — a soli 60 chilometri da Shanghai — abbiamo consolidato una solida presenza globale, con mercati principali in Europa (Spagna, Paesi Bassi, Norvegia, Danimarca, Regno Unito e Romania), Nord America e Australia.",
        desc2: "Operiamo due sedi aziendali e due impianti di produzione all'avanguardia. La nostra forza lavoro dedicata gestisce molteplici linee di produzione di specchi a LED e fitting, oltre a laboratori specializzati su misura, il tutto nel rigoroso rispetto degli standard di gestione della qualità ISO 9001.",
        backedBy: "Supportato da oltre 200 professionisti dedicati",
        quote: "\"La Qualità Prima di Tutto, i Clienti Prima di Tutto\"",
        corePrinciple: "Il Nostro Principio Fondamentale"
      },
      collections: {
        subtitle: "Collezioni",
        title: "Versatile e Personalizzato",
        desc: "Produciamo specchi LED, specchi da bagno, specchi da toeletta e armadi a specchio, offrendo migliaia di stili e soluzioni completamente su misura.",
        viewAll: "Vedi Tutti i Prodotti",
        smart: {
          tag: "Ammiraglia",
          title: "Specchi Smart e LED",
          desc: "Specchi da bagno retroilluminati con interruttori touch, funzione antiappannamento e altoparlanti Bluetooth.",
          explore: "Esplora Categoria"
        },
        vanity: {
          title: "Decorativi e da Trucco",
          desc: "Specchi da trucco di livello alberghiero con controlli a sensore e ingrandimento.",
          explore: "Esplora"
        },
        oem: {
          title: "Servizi OEM / ODM",
          desc: "Personalizza dimensioni, materiale, funzione, logo e imballaggio in base alle esigenze del cliente.",
          partner: "Collabora con Noi"
        }
      },
      certificates: {
        subtitle: "Le Nostre Qualifiche",
        title: "Certificazioni Globali"
      },
      factoryShowcase: {
        subtitle: "Dentro la Fabbrica",
        title: "Dove Nasce Ogni Specchio",
        desc: "Uno sguardo dentro il nostro stabilimento di 46.800 m² a Jiaxing — produzione verticalmente integrata di specchi LED, smart, da toeletta e da bagno, dal vetro grezzo al pallet pronto per la spedizione.",
        empty: "Foto della fabbrica in arrivo."
      },
      featuredVideo: {
        subtitle: "Video in Evidenza",
        nowPlaying: "In riproduzione",
        title: "I Nostri Specchi in Movimento",
        desc: "Un clic per entrare in reparto: guarda come gli specchi LED, smart e da toeletta BOLEN vengono prodotti, rifiniti e testati prima della spedizione.",
        watch: "Guarda il video completo",
        viewAll: "Tutti i video",
        playAria: "Riproduci video: {{title}}",
        pauseAria: "Metti in pausa il video di sfondo",
        soundOn: "Attiva l'audio",
        soundOff: "Disattiva l'audio"
      },
      advantage: {
        subtitle: "Il Vantaggio BOLEN",
        title: "Vantaggio Produttivo",
        desc: "Ventuno anni di produzione verticalmente integrata, uno stabilimento di 46.800 m² e una posizione logisticamente privilegiata vicino ai porti di Shanghai e Ningbo.",
        features: {
          f1: { title: "Capacità Produttiva Comprovata", desc: "Fondata 21 anni fa, la nostra struttura di 46.800 m² impiega oltre 200 lavoratori qualificati, garantendo una catena di approvvigionamento stabile e tempi di consegna affidabili." },
          f2: { title: "Posizione Strategica", desc: "Situati vicino ai porti di Shanghai e Ningbo, godiamo di una posizione privilegiata che assicura una logistica comoda ed efficiente." },
          f3: { title: "Fabbrica Diretta ed Economicamente Vantaggiosa", desc: "Come fabbrica diretta, eliminiamo i costi degli intermediari per offrire prezzi altamente competitivi senza compromettere la qualità, garantendo il miglior valore per il tuo business." }
        }
      },
      manufacturingProcess: {
        subtitle: "Dal Brief al Pallet",
        title: "Processo Produttivo",
        desc: "Sei fasi rigorosamente controllate portano ogni ordine dalla specifica alla spedizione.",
        steps: {
          s1: { title: "Analisi dei Requisiti", desc: "Soluzioni su misura basate sulla tua visione specifica e sulle esigenze del mercato." },
          s2: { title: "Design Personalizzato", desc: "Conferma di ogni dettaglio prima della produzione, garantendo che il prodotto finale soddisfi le tue aspettative." },
          s3: { title: "Produzione di Precisione", desc: "Integrazione di linee automatizzate con precisione manuale per qualità ed efficienza ottimali." },
          s4: { title: "Ispezione Qualità al 100%", desc: "Controlli di qualità rigorosi su aspetto, funzione e artigianalità dello specchio." },
          s5: { title: "Imballaggio Personalizzato", desc: "Branding completamente personalizzabile per aumentare la tua competitività sul mercato." },
          s6: { title: "Tempi di Consegna Stabili", desc: "Pianificazione affidabile e logistica efficiente per garantire la consegna puntuale." }
        }
      },
      whyUs: {
        title1: "Perché Collaborare con",
        title2: "Bolen?",
        features: [
          { title: "Accesso Globale e Qualità Certificata" },
          { title: "Fabbrica Diretta ed Economicamente Vantaggiosa" },
          { title: "Controllo Qualità Rigoroso e Garanzia" },
          { title: "Personalizzazione Completa" }
        ],
        paragraphs: [
          "Abbiamo stabilito partnership solide in Europa (NL, RO, UK, ES, NO, DK), Medio Oriente, Nord America, Australia e Sud America. I nostri prodotti sono pienamente conformi agli standard internazionali, con certificazioni CE, CB, RoHS, IP44, SAA e altre.",
          "Come produttore diretto, offriamo prezzi altamente competitivi. Ci impegniamo a fornire una qualità premium perfettamente in linea con le tue esigenze di budget.",
          "Il nostro sistema di garanzia della qualità rispecchia il nostro impegno post-vendita. Ogni prodotto viene sottoposto a ispezione al 100% prima della spedizione, supportato da una garanzia completa di 2 anni sui componenti elettronici.",
          "Dal vetro dello specchio all'imballaggio, offriamo servizi di personalizzazione OEM/ODM end-to-end pensati per aiutarti ad ampliare la tua portata di mercato e costruire il tuo marchio."
        ]
      },
      cta: {
        title: "Pronto a Elevare il Tuo Spazio?",
        desc: "Contattaci oggi per discutere le tue esigenze personalizzate o sfoglia il nostro ampio catalogo di specchi premium.",
        viewCatalog: "Vedi Catalogo",
        contactSales: "Contatta le Vendite"
      }
    },
    products: {
      catalog: "Catalogo Prodotti",
      desc: "Sfoglia la nostra vasta collezione di specchi premium, con tecnologia LED intelligente, eleganti design da trucco e opzioni personalizzabili.",
      noProducts: "Nessun prodotto trovato corrispondente ai tuoi criteri.",
      viewDetails: "Vedi Dettagli",
      searchLabel: "Cerca prodotti",
      searchPlaceholder: "Cerca prodotti...",
      resultCount: "{{count}} prodotti trovati",
      showMore: "Mostra altro",
      allCategories: "Tutte le Categorie",
      categories: {
        "New Arrival": "Novità",
        "Hot Sale": "In Offerta",
        "Led Lighted Mirror": "Specchio con Luce LED",
        "Bathroom Mirror without led": "Specchio da Bagno senza LED",
        "Full Length Dressing Mirror": "Specchio a Figura Intera",
        "Irregular Mirror": "Specchio Irregolare"
      },
      priceRange: "Fascia di Prezzo",
      priceRangeLabel: "Fascia indicativa di fabbrica",
      priceQualifier: "Il prezzo finale dipende da quantità e specifiche",
      msrp: "Prezzo al Dettaglio Consigliato"
    },
    productDetail: {
      backToCatalog: "Torna al Catalogo",
      specifications: "Specifiche",
      productDetails: "Dettagli Prodotto",
      requestQuote: "Richiedi un Preventivo (RFQ)",
      companyName: "Azienda / Nome Contatto",
      email: "Indirizzo Email",
      inquiryDetails: "Dettagli Richiesta (Quantità, Personalizzazione, ecc.)",
      submitRfq: "Invia RFQ",
      submitting: "Invio in corso...",
      rfqSuccess: "RFQ inviata con successo! Ti contatteremo presto.",
      rfqError: "Impossibile inviare la RFQ. Riprova.",
      relatedVideos: "Video correlati",
      description: "Descrizione",
      buyerSummary: "Specchi diretti dalla fabbrica per progetti all'ingrosso e OEM/ODM. Il prezzo viene calcolato in base alle specifiche: chiedi MOQ, campioni, dimensioni e funzioni personalizzate, certificazioni e tempi di produzione.",
      factoryQuoteCta: "Richiedi prezzo di fabbrica",
      quoteBasis: "Prezzo su specifica · Chiedi MOQ, campioni e tempi di produzione.",
      productReference: "Riferimento prodotto",
      rfqIntro: "Indicaci quantità e specifiche richieste. Confermeremo prezzo di fabbrica, MOQ, opzioni campione e tempi di produzione entro 24 ore.",
      successTitle: "Richiesta inviata con successo!",
      sendAnother: "Invia un'altra richiesta",
      mobileFactoryPricing: "Prezzo di fabbrica",
      mobileQuoteMeta: "MOQ · Campioni · Tempi",
      mobileQuoteLabel: "Accesso rapido al preventivo di fabbrica",
      inquiryPlaceholder: "Sono interessato a {{title}}. Preparate un preventivo per la quantità stimata includendo MOQ, opzioni campione e tempi di produzione.",
      notFound: "Prodotto non trovato.",
      previousImage: "Immagine precedente",
      nextImage: "Immagine successiva",
      galleryView: "{{title}} — vista {{index}}",
      premiumQuality: "Qualità premium",
      globalShipping: "Spedizione globale",
      fastTurnaround: "Tempi rapidi",
      oemAvailable: "OEM/ODM disponibile",
      brandSuffix: "| BOLEN Mirror",
      descTemplate: "{title} di alta qualità, prodotto da BOLEN Mirror (Jiaxing Chengtai Mirror Co., Ltd.) — specchi LED, smart, da toeletta e da bagno OEM/ODM. Richiedi un preventivo per i prezzi all'ingrosso."
    },
    rfq: {
      intro: "Cerchi prezzi all'ingrosso, ordini personalizzati o servizi OEM/ODM? Inviaci la richiesta: il nostro team commerciale risponderà entro 24 ore.",
      quoteIncludesTitle: "Il preventivo includerà",
      quoteIncludesMoq: "MOQ e base del prezzo unitario",
      quoteIncludesLeadTime: "Tempi di campionatura e produzione",
      quoteIncludesOptions: "Opzioni di personalizzazione e conformità per il mercato di destinazione",
      prefillMessage: "Sono interessato a {{reference}}. Preparate un preventivo per la quantità stimata includendo MOQ, base del prezzo unitario, tempi di campionatura e produzione, personalizzazione e opzioni di conformità.",
      contactInformation: "Informazioni di contatto",
      emailUs: "Scrivici",
      callUs: "Chiamaci",
      visitUs: "Visita la sede",
      successTitle: "Richiesta inviata con successo!",
      sendAnother: "Invia un'altra richiesta",
      productInterest: "Prodotto di interesse (facoltativo)",
      productPlaceholder: "es. specchi LED da bagno o specchi da toeletta personalizzati",
      messagePlaceholder: "Indica quantità stimata, dimensioni, funzioni, mercato di destinazione ed esigenze di personalizzazione.",
      backupTitle: "Non riesci a inviare il modulo?",
      backupText: "Scrivici o chiamaci direttamente e ti aiuteremo con la richiesta.",
      emailDirectly: "Scrivici",
      callDirectly: "Chiamaci",
      emailSubject: "Richiesta preventivo specchi BOLEN",
      emailSubjectProduct: "Richiesta preventivo: {{reference}}",
      errors: {
        nameRequired: "Il nome è obbligatorio",
        emailRequired: "L'indirizzo e-mail è obbligatorio",
        invalidEmail: "Indirizzo e-mail non valido",
        messageRequired: "I dettagli della richiesta sono obbligatori"
      }
    },
    blog: {
      metaTitle: "The BOLEN Journal | Approfondimenti su Specchi LED e Smart",
      metaDescription: "Guide all'acquisto, spiegazioni tecniche e approfondimenti sulla produzione di specchi LED, specchi smart e produzione OEM/ODM di BOLEN.",
      kicker: "Appunti dalla fabbrica",
      titleLead: "The BOLEN",
      titleAccent: "Journal",
      intro: "Guide, tecnologia e know-how produttivo su specchi LED e smart — scritti dal team che li costruisce.",
      featured: "In evidenza",
      readArticle: "Leggi l'articolo",
      allPosts: "Tutti",
      empty: "Nessun articolo pubblicato ancora. Torna presto.",
      readingTime: "{{minutes}} min di lettura",
      ctaTitle: "Cerchi uno specchio costruito su tue specifiche?",
      ctaDesc: "BOLEN produce specchi LED, smart, da toeletta e da bagno per marchi globali — OEM e ODM, da una fabbrica verticalmente integrata.",
      ctaCatalog: "Sfoglia il catalogo",
      ctaQuote: "Richiedi un preventivo",
      related: "Altro dal Journal",
      viewAll: "Vedi tutto",
      notFound: "Articolo non trovato",
      backToJournal: "Torna al Journal",
      relatedProducts: "Prodotti dell'articolo"
    },
    videos: {
      metaTitle: "Video BOLEN Mirror | Demo prodotto e tour della fabbrica",
      metaDescription: "Guarda demo dei prodotti BOLEN, tour della fabbrica, clip di installazione e video sulle funzioni degli specchi LED smart.",
      kicker: "La prova del prodotto in movimento",
      titleLead: "Video",
      titleAccent: "BOLEN",
      intro: "Scopri specchi LED, funzioni smart, processi di fabbrica e dettagli di installazione prima di specificare un prodotto.",
      search: "Cerca video...",
      allVideos: "Tutti i video",
      empty: "Nessun video pubblicato ancora. Torna presto.",
      cardLabel: "Video",
      latest: "Recente",
      notFound: "Video non trovato",
      backToVideos: "Torna ai video",
      ctaTitle: "Ti serve questo specchio per la tua linea?",
      ctaDesc: "Invia il clip o il riferimento prodotto a BOLEN e il nostro team potrà quotare opzioni OEM/ODM, imballaggio e tempi di consegna.",
      ctaQuote: "Richiedi un preventivo",
      ctaCatalog: "Vedi prodotti",
      relatedProducts: "Prodotti correlati",
      relatedVideos: "Altri video",
      viewAll: "Vedi tutto",
      categories: {
        "Factory Tour": "Tour della fabbrica",
        "Product Demo": "Demo prodotto",
        "Installation": "Installazione",
        "Smart Features": "Funzioni smart"
      }
    },
    admin: {
      dashboard: {
        title: "Pannello di Controllo",
        addProduct: "Aggiungi Prodotto",
        tabs: {
          products: "Prodotti",
          rfqs: "Richieste (RFQ)",
          employees: "Dipendenti",
          settings: "Impostazioni"
        },
        products: {
          uncategorized: "Senza categoria",
          noProducts: "Nessun prodotto trovato.",
          deleteConfirm: "Sei sicuro di voler eliminare questo prodotto?",
          deleteError: "Impossibile eliminare il prodotto."
        },
        rfqs: {
          new: "Nuovo",
          replyEmail: "Rispondi via Email",
          noRfqs: "Nessuna richiesta (RFQ) ricevuta finora."
        },
        employees: {
          status: "Stato:",
          approve: "Approva",
          reject: "Rifiuta",
          noEmployees: "Nessun account dipendente trovato.",
          updateError: "Impossibile aggiornare lo stato del dipendente.",
          roles: {
            admin: "ADMIN",
            pending: "IN ATTESA",
            rejected: "RIFIUTATO"
          }
        },
        settings: {
          title: "Impostazioni del Sito",
          heroBgLabel: "Immagini Promozionali della Home Page",
          heroBgPlaceholder: "https://example.com/image.jpg",
          heroBgHelp: "Aggiungi URL di immagini o carica immagini. La prima immagine sarà quella predefinita se non ne viene fornita nessuna.",
          preview: "Anteprima:",
          save: "Salva Impostazioni",
          saving: "Salvataggio...",
          saveSuccess: "Impostazioni salvate con successo!",
          setupRequired: "Configurazione del Database Richiesta",
          setupDesc: "Per abilitare le impostazioni del sito, esegui il seguente comando SQL nel tuo Editor SQL di Supabase:",
          setupBtn: "Ho eseguito il comando SQL",
          addImage: "Aggiungi Immagine",
          removeImage: "Rimuovi"
        }
      },
      login: {
        title: "Portale Dipendenti",
        subtitleRegister: "Crea un account dipendente per richiedere l'accesso.",
        subtitleLogin: "Accedi per gestire il catalogo prodotti e visualizzare le richieste (RFQ).",
        pendingTitle: "In Attesa di Approvazione!",
        pendingDesc: "Il tuo account ({{email}}) è in attesa dell'approvazione dell'amministratore principale.",
        deniedTitle: "Accesso Negato!",
        deniedDesc: "Il tuo account ({{email}}) non dispone dei privilegi di amministratore.",
        email: "Indirizzo email",
        password: "Password",
        registerBtn: "Registra Account",
        signInBtn: "Accedi",
        quickLogin: "Accesso Rapido (Amministratore Principale)",
        orContinueWith: "Oppure continua con",
        googleLogin: "Google (Amministratore Principale)",
        alreadyHaveAccount: "Hai già un account? Accedi",
        needAccount: "Hai bisogno di un account dipendente? Registrati",
        errors: {
          loginFailed: "Si è verificato un errore durante l'accesso.",
          generalError: "Si è verificato un errore."
        }
      },
      productForm: {
        backToDashboard: "Torna al Pannello",
        supabaseSetupTitle: "Configurazione Supabase Richiesta",
        supabaseSetupDesc: "Per abilitare il caricamento delle immagini, aggiungi VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY alle tue Variabili d'Ambiente (o Secrets di AI Studio) e ricostruisci l'app.",
        editProduct: "Modifica Prodotto",
        addProduct: "Aggiungi Nuovo Prodotto",
        productTitle: "Titolo del Prodotto",
        category: "Categoria",
        priceRange: "Fascia di Prezzo",
        msrp: "Prezzo Consigliato",
        shortDesc: "Descrizione Breve",
        longDetails: "Dettagli Estesi (Rich Text / HTML consentito)",
        images: "Immagini",
        uploading: "Caricamento...",
        uploadImages: "Carica Immagini",
        addUrl: "Aggiungi URL",
        specifications: "Specifiche",
        addSpec: "Aggiungi Specifica",
        cancel: "Annulla",
        saveProduct: "Salva Prodotto",
        errors: {
          titleRequired: "Il titolo è obbligatorio",
          descRequired: "La descrizione è obbligatoria",
          urlRequired: "L'URL è obbligatorio"
        },
        placeholders: {
          specKey: "es. Dimensioni",
          specValue: "es. 24x36 pollici"
        },
        alerts: {
          supabaseNotConfigured: "Supabase non è configurato. Aggiungi VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY alle tue Variabili d'Ambiente e ricostruisci.",
          bucketNotFound: "Bucket di archiviazione \"product-images\" non trovato. Crealo nella tua dashboard Supabase e impostalo come Pubblico.",
          uploadFailed: "Impossibile caricare le immagini: {{message}}",
          saveFailed: "Impossibile salvare il prodotto. Controlla la console per i dettagli."
        }
      }
    }
  }
};
