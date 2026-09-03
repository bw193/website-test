export const fr = {
  translation: {
    // Page-level <title>/<meta description> for the four static routes.
    // scripts/prerender-static.ts reads these same values, so the tags baked
    // into the static HTML and the tags react-helmet-async writes on mount
    // cannot drift. Previously the pages passed hardcoded English, which
    // overwrote the correctly-localized prerendered meta on 5 locales.
    seo: {
      homeTitle: "BOLEN Mirror | Fabricant de Miroirs LED et Usine OEM de Miroirs Intelligents",
      homeDesc: "BOLEN Mirror est un fabricant leader de miroirs LED spécialisé dans les miroirs LED OEM, les miroirs intelligents, les miroirs de toilette et les miroirs de salle de bain pour les marques mondiales.",
      catalogTitle: "Catalogue de Produits Miroirs LED | Fabricant BOLEN Mirror",
      catalogDesc: "Explorez notre large gamme de miroirs LED OEM, miroirs intelligents, miroirs de toilette et miroirs de salle de bain d'un fabricant leader de miroirs LED. Fabrication de haute qualité pour les marques mondiales.",
      categoryTitle: "{{category}} | Fabricant BOLEN Mirror",
      categoryDesc: "Parcourez {{category}} BOLEN pour la vente en gros OEM/ODM. Miroirs LED, de toilette et de salle de bain en direct d'usine pour marques mondiales et projets hôteliers.",
      storyTitle: "Notre Histoire | Fabricant de Miroirs LED BOLEN",
      storyDesc: "Découvrez l'histoire et le savoir-faire de BOLEN (Jiaxing Chengtai Mirror Co., Ltd.), fabricant de miroirs LED et intelligents OEM fondé en 2005.",
      rfqTitle: "Demande de Devis | Fabricant de Miroirs LED BOLEN",
      rfqDesc: "Contactez BOLEN, un fabricant leader de miroirs LED, pour les demandes OEM/ODM, la fabrication de miroirs personnalisés et les commandes en gros."
    },
    navbar: {
      home: "Accueil",
      catalog: "Catalogue",
      ourStory: "Notre Histoire",
      blog: "Conseils",
      videos: "Vidéos",
      adminDashboard: "Tableau de Bord",
      logout: "Déconnexion",
      employeeLogin: "Connexion Employé"
    },
    footer: {
      description: "Fabricant et exportateur de miroirs haut de gamme. Nous fournissons des miroirs de toilette modernes et de qualité aux entreprises du monde entier.",
      contact: "Contact",
      quickLinks: "Liens rapides",
      rights: "Tous droits réservés."
    },
    accessibility: {
      skipToContent: "Aller au contenu"
    },
    aiReceptionist: {
      title: "Assistant IA BOLEN",
      available: "Disponible",
      subtitle: "Choix de produits et devis",
      closeLabel: "Fermer l’assistant IA",
      greeting: "Bonjour ! Je suis l’assistant IA BOLEN pour le choix de produits et les demandes de devis. Je peux vous renseigner sur nos produits, les quantités minimales, la personnalisation, les certifications et les délais.",
      quickQuestionsLabel: "Questions suggérées",
      quickQuestions: "Questions rapides",
      quickProduct: "Quel miroir convient à mon projet ?",
      quickMoq: "Quelle est votre quantité minimale de commande ?",
      quickCustomization: "Quels éléments puis-je personnaliser ?",
      quickLeadTime: "Quels sont les délais pour les échantillons et la production ?",
      youLabel: "Vous",
      assistantLabel: "Assistant IA",
      thinking: "Réflexion en cours…",
      timeoutError: "La réponse prend trop de temps. Veuillez réessayer.",
      error: "Je ne peux pas répondre pour le moment. Veuillez réessayer.",
      retry: "Réessayer",
      humanCta: "Demander un devis à notre équipe commerciale",
      inputLabel: "Écrire à l’assistant IA",
      placeholder: "Posez une question sur nos produits, les quantités minimales ou la personnalisation…",
      sendLabel: "Envoyer le message",
      emailInvalid: "Saisissez une adresse e-mail valide.",
      emailConsentRequired: "Confirmez que nous pouvons utiliser votre e-mail pour assurer le suivi.",
      emailTimeoutError: "L’enregistrement de votre e-mail a pris trop de temps. Réessayez.",
      emailSubmitError: "Nous n’avons pas pu enregistrer votre e-mail. Réessayez.",
      emailGateTitle: "Continuer la conversation",
      emailGateDescription: "Vous avez reçu votre première réponse IA. Saisissez votre e-mail pour continuer.",
      emailGateDescriptionWithLimit: "Vous avez reçu votre première réponse IA. Saisissez votre e-mail pour continuer, avec jusqu’à {{maxTurns}} questions dans cette session.",
      emailLabel: "Adresse e-mail",
      emailCompactPlaceholder: "E-mail professionnel pour continuer",
      emailPlaceholder: "vous@entreprise.com",
      emailConsentCompact: "J’accepte le suivi par e-mail et son association à ce chat pendant 90 jours maximum.",
      emailConsent: "J’accepte que BOLEN utilise cet e-mail pour le suivi de ma demande et l’associe à ce chat pendant 90 jours au maximum.",
      emailSubmitting: "Enregistrement…",
      emailContinueShort: "Continuer",
      emailContinue: "Continuer avec l’e-mail",
      turnLimitReached: "Vous avez atteint la limite de questions IA pour cette session. Notre équipe commerciale peut continuer à vous aider.",
      turnLimitTitle: "Limite de questions atteinte",
      turnLimitDescription: "Contactez notre équipe commerciale pour poursuivre.",
      turnLimitDescriptionWithLimit: "Cette session comprend jusqu’à {{maxTurns}} questions IA. Contactez notre équipe commerciale pour plus d’aide.",
      turnUsage: "Questions IA utilisées : {{completedTurns}} sur {{maxTurns}}.",
      privacyNote: "Nous conservons une copie automatiquement anonymisée de ce chat pendant 90 jours au maximum. Ne saisissez pas de coordonnées ni de données d’identité, de paiement ou de compte dans le chat. L’e-mail envoyé via le formulaire séparé est conservé avec votre consentement et visible uniquement par les administrateurs autorisés.",
      privacyNoteCompact: "Le chat anonymisé est conservé jusqu’à 90 jours. Ne saisissez aucune donnée sensible.",
      privacyContact: "Demande de confidentialité",
      openLabel: "Ouvrir l’assistant IA BOLEN",
      buttonText: "Demander à l’IA"
    },
    ourStoryPage: {
      title: "Notre Histoire",
      subtitle: "Jiaxing Chengtai Mirror Co., Ltd. (BOLEN)",
      hero: {
        kicker: "Fabrication de miroirs LED à Jiaxing depuis 2005",
        titleLine1: "Fabriqués ici.",
        titleLine2: "Une confiance qui dépasse nos frontières.",
        description: "Du cahier des charges validé à l'expédition emballée, BOLEN réunit le développement de miroirs sur mesure, la production, le contrôle et la préparation en marque propre sur son site de Jiaxing.",
        tourCta: "Visiter l'usine",
        factsCta: "Voir les données de l'entreprise",
        city: "Jiaxing, Chine",
        facilitySuffix: "m² de site de production",
        productsSuffix: "produits dans le catalogue actualisé"
      },
      chapters: {
        company: "Entreprise",
        factory: "Usine",
        making: "Fabrication",
        quality: "Qualité",
        partnership: "Partenariat"
      },
      company: {
        eyebrow: "L'entreprise en bref",
        titleLine1: "Un fabricant spécialisé dans les miroirs.",
        titleLine2: "Conçu pour des collaborations de production durables.",
        description: "Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) a été fondée en 2005. Aujourd'hui, plus de 200 spécialistes travaillent sur un site de production de 46 800 m² à Jiaxing et accompagnent les programmes de miroirs sur mesure, de la spécification à l'expédition.",
        foundedLabel: "Fondation",
        foundedNote: "En activité depuis 2005.",
        facilityLabel: "Surface de production",
        facilityNote: "46 800 m² à Jiaxing.",
        teamLabel: "Spécialistes",
        teamNote: "Plus de 200 personnes réparties entre la production et les fonctions support.",
        catalogLabel: "Catalogue actualisé",
        catalogNote: "Le nombre actuel de produits provient de la base de données du site web.",
        snapshotLabel: "Instantané des données",
        snapshotNote: "Les décomptes actuels du catalogue et des contenus multimédias sont actualisés depuis la base de données du site web."
      },
      process: {
        eyebrow: "Du cahier des charges à l'expédition",
        titleLine1: "Un processus continu.",
        titleLine2: "Six étapes avec des responsabilités claires.",
        description: "Chaque programme suit une séquence définie afin que les exigences, les validations, les contrôles de production, l'emballage et les modalités de livraison restent visibles.",
        steps: {
          brief: {
            label: "01 · Cahier des charges",
            title: "Les exigences avant tout",
            description: "Nous commençons par préciser les fonctions attendues du miroir, son lieu de vente ou d'installation et les modalités de livraison de la commande.",
            check1: "Usage, marché de destination et volume de la commande",
            check2: "Dimensions, forme, fonctions et finition recherchées",
            check3: "Délais et besoins en emballage et en documentation"
          },
          specification: {
            label: "02 · Spécification",
            title: "Conception sur mesure validée",
            description: "Le cahier des charges convenu devient une spécification prête pour la production avant le début de la fabrication.",
            check1: "Plans, dimensions, tolérances et détails de fixation",
            check2: "Options d'éclairage, électriques, de matériaux et de commande",
            check3: "Validation de l'échantillon et confirmation documentée des modifications"
          },
          manufacturing: {
            label: "03 · Fabrication",
            title: "Fabrication de précision",
            description: "Le verre, les cadres, l'éclairage, les composants électriques et les fonctions intelligentes sont assemblés au fil d'étapes de production coordonnées.",
            check1: "Découpe du verre, finition des chants et préparation des surfaces",
            check2: "Intégration du cadre, des LED, des composants électriques et des fonctions",
            check3: "Assemblage contrôlé selon la spécification validée"
          },
          inspection: {
            label: "04 · Contrôle",
            title: "Contrôle aux étapes clés",
            description: "L'apparence, le fonctionnement et la qualité de fabrication sont vérifiés selon les exigences approuvées avant l'emballage.",
            check1: "Finition visible, surface du miroir, dimensions et ajustement",
            check2: "Éclairage, commandes, désembuage et fonctions spécifiées",
            check3: "Détails d'assemblage, accessoires et homogénéité de la commande"
          },
          packaging: {
            label: "05 · Emballage",
            title: "Emballage en marque propre",
            description: "Les détails de l'emballage sont préparés selon le produit, la marque et les exigences de livraison confirmées pour la commande.",
            check1: "Étiquettes de marque, manuels, accessoires et encarts",
            check2: "Matériaux de protection adaptés au miroir et au carton",
            check3: "Vérification des informations du carton et des marques d'expédition"
          },
          logistics: {
            label: "06 · Logistique",
            title: "Expédition et logistique",
            description: "Les quantités finales, les informations d'emballage et les modalités d'expédition sont coordonnées avant que la commande ne quitte le site.",
            check1: "Confirmation finale des quantités et des palettes",
            check2: "Coordination des documents d'expédition de la commande",
            check3: "Remise au transporteur et mises à jour du suivi"
          }
        }
      },
      gallery: {
        eyebrow: "Dans l'usine",
        title: "Le travail, les équipements et les équipes au plus près.",
        description: "Parcourez les images récentes de l'usine gérées dans la base de données du site web. Lorsqu'elles sont disponibles, les légendes précisent le travail présenté.",
        previous: "Image précédente de l'usine",
        next: "Image suivante de l'usine",
        selectImage: "Sélectionner une image de l'usine",
        activeImage: "Image actuelle de l'usine"
      },
      film: {
        eyebrow: "Film de l'usine",
        title: "Découvrez le processus en mouvement.",
        description: "Regardez des vidéos publiées de l'usine et des produits, sélectionnées dans la vidéothèque du site web.",
        play: "Lire le film de l'usine",
        watchFilm: "Regarder le film de l'usine",
        allVideos: "Voir toutes les vidéos",
        videoCountSuffix: "vidéos publiées"
      },
      quality: {
        eyebrow: "Qualité et adéquation au marché",
        titleLine1: "Des preuves avant les affirmations.",
        titleLine2: "Un périmètre confirmé pour chaque commande.",
        description: "Les rapports de contrôle et la documentation produit disponible aident les acheteurs à évaluer le modèle adapté au marché visé.",
        documentsLabel: "Documents et contrôles",
        scopeNote: "La couverture des certifications et des documents varie selon le modèle et le marché de destination et est confirmée lors du devis."
      },
      partnership: {
        eyebrow: "Démarrer un projet",
        titleLine1: "Confiez-nous votre cahier des charges.",
        titleLine2: "Nous définirons la prochaine étape.",
        description: "Indiquez-nous le produit, le volume, le marché cible et le calendrier envisagés. Notre équipe examinera les exigences et vous répondra avec les éléments nécessaires pour avancer.",
        primaryCta: "Demander un devis",
        secondaryCta: "Parcourir le catalogue",
        emailLabel: "E-mail",
        phoneLabel: "Téléphone"
      },
      accessibility: {
        chapterNavigation: "Navigation dans les chapitres de notre histoire",
        processTabs: "Étapes du processus de fabrication",
        processPanel: "Détails du processus de fabrication",
        factoryGallery: "Galerie d'images de l'usine"
      }
    },
    home: {
      companyName: "Jiaxing Chengtai Mirror Co., Ltd.",
      heroKicker: "Fabricant de miroirs LED · Partenaire OEM/ODM",
      heroTitle1: "Des miroirs haut de gamme,",
      heroTitle2: "conçus sur mesure pour votre marque.",
      heroDesc: "<1>BOLEN</1> accompagne des marques du monde entier dans la commercialisation de collections de miroirs distinctives. De la conception et de la personnalisation à la production soumise à un contrôle qualité rigoureux et à la livraison mondiale, nous rendons la fabrication haut de gamme simple, fiable et adaptée à tous les volumes.",
      heroPrimaryCta: "Demander prix et MOQ",
      heroSecondaryCta: "Découvrir nos produits",
      stats: {
        sqMeters: "Site de production",
        artisans: "Spécialistes qualifiés",
        styles: "Modèles de miroirs",
        global: "Livraison mondiale"
      },
      about: {
        heritage: "Notre Héritage",
        title1: "Portée Mondiale :",
        title2: "De Shanghai au Monde Entier",
        desc1: "Basés à Jiaxing, Zhejiang, en Chine — à seulement 60 kilomètres de Shanghai — nous avons établi une forte présence mondiale, avec des marchés principaux couvrant l'Europe (Espagne, Pays-Bas, Norvège, Danemark, Royaume-Uni et Roumanie), l'Amérique du Nord et l'Australie.",
        desc2: "Nous exploitons deux sièges sociaux et deux usines de production de pointe. Notre main-d'œuvre dévouée gère plusieurs lignes de production de miroirs LED et d'essayage, ainsi que des ateliers spécialisés sur mesure, le tout en stricte conformité avec les normes de gestion de la qualité ISO 9001.",
        backedBy: "Soutenu par plus de 200 professionnels",
        quote: "\"La Qualité d'Abord, Les Clients d'Abord\"",
        corePrinciple: "Notre Principe Fondamental"
      },
      collections: {
        subtitle: "Collections",
        title: "Polyvalent et Sur Mesure",
        desc: "Nous fabriquons des miroirs LED, des miroirs de salle de bain, des miroirs de toilette et des armoires à miroir, proposant des milliers de styles et des solutions entièrement sur mesure.",
        viewAll: "Voir Tous les Produits",
        smart: {
          tag: "Phare",
          title: "Miroirs Intelligents et LED",
          desc: "Miroirs de salle de bain rétroéclairés avec interrupteurs tactiles, fonction anti-buée et haut-parleurs Bluetooth.",
          explore: "Explorer la Catégorie"
        },
        vanity: {
          title: "Décoratif et Coiffeuse",
          desc: "Miroirs de courtoisie de qualité hôtelière avec commandes par capteur et grossissement.",
          explore: "Explorer"
        },
        oem: {
          title: "Services OEM / ODM",
          desc: "Personnalisez la taille, le matériau, la fonction, le logo et l'emballage en fonction des besoins du client.",
          partner: "Devenez Partenaire"
        }
      },
      certificates: {
        subtitle: "Nos Qualifications",
        title: "Certifications Mondiales"
      },
      factoryShowcase: {
        subtitle: "À l'Intérieur de l'Usine",
        title: "Là Où Naît Chaque Miroir",
        desc: "Visite de notre site de 46 800 m² à Jiaxing — production verticalement intégrée de miroirs LED, intelligents, de toilette et de salle de bain, du verre brut à la palette prête à expédier.",
        empty: "Photos de l'usine bientôt disponibles."
      },
      featuredVideo: {
        subtitle: "Vidéo à la Une",
        nowPlaying: "Lecture en cours",
        title: "Découvrez Nos Miroirs en Mouvement",
        desc: "Un clic pour entrer dans l'atelier : découvrez comment les miroirs LED, intelligents et de toilette BOLEN sont fabriqués, finis et testés avant expédition.",
        watch: "Voir la vidéo complète",
        viewAll: "Toutes les vidéos",
        playAria: "Lire la vidéo : {{title}}",
        pauseAria: "Mettre en pause la vidéo d'arrière-plan",
        soundOn: "Activer le son",
        soundOff: "Couper le son"
      },
      advantage: {
        subtitle: "L'Atout BOLEN",
        title: "Atout de Fabrication",
        desc: "Vingt et un ans de production verticalement intégrée, une usine de 46 800 m² et un emplacement logistique privilégié à proximité des ports de Shanghai et Ningbo.",
        features: {
          f1: { title: "Capacité de Fabrication Éprouvée", desc: "Établie il y a 21 ans, notre installation de 46 800 m² emploie plus de 200 ouvriers qualifiés, garantissant une chaîne d'approvisionnement stable et des délais de livraison fiables." },
          f2: { title: "Emplacement Stratégique", desc: "Situés à proximité des ports de Shanghai et Ningbo, nous bénéficions d'un emplacement de choix qui assure une logistique pratique et efficace." },
          f3: { title: "Usine Directe et Rentable", desc: "En tant qu'usine directe, nous éliminons les coûts d'intermédiaires pour offrir des prix très compétitifs sans compromettre la qualité, garantissant la meilleure valeur pour votre entreprise." }
        }
      },
      manufacturingProcess: {
        subtitle: "Du Brief à la Palette",
        title: "Processus de Fabrication",
        desc: "Six étapes rigoureusement contrôlées mènent chaque commande de la spécification à l'expédition.",
        steps: {
          s1: { title: "Analyse des Besoins", desc: "Solutions sur mesure basées sur votre vision spécifique et les besoins du marché." },
          s2: { title: "Conception Personnalisée", desc: "Confirmation de chaque détail avant la production pour garantir que le produit final répond à vos attentes." },
          s3: { title: "Fabrication de Précision", desc: "Intégration des lignes automatisées et de la précision manuelle pour une qualité et une efficacité optimales." },
          s4: { title: "Inspection Qualité 100%", desc: "Contrôles qualité stricts sur l'apparence, la fonction et la fabrication du miroir." },
          s5: { title: "Emballage Personnalisé", desc: "Image de marque entièrement personnalisable pour renforcer votre compétitivité sur le marché." },
          s6: { title: "Délai Stable", desc: "Planification fiable et logistique efficace pour garantir une livraison à temps." }
        }
      },
      whyUs: {
        title1: "Pourquoi Choisir",
        title2: "Bolen ?",
        features: [
          { title: "Accès au Marché Mondial et Qualité Certifiée" },
          { title: "Usine Directe et Rentable" },
          { title: "Contrôle Qualité Rigoureux et Garantie" },
          { title: "Personnalisation Complète" }
        ],
        paragraphs: [
          "Nous avons établi des partenariats solides en Europe (NL, RO, UK, ES, NO, DK), au Moyen-Orient, en Amérique du Nord, en Australie et en Amérique du Sud. Nos produits sont entièrement conformes aux normes internationales et possèdent les certifications CE, CB, RoHS, IP44, SAA, entre autres.",
          "En tant que fabricant direct, nous offrons des prix très compétitifs. Nous nous engageons à livrer une qualité premium parfaitement adaptée à vos exigences budgétaires.",
          "Notre système d'assurance qualité est à la hauteur de notre engagement après-vente. Chaque produit subit une inspection à 100% avant expédition, soutenue par une garantie complète de 2 ans sur les composants électroniques.",
          "Du verre des miroirs à l'emballage, nous offrons des services de personnalisation OEM/ODM de bout en bout, conçus pour vous aider à étendre votre portée et à construire votre marque."
        ]
      },
      cta: {
        title: "Prêt à Sublimer Votre Espace ?",
        desc: "Contactez-nous dès aujourd'hui pour discuter de vos besoins personnalisés ou parcourez notre vaste catalogue de miroirs haut de gamme.",
        viewCatalog: "Voir le Catalogue",
        contactSales: "Contacter les Ventes"
      }
    },
    products: {
      catalog: "Catalogue de Produits",
      kicker: "OEM · ODM · Direct usine",
      desc: "Parcourez notre vaste collection de miroirs haut de gamme, dotés de la technologie LED intelligente, de designs élégants et d'options personnalisables.",
      noProducts: "Aucun produit trouvé correspondant à vos critères.",
      emptyTitle: "Aucun produit trouvé",
      emptySearch: "Aucun résultat pour « {{query}} ». Essayez d’ajuster votre recherche ou vos filtres.",
      clearFilters: "Effacer tous les filtres",
      viewDetails: "Voir les Détails",
      searchLabel: "Rechercher des produits",
      searchPlaceholder: "Rechercher des produits...",
      resultCount: "{{count}} produits trouvés",
      showMore: "Afficher plus",
      allCategories: "Toutes les Catégories",
      categoriesNav: "Catégories de produits",
      categoryIntro: "{{category}} en direct d'usine pour projets OEM/ODM et gros — dimensions, éclairage et finitions sur mesure depuis Jiaxing.",
      categories: {
        "New Arrival": "Nouveautés",
        "Hot Sale": "En Promotion",
        "Led Lighted Mirror": "Miroir Lumineux LED",
        "Bathroom Mirror without led": "Miroir de Salle de Bain sans LED",
        "Full Length Dressing Mirror": "Miroir sur Pied",
        "Irregular Mirror": "Miroir Irrégulier"
      },
      priceRange: "Gamme de Prix",
      priceRangeLabel: "Fourchette indicative usine",
      priceQualifier: "Le prix final dépend de la quantité et des spécifications",
      msrp: "Prix de Vente Conseillé"
    },
    productDetail: {
      backToCatalog: "Retour au Catalogue",
      specifications: "Spécifications",
      productDetails: "Détails du Produit",
      requestQuote: "Demander un Devis (RFQ)",
      companyName: "Entreprise / Nom du Contact",
      email: "Adresse E-mail",
      inquiryDetails: "Détails de la Demande (Quantité, Personnalisation, etc.)",
      submitRfq: "Soumettre RFQ",
      submitting: "Soumission...",
      rfqSuccess: "RFQ soumis avec succès ! Nous vous contacterons bientôt.",
      rfqError: "Échec de la soumission du RFQ. Veuillez réessayer.",
      relatedVideos: "Vidéos associées",
      description: "Description",
      buyerSummary: "Miroirs en direct d'usine pour projets de gros et OEM/ODM. Le prix est calculé selon vos spécifications : demandez le MOQ, les échantillons, les dimensions et fonctions sur mesure, les certifications et le délai de production.",
      factoryQuoteCta: "Demander un prix usine",
      quoteBasis: "Prix selon spécifications · Demandez le MOQ, les échantillons et le délai de production.",
      productReference: "Référence produit",
      rfqIntro: "Indiquez-nous la quantité et les spécifications souhaitées. Nous confirmerons le prix usine, le MOQ, les options d'échantillon et le délai de production sous 24 heures.",
      successTitle: "Demande envoyée avec succès !",
      sendAnother: "Envoyer une autre demande",
      mobileFactoryPricing: "Prix usine",
      mobileQuoteMeta: "MOQ · Échantillons · Délai",
      mobileQuoteLabel: "Accès rapide au devis usine",
      inquiryPlaceholder: "Je suis intéressé par {{title}}. Merci d'établir un devis pour la quantité estimée et d'indiquer le MOQ, les options d'échantillon et le délai de production.",
      notFound: "Produit introuvable.",
      previousImage: "Image précédente",
      nextImage: "Image suivante",
      galleryView: "{{title}} — vue {{index}}",
      premiumQuality: "Qualité premium",
      globalShipping: "Expédition mondiale",
      fastTurnaround: "Production rapide",
      oemAvailable: "OEM/ODM disponible",
      keySpecs: "En bref",
      viewAllSpecs: "Voir toutes les spécifications",
      quotingFor: "Demande de devis pour",
      brandSuffix: "| BOLEN Mirror",
      descTemplate: "{title} haut de gamme, fabriqué par BOLEN Mirror (Jiaxing Chengtai Mirror Co., Ltd.) — miroirs LED, intelligents, de toilette et de salle de bain OEM/ODM. Demandez un devis pour les tarifs en gros."
    },
    rfq: {
      intro: "Vous recherchez des tarifs de gros, une commande sur mesure ou des services OEM/ODM ? Envoyez-nous votre demande ; notre équipe commerciale répondra sous 24 heures.",
      quoteIncludesTitle: "Votre devis comprendra",
      quoteIncludesMoq: "MOQ et base du prix unitaire",
      quoteIncludesLeadTime: "Délais d'échantillon et de production",
      quoteIncludesOptions: "Options de personnalisation et de conformité au marché cible",
      prefillMessage: "Je suis intéressé par {{reference}}. Merci d'établir un devis pour la quantité estimée et d'indiquer le MOQ, la base du prix unitaire, les délais d'échantillon et de production, ainsi que les options de personnalisation et de conformité.",
      contactInformation: "Coordonnées",
      emailUs: "Nous écrire",
      callUs: "Nous appeler",
      visitUs: "Nous rendre visite",
      successTitle: "Demande envoyée avec succès !",
      sendAnother: "Envoyer une autre demande",
      productInterest: "Produit recherché (facultatif)",
      productPlaceholder: "p. ex. miroirs LED de salle de bain ou miroirs de toilette sur mesure",
      messagePlaceholder: "Indiquez la quantité estimée, les dimensions, les fonctions, le marché cible et les besoins de personnalisation.",
      backupTitle: "Impossible d'envoyer le formulaire ?",
      backupText: "Écrivez-nous ou appelez-nous directement ; nous vous aiderons dans votre demande.",
      emailDirectly: "Nous écrire",
      callDirectly: "Nous appeler",
      emailSubject: "Demande de devis miroirs BOLEN",
      emailSubjectProduct: "Demande de devis : {{reference}}",
      errors: {
        nameRequired: "Le nom est obligatoire",
        emailRequired: "L'adresse e-mail est obligatoire",
        invalidEmail: "Adresse e-mail non valide",
        messageRequired: "Les détails de la demande sont obligatoires"
      }
    },
    blog: {
      metaTitle: "Conseils BOLEN | Achat et Fabrication de Miroirs LED",
      metaDescription: "Guides d'achat pratiques, explications techniques et conseils de fabrication OEM/ODM pour les miroirs LED, intelligents et sur mesure.",
      schemaName: "Conseils BOLEN Mirror",
      kicker: "Conseils pratiques issus de l'usine",
      titleLead: "Conseils d'achat de",
      titleAccent: "miroirs",
      intro: "Conseils d'achat, explications techniques et savoir-faire de fabrication pour les miroirs LED, intelligents et les programmes OEM/ODM.",
      featured: "Conseil à la une",
      readArticle: "Lire le conseil",
      allPosts: "Tous",
      empty: "Aucun conseil publié pour le moment. Revenez bientôt.",
      readingTime: "{{minutes}} min de lecture",
      ctaTitle: "Vous cherchez un miroir fabriqué selon vos spécifications ?",
      ctaDesc: "BOLEN fabrique des miroirs LED, intelligents, de toilette et de salle de bain pour les marques mondiales — OEM et ODM, depuis une usine verticalement intégrée.",
      ctaCatalog: "Parcourir le catalogue",
      ctaQuote: "Demander un devis",
      related: "Plus de conseils",
      viewAll: "Voir tout",
      notFound: "Conseil introuvable",
      notFoundDescription: "Le conseil BOLEN demandé est introuvable.",
      backToJournal: "Retour aux conseils",
      relatedProducts: "Produits de ce conseil",
      latestHeading: "Derniers conseils",
      latestIntro: "Filtrez par thème ou parcourez tous les guides publiés.",
      filterLabel: "Filtrer les conseils par thème",
      noMoreInTopic: "Aucun autre conseil dans cette vue pour le moment.",
      nextStepTitle: "Transformez ces conseils en spécification prête pour l'usine",
      nextStepDescription: "Comparez les options de fabrication, puis envoyez dimensions, quantité, marché et fonctions requises pour un devis précis.",
      categories: {
        "Buying Guide": "Guide d'achat",
        "Bolen Story": "Histoire de BOLEN",
        "Technology": "Technologie",
        "Manufacturing": "Fabrication",
        "Design": "Design"
      }
    },
    videos: {
      metaTitle: "Vidéos miroirs LED : démos, visites d'usine et installation | BOLEN",
      metaDescription: "Regardez les vidéos de miroirs LED BOLEN : démonstrations de miroirs connectés, visites de l'usine de 46 800 m², contrôle qualité et guides d'installation d'un fabricant OEM/ODM depuis 21 ans.",
      kicker: "Vidéothèque",
      titleLead: "Vidéos miroirs LED :",
      titleAccent: "démos produit, visites d'usine et installation",
      intro: "Voyez comment les miroirs LED, connectés, de toilette et de salle de bain BOLEN sont fabriqués, testés et installés : de courts clips tournés dans notre propre usine de Jiaxing qui répondent à vos questions d'achat avant de spécifier un produit.",
      heroPrimaryCta: "Demander un devis",
      heroSecondaryCta: "Voir les produits",
      stats: {
        videos: "Vidéos",
        topics: "Thèmes",
        runtime: "Minutes d'images",
        updated: "Dernière mise à jour"
      },
      spotlightLabel: "Dernière vidéo",
      watchNow: "Regarder",
      libraryHeading: "Toutes les vidéos",
      libraryIntro: "Filtrez par thème ou recherchez dans la vidéothèque.",
      resultsCount: "{{count}} vidéos",
      search: "Rechercher des vidéos...",
      searchLabel: "Rechercher des vidéos",
      clearSearch: "Effacer la recherche",
      filterLabel: "Filtrer les vidéos par thème",
      allVideos: "Toutes les vidéos",
      clearFilters: "Réinitialiser les filtres",
      noResults: "Aucune vidéo ne correspond à votre recherche.",
      noResultsHint: "Essayez un autre mot-clé ou réinitialisez les filtres.",
      empty: "Aucune vidéo publiée pour le moment. Revenez bientôt.",
      cardLabel: "Vidéo",
      latest: "Récent",
      watchLabel: "Regarder : {{title}}",
      playLabel: "Lire la vidéo : {{title}}",
      unavailable: "Cette vidéo est temporairement indisponible.",
      duration: "Durée",
      tagsLabel: "Thèmes",
      upNext: "À suivre",
      share: {
        label: "Partager",
        copy: "Copier le lien",
        copied: "Lien copié",
        copyPrompt: "Copiez ce lien",
        linkedin: "Partager sur LinkedIn",
        whatsapp: "Partager sur WhatsApp",
        email: "Partager par e-mail",
        more: "Autres options de partage"
      },
      notFound: "Vidéo introuvable",
      notFoundDescription: "La vidéo BOLEN demandée est introuvable.",
      backToVideos: "Retour aux vidéos",
      sidebarKicker: "Spécifier ce miroir",
      ctaTitle: "Besoin de ce miroir pour votre gamme ?",
      ctaDesc: "Envoyez le clip ou la référence produit à BOLEN et notre équipe pourra chiffrer les options OEM/ODM, l'emballage et le délai.",
      ctaQuote: "Demander un devis",
      ctaCatalog: "Voir les produits",
      relatedProductsKicker: "Du catalogue",
      relatedProducts: "Produits présentés dans cette vidéo",
      relatedVideos: "Plus de vidéos",
      viewAll: "Voir tout",
      guide: {
        kicker: "Tourné dans notre propre usine",
        heading: "Ce que couvre la vidéothèque",
        intro: "Chaque clip est filmé sur des unités de production BOLEN et dans l'usine de 46 800 m² de Jiaxing, sans images de banque : ce que vous voyez est ce qui est expédié.",
        demos: {
          title: "Démonstrations produit",
          desc: "Modes de couleur LED, variation continue, antibuée, capteurs tactiles et fonctions connectées présentés sur de vraies unités de production, pas des rendus.",
          cta: "Voir les démonstrations"
        },
        factory: {
          title: "Usine et contrôle qualité",
          desc: "Découpe du verre, assemblage LED, tests IP44 et emballage dans l'usine de 46 800 m² de Jiaxing qui expédie votre commande.",
          cta: "Visiter l'usine"
        },
        install: {
          title: "Installation et spécifications",
          desc: "Détails de montage, de câblage et de manutention qui aident installateurs, détaillants et acheteurs de projets à anticiper.",
          cta: "Vidéos d'installation"
        }
      },
      closing: {
        title: "Vous avez repéré un miroir à spécifier ?",
        desc: "Envoyez-nous la vidéo ou la référence produit. Nous répondons avec les options OEM/ODM, le MOQ, l'emballage et le délai, et pouvons filmer une démonstration sur mesure de votre spécification."
      },
      categories: {
        "Factory Tour": "Visite d'usine",
        "Product Demo": "Démonstration produit",
        "Installation": "Installation",
        "Smart Features": "Fonctions intelligentes",
        "Technology": "Technologie",
        "Quality Control": "Contrôle qualité"
      }
    },
    admin: {
      dashboard: {
        title: "Tableau de Bord",
        addProduct: "Ajouter un Produit",
        tabs: {
          products: "Produits",
          rfqs: "Demandes (RFQ)",
          employees: "Employés",
          settings: "Paramètres"
        },
        products: {
          uncategorized: "Non catégorisé",
          noProducts: "Aucun produit trouvé.",
          deleteConfirm: "Êtes-vous sûr de vouloir supprimer ce produit ?",
          deleteError: "Échec de la suppression du produit."
        },
        rfqs: {
          new: "Nouveau",
          replyEmail: "Répondre par E-mail",
          noRfqs: "Aucune demande (RFQ) reçue pour le moment."
        },
        employees: {
          status: "Statut :",
          approve: "Approuver",
          reject: "Rejeter",
          noEmployees: "Aucun compte employé trouvé.",
          updateError: "Échec de la mise à jour du statut de l'employé.",
          roles: {
            admin: "ADMIN",
            pending: "EN ATTENTE",
            rejected: "REJETÉ"
          }
        },
        settings: {
          title: "Paramètres du Site",
          heroBgLabel: "Images Promotionnelles de la Page d'Accueil",
          heroBgPlaceholder: "https://example.com/image.jpg",
          heroBgHelp: "Ajoutez des URLs d'images ou téléchargez des images. La première image sera celle par défaut si aucune n'est fournie.",
          preview: "Aperçu :",
          save: "Enregistrer les Paramètres",
          saving: "Enregistrement...",
          saveSuccess: "Paramètres enregistrés avec succès !",
          setupRequired: "Configuration de la Base de Données Requise",
          setupDesc: "Pour activer les paramètres du site, veuillez exécuter la commande SQL suivante dans votre Éditeur SQL Supabase :",
          setupBtn: "J'ai exécuté la commande SQL",
          addImage: "Ajouter une Image",
          removeImage: "Supprimer"
        }
      },
      login: {
        title: "Portail Employé",
        subtitleRegister: "Créez un compte employé pour demander l'accès.",
        subtitleLogin: "Connectez-vous pour gérer le catalogue de produits et consulter les demandes (RFQ).",
        pendingTitle: "En Attente d'Approbation !",
        pendingDesc: "Votre compte ({{email}}) attend l'approbation de l'administrateur principal.",
        deniedTitle: "Accès Refusé !",
        deniedDesc: "Votre compte ({{email}}) ne dispose pas de privilèges d'administrateur.",
        email: "Adresse e-mail",
        password: "Mot de passe",
        registerBtn: "Créer un Compte",
        signInBtn: "Se Connecter",
        quickLogin: "Connexion Rapide (Administrateur Principal)",
        orContinueWith: "Ou continuez avec",
        googleLogin: "Google (Administrateur Principal)",
        alreadyHaveAccount: "Vous avez déjà un compte ? Connectez-vous",
        needAccount: "Besoin d'un compte employé ? Inscrivez-vous",
        errors: {
          loginFailed: "Une erreur s'est produite lors de la connexion.",
          generalError: "Une erreur s'est produite."
        }
      },
      productForm: {
        backToDashboard: "Retour au Tableau de Bord",
        supabaseSetupTitle: "Configuration de Supabase Requise",
        supabaseSetupDesc: "Pour activer le téléchargement d'images, veuillez ajouter VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY à vos Variables d'Environnement (ou Secrets AI Studio) et reconstruire l'application.",
        editProduct: "Modifier le Produit",
        addProduct: "Ajouter un Nouveau Produit",
        productTitle: "Titre du Produit",
        category: "Catégorie",
        priceRange: "Gamme de Prix",
        msrp: "Prix Conseillé",
        shortDesc: "Description Courte",
        longDetails: "Détails Longs (Texte enrichi / HTML autorisé)",
        images: "Images",
        uploading: "Téléchargement...",
        uploadImages: "Télécharger des Images",
        addUrl: "Ajouter une URL",
        specifications: "Spécifications",
        addSpec: "Ajouter une Spécification",
        cancel: "Annuler",
        saveProduct: "Enregistrer le Produit",
        errors: {
          titleRequired: "Le titre est obligatoire",
          descRequired: "La description est obligatoire",
          urlRequired: "L'URL est obligatoire"
        },
        placeholders: {
          specKey: "p. ex., Dimensions",
          specValue: "p. ex., 24x36 pouces"
        },
        alerts: {
          supabaseNotConfigured: "Supabase n'est pas configuré. Veuillez ajouter VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY à vos Variables d'Environnement et reconstruire.",
          bucketNotFound: "Le bucket de stockage \"product-images\" est introuvable. Veuillez le créer dans votre tableau de bord Supabase et le définir comme Public.",
          uploadFailed: "Échec du téléchargement des images : {{message}}",
          saveFailed: "Échec de l'enregistrement du produit. Consultez la console pour plus de détails."
        }
      }
    }
  }
};
