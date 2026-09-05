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
      categoryTitle: "{{category}} | Produttore BOLEN Mirror",
      categoryDesc: "Sfoglia {{category}} BOLEN per l’ingrosso OEM/ODM. Specchi LED, da toeletta e da bagno diretti dalla fabbrica per marchi globali e progetti alberghieri.",
      storyTitle: "La Nostra Storia | Produttore di Specchi LED BOLEN",
      storyDesc: "Scopri la storia e la capacità produttiva di BOLEN (Jiaxing Chengtai Mirror Co., Ltd.), produttore di specchi LED e smart OEM fondato nel 2005.",
      rfqTitle: "Richiesta di Preventivo | Produttore di Specchi LED BOLEN",
      rfqDesc: "Contatta BOLEN, un produttore leader di specchi LED, per richieste OEM/ODM, produzione personalizzata di specchi e ordini all'ingrosso."
    },
    navbar: {
      home: "Home",
      catalog: "Catalogo",
      ourStory: "La Nostra Storia",
      blog: "Approfondimenti",
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
    aiReceptionist: {
      title: "Assistente IA BOLEN",
      available: "Disponibile",
      subtitle: "Scelta dei prodotti e preventivi",
      closeLabel: "Chiudi l’assistente IA",
      greeting: "Ciao! Sono l’assistente IA BOLEN per la scelta dei prodotti e le richieste di preventivo. Posso aiutarti con prodotti, quantità minime, personalizzazioni, certificazioni e tempi di consegna.",
      quickQuestionsLabel: "Domande suggerite",
      quickQuestions: "Domande rapide",
      quickProduct: "Quale specchio è adatto al mio progetto?",
      quickMoq: "Qual è la quantità minima ordinabile?",
      quickCustomization: "Cosa posso personalizzare?",
      quickLeadTime: "Quali sono i tempi per i campioni e la produzione?",
      youLabel: "Tu",
      assistantLabel: "Assistente IA",
      thinking: "Sto pensando…",
      timeoutError: "La risposta sta richiedendo troppo tempo. Riprova.",
      error: "Al momento non riesco a rispondere. Riprova.",
      retry: "Riprova",
      humanCta: "Richiedi un preventivo al nostro team commerciale",
      inputLabel: "Scrivi all’assistente IA",
      placeholder: "Chiedi informazioni su prodotti, quantità minime o personalizzazioni…",
      sendLabel: "Invia messaggio",
      emailInvalid: "Inserisci un indirizzo e-mail valido.",
      emailConsentRequired: "Conferma che possiamo usare la tua e-mail per dare seguito alla richiesta.",
      emailTimeoutError: "Il salvataggio dell’e-mail ha richiesto troppo tempo. Riprova.",
      emailSubmitError: "Non è stato possibile salvare l’e-mail. Riprova.",
      emailGateTitle: "Continua la conversazione",
      emailGateDescription: "Hai ricevuto la prima risposta dell’IA. Inserisci la tua e-mail per continuare.",
      emailGateDescriptionWithLimit: "Hai ricevuto la prima risposta dell’IA. Inserisci la tua e-mail per continuare, con un massimo di {{maxTurns}} domande in questa sessione.",
      emailLabel: "Indirizzo e-mail",
      emailCompactPlaceholder: "E-mail di lavoro per continuare",
      emailPlaceholder: "tu@azienda.com",
      emailConsentCompact: "Accetto il follow-up via e-mail e il collegamento a questa chat per un massimo di 90 giorni.",
      emailConsent: "Accetto che BOLEN usi questa e-mail per dare seguito alla mia richiesta e la associ a questa chat per un massimo di 90 giorni.",
      emailSubmitting: "Salvataggio…",
      emailContinueShort: "Continua",
      emailContinue: "Continua con l’e-mail",
      turnLimitReached: "Hai raggiunto il limite di domande IA per questa sessione. Il nostro team commerciale può continuare ad aiutarti.",
      turnLimitTitle: "Limite di domande raggiunto",
      turnLimitDescription: "Contatta il nostro team commerciale per continuare.",
      turnLimitDescriptionWithLimit: "Questa sessione include fino a {{maxTurns}} domande IA. Contatta il team commerciale per ulteriore assistenza.",
      turnUsage: "Domande IA utilizzate: {{completedTurns}} di {{maxTurns}}.",
      privacyNote: "Conserviamo per un massimo di 90 giorni una copia automaticamente oscurata di questa chat IA. Non inserire nella chat dati di contatto, identità, pagamento o account. L’e-mail inviata tramite il modulo separato viene conservata con il tuo consenso ed è visibile solo agli amministratori autorizzati.",
      privacyNoteCompact: "La chat oscurata viene conservata fino a 90 giorni. Non inserire dati sensibili.",
      privacyContact: "Richiesta privacy",
      openLabel: "Apri l’assistente IA BOLEN",
      buttonText: "Chiedi all’IA"
    },
    ourStoryPage: {
      title: "La Nostra Storia",
      subtitle: "Jiaxing Chengtai Mirror Co., Ltd. (BOLEN)",
      hero: {
        kicker: "Produzione di specchi LED a Jiaxing dal 2005",
        titleLine1: "Realizzati qui.",
        titleLine2: "Scelti oltre confine.",
        description: "Dal brief confermato alla spedizione imballata, BOLEN riunisce nello stabilimento di Jiaxing lo sviluppo di specchi personalizzati, la produzione, l'ispezione e la preparazione del packaging private label.",
        tourCta: "Visita lo stabilimento",
        factsCta: "Scopri i dati aziendali",
        city: "Jiaxing, Cina",
        facilitySuffix: "m² di superficie produttiva",
        productsSuffix: "prodotti nel catalogo aggiornato"
      },
      chapters: {
        company: "Azienda",
        factory: "Stabilimento",
        making: "Produzione",
        quality: "Qualità",
        partnership: "Partnership"
      },
      company: {
        eyebrow: "L'azienda in sintesi",
        titleLine1: "Un produttore specializzato in specchi.",
        titleLine2: "Organizzato per programmi produttivi di lungo periodo.",
        description: "Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) è stata fondata nel 2005. Oggi oltre 200 specialisti lavorano in uno stabilimento produttivo di 46.800 m² a Jiaxing, seguendo programmi di specchi personalizzati dalla definizione delle specifiche alla spedizione.",
        foundedLabel: "Fondazione",
        foundedNote: "Operativa dal 2005.",
        facilityLabel: "Superficie produttiva",
        facilityNote: "46.800 m² a Jiaxing.",
        teamLabel: "Specialisti",
        teamNote: "Oltre 200 persone tra produzione e funzioni di supporto.",
        catalogLabel: "Catalogo aggiornato",
        catalogNote: "Il numero attuale di prodotti proviene dal database del sito.",
        snapshotLabel: "Dati aggiornati",
        snapshotNote: "I conteggi aggiornati di catalogo e contenuti multimediali vengono recuperati dal database del sito."
      },
      process: {
        eyebrow: "Dal brief alla spedizione",
        titleLine1: "Un processo coordinato.",
        titleLine2: "Sei fasi con responsabilità chiare.",
        description: "Ogni programma segue una sequenza definita, così requisiti, approvazioni, controlli di produzione, packaging e dettagli di consegna restano tracciabili.",
        steps: {
          brief: {
            label: "01 · Brief",
            title: "Prima i requisiti",
            description: "Iniziamo chiarendo cosa deve fare lo specchio, dove sarà venduto o installato e come dovrà essere consegnato l'ordine.",
            check1: "Utilizzo, mercato di destinazione e volume dell'ordine",
            check2: "Dimensioni, forma, funzioni e finitura richieste",
            check3: "Tempistiche, packaging e documentazione necessari"
          },
          specification: {
            label: "02 · Specifiche",
            title: "Design personalizzato confermato",
            description: "Prima di avviare la produzione, il brief concordato viene trasformato in una specifica pronta per la fabbricazione.",
            check1: "Disegni, dimensioni, tolleranze e dettagli di montaggio",
            check2: "Opzioni di illuminazione, elettriche, materiali e comandi",
            check3: "Approvazione del campione e conferma registrata delle modifiche"
          },
          manufacturing: {
            label: "03 · Produzione",
            title: "Produzione di precisione",
            description: "Vetro, cornici, illuminazione, componenti elettrici e funzioni smart vengono integrati attraverso fasi produttive coordinate.",
            check1: "Taglio del vetro, finitura dei bordi e preparazione della superficie",
            check2: "Integrazione di cornice, LED, componenti elettrici e funzioni",
            check3: "Assemblaggio controllato secondo le specifiche confermate"
          },
          inspection: {
            label: "04 · Ispezione",
            title: "Controlli nei passaggi chiave",
            description: "Aspetto, funzionalità e qualità della lavorazione vengono verificati rispetto ai requisiti approvati prima dell'imballaggio.",
            check1: "Finitura visibile, superficie dello specchio, dimensioni e accoppiamenti",
            check2: "Illuminazione, comandi, antiappannamento e funzioni specificate",
            check3: "Dettagli di assemblaggio, accessori e coerenza dell'ordine"
          },
          packaging: {
            label: "05 · Packaging",
            title: "Packaging private label",
            description: "I dettagli dell'imballaggio vengono preparati in base al prodotto, al marchio e ai requisiti di consegna confermati per l'ordine.",
            check1: "Etichette del marchio, manuali, accessori e inserti",
            check2: "Materiali protettivi adatti allo specchio e al cartone",
            check3: "Verifica delle informazioni sul cartone e dei marchi di spedizione"
          },
          logistics: {
            label: "06 · Logistica",
            title: "Spedizione e logistica",
            description: "Quantità finali, informazioni di imballaggio e dettagli di partenza vengono coordinati prima che l'ordine lasci lo stabilimento.",
            check1: "Conferma della quantità finale e dei pallet",
            check2: "Coordinamento dei documenti di spedizione dell'ordine",
            check3: "Passaggio al trasporto e aggiornamenti sulla spedizione"
          }
        }
      },
      gallery: {
        eyebrow: "Dentro lo stabilimento",
        title: "Lavoro, attrezzature e persone da vicino.",
        description: "Esplora le immagini aggiornate dello stabilimento gestite tramite il database del sito. Dove disponibili, le didascalie descrivono il lavoro mostrato.",
        previous: "Immagine precedente dello stabilimento",
        next: "Immagine successiva dello stabilimento",
        selectImage: "Seleziona un'immagine dello stabilimento",
        activeImage: "Immagine attiva dello stabilimento"
      },
      film: {
        eyebrow: "Filmato dallo stabilimento",
        title: "Guarda il processo in movimento.",
        description: "Guarda i filmati pubblicati sullo stabilimento e sui prodotti selezionati dalla videoteca del sito.",
        play: "Riproduci il filmato dello stabilimento",
        watchFilm: "Guarda il filmato dello stabilimento",
        allVideos: "Vedi tutti i video",
        videoCountSuffix: "video pubblicati"
      },
      quality: {
        eyebrow: "Qualità e requisiti di mercato",
        titleLine1: "Evidenze prima delle dichiarazioni.",
        titleLine2: "Ambito confermato per ogni ordine.",
        description: "I registri di ispezione e la documentazione di prodotto disponibile aiutano gli acquirenti a valutare il modello adatto al mercato previsto.",
        documentsLabel: "Documenti e controlli",
        scopeNote: "La copertura di certificazioni e documenti varia in base al modello e al mercato di destinazione e viene confermata durante la quotazione."
      },
      partnership: {
        eyebrow: "Avvia un progetto",
        titleLine1: "Portaci il tuo brief.",
        titleLine2: "Definiremo il passo successivo.",
        description: "Indicaci il prodotto, il volume, il mercato di destinazione e le tempistiche previste. Il nostro team esaminerà i requisiti e risponderà con i punti necessari per procedere.",
        primaryCta: "Richiedi un preventivo",
        secondaryCta: "Sfoglia il catalogo",
        emailLabel: "E-mail",
        phoneLabel: "Telefono"
      },
      accessibility: {
        chapterNavigation: "Navigazione tra i capitoli della storia aziendale",
        processTabs: "Fasi del processo produttivo",
        processPanel: "Dettagli del processo produttivo",
        factoryGallery: "Galleria di immagini dello stabilimento"
      }
    },
    home: {
      companyName: "Jiaxing Chengtai Mirror Co., Ltd.",
      heroKicker: "Produttore di specchi LED · Partner OEM/ODM",
      heroTitle1: "Specchi di alta gamma,",
      heroTitle2: "realizzati su misura per il tuo brand.",
      heroDesc: "<1>BOLEN</1> aiuta brand di tutto il mondo a portare sul mercato collezioni di specchi dal carattere distintivo. Dalla progettazione e personalizzazione alla produzione con rigorosi controlli di qualità e alla consegna in tutto il mondo, rendiamo la produzione di alta gamma semplice, affidabile e scalabile.",
      heroPrimaryCta: "Richiedi prezzi e MOQ",
      heroSecondaryCta: "Scopri i prodotti",
      quickInquiry: {
        title: "Messaggio per una risposta rapida",
        name: "Nome o azienda",
        email: "E-mail",
        message: "Messaggio",
        send: "Invia",
        sending: "Invio...",
        success: "Grazie — la tua richiesta è stata inviata.",
        error: "Non è stato possibile inviare la richiesta. Riprova."
      },
      stats: {
        sqMeters: "Produzione industriale su larga scala con tempi affidabili e puntuali.",
        artisans: "Specialisti qualificati, rigoroso controllo qualità e garanzia estesa di 3 anni.",
        styles: "Design di specchi completamente personalizzabili con certificazioni internazionali.",
        global: "Consegna mondiale a tariffe esclusive con partner logistici riconosciuti a livello internazionale."
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
        visit: "Scopri la nostra fabbrica",
        prev: "Foto precedente della fabbrica",
        next: "Foto successiva della fabbrica",
        selectImage: "Visualizza la foto della fabbrica",
        imageUnavailable: "Questa foto non è disponibile. Selezionane un'altra.",
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
          "Il nostro sistema di garanzia della qualità rispecchia il nostro impegno post-vendita. Ogni prodotto viene sottoposto a ispezione al 100% prima della spedizione ed è coperto da una garanzia estesa completa di 3 anni sui componenti elettronici.",
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
      kicker: "OEM · ODM · Diretto dalla fabbrica",
      desc: "Sfoglia la nostra vasta collezione di specchi premium, con tecnologia LED intelligente, eleganti design da trucco e opzioni personalizzabili.",
      noProducts: "Nessun prodotto trovato corrispondente ai tuoi criteri.",
      emptyTitle: "Nessun prodotto trovato",
      emptySearch: "Nessun risultato per “{{query}}”. Prova a modificare ricerca o filtri.",
      clearFilters: "Cancella tutti i filtri",
      viewDetails: "Vedi Dettagli",
      searchLabel: "Cerca prodotti",
      searchPlaceholder: "Cerca prodotti...",
      resultCount: "{{count}} prodotti trovati",
      showMore: "Mostra altro",
      allCategories: "Tutte le Categorie",
      categoriesNav: "Categorie di prodotti",
      categoryIntro: "{{category}} diretti dalla fabbrica per progetti OEM/ODM e all’ingrosso: dimensioni, illuminazione e finiture su misura da Jiaxing.",
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
      keySpecs: "In sintesi",
      viewAllSpecs: "Vedi tutte le specifiche",
      quotingFor: "Richiesta di preventivo per",
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
      metaTitle: "Approfondimenti BOLEN | Acquisto e Produzione di Specchi LED",
      metaDescription: "Guide pratiche all'acquisto, spiegazioni tecniche e approfondimenti OEM/ODM per specchi LED, smart e su misura.",
      schemaName: "Approfondimenti BOLEN Mirror",
      kicker: "Indicazioni pratiche dalla fabbrica",
      titleLead: "Approfondimenti per l'acquisto di",
      titleAccent: "specchi",
      intro: "Consigli d'acquisto, spiegazioni tecniche e know-how produttivo per specchi LED, smart e programmi OEM/ODM.",
      featured: "Approfondimento in evidenza",
      readArticle: "Leggi l'approfondimento",
      allPosts: "Tutti",
      empty: "Nessun approfondimento pubblicato ancora. Torna presto.",
      readingTime: "{{minutes}} min di lettura",
      ctaTitle: "Cerchi uno specchio costruito su tue specifiche?",
      ctaDesc: "BOLEN produce specchi LED, smart, da toeletta e da bagno per marchi globali — OEM e ODM, da una fabbrica verticalmente integrata.",
      ctaCatalog: "Sfoglia il catalogo",
      ctaQuote: "Richiedi un preventivo",
      related: "Altri approfondimenti",
      viewAll: "Vedi tutto",
      notFound: "Approfondimento non trovato",
      notFoundDescription: "L'approfondimento BOLEN richiesto non è stato trovato.",
      backToJournal: "Torna agli approfondimenti",
      relatedProducts: "Prodotti di questo approfondimento",
      latestHeading: "Ultimi approfondimenti",
      latestIntro: "Filtra per argomento o consulta tutte le guide pubblicate.",
      filterLabel: "Filtra gli approfondimenti per argomento",
      noMoreInTopic: "Non ci sono ancora altri approfondimenti in questa vista.",
      nextStepTitle: "Trasforma le informazioni utili in una specifica pronta per la fabbrica",
      nextStepDescription: "Confronta i percorsi produttivi e invia dimensioni, quantità, mercato e funzioni richieste per un preventivo mirato.",
      categories: {
        "Buying Guide": "Guida all'acquisto",
        "Bolen Story": "Storia di BOLEN",
        "Technology": "Tecnologia",
        "Manufacturing": "Produzione",
        "Design": "Design"
      }
    },
    videos: {
      metaTitle: "Video specchi LED: demo prodotto, tour della fabbrica e installazione | BOLEN",
      metaDescription: "Guarda i video degli specchi LED BOLEN: demo di specchi smart, tour della fabbrica di 46.800 m², controllo qualità e guide di installazione da un produttore OEM/ODM con 21 anni di esperienza.",
      kicker: "Libreria video",
      titleLead: "Video specchi LED:",
      titleAccent: "demo prodotto, tour della fabbrica e installazione",
      intro: "Scopri come gli specchi LED, smart, da toeletta e da bagno BOLEN vengono costruiti, testati e installati: brevi clip girate nella nostra fabbrica di Jiaxing che rispondono alle domande di acquisto prima di specificare un prodotto.",
      heroPrimaryCta: "Richiedi un preventivo",
      heroSecondaryCta: "Vedi prodotti",
      stats: {
        videos: "Video",
        topics: "Argomenti",
        runtime: "Minuti di riprese",
        updated: "Ultimo aggiornamento"
      },
      spotlightLabel: "Ultimo video",
      watchNow: "Guarda ora",
      libraryHeading: "Tutti i video",
      libraryIntro: "Filtra per argomento o cerca nella libreria.",
      resultsCount: "{{count}} video",
      search: "Cerca video...",
      searchLabel: "Cerca video",
      clearSearch: "Cancella ricerca",
      filterLabel: "Filtra i video per argomento",
      allVideos: "Tutti i video",
      clearFilters: "Azzera filtri",
      noResults: "Nessun video corrisponde alla tua ricerca.",
      noResultsHint: "Prova un'altra parola chiave o azzera i filtri.",
      empty: "Nessun video pubblicato ancora. Torna presto.",
      cardLabel: "Video",
      latest: "Recente",
      watchLabel: "Guarda: {{title}}",
      playLabel: "Riproduci video: {{title}}",
      unavailable: "Questo video non è al momento disponibile.",
      duration: "Durata",
      tagsLabel: "Argomenti",
      upNext: "Prossimi video",
      share: {
        label: "Condividi",
        copy: "Copia link",
        copied: "Link copiato",
        copyPrompt: "Copia questo link",
        linkedin: "Condividi su LinkedIn",
        whatsapp: "Condividi su WhatsApp",
        email: "Condividi via e-mail",
        more: "Altre opzioni di condivisione"
      },
      notFound: "Video non trovato",
      notFoundDescription: "Il video BOLEN richiesto non è stato trovato.",
      backToVideos: "Torna ai video",
      sidebarKicker: "Specifica questo specchio",
      ctaTitle: "Ti serve questo specchio per la tua linea?",
      ctaDesc: "Invia il clip o il riferimento prodotto a BOLEN e il nostro team potrà quotare opzioni OEM/ODM, imballaggio e tempi di consegna.",
      ctaQuote: "Richiedi un preventivo",
      ctaCatalog: "Vedi prodotti",
      relatedProductsKicker: "Dal catalogo",
      relatedProducts: "Prodotti in questo video",
      relatedVideos: "Altri video",
      viewAll: "Vedi tutto",
      guide: {
        kicker: "Girato nella nostra fabbrica",
        heading: "Cosa copre la libreria",
        intro: "Ogni clip è girata su unità di produzione BOLEN e all'interno dello stabilimento di 46.800 m² di Jiaxing, senza filmati di repertorio: ciò che vedi è ciò che spediamo.",
        demos: {
          title: "Demo prodotto",
          desc: "Modalità colore LED, dimmerazione continua, antiappannamento, sensori touch e funzioni smart mostrati su vere unità di produzione, non su render.",
          cta: "Guarda le demo prodotto"
        },
        factory: {
          title: "Fabbrica e controllo qualità",
          desc: "Taglio del vetro, assemblaggio LED, test IP44 e imballaggio nello stabilimento di 46.800 m² di Jiaxing che spedisce il tuo ordine.",
          cta: "Visita la fabbrica"
        },
        install: {
          title: "Installazione e specifiche",
          desc: "Dettagli di montaggio, cablaggio e movimentazione che aiutano installatori, rivenditori e buyer di progetto a pianificare.",
          cta: "Video di installazione"
        }
      },
      closing: {
        title: "Hai visto uno specchio che vuoi specificare?",
        desc: "Inviaci il video o il riferimento prodotto. Rispondiamo con opzioni OEM/ODM, MOQ, imballaggio e tempi di consegna, e possiamo girare una demo su misura della tua specifica."
      },
      categories: {
        "Factory Tour": "Tour della fabbrica",
        "Product Demo": "Demo prodotto",
        "Installation": "Installazione",
        "Smart Features": "Funzioni smart",
        "Technology": "Tecnologia",
        "Quality Control": "Controllo qualità"
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
          active: "Attivo",
          inactive: "Disattivato",
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
        visibility: "Visibilità",
        active: "Attivo",
        inactive: "Disattivato",
        activeHelp: "Visibile nel catalogo e al relativo URL del prodotto.",
        inactiveHelp: "Nascosto dal sito pubblico e non pubblicato al relativo URL del prodotto.",
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
