export const de = {
  translation: {
    // Page-level <title>/<meta description> for the four static routes.
    // scripts/prerender-static.ts reads these same values, so the tags baked
    // into the static HTML and the tags react-helmet-async writes on mount
    // cannot drift. Previously the pages passed hardcoded English, which
    // overwrote the correctly-localized prerendered meta on 5 locales.
    seo: {
      homeTitle: "BOLEN Mirror | LED-Spiegelhersteller & OEM-Smart-Spiegel-Fabrik",
      homeDesc: "BOLEN Mirror ist ein führender LED-Spiegelhersteller, spezialisiert auf OEM-LED-Spiegel, Smart-Spiegel, Schminkspiegel und Badspiegel für globale Marken.",
      catalogTitle: "LED-Spiegel Produktkatalog | BOLEN Mirror Hersteller",
      catalogDesc: "Entdecken Sie unser umfangreiches Sortiment an OEM-LED-Spiegeln, Smart-Spiegeln, Schminkspiegeln und Badspiegeln von einem führenden LED-Spiegelhersteller. Hochwertige Fertigung für globale Marken.",
      categoryTitle: "{{category}} | BOLEN Mirror Hersteller",
      categoryDesc: "Entdecken Sie BOLEN {{category}} für OEM/ODM-Großhandel. LED-, Schmink- und Badspiegel direkt ab Werk für globale Marken und Hotelprojekte.",
      storyTitle: "Unsere Geschichte | BOLEN LED-Spiegelhersteller",
      storyDesc: "Erfahren Sie mehr über die Geschichte und Fertigungskompetenz von BOLEN (Jiaxing Chengtai Mirror Co., Ltd.), einem 2005 gegründeten Hersteller von LED- und OEM-Smart-Spiegeln.",
      rfqTitle: "Angebotsanfrage | BOLEN LED-Spiegelhersteller",
      rfqDesc: "Kontaktieren Sie BOLEN, einen führenden LED-Spiegelhersteller, für OEM/ODM-Anfragen, kundenspezifische Spiegelherstellung und Großbestellungen."
    },
    navbar: {
      home: "Startseite",
      catalog: "Katalog",
      ourStory: "Unsere Geschichte",
      blog: "Einblicke",
      videos: "Videos",
      adminDashboard: "Admin-Dashboard",
      logout: "Abmelden",
      employeeLogin: "Mitarbeiter-Login"
    },
    footer: {
      description: "Premium-Spiegelhersteller und Exporteur. Wir liefern hochwertige, moderne Schminkspiegel an Unternehmen weltweit.",
      contact: "Kontakt",
      quickLinks: "Schnelllinks",
      rights: "Alle Rechte vorbehalten."
    },
    accessibility: {
      skipToContent: "Zum Inhalt springen"
    },
    aiReceptionist: {
      title: "BOLEN KI-Assistent",
      available: "Verfügbar",
      subtitle: "Produktauswahl & Angebot",
      closeLabel: "KI-Assistent schließen",
      greeting: "Hallo! Ich bin der BOLEN KI-Assistent für Produktauswahl und Angebotsanfragen. Ich helfe Ihnen bei Fragen zu Produkten, Mindestbestellmengen, Anpassungen, Zertifizierungen und Lieferzeiten.",
      quickQuestionsLabel: "Vorgeschlagene Fragen",
      quickQuestions: "Schnelle Fragen",
      quickProduct: "Welcher Spiegel passt zu meinem Projekt?",
      quickMoq: "Wie hoch ist Ihre Mindestbestellmenge?",
      quickCustomization: "Was kann ich individuell anpassen?",
      quickLeadTime: "Welche Vorlaufzeiten gelten für Muster und Produktion?",
      youLabel: "Sie",
      assistantLabel: "KI-Assistent",
      thinking: "Einen Moment…",
      timeoutError: "Die Antwort dauert zu lange. Bitte versuchen Sie es erneut.",
      error: "Ich konnte gerade nicht antworten. Bitte versuchen Sie es erneut.",
      retry: "Erneut versuchen",
      humanCta: "Angebot von unserem Vertrieb anfordern",
      inputLabel: "Nachricht an den KI-Assistenten",
      placeholder: "Fragen zu Produkten, Mindestmengen oder Anpassungen…",
      sendLabel: "Nachricht senden",
      emailInvalid: "Geben Sie eine gültige E-Mail-Adresse ein.",
      emailConsentRequired: "Bestätigen Sie, dass wir Ihre E-Mail für die Bearbeitung dieser Anfrage verwenden dürfen.",
      emailTimeoutError: "Das Speichern Ihrer E-Mail hat zu lange gedauert. Versuchen Sie es erneut.",
      emailSubmitError: "Ihre E-Mail konnte nicht gespeichert werden. Versuchen Sie es erneut.",
      emailGateTitle: "Gespräch fortsetzen",
      emailGateDescription: "Sie haben Ihre erste KI-Antwort erhalten. Geben Sie Ihre E-Mail ein, um fortzufahren.",
      emailGateDescriptionWithLimit: "Sie haben Ihre erste KI-Antwort erhalten. Geben Sie Ihre E-Mail ein, um mit bis zu {{maxTurns}} KI-Fragen in dieser Sitzung fortzufahren.",
      emailLabel: "E-Mail-Adresse",
      emailCompactPlaceholder: "Geschäftliche E-Mail zum Fortfahren",
      emailPlaceholder: "sie@unternehmen.com",
      emailConsentCompact: "Ich stimme E-Mail-Nachfragen und der Verknüpfung mit diesem Chat für bis zu 90 Tage zu.",
      emailConsent: "Ich stimme zu, dass BOLEN diese E-Mail zur Bearbeitung meiner Anfrage nutzt und sie bis zu 90 Tage mit diesem Chat verknüpft.",
      emailSubmitting: "Wird gespeichert…",
      emailContinueShort: "Weiter",
      emailContinue: "Mit E-Mail fortfahren",
      turnLimitReached: "Sie haben das KI-Fragenlimit für diese Sitzung erreicht. Unser Vertrieb hilft Ihnen gerne weiter.",
      turnLimitTitle: "KI-Fragenlimit erreicht",
      turnLimitDescription: "Kontaktieren Sie unseren Vertrieb, um das Gespräch fortzusetzen.",
      turnLimitDescriptionWithLimit: "Diese Sitzung umfasst bis zu {{maxTurns}} KI-Fragen. Kontaktieren Sie unseren Vertrieb für weitere Hilfe.",
      turnUsage: "Verwendete KI-Fragen: {{completedTurns}} von {{maxTurns}}.",
      privacyNote: "Wir speichern eine automatisch bereinigte Kopie dieses KI-Chats für höchstens 90 Tage. Geben Sie im Chat keine Kontakt-, Ausweis-, Zahlungs- oder Kontodaten ein. Eine über das separate Formular übermittelte E-Mail wird mit Ihrer Einwilligung gespeichert und ist nur für autorisierte Administratoren sichtbar.",
      privacyNoteCompact: "Der bereinigte Chat wird bis zu 90 Tage gespeichert. Keine sensiblen Daten eingeben.",
      privacyContact: "Datenschutzanfrage",
      openLabel: "BOLEN KI-Assistent öffnen",
      buttonText: "KI fragen"
    },
    ourStoryPage: {
      title: "Unsere Geschichte",
      subtitle: "Jiaxing Chengtai Mirror Co., Ltd. (BOLEN)",
      hero: {
        kicker: "LED-Spiegelproduktion in Jiaxing seit 2005",
        titleLine1: "Hier gefertigt.",
        titleLine2: "Über Grenzen hinweg vertraut.",
        description: "Vom bestätigten Briefing bis zur versandfertigen Verpackung bündelt BOLEN die kundenspezifische Spiegelentwicklung, Fertigung, Prüfung und Vorbereitung von Private-Label-Verpackungen an unserem Standort in Jiaxing.",
        tourCta: "Fertigung ansehen",
        factsCta: "Unternehmensdaten ansehen",
        city: "Jiaxing, China",
        facilitySuffix: "m² Produktionsfläche",
        productsSuffix: "Produkte im Live-Katalog"
      },
      chapters: {
        company: "Unternehmen",
        factory: "Werk",
        making: "Fertigung",
        quality: "Qualität",
        partnership: "Partnerschaft"
      },
      company: {
        eyebrow: "Unternehmen im Überblick",
        titleLine1: "Ein spezialisierter Spiegelhersteller.",
        titleLine2: "Auf langfristige Fertigungsprojekte ausgerichtet.",
        description: "Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) wurde 2005 gegründet. Heute arbeiten mehr als 200 Fachkräfte auf einer Produktionsfläche von 46.800 m² in Jiaxing und begleiten kundenspezifische Spiegelprogramme von der Spezifikation bis zum Versand.",
        foundedLabel: "Gegründet",
        foundedNote: "Seit 2005 in Betrieb.",
        facilityLabel: "Produktionsfläche",
        facilityNote: "46.800 m² in Jiaxing.",
        teamLabel: "Fachkräfte",
        teamNote: "Mehr als 200 Menschen in Fertigung und unterstützenden Bereichen.",
        catalogLabel: "Live-Katalog",
        catalogNote: "Die aktuelle Produktzahl stammt aus der Website-Datenbank.",
        snapshotLabel: "Datenstand",
        snapshotNote: "Live-Katalog- und Medienzahlen werden aus der Website-Datenbank aktualisiert."
      },
      process: {
        eyebrow: "Vom Briefing bis zum Versand",
        titleLine1: "Ein durchgängiger Prozess.",
        titleLine2: "Sechs klar verantwortete Phasen.",
        description: "Jedes Programm durchläuft eine festgelegte Abfolge, damit Anforderungen, Freigaben, Produktionsprüfungen, Verpackung und Lieferdetails nachvollziehbar bleiben.",
        steps: {
          brief: {
            label: "01 · Briefing",
            title: "Anforderungen zuerst",
            description: "Zu Beginn klären wir, was der Spiegel leisten muss, wo er verkauft oder installiert wird und wie die Bestellung geliefert werden soll.",
            check1: "Anwendungsfall, Zielmarkt und Bestellmenge",
            check2: "Gewünschte Größe, Form, Funktionen und Oberfläche",
            check3: "Zeitplan, Verpackungs- und Dokumentationsbedarf"
          },
          specification: {
            label: "02 · Spezifikation",
            title: "Kundenspezifisches Design bestätigt",
            description: "Das abgestimmte Briefing wird vor Fertigungsbeginn in eine produktionsreife Spezifikation überführt.",
            check1: "Zeichnungen, Maße, Toleranzen und Montagedetails",
            check2: "Beleuchtung, Elektrik, Materialien und Steuerungsoptionen",
            check3: "Musterfreigabe und dokumentierte Änderungsbestätigung"
          },
          manufacturing: {
            label: "03 · Fertigung",
            title: "Präzise Fertigung",
            description: "Glas, Rahmen, Beleuchtung, elektrische Komponenten und Smart-Funktionen werden in koordinierten Produktionsstufen zusammengeführt.",
            check1: "Glaszuschnitt, Kantenbearbeitung und Oberflächenvorbereitung",
            check2: "Integration von Rahmen, LED, Elektrik und Funktionen",
            check3: "Kontrollierte Montage nach bestätigter Spezifikation"
          },
          inspection: {
            label: "04 · Prüfung",
            title: "Prüfung an wichtigen Kontrollpunkten",
            description: "Optik, Funktion und Verarbeitung werden vor dem Verpacken anhand der freigegebenen Anforderungen geprüft.",
            check1: "Sichtbare Oberfläche, Spiegelfläche, Maße und Passung",
            check2: "Beleuchtung, Steuerung, Entnebelung und vereinbarte Funktionen",
            check3: "Montagedetails, Zubehör und Einheitlichkeit der Bestellung"
          },
          packaging: {
            label: "05 · Verpackung",
            title: "Private-Label-Verpackung",
            description: "Die Verpackungsdetails werden auf das Produkt sowie die für den Auftrag bestätigten Marken- und Lieferanforderungen abgestimmt.",
            check1: "Markenetiketten, Anleitungen, Zubehör und Beilagen",
            check2: "Auf Spiegel und Karton abgestimmte Schutzmaterialien",
            check3: "Prüfung von Kartonangaben und Versandmarkierungen"
          },
          logistics: {
            label: "06 · Logistik",
            title: "Versand und Logistik",
            description: "Endmengen, Verpackungsinformationen und Versanddetails werden koordiniert, bevor die Bestellung das Werk verlässt.",
            check1: "Bestätigung von Endmenge und Palettierung",
            check2: "Abstimmung der Versanddokumente für den Auftrag",
            check3: "Übergabe an den Versand und Statusmeldungen"
          }
        }
      },
      gallery: {
        eyebrow: "Einblick in die Fertigung",
        title: "Arbeit, Anlagen und Menschen aus der Nähe.",
        description: "Entdecken Sie aktuelle Fabrikbilder, die über die Website-Datenbank verwaltet werden. Soweit vorhanden, erläutern Bildunterschriften die gezeigten Arbeitsschritte.",
        previous: "Vorheriges Fabrikbild",
        next: "Nächstes Fabrikbild",
        selectImage: "Fabrikbild auswählen",
        activeImage: "Aktuelles Fabrikbild"
      },
      film: {
        eyebrow: "Film aus der Fertigung",
        title: "Den Prozess in Bewegung sehen.",
        description: "Sehen Sie veröffentlichte Fabrik- und Produktaufnahmen aus der Videobibliothek der Website.",
        play: "Fabrikfilm abspielen",
        watchFilm: "Fabrikfilm ansehen",
        allVideos: "Alle Videos ansehen",
        videoCountSuffix: "veröffentlichte Videos"
      },
      quality: {
        eyebrow: "Qualität und Markteignung",
        titleLine1: "Nachweise statt pauschaler Aussagen.",
        titleLine2: "Umfang je Auftrag bestätigt.",
        description: "Prüfprotokolle und verfügbare Produktdokumente helfen Einkäufern, das passende Modell für den vorgesehenen Markt zu bewerten.",
        documentsLabel: "Dokumente und Prüfungen",
        scopeNote: "Der Umfang von Zertifizierungen und Dokumenten variiert je nach Modell und Zielmarkt und wird im Rahmen der Angebotserstellung bestätigt."
      },
      partnership: {
        eyebrow: "Projekt starten",
        titleLine1: "Bringen Sie uns Ihr Briefing.",
        titleLine2: "Wir definieren den nächsten Schritt.",
        description: "Teilen Sie uns Produkt, Menge, Zielmarkt und gewünschten Zeitplan mit. Unser Team prüft die Anforderungen und meldet sich mit den Punkten, die für den nächsten Schritt erforderlich sind.",
        primaryCta: "Angebot anfragen",
        secondaryCta: "Katalog ansehen",
        emailLabel: "E-Mail",
        phoneLabel: "Telefon"
      },
      accessibility: {
        chapterNavigation: "Navigation durch die Kapitel der Unternehmensgeschichte",
        processTabs: "Phasen des Fertigungsprozesses",
        processPanel: "Details zum Fertigungsprozess",
        factoryGallery: "Galerie mit Fabrikbildern"
      }
    },
    home: {
      companyName: "Jiaxing Chengtai Mirror Co., Ltd.",
      heroKicker: "LED-Spiegelhersteller · OEM/ODM-Partner",
      heroTitle1: "Premium-Spiegel,",
      heroTitle2: "passgenau für Ihre Marke.",
      heroDesc: "<1>BOLEN</1> unterstützt Marken weltweit dabei, unverwechselbare Spiegelkollektionen auf den Markt zu bringen. Von Design und Individualisierung über qualitätsgesicherte Fertigung bis hin zur weltweiten Lieferung machen wir Premiumfertigung einfach, zuverlässig und skalierbar.",
      heroPrimaryCta: "Preise & MOQ anfragen",
      heroSecondaryCta: "Produkte entdecken",
      stats: {
        sqMeters: "Produktionsfläche",
        artisans: "Qualifizierte Fachkräfte",
        styles: "Spiegeldesigns",
        global: "Weltweite Lieferung"
      },
      about: {
        heritage: "Unser Erbe",
        title1: "Globale Reichweite:",
        title2: "Von Shanghai in die Welt",
        desc1: "Mit Hauptsitz in Jiaxing, Zhejiang, China – nur 60 Kilometer von Shanghai entfernt – haben wir eine starke globale Präsenz aufgebaut, mit Hauptmärkten in Europa (Spanien, Niederlande, Norwegen, Dänemark, Vereinigtes Königreich und Rumänien), Nordamerika und Australien.",
        desc2: "Wir betreiben zwei Unternehmenszentralen und zwei hochmoderne Produktionsstätten. Unsere engagierte Belegschaft verwaltet mehrere LED- und Spiegelproduktionslinien sowie spezialisierte Werkstätten für Sonderanfertigungen, alles in strikter Übereinstimmung mit den Qualitätsmanagementstandards ISO 9001.",
        backedBy: "Unterstützt von über 200 engagierten Fachleuten",
        quote: "\"Qualität zuerst, Kunden zuerst\"",
        corePrinciple: "Unser Grundprinzip"
      },
      collections: {
        subtitle: "Kollektionen",
        title: "Vielseitig & Maßgeschneidert",
        desc: "Wir fertigen LED-Spiegel, Badspiegel, Ankleidespiegel und Spiegelschränke und bieten tausende Stile sowie vollständig maßgeschneiderte Lösungen.",
        viewAll: "Alle Produkte ansehen",
        smart: {
          tag: "Flaggschiff",
          title: "Smart & LED Spiegel",
          desc: "Hintergrundbeleuchtete Badezimmerspiegel mit Touch-Schaltern, Anti-Beschlag-Funktion und Bluetooth-Lautsprechern.",
          explore: "Kategorie entdecken"
        },
        vanity: {
          title: "Dekorativ & Kosmetik",
          desc: "Kosmetikspiegel in Hotelqualität mit Sensorsteuerung und Vergrößerung.",
          explore: "Entdecken"
        },
        oem: {
          title: "OEM / ODM Dienstleistungen",
          desc: "Passen Sie Größe, Material, Funktion, Logo und Verpackung an die Kundenbedürfnisse an.",
          partner: "Arbeiten Sie mit uns zusammen"
        }
      },
      certificates: {
        subtitle: "Unsere Qualifikationen",
        title: "Globale Zertifizierungen"
      },
      factoryShowcase: {
        subtitle: "Einblick in die Fabrik",
        title: "Wo jeder Spiegel entsteht",
        desc: "Ein Blick in unsere 46.800 m² große Produktionsstätte in Jiaxing — vertikal integrierte Fertigung von LED-, Smart-, Schmink- und Badspiegeln, vom Rohglas bis zur versandfertigen Palette.",
        empty: "Fabrikfotos folgen in Kürze."
      },
      featuredVideo: {
        subtitle: "Ausgewähltes Video",
        nowPlaying: "Läuft jetzt",
        title: "Unsere Spiegel in Bewegung",
        desc: "Ein Klick in die Fertigung: Sehen Sie, wie BOLEN LED-, Smart- und Schminkspiegel gefertigt, veredelt und vor dem Versand geprüft werden.",
        watch: "Ganzes Video ansehen",
        viewAll: "Alle Videos",
        playAria: "Video abspielen: {{title}}",
        pauseAria: "Hintergrundvideo anhalten",
        soundOn: "Ton einschalten",
        soundOff: "Video stummschalten"
      },
      advantage: {
        subtitle: "Der BOLEN-Vorteil",
        title: "Fertigungs-Vorteil",
        desc: "21 Jahre vertikal integrierte Produktion, eine Anlage mit 46.800 m² und ein logistisch optimaler Standort in der Nähe der Häfen von Shanghai und Ningbo.",
        features: {
          f1: { title: "Bewährte Fertigungsleistung", desc: "Seit 21 Jahren etabliert, unsere 46.800 m² große Anlage beschäftigt über 200 erfahrene Mitarbeiter und garantiert eine stabile Lieferkette sowie zuverlässige Lieferzeiten." },
          f2: { title: "Strategischer Standort", desc: "Nahe den Häfen von Shanghai und Ningbo gelegen, genießen wir eine erstklassige Lage, die eine bequeme und effiziente Logistik gewährleistet." },
          f3: { title: "Werksdirekt & Kosteneffizient", desc: "Als Direkthersteller eliminieren wir Zwischenhändlerkosten und bieten hochkompetitive Preise ohne Qualitätsabstriche – für den besten Wert für Ihr Geschäft." }
        }
      },
      manufacturingProcess: {
        subtitle: "Vom Briefing bis zur Palette",
        title: "Fertigungsprozess",
        desc: "Sechs streng kontrollierte Stufen bringen jeden Auftrag von der Spezifikation bis zum Versand.",
        steps: {
          s1: { title: "Anforderungsanalyse", desc: "Maßgeschneiderte Lösungen, basierend auf Ihrer spezifischen Vision und den Marktanforderungen." },
          s2: { title: "Individuelles Design", desc: "Bestätigung jedes Details vor der Produktion, damit das Endprodukt Ihren Erwartungen entspricht." },
          s3: { title: "Präzisionsfertigung", desc: "Integration automatisierter Linien mit manueller Präzision für optimale Qualität und Effizienz." },
          s4: { title: "100% Qualitätsprüfung", desc: "Strenge Qualitätskontrollen zu Aussehen, Funktion und Verarbeitung des Spiegels." },
          s5: { title: "Individuelle Verpackung", desc: "Vollständig anpassbares Branding zur Steigerung Ihrer Wettbewerbsfähigkeit am Markt." },
          s6: { title: "Stabile Lieferzeiten", desc: "Zuverlässige Planung und effiziente Logistik garantieren die pünktliche Lieferung." }
        }
      },
      whyUs: {
        title1: "Warum eine Partnerschaft mit",
        title2: "Bolen?",
        features: [
          { title: "Globaler Marktzugang & zertifizierte Qualität" },
          { title: "Werksdirekt & kosteneffizient" },
          { title: "Strenge Qualitätskontrolle & Garantie" },
          { title: "Umfassende Anpassung" }
        ],
        paragraphs: [
          "Wir haben enge Partnerschaften in Europa (NL, RO, UK, ES, NO, DK), im Nahen Osten, in Nordamerika, Australien und Südamerika aufgebaut. Unsere Produkte entsprechen vollständig den internationalen Standards und verfügen über CE-, CB-, RoHS-, IP44-, SAA- und weitere Zertifizierungen.",
          "Als Direkthersteller bieten wir hochkompetitive Preise. Wir verpflichten uns zu Premium-Qualität, die perfekt zu Ihren Budget-Anforderungen passt.",
          "Unser Qualitätssicherungssystem entspricht unserem After-Sales-Versprechen. Jedes Produkt wird vor dem Versand zu 100% geprüft, mit einer umfassenden 2-Jahres-Garantie auf elektronische Komponenten.",
          "Vom Spiegelglas bis zur Verpackung bieten wir End-to-End-OEM/ODM-Anpassungsservices, die Ihnen helfen, Ihre Marktreichweite zu erweitern und Ihre Marke aufzubauen."
        ]
      },
      cta: {
        title: "Bereit, Ihren Raum aufzuwerten?",
        desc: "Kontaktieren Sie uns noch heute, um Ihre individuellen Anforderungen zu besprechen, oder durchsuchen Sie unseren umfangreichen Katalog an Premium-Spiegeln.",
        viewCatalog: "Katalog ansehen",
        contactSales: "Vertrieb kontaktieren"
      }
    },
    products: {
      catalog: "Produktkatalog",
      kicker: "OEM · ODM · Direkt ab Werk",
      desc: "Durchsuchen Sie unsere umfangreiche Kollektion an Premium-Spiegeln, die intelligente LED-Technologie, elegante Kosmetikdesigns und anpassbare Optionen bieten.",
      noProducts: "Keine Produkte gefunden, die Ihren Kriterien entsprechen.",
      emptyTitle: "Keine Produkte gefunden",
      emptySearch: "Zu „{{query}}“ wurden keine Treffer gefunden. Passen Sie Suche oder Filter an.",
      clearFilters: "Alle Filter zurücksetzen",
      viewDetails: "Details ansehen",
      searchLabel: "Produkte suchen",
      searchPlaceholder: "Produkte suchen...",
      resultCount: "{{count}} Produkte gefunden",
      showMore: "Mehr anzeigen",
      allCategories: "Alle Kategorien",
      categoriesNav: "Produktkategorien",
      categoryIntro: "{{category}} direkt ab Werk für OEM/ODM- und Großhandelsprojekte — individuelle Größen, Beleuchtung und Oberflächen aus Jiaxing.",
      categories: {
        "New Arrival": "Neuheiten",
        "Hot Sale": "Im Angebot",
        "Led Lighted Mirror": "LED-Leuchtspiegel",
        "Bathroom Mirror without led": "Badspiegel ohne LED",
        "Full Length Dressing Mirror": "Ganzkörperspiegel",
        "Irregular Mirror": "Unregelmäßiger Spiegel"
      },
      priceRange: "Preisspanne",
      priceRangeLabel: "Unverbindliche Werkspreisspanne",
      priceQualifier: "Endpreis abhängig von Menge und Spezifikation",
      msrp: "Unverbindliche Preisempfehlung"
    },
    productDetail: {
      backToCatalog: "Zurück zum Katalog",
      specifications: "Spezifikationen",
      productDetails: "Produktdetails",
      requestQuote: "Angebot anfordern (RFQ)",
      companyName: "Unternehmen / Kontaktname",
      email: "E-Mail-Adresse",
      inquiryDetails: "Anfragedetails (Menge, Anpassung, etc.)",
      submitRfq: "RFQ senden",
      submitting: "Wird gesendet...",
      rfqSuccess: "RFQ erfolgreich gesendet! Wir werden uns in Kürze bei Ihnen melden.",
      rfqError: "Senden der RFQ fehlgeschlagen. Bitte versuchen Sie es erneut.",
      relatedVideos: "Ähnliche Videos",
      description: "Beschreibung",
      buyerSummary: "Spiegel direkt ab Werk für Großhandel und OEM/ODM-Projekte. Die Preise werden nach Ihren Spezifikationen kalkuliert – fragen Sie nach MOQ, Mustern, individuellen Größen und Funktionen, Zertifizierungen und Produktionszeit.",
      factoryQuoteCta: "Werksangebot anfordern",
      quoteBasis: "Preis nach Spezifikation · MOQ, Muster und Produktionszeit anfragen.",
      productReference: "Produktreferenz",
      rfqIntro: "Nennen Sie uns Menge und Spezifikationen. Wir bestätigen Werkskonditionen, MOQ, Musteroptionen und Produktionszeit innerhalb von 24 Stunden.",
      successTitle: "Anfrage erfolgreich gesendet!",
      sendAnother: "Weitere Anfrage senden",
      mobileFactoryPricing: "Werkspreise",
      mobileQuoteMeta: "MOQ · Muster · Lieferzeit",
      mobileQuoteLabel: "Schnellzugriff auf Werksangebot",
      inquiryPlaceholder: "Ich interessiere mich für {{title}}. Bitte erstellen Sie ein Angebot für die geplante Menge und nennen Sie MOQ, Musteroptionen und Produktionszeit.",
      notFound: "Produkt nicht gefunden.",
      previousImage: "Vorheriges Bild",
      nextImage: "Nächstes Bild",
      galleryView: "{{title}} — Ansicht {{index}}",
      premiumQuality: "Premiumqualität",
      globalShipping: "Weltweiter Versand",
      fastTurnaround: "Schnelle Abwicklung",
      oemAvailable: "OEM/ODM verfügbar",
      keySpecs: "Auf einen Blick",
      viewAllSpecs: "Alle Spezifikationen ansehen",
      quotingFor: "Angebotsanfrage für",
      brandSuffix: "| BOLEN Mirror",
      descTemplate: "Hochwertiger {title} von BOLEN Mirror (Jiaxing Chengtai Mirror Co., Ltd.) — OEM/ODM-LED-, Smart-, Schmink- und Badspiegel. Fordern Sie ein Angebot für Großhandelspreise an."
    },
    rfq: {
      intro: "Sie interessieren sich für Großhandelspreise, Sonderanfertigungen oder OEM/ODM? Senden Sie uns Ihre Anfrage; unser Vertrieb antwortet innerhalb von 24 Stunden.",
      quoteIncludesTitle: "Ihr Angebot enthält",
      quoteIncludesMoq: "MOQ und Grundlage des Stückpreises",
      quoteIncludesLeadTime: "Muster- und Produktionszeiten",
      quoteIncludesOptions: "Anpassungs- und Compliance-Optionen für den Zielmarkt",
      prefillMessage: "Ich interessiere mich für {{reference}}. Bitte erstellen Sie ein Angebot für die geplante Menge und nennen Sie MOQ, Stückpreisgrundlage, Muster- und Produktionszeiten sowie Anpassungs- und Compliance-Optionen.",
      contactInformation: "Kontaktinformationen",
      emailUs: "E-Mail senden",
      callUs: "Anrufen",
      visitUs: "Besuchen Sie uns",
      successTitle: "Anfrage erfolgreich gesendet!",
      sendAnother: "Weitere Anfrage senden",
      productInterest: "Produktinteresse (optional)",
      productPlaceholder: "z. B. LED-Badspiegel oder individuelle Schminkspiegel",
      messagePlaceholder: "Bitte nennen Sie geplante Menge, Abmessungen, Funktionen, Zielmarkt und Anpassungswünsche.",
      backupTitle: "Formular kann nicht gesendet werden?",
      backupText: "Kontaktieren Sie uns direkt per E-Mail oder Telefon; wir helfen Ihnen gerne weiter.",
      emailDirectly: "E-Mail senden",
      callDirectly: "Anrufen",
      emailSubject: "BOLEN Spiegelanfrage",
      emailSubjectProduct: "Angebotsanfrage: {{reference}}",
      errors: {
        nameRequired: "Name ist erforderlich",
        emailRequired: "E-Mail-Adresse ist erforderlich",
        invalidEmail: "Ungültige E-Mail-Adresse",
        messageRequired: "Anfragedetails sind erforderlich"
      }
    },
    blog: {
      metaTitle: "BOLEN Einblicke | Beschaffung und Fertigung von LED-Spiegeln",
      metaDescription: "Praxisnahe Einkaufsratgeber, Technik-Erklärungen und OEM/ODM-Fertigungseinblicke für LED-, Smart- und Maßspiegel.",
      schemaName: "BOLEN Mirror Einblicke",
      kicker: "Praktische Orientierung aus der Fertigung",
      titleLead: "Einblicke in die",
      titleAccent: "Spiegelbeschaffung",
      intro: "Einkaufsratgeber, Technik-Erklärungen und Fertigungswissen für LED-Spiegel, Smart-Spiegel und OEM/ODM-Programme.",
      featured: "Empfohlener Einblick",
      readArticle: "Einblick lesen",
      allPosts: "Alle",
      empty: "Noch keine Einblicke veröffentlicht. Schauen Sie bald wieder vorbei.",
      readingTime: "{{minutes}} Min. Lesezeit",
      ctaTitle: "Suchen Sie einen Spiegel nach Ihren Spezifikationen?",
      ctaDesc: "BOLEN fertigt LED-, Smart-, Schmink- und Badspiegel für globale Marken — OEM und ODM, aus einer vertikal integrierten Fabrik.",
      ctaCatalog: "Katalog durchsuchen",
      ctaQuote: "Angebot anfordern",
      related: "Weitere Einblicke",
      viewAll: "Alle ansehen",
      notFound: "Einblick nicht gefunden",
      notFoundDescription: "Der angeforderte BOLEN Einblick wurde nicht gefunden.",
      backToJournal: "Zurück zu den Einblicken",
      relatedProducts: "In diesem Einblick vorgestellt",
      latestHeading: "Neueste Einblicke",
      latestIntro: "Nach Thema filtern oder alle veröffentlichten Ratgeber durchsuchen.",
      filterLabel: "Einblicke nach Thema filtern",
      noMoreInTopic: "In dieser Ansicht gibt es noch keine weiteren Einblicke.",
      nextStepTitle: "Machen Sie aus hilfreichen Einblicken eine werksreife Spezifikation",
      nextStepDescription: "Vergleichen Sie Fertigungswege und senden Sie Maße, Menge, Markt und gewünschte Funktionen für ein gezieltes Angebot.",
      categories: {
        "Buying Guide": "Kaufratgeber",
        "Bolen Story": "BOLEN Geschichte",
        "Technology": "Technologie",
        "Manufacturing": "Fertigung",
        "Design": "Design"
      }
    },
    videos: {
      metaTitle: "LED-Spiegel Videos: Produktdemos, Werksrundgänge & Installation | BOLEN",
      metaDescription: "Sehen Sie BOLEN LED-Spiegel-Videos: Smart-Mirror-Produktdemos, Rundgänge durch das 46.800 m² Werk, Qualitätskontrolle und Installationsanleitungen eines OEM/ODM-Spiegelherstellers mit 21 Jahren Erfahrung.",
      kicker: "Videobibliothek",
      titleLead: "LED-Spiegel Videos:",
      titleAccent: "Produktdemos, Werksrundgänge & Installation",
      intro: "Sehen Sie, wie BOLEN LED-, Smart-, Schmink- und Badspiegel gefertigt, geprüft und montiert werden – kurze Clips aus unserem eigenen Werk in Jiaxing, die Ihre Beschaffungsfragen beantworten, bevor Sie ein Produkt spezifizieren.",
      heroPrimaryCta: "Angebot anfordern",
      heroSecondaryCta: "Produkte ansehen",
      stats: {
        videos: "Videos",
        topics: "Themen",
        runtime: "Minuten Material",
        updated: "Zuletzt aktualisiert"
      },
      spotlightLabel: "Neuestes Video",
      watchNow: "Jetzt ansehen",
      libraryHeading: "Alle Videos",
      libraryIntro: "Nach Thema filtern oder die Bibliothek durchsuchen.",
      resultsCount: "{{count}} Videos",
      search: "Videos suchen...",
      searchLabel: "Videos suchen",
      clearSearch: "Suche löschen",
      filterLabel: "Videos nach Thema filtern",
      allVideos: "Alle Videos",
      clearFilters: "Filter zurücksetzen",
      noResults: "Keine Videos passen zu Ihrer Suche.",
      noResultsHint: "Versuchen Sie ein anderes Stichwort oder setzen Sie die Filter zurück.",
      empty: "Noch keine Videos veröffentlicht. Schauen Sie bald wieder vorbei.",
      cardLabel: "Video",
      latest: "Neu",
      watchLabel: "Ansehen: {{title}}",
      playLabel: "Video abspielen: {{title}}",
      unavailable: "Dieses Video ist vorübergehend nicht verfügbar.",
      duration: "Dauer",
      tagsLabel: "Themen",
      upNext: "Als Nächstes",
      share: {
        label: "Teilen",
        copy: "Link kopieren",
        copied: "Link kopiert",
        copyPrompt: "Diesen Link kopieren",
        linkedin: "Auf LinkedIn teilen",
        whatsapp: "Über WhatsApp teilen",
        email: "Per E-Mail teilen",
        more: "Weitere Optionen zum Teilen"
      },
      notFound: "Video nicht gefunden",
      notFoundDescription: "Das angeforderte BOLEN-Video wurde nicht gefunden.",
      backToVideos: "Zurück zu Videos",
      sidebarKicker: "Diesen Spiegel spezifizieren",
      ctaTitle: "Benötigen Sie diesen Spiegel für Ihre Produktlinie?",
      ctaDesc: "Senden Sie den Clip oder die Produktreferenz an BOLEN. Unser Team kann OEM/ODM-Optionen, Verpackung und Lieferzeit kalkulieren.",
      ctaQuote: "Angebot anfordern",
      ctaCatalog: "Produkte ansehen",
      relatedProductsKicker: "Aus dem Katalog",
      relatedProducts: "Produkte in diesem Video",
      relatedVideos: "Weitere Videos",
      viewAll: "Alle ansehen",
      guide: {
        kicker: "Gedreht in unserem eigenen Werk",
        heading: "Was die Bibliothek abdeckt",
        intro: "Jeder Clip wird an BOLEN-Serienprodukten und im 46.800 m² großen Werk in Jiaxing gefilmt – ohne Stockmaterial. Was Sie sehen, ist das, was geliefert wird.",
        demos: {
          title: "Produktdemos",
          desc: "LED-Farbmodi, stufenloses Dimmen, Antibeschlag, Touchsensoren und Smart-Funktionen an echten Serienprodukten – keine Renderings.",
          cta: "Produktdemos ansehen"
        },
        factory: {
          title: "Werk & Qualitätskontrolle",
          desc: "Glaszuschnitt, LED-Montage, IP44-Prüfung und Verpackung im 46.800 m² Werk in Jiaxing, das Ihre Bestellung versendet.",
          cta: "Das Werk sehen"
        },
        install: {
          title: "Installation & Spezifikationen",
          desc: "Montage-, Verkabelungs- und Handling-Details, mit denen Installateure, Händler und Projekteinkäufer vorausplanen.",
          cta: "Installationsvideos"
        }
      },
      closing: {
        title: "Einen Spiegel gesehen, den Sie spezifizieren möchten?",
        desc: "Senden Sie uns das Video oder die Produktreferenz. Wir antworten mit OEM/ODM-Optionen, MOQ, Verpackung und Lieferzeit – und drehen auf Wunsch eine Demo nach Ihrer Spezifikation."
      },
      categories: {
        "Factory Tour": "Werksrundgang",
        "Product Demo": "Produktdemo",
        "Installation": "Installation",
        "Smart Features": "Smart-Funktionen",
        "Technology": "Technologie",
        "Quality Control": "Qualitätskontrolle"
      }
    },
    admin: {
      dashboard: {
        title: "Admin-Dashboard",
        addProduct: "Produkt hinzufügen",
        tabs: {
          products: "Produkte",
          rfqs: "Anfragen (RFQ)",
          employees: "Mitarbeiter",
          settings: "Einstellungen"
        },
        products: {
          uncategorized: "Nicht kategorisiert",
          noProducts: "Keine Produkte gefunden.",
          deleteConfirm: "Sind Sie sicher, dass Sie dieses Produkt löschen möchten?",
          deleteError: "Fehler beim Löschen des Produkts."
        },
        rfqs: {
          new: "Neu",
          replyEmail: "Per E-Mail antworten",
          noRfqs: "Noch keine Anfragen (RFQ) erhalten."
        },
        employees: {
          status: "Status:",
          approve: "Genehmigen",
          reject: "Ablehnen",
          noEmployees: "Keine Mitarbeiterkonten gefunden.",
          updateError: "Fehler beim Aktualisieren des Mitarbeiterstatus.",
          roles: {
            admin: "ADMIN",
            pending: "AUSSTEHEND",
            rejected: "ABGELEHNT"
          }
        },
        settings: {
          title: "Website-Einstellungen",
          heroBgLabel: "Werbebilder der Startseite",
          heroBgPlaceholder: "https://example.com/image.jpg",
          heroBgHelp: "Fügen Sie Bild-URLs hinzu oder laden Sie Bilder hoch. Das erste Bild ist die Standardeinstellung, wenn keines angegeben wird.",
          preview: "Vorschau:",
          save: "Einstellungen speichern",
          saving: "Wird gespeichert...",
          saveSuccess: "Einstellungen erfolgreich gespeichert!",
          setupRequired: "Datenbank-Setup erforderlich",
          setupDesc: "Um die Website-Einstellungen zu aktivieren, führen Sie bitte den folgenden SQL-Befehl in Ihrem Supabase SQL-Editor aus:",
          setupBtn: "Ich habe den SQL-Befehl ausgeführt",
          addImage: "Bild hinzufügen",
          removeImage: "Entfernen"
        }
      },
      login: {
        title: "Mitarbeiterportal",
        subtitleRegister: "Erstellen Sie ein Mitarbeiterkonto, um Zugriff anzufordern.",
        subtitleLogin: "Melden Sie sich an, um den Produktkatalog zu verwalten und Anfragen (RFQ) anzuzeigen.",
        pendingTitle: "Genehmigung ausstehend!",
        pendingDesc: "Ihr Konto ({{email}}) wartet auf die Genehmigung des Hauptadministrators.",
        deniedTitle: "Zugriff verweigert!",
        deniedDesc: "Ihr Konto ({{email}}) verfügt nicht über Administratorrechte.",
        email: "E-Mail-Adresse",
        password: "Passwort",
        registerBtn: "Konto registrieren",
        signInBtn: "Anmelden",
        quickLogin: "Schnellanmeldung (Hauptadministrator)",
        orContinueWith: "Oder fortfahren mit",
        googleLogin: "Google (Hauptadministrator)",
        alreadyHaveAccount: "Haben Sie bereits ein Konto? Anmelden",
        needAccount: "Benötigen Sie ein Mitarbeiterkonto? Registrieren",
        errors: {
          loginFailed: "Bei der Anmeldung ist ein Fehler aufgetreten.",
          generalError: "Ein Fehler ist aufgetreten."
        }
      },
      productForm: {
        backToDashboard: "Zurück zum Dashboard",
        supabaseSetupTitle: "Supabase-Setup erforderlich",
        supabaseSetupDesc: "Um Bild-Uploads zu aktivieren, fügen Sie bitte VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY zu Ihren Umgebungsvariablen (oder AI Studio-Secrets) hinzu und erstellen Sie die App neu.",
        editProduct: "Produkt bearbeiten",
        addProduct: "Neues Produkt hinzufügen",
        productTitle: "Produkttitel",
        category: "Kategorie",
        priceRange: "Preisspanne",
        msrp: "UVP",
        shortDesc: "Kurzbeschreibung",
        longDetails: "Lange Details (Rich Text / HTML erlaubt)",
        images: "Bilder",
        uploading: "Wird hochgeladen...",
        uploadImages: "Bilder hochladen",
        addUrl: "URL hinzufügen",
        specifications: "Spezifikationen",
        addSpec: "Spezifikation hinzufügen",
        cancel: "Abbrechen",
        saveProduct: "Produkt speichern",
        errors: {
          titleRequired: "Titel ist erforderlich",
          descRequired: "Beschreibung ist erforderlich",
          urlRequired: "URL ist erforderlich"
        },
        placeholders: {
          specKey: "z. B. Abmessungen",
          specValue: "z. B. 24x36 Zoll"
        },
        alerts: {
          supabaseNotConfigured: "Supabase ist nicht konfiguriert. Bitte fügen Sie VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY zu Ihren Umgebungsvariablen hinzu und erstellen Sie die App neu.",
          bucketNotFound: "Speicher-Bucket \"product-images\" nicht gefunden. Bitte erstellen Sie ihn in Ihrem Supabase-Dashboard und setzen Sie ihn auf Öffentlich.",
          uploadFailed: "Fehler beim Hochladen der Bilder: {{message}}",
          saveFailed: "Fehler beim Speichern des Produkts. Überprüfen Sie die Konsole für Details."
        }
      }
    }
  }
};
