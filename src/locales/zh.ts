export const zh = {
  translation: {
    // Page-level <title>/<meta description> for the four static routes.
    // scripts/prerender-static.ts reads these same values, so the tags baked
    // into the static HTML and the tags react-helmet-async writes on mount
    // cannot drift. Previously the pages passed hardcoded English, which
    // overwrote the correctly-localized prerendered meta on 5 locales.
    seo: {
      homeTitle: "BOLEN 镜业 | LED 智能镜制造商 & OEM 镜子工厂",
      homeDesc: "BOLEN Mirror 是领先的 LED 镜制造商，专业生产 OEM LED 镜、智能镜、化妆镜和浴室镜，服务全球品牌。",
      catalogTitle: "LED 镜产品目录 | BOLEN 镜业制造商",
      catalogDesc: "探索我们丰富的 OEM LED 镜、智能镜、化妆镜和浴室镜产品系列，来自领先的 LED 镜制造商，为全球品牌提供优质制造。",
      storyTitle: "关于我们 | BOLEN LED 镜业制造商",
      storyDesc: "了解 BOLEN（嘉兴诚泰镜业有限公司）的历史和卓越制造，自 1995 年以来领先的 LED 镜制造商，专业生产 OEM 智能镜。",
      rfqTitle: "询价 | BOLEN LED 镜业制造商",
      rfqDesc: "联系领先的 LED 镜制造商 BOLEN，获取 OEM/ODM 询价、定制镜子制造和批量订单。"
    },
    navbar: {
      home: "首页",
      catalog: "产品目录",
      ourStory: "我们的故事",
      blog: "博客",
      videos: "视频",
      adminDashboard: "管理后台",
      logout: "退出登录",
      employeeLogin: "员工登录"
    },
    footer: {
      description: "高端镜子制造商与出口商，为全球企业供应高品质现代化妆镜。",
      contact: "联系方式",
      quickLinks: "快速链接",
      rights: "版权所有。"
    },
    accessibility: {
      skipToContent: "跳到主要内容"
    },
    ourStoryPage: {
      title: "我们的故事",
      subtitle: "嘉兴诚泰镜业有限公司",
      paragraphs: [
        "凭借在镜子制造领域20多年的专注经验（历史可追溯至1995年），嘉兴诚泰镜业有限公司建立了超越任何单一销售渠道的声誉。我们拥有50,000多平方米的生产综合体、两家独立工厂以及一支由200多名熟练工人组成的团队，这赋予了我们处理几乎任何规模订单的能力和灵活性——从精品室内设计项目到大型酒店和房地产开发。",
        "我们将整个生产过程掌握在自己手中。从原玻璃加工和LED集成到框架制造和智能功能组装，制造的每个阶段都在同一屋檐下进行，并由专门的QA/QC检查员监督。这种垂直整合意味着我们在每个步骤都控制质量，消除第三方延迟，并保持具有竞争力的交货时间。",
        "我们跨越多个核心系列的200多种产品款式绝非现成的模板——它们代表了多年来结合欧洲审美趋势和真实买家反馈的设计迭代。对于需要独特产品的客户，我们的OEM和ODM能力允许对尺寸、形状、照明、智能功能、材料和品牌进行完全定制。",
        "在包括CE、RoHS和IP66防水在内的国际认证支持下，我们的产品满足欧洲、北美、中东及其他地区市场的合规要求。我们不仅仅是制造镜子——我们与进口商、分销商、室内设计师和开发商建立长期合作伙伴关系，满足他们对一致性、精确性以及年复一年可靠供应商的需求。"
      ]
    },
    home: {
      companyName: "嘉兴诚泰镜业有限公司",
      heroKicker: "LED镜制造商 · OEM/ODM合作伙伴",
      heroTitle1: "高端镜品，",
      heroTitle2: "为您的品牌量身打造。",
      heroDesc: "自2005年以来，<1>BOLEN</1>始终助力全球品牌将独具特色的镜类产品系列推向市场。从设计与定制，到严格品控的生产制造和全球交付，我们让高端制造更简单、更可靠，也更易于规模化。",
      heroPrimaryCta: "启动您的项目",
      heroSecondaryCta: "浏览产品",
      stats: {
        sqMeters: "生产基地",
        artisans: "专业技术人员",
        styles: "镜款设计",
        global: "全球交付"
      },
      about: {
        heritage: "我们的传承",
        title1: "覆盖全球：",
        title2: "从上海走向世界",
        desc1: "总部位于中国浙江嘉兴——距离上海仅60公里——我们已建立起强大的全球业务布局，主要市场覆盖欧洲（西班牙、荷兰、挪威、丹麦、英国、罗马尼亚）、北美和澳大利亚。",
        desc2: "我们运营两个企业总部和两个现代化生产工厂。我们敬业的员工管理着多条LED和试衣镜生产线，以及专门的定制车间，所有操作均严格遵守ISO 9001质量管理标准。",
        backedBy: "由200多名专业人员提供支持",
        quote: "“质量第一，客户至上”",
        corePrinciple: "我们的核心原则"
      },
      collections: {
        subtitle: "系列产品",
        title: "多功能与定制",
        desc: "我们生产 LED 镜、浴室镜、穿衣镜与镜柜，提供数千种款式与全方位定制方案。",
        viewAll: "查看所有产品",
        smart: {
          tag: "旗舰产品",
          title: "智能与LED镜子",
          desc: "带触摸开关、防雾功能和蓝牙扬声器的背光浴室镜。",
          explore: "探索类别"
        },
        vanity: {
          title: "装饰与化妆镜",
          desc: "带传感器控制和放大功能的酒店级化妆镜。",
          explore: "探索"
        },
        oem: {
          title: "OEM / ODM 服务",
          desc: "根据客户需求定制尺寸、材质、功能、Logo和包装。",
          partner: "与我们合作"
        }
      },
      certificates: {
        subtitle: "我们的资质",
        title: "全球认证"
      },
      factoryShowcase: {
        subtitle: "走进工厂",
        title: "每一面镜子的诞生之地",
        desc: "走进我们位于嘉兴的 50,000 平方米生产基地——从原片玻璃到打包出货，垂直整合制造 LED 镜、智能镜、化妆镜与浴室镜。",
        empty: "工厂照片即将上线。"
      },
      featuredVideo: {
        subtitle: "精选影片",
        nowPlaying: "正在播放",
        title: "在动态中了解我们的镜子",
        desc: "一键走进车间：观看 BOLEN LED 镜、智能镜与化妆镜从制造、打磨到出货前测试的全过程。",
        watch: "观看完整视频",
        viewAll: "全部视频",
        playAria: "播放视频：{{title}}",
        pauseAria: "暂停背景视频",
        soundOn: "开启声音",
        soundOff: "静音"
      },
      advantage: {
        subtitle: "BOLEN 的优势",
        title: "制造优势",
        desc: "21 年的垂直一体化生产、46,800 平方米厂房，毗邻上海与宁波港口的物流优选位置。",
        features: {
          f1: { title: "成熟的制造实力", desc: "公司成立已 21 年，拥有 46,800 平方米厂房和 200 余名熟练工人，保障稳定的供应链与可靠的交期。" },
          f2: { title: "得天独厚的地理位置", desc: "毗邻上海与宁波港口，地理位置优越，物流便捷高效。" },
          f3: { title: "工厂直销，超高性价比", desc: "作为源头工厂，我们去除中间环节，提供极具竞争力的价格，同时不妥协品质，为您的业务带来最佳价值。" }
        }
      },
      manufacturingProcess: {
        subtitle: "从需求到出货",
        title: "制造工艺",
        desc: "六个严格把控的环节，让每个订单从规划到发货环环相扣。",
        steps: {
          s1: { title: "需求分析", desc: "根据您的具体愿景与市场需求，量身定制方案。" },
          s2: { title: "定制设计", desc: "投产前确认每一处细节，确保成品符合预期。" },
          s3: { title: "精密制造", desc: "自动化产线与人工精修结合，兼顾品质与效率。" },
          s4: { title: "100% 品质检验", desc: "对镜面外观、功能与工艺执行严格的质量检查。" },
          s5: { title: "定制包装", desc: "支持全面品牌定制，提升您的市场竞争力。" },
          s6: { title: "稳定交期", desc: "可靠的排产与高效物流，确保按时交付。" }
        }
      },
      whyUs: {
        title1: "为什么选择",
        title2: "BOLEN？",
        features: [
          { title: "全球市场准入与认证品质" },
          { title: "工厂直销，超高性价比" },
          { title: "严格的质量管控与质保" },
          { title: "全方位定制能力" }
        ],
        paragraphs: [
          "我们已在欧洲（荷兰、罗马尼亚、英国、西班牙、挪威、丹麦）、中东、北美、澳大利亚与南美建立了深度合作。产品完全符合国际标准，持有 CE、CB、RoHS、IP44、SAA 等多项认证。",
          "作为源头制造商，我们提供极具竞争力的价格，并致力于在您的预算范围内交付优质产品。",
          "我们的品质保证体系与售后承诺相匹配。每件产品出货前均经过 100% 检验，电子元件提供 2 年完整质保。",
          "从镜面玻璃到包装，我们提供端到端的 OEM/ODM 定制服务，量身打造，助您拓展市场并塑造品牌。"
        ]
      },
      cta: {
        title: "准备好提升您的空间了吗？",
        desc: "立即联系我们讨论您的定制需求，或浏览我们丰富的优质镜子目录。",
        viewCatalog: "查看目录",
        contactSales: "联系销售"
      }
    },
    products: {
      catalog: "产品目录",
      desc: "浏览我们丰富的优质镜子系列，包括智能LED技术、优雅的化妆镜设计和可定制选项。",
      noProducts: "没有找到符合您标准的产品。",
      viewDetails: "查看详情",
      searchLabel: "搜索产品",
      searchPlaceholder: "搜索产品...",
      allCategories: "所有类别",
      categories: {
        "New Arrival": "新品上市",
        "Hot Sale": "热销产品",
        "Led Lighted Mirror": "LED发光镜",
        "Bathroom Mirror without led": "无LED浴室镜",
        "Full Length Dressing Mirror": "全身穿衣镜",
        "Irregular Mirror": "异形镜"
      },
      priceRange: "价格区间",
      msrp: "建议零售价"
    },
    productDetail: {
      backToCatalog: "返回目录",
      specifications: "规格",
      productDetails: "产品详情",
      requestQuote: "请求报价 (RFQ)",
      companyName: "公司 / 联系人姓名",
      email: "电子邮件地址",
      inquiryDetails: "询价详情 (数量、定制等)",
      submitRfq: "提交 RFQ",
      submitting: "提交中...",
      rfqSuccess: "RFQ 提交成功！我们将尽快与您联系。",
      rfqError: "提交 RFQ 失败。请重试。",
      relatedVideos: "相关视频",
      brandSuffix: "| BOLEN 镜业",
      descTemplate: "{title} — 嘉兴诚泰镜业有限公司（BOLEN）优质出品，专业提供 OEM/ODM LED 镜、智能镜、化妆镜和浴室镜。欢迎询价获取批发价格。"
    },
    blog: {
      metaTitle: "BOLEN 博客 | LED 与智能镜行业洞察",
      metaDescription: "来自 BOLEN 的 LED 镜、智能镜及 OEM/ODM 生产的选购指南、技术解析与制造洞察。",
      kicker: "来自工厂一线的笔记",
      titleLead: "The BOLEN",
      titleAccent: "博客",
      intro: "关于 LED 镜与智能镜的指南、技术与制造知识——由亲手打造它们的团队撰写。",
      featured: "精选",
      readArticle: "阅读文章",
      allPosts: "全部",
      empty: "暂无已发布的文章，敬请期待。",
      readingTime: "{{minutes}} 分钟阅读",
      ctaTitle: "需要按您的规格定制镜子吗？",
      ctaDesc: "BOLEN 为全球品牌制造 LED 镜、智能镜、化妆镜和浴室镜——OEM 与 ODM，源自一家垂直整合的工厂。",
      ctaCatalog: "浏览产品目录",
      ctaQuote: "请求报价",
      related: "更多博客文章",
      viewAll: "查看全部",
      notFound: "未找到文章",
      backToJournal: "返回博客",
      relatedProducts: "本文相关产品"
    },
    videos: {
      metaTitle: "BOLEN 镜业视频 | 产品演示与工厂实拍",
      metaDescription: "观看 BOLEN 镜子的产品演示、工厂实拍、安装片段以及 LED 智能镜功能视频。",
      kicker: "动态呈现产品实力",
      titleLead: "BOLEN",
      titleAccent: "视频",
      intro: "在选型前，了解 LED 镜、智能功能、工厂流程和安装细节。",
      search: "搜索视频...",
      allVideos: "全部视频",
      empty: "暂无已发布视频，请稍后再来。",
      cardLabel: "视频",
      latest: "最新",
      notFound: "未找到视频",
      backToVideos: "返回视频",
      ctaTitle: "这款镜子适合您的产品线吗？",
      ctaDesc: "把视频或产品参考发给 BOLEN，我们的团队可以为您提供 OEM/ODM 选项、包装和交期报价。",
      ctaQuote: "请求报价",
      ctaCatalog: "浏览产品",
      relatedProducts: "相关产品",
      relatedVideos: "更多视频",
      viewAll: "查看全部",
      categories: {
        "Factory Tour": "工厂实拍",
        "Product Demo": "产品演示",
        "Installation": "安装演示",
        "Smart Features": "智能功能"
      }
    },
    admin: {
      dashboard: {
        title: "管理后台",
        addProduct: "添加产品",
        tabs: {
          products: "产品",
          rfqs: "询价单",
          employees: "员工",
          settings: "设置"
        },
        products: {
          uncategorized: "未分类",
          noProducts: "未找到产品。",
          deleteConfirm: "您确定要删除此产品吗？",
          deleteError: "删除产品失败。"
        },
        rfqs: {
          new: "新",
          replyEmail: "通过邮件回复",
          noRfqs: "暂未收到询价单。"
        },
        employees: {
          status: "状态：",
          approve: "批准",
          reject: "拒绝",
          noEmployees: "未找到员工账号。",
          updateError: "更新员工状态失败。",
          roles: {
            admin: "管理员",
            pending: "待批准",
            rejected: "已拒绝"
          }
        },
        settings: {
          title: "网站设置",
          heroBgLabel: "首页推广图片",
          heroBgPlaceholder: "https://example.com/image.jpg",
          heroBgHelp: "添加图片URL或上传图片。如果未提供，将使用默认背景。",
          preview: "预览：",
          save: "保存设置",
          saving: "保存中...",
          saveSuccess: "设置保存成功！",
          setupRequired: "需要设置数据库",
          setupDesc: "要启用网站设置，请在您的Supabase SQL编辑器中运行以下SQL命令：",
          setupBtn: "我已运行SQL命令",
          addImage: "添加图片",
          removeImage: "移除"
        }
      },
      login: {
        title: "员工门户",
        subtitleRegister: "创建员工账号以申请访问权限。",
        subtitleLogin: "登录以管理产品目录和查看询价单。",
        pendingTitle: "等待批准！",
        pendingDesc: "您的账号 ({{email}}) 正在等待超级管理员批准。",
        deniedTitle: "访问被拒绝！",
        deniedDesc: "您的账号 ({{email}}) 没有管理员权限。",
        email: "电子邮件地址",
        password: "密码",
        registerBtn: "注册账号",
        signInBtn: "登录",
        quickLogin: "快速登录 (超级管理员)",
        orContinueWith: "或继续使用",
        googleLogin: "Google (超级管理员)",
        alreadyHaveAccount: "已有账号？登录",
        needAccount: "需要员工账号？注册",
        errors: {
          loginFailed: "登录过程中发生错误。",
          generalError: "发生错误。"
        }
      },
      productForm: {
        backToDashboard: "返回仪表盘",
        supabaseSetupTitle: "需要设置 Supabase",
        supabaseSetupDesc: "要启用图片上传，请将 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 添加到您的环境变量（或 AI Studio Secrets）中，并重新构建应用。",
        editProduct: "编辑产品",
        addProduct: "添加新产品",
        productTitle: "产品标题",
        category: "类别",
        priceRange: "价格区间",
        msrp: "建议零售价",
        shortDesc: "简短描述",
        longDetails: "详细信息 (允许富文本 / HTML)",
        images: "图片",
        uploading: "上传中...",
        uploadImages: "上传图片",
        addUrl: "添加 URL",
        specifications: "规格",
        addSpec: "添加规格",
        cancel: "取消",
        saveProduct: "保存产品",
        errors: {
          titleRequired: "标题是必填项",
          descRequired: "描述是必填项",
          urlRequired: "URL 是必填项"
        },
        placeholders: {
          specKey: "例如：尺寸",
          specValue: "例如：24x36 英寸"
        },
        alerts: {
          supabaseNotConfigured: "未配置 Supabase。请将 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 添加到您的环境变量中并重新构建。",
          bucketNotFound: "未找到存储桶 \"product-images\"。请在您的 Supabase 仪表板中创建它并将其设置为公开。",
          uploadFailed: "上传图片失败：{{message}}",
          saveFailed: "保存产品失败。请检查控制台以获取详细信息。"
        }
      }
    }
  }
};
