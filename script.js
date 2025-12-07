// Page Navigation with Active State Highlighting
function showPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });
  document.getElementById(pageId).classList.add("active");
  window.scrollTo(0, 0);

  // Update navigation active state
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("data-page") === pageId) {
      link.classList.add("active");
    }
  });

  // Close mobile menu if open
  document.getElementById("navLinks").classList.remove("active");
}

// Generate unique Case ID
function generateCaseId() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = String(Math.floor(Math.random() * 9999)).padStart(4, "0");
  return `#SC${year}${month}${day}-${random}`;
}

// Small helper to load the Samanta logo as a data URL for jsPDF
function loadLogoDataUrl(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = src;
  });
}

// Download PDF using jsPDF & autoTable (with logo)
async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("portrait", "mm", "a4");

  const caseIdEl = document.getElementById("caseIdValue");
  const caseId = caseIdEl ? caseIdEl.textContent : generateCaseId();
  const form = document.getElementById("complaintForm");
  if (!form) return;
  const formData = new FormData(form);

  // Try loading the logo; continue without it if it fails
  let logoDataUrl = null;
  try {
    logoDataUrl = await loadLogoDataUrl(
      "assets/Logo_samanta_WebApp-modified.png"
    );
  } catch (e) {
    console.warn("Logo load failed", e);
  }

  // HEADER
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", 15, 6, 18, 18);
  }

  doc.setFontSize(18);
  doc.setFont("Helvetica", "bold");
  doc.text("SAMANTA PORTAL", 105, 15, { align: "center" });

  doc.setFontSize(13);
  doc.setFont("Helvetica", "normal");
  doc.text("POLICE COMPLAINT FORM", 105, 22, { align: "center" });

  doc.setFontSize(10);
  doc.text(`Case ID: ${caseId}`, 15, 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 30);
  doc.text(`Time: ${new Date().toLocaleTimeString()}`, 150, 35);

  // COMPLAINANT INFORMATION
  doc.setFontSize(12);
  doc.setFont("Helvetica", "bold");
  doc.text("COMPLAINANT INFORMATION", 15, 45);

  doc.autoTable({
    startY: 50,
    theme: "grid",
    head: [["Field", "Details"]],
    body: [
      ["Full Name", formData.get("fullName") || "N/A"],
      ["Address", formData.get("address") || "N/A"],
      ["Phone", formData.get("phone") || "N/A"],
      ["Email", formData.get("email") || "N/A"],
    ],
  });

  // INCIDENT DETAILS
  doc.setFontSize(12);
  doc.text("INCIDENT DETAILS", 15, doc.lastAutoTable.finalY + 10);

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 15,
    theme: "grid",
    head: [["Detail", "Information"]],
    body: [
      ["Date of Incident", formData.get("incidentDate") || "N/A"],
      ["Location", formData.get("location") || "N/A"],
      ["Type of Complaint", formData.get("type") || "N/A"],
    ],
  });

  // COMPLAINT DESCRIPTION
  doc.setFontSize(12);
  doc.text("COMPLAINT DESCRIPTION", 15, doc.lastAutoTable.finalY + 12);

  const description = doc.splitTextToSize(
    formData.get("description") || "N/A",
    180
  );

  doc.setFontSize(10);
  doc.text(description, 15, doc.lastAutoTable.finalY + 18);

  // ACCUSED DETAILS
  doc.setFontSize(12);
  doc.text("ACCUSED DETAILS", 15, doc.lastAutoTable.finalY + 45);

  const accused = doc.splitTextToSize(formData.get("accused") || "N/A", 180);
  doc.setFontSize(10);
  doc.text(accused, 15, doc.lastAutoTable.finalY + 52);

  // FOOTER / NOTICE
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = pageHeight - 20;
  doc.setFontSize(10);
  doc.setTextColor(220, 38, 38); // red tone

  doc.text(`Case ID: ${caseId}`, 105, footerY + 5, { align: "center" });
  doc.setTextColor(0, 0, 0);
  doc.text(
    "This is an official record from Samanta Portal. Keep this for your reference.",
    105,
    footerY + 10,
    { align: "center" }
  );

  doc.save(`Complaint_${caseId.replace("#", "")}.pdf`);
}

// Chatbot logic (Nepali topics) with existing UI styles
const chatTopics = [
  {
    id: 1,
    title: "लैंगिक समानता",
    icon: "⚖️",
    mainQuestion: "लैंगिक समानता भनेको के हो?",
    items: [
      {
        q: "Sambidhan ले लैंगिक समानता कसरी सुनिश्चित गर्छ?",
        answer:
          "नेपालको संविधान धारा १८ (समानताको हक) ले सबै व्यक्तिलाई जात, लिंग, धर्म, भाषा, लैंगिक पहिचान, वा अरू कुनै आधारमा भेदभाव गर्न नपाइने स्पष्ट रूपमा भन्छ। यसले महिला, पुरुष, तेस्रो लिङ्ग सबैलाई समान सम्मान र समान अधिकारको ग्यारेन्टी दिन्छ।",
        legal:
          "यदि कुनै संस्थाले वा व्यक्तिले लिंगका आधारमा भेदभाव गर्‍यो भने, उनीहरूलाई संविधानविरुद्ध कार्य गरेको मानिन्छ र भेदभाव सम्बन्धी फौजदारी मुद्दा चल्न सक्छ (Criminal Code 2074, Section 161).",
      },
      {
        q: "महिलाहरू र LGBTQIA+ समुदायलाई समान अधिकार कसरी उपलब्ध हुन्छ?",
        answer:
          "संविधान धारा १२ (नागरिकताको हक), धारा १८ (समानता), धारा ४२ (समावेशीताको हक) मार्फत सबै लिंगका व्यक्तिलाई अधिकार, पहिचान, र सम्मान दिलाउँछ। LGBTQIA+ व्यक्तिलाई 'तेस्रो लिङ्ग' को रूपमा कानुनी पहिचान मिल्छ।",
        legal:
          "कुनै व्यक्तिको पहिचान, लिङ्ग वा लैंगिक झुकावका कारण दुर्व्यवहार गरे फौजदारी सजाय (Criminal Code Section 161–167) लाग्छ।",
      },
      {
        q: "लिंगका कारण रोजगार वा सेवा नदिए के हुन्छ?",
        answer:
          "संविधानले कुनै पनि व्यक्तिलाई लिंगका आधारमा रोजगारी, सेवा, शिक्षा वा स्वास्थ्यमा भेदभाव गर्न नपाइने भन्छ। यदि यस्तो भयो भने पीडितले गुनासो दर्ज गर्न सक्छ।",
        legal:
          "लैंगिक भेदभाव गरेको पाइएमा संस्थालाई जरिवाना, सेवा निलम्बन वा फौजदारी सजाय हुनेछ।",
      },
      {
        q: "सामान्य नागरिकले लैंगिक समानता कसरी अभ्यास गर्न सक्छन्?",
        answer:
          "• सबै लिंगलाई सम्मानजनक व्यवहार गर्ने\n• सार्वजनिक स्थानमा दुर्व्यवहार नरोप्ने\n• बालबालिका, महिला, LGBTQIA+ को अधिकारलाई समर्थन गर्ने\n• कानूनी प्रक्रिया बुझ्ने",
        legal: "लैंगिक असमानता बढाउने गतिविधिलाई राज्यले कारबाही गर्न सक्छ।",
      },
    ],
  },
  {
    id: 2,
    title: "यौन उत्पीडन",
    icon: "🚫",
    mainQuestion: "यौन उत्पीडन (Sexual Harassment) भनेको के हो?",
    items: [
      {
        q: "काम गर्ने ठाउँमा यौन उत्पीडन के मानिन्छ?",
        answer:
          "अनावश्यक स्पर्श, अश्लील टिप्पणी, धम्की, यौन प्रस्ताव, जानीजानी डराउने, हेप्ने, वा अश्लील सामग्री पठाउनु—सबै यौन उत्पीडनमा पर्छ (Criminal Code Section 222–224).",
        legal: "३ महिना देखि १ वर्षसम्म कैद वा जरिवाना, वा दुवै।",
      },
      {
        q: "सार्वजनिक ठाउँमा के कुरा यौन उत्पीडन ठहरिन्छ?",
        answer:
          "बजार, सडक, बस, पार्क जस्ता ठाउँमा:\n• सीटी बजाउने\n• अश्लील हेराइ\n• टोकाइ/धकेलाइ\n• फोटो/भिडियो खिचेर दुव्र्यवहार\n• अश्लील बोल्ने\n\nयी सबै कानूनी रूपमा अपराध मानिन्छ।",
        legal: "३ महिना–१ वर्ष सम्म कैद वा जरिवाना (Criminal Code 224).",
      },
      {
        q: "Online/फोनमा यौन उत्पीडन के हुन्छ?",
        answer:
          "• अनावश्यक मेसेज\n• अश्लील फोटो/भिडियो पठाउने\n• लगातार फोन गरेर जिस्क्याउने\n• धम्की दिने\n\nयी सबै साइबर यौन उत्पीडन हो।",
        legal: "साइबर सुरक्षा ऐन अनुसार कैद + जरिवाना।",
      },
      {
        q: "पीडितले के गर्न सक्छ?",
        answer:
          "• प्रमाण सुरक्षित गर्ने (स्क्रिनसट, फोटो)\n• नजिकैको प्रहरी वा महिला सेलमा उजुरी दिने\n• Samanta Portal मा सुरक्षित गुनासो दर्ता गर्ने",
        legal:
          "उजुरी पछि कानूनी कारबाही सुरु हुन्छ, अभियुक्त पक्राउ पर्न सक्छ।",
      },
    ],
  },
  {
    id: 3,
    title: "घरेलु हिंसा",
    icon: "🏠",
    mainQuestion: "घरेलु हिंसा कसरी परिभाषित हुन्छ?",
    items: [
      {
        q: "घरेलु हिंसा कस्ता–कस्ता प्रकारका हुन्छन्?",
        answer:
          "• शारीरिक हिंसा\n• मानसिक/भावनात्मक हिंसा\n• आर्थिक नियन्त्रण\n• सामाजिक प्रतिबन्ध\n• यौन हिंसा",
        legal:
          "Domestic Violence Act 2066 अनुसार जरिवाना वा ६ महिना–३ वर्ष कैद।",
      },
      {
        q: "कसले घरेलु हिंसा उजुरी गर्न सक्छ?",
        answer:
          "• पीडित स्वयं\n• परिवारका सदस्य\n• छिमेकी/समुदाय\n• NGO/महिला समूह",
        legal: "उजुरी दर्ता भएपछि तत्काल संरक्षण आदेश जारी गर्न सकिन्छ।",
      },
      {
        q: "महिलालाई आर्थिक रूपमा रोक्नु अपराध हो?",
        answer:
          "हो। खर्च रोक्नु, काम गर्न नदिनु, बैंक कार्ड खोस्नु–सब आर्थिक हिंसा हो।",
        legal: "३ महिना–१ वर्ष कैद वा जरिवाना।",
      },
      {
        q: "राहत र सुरक्षित आश्रय के उपलब्ध हुन्छ?",
        answer:
          "NGO र सरकारी shelter home ले:\n• भोजन\n• स्वास्थ्य\n• कानूनी समर्थन\n• मनोवैज्ञानिक सल्लाह\n\nउपलब्ध गराउँछ।",
        legal: "राज्यले पीडितको सुरक्षा सुनिश्चित गर्न बाध्य हुन्छ।",
      },
    ],
  },
  {
    id: 4,
    title: "साइबर दुव्र्यवहार",
    icon: "💻",
    mainQuestion: "अनलाइन दुव्र्यवहार (Cyber Harassment) कस्तो अपराध हो?",
    items: [
      {
        q: "के–के कुरालाई साइबर दुव्र्यवहार मानिन्छ?",
        answer:
          "• फोटो/भिडियो दुरुपयोग\n• धम्की दिने\n• ह्याक गर्ने\n• अफवाह फैलाउने\n• ब्ल्याकमेल गर्ने",
        legal:
          "३ महिना–५ वर्ष कैद + ठूलो जरिवाना (Cyber Security Bill + Criminal Code).",
      },
      {
        q: "सामाजिक सञ्जालमा मानहानी के हुन्छ?",
        answer:
          "कसैको बदनाम गर्ने, गलत सूचना दिने, अपमानजनक सामग्री पोष्ट गर्नु अपराध हो।",
        legal: "१ वर्षसम्म कैद वा जरिवाना।",
      },
      {
        q: "बालबालिकालाई लक्षित साइबर अपराध कति गम्भीर मानिन्छ?",
        answer: "बालबालिकाको फोटो/च्याट दुरुपयोग अत्यन्त गम्भीर अपराध हो।",
        legal: "५ वर्षदेखि १५ वर्षसम्म कैद।",
      },
      {
        q: "पीडितले के गर्नु पर्छ?",
        answer:
          "• स्क्रिनसट लिनु\n• Samanta Portal वा प्रहरी साइबर ब्यूरोमा उजुरी दिने\n• प्रमाण मेट्न नखोज्ने",
        legal: "साइबर अपराधमा तुरुन्त अनुसन्धान गर्न प्रहरीले बाध्य हुन्छ।",
      },
    ],
  },
  {
    id: 5,
    title: "मानव बेचबिखन",
    icon: "⛓️",
    mainQuestion:
      "मानव बेचबिखन / जबरजस्ती करणी (Trafficking & Rape) के भिन्नता हो?",
    items: [
      {
        q: "मानव बेचबिखन के हो?",
        answer: "ललच्याउने, बेच्ने, तस्करी गर्ने, वा जबरजस्ती विदेश पठाउने।",
        legal: "२० वर्षसम्म कैद।",
      },
      {
        q: "जबरजस्ती करणी कसरी परिभाषित हुन्छ?",
        answer: "सहमति बिना यौन क्रिया गर्नु।",
        legal: "७–२० वर्ष कैद।",
      },
      {
        q: "सहमतिको उमेर कति हो?",
        answer: "१८ वर्षभन्दा कम उमेरमा सहमति कानूनी मानिँदैन।",
        legal: "किशोरीसँग करणी = १०–२० वर्ष कैद।",
      },
      {
        q: "पीडितले तत्काल के गर्नु पर्छ?",
        answer:
          "• स्वास्थ्य जाँच\n• पुलिसमा उजुरी\n• प्रमाण सुरक्षित गर्नु\n• Legal & NGO support लिनु",
        legal: "",
      },
    ],
  },
  {
    id: 6,
    title: "विवाहमा हिंसा",
    icon: "💔",
    mainQuestion: "विवाहमा हुने हिंसा (Marital Abuse) के अपराध हो?",
    items: [
      {
        q: "दाम्पत्य सम्बन्धमा जबरजस्ती सम्भोग अपराध हो?",
        answer: "हो। पति–पत्नी बीच जबरजस्ती सम्भोग = अपराध।",
        legal: "३–५ वर्ष कैद।",
      },
      {
        q: "मानसिक हिंसा कस्तो देखिन्छ?",
        answer: "• निरन्तर गाली\n• अवमूल्यन\n• धम्की\n• सामाजिक अलगाव",
        legal: "Domestic Violence Act अनुसार कारबाही।",
      },
      {
        q: "आर्थिक हिंसा कस्तो मानिन्छ?",
        answer: "खर्च रोक्ने, कमाइ खोस्ने, बैंक कार्ड लुट्ने—सबै अपराध।",
        legal: "कैद वा जरिवाना।",
      },
      {
        q: "कसरी सुरक्षा माग्न सकिन्छ?",
        answer:
          "• प्रहरी\n• वडा कार्यालय\n• NGO shelter\n• Samanta Portal मार्फत रिपोर्ट",
        legal: "",
      },
    ],
  },
  {
    id: 7,
    title: "उजुरी प्रक्रिया",
    icon: "📝",
    mainQuestion: "राज्यलाई उजुरी/गुनासो कसरी दिन सकिन्छ?",
    items: [
      {
        q: "कुन स्तरका मुद्दा प्रहरीलाई दिनुपर्छ?",
        answer: "• यौन अपराध\n• हिंसा\n• साइबर अपराध\n• आपतकालीन जोखिम",
        legal: "प्रहरीले तत्काल दर्ता गर्नै पर्छ।",
      },
      {
        q: "NGO ले कस्ता सेवा दिन्छ?",
        answer: "• काउन्सेलिङ\n• Shelter\n• कानूनी सहायता\n• पुनःस्थापना",
        legal: "",
      },
      {
        q: "Samanta Portal मा उजुरी दिएपछि के हुन्छ?",
        answer:
          "• जोखिम मूल्यांकन\n• NGO/Police लाई स्वतः फर्वार्ड\n• फॉलो-अप Support",
        legal: "",
      },
      {
        q: "उजुरी गोप्य रहन्छ?",
        answer: "हो। PII (नाम, फोटो, location) कडाइका साथ सुरक्षित राखिन्छ।",
        legal: "",
      },
    ],
  },
];

let chatInitialized = false;

function ensureChatInitialized() {
  if (chatInitialized) return;
  chatInitialized = true;
  addMessage(
    "नमस्ते — Samanta मा स्वागत छ। माथिका विषय मध्ये १–७ छान्नुहोस् वा टाइप/बोल्नुहोस्।",
    "bot"
  );
  renderMainMenu();
}

function renderMainMenu() {
  const buttons = chatTopics
    .map(
      (t) =>
        `<li style="margin:6px 0;"><button class="btn-secondary" style="width:100%;text-align:left;padding:10px 14px;" onclick="openTopic(${t.id})">${t.id}. ${t.icon} ${t.title}</button></li>`
    )
    .join("");
  addMessage(
    `<div><div class="message-title">कृपया विषय छान्नुहोस् (१–७):</div><ul style="list-style:none;padding:0;margin:8px 0;">${buttons}</ul></div>`,
    "bot"
  );
}

function openTopic(id) {
  const topic = chatTopics.find((t) => t.id === id);
  if (!topic) return;

  addMessage(`${topic.icon} ${topic.mainQuestion}`, "user");

  const questions = topic.items
    .map(
      (it, idx) =>
        `<button class="btn-secondary" style="width:100%;text-align:left;margin:4px 0;" onclick="showAnswer(${
          topic.id
        }, ${idx})">${idx + 1}. ${it.q}</button>`
    )
    .join("");

  addMessage(
    `<div><div class="message-title">प्रश्नहरू:</div>${questions}</div>`,
    "bot"
  );
}

function showAnswer(topicId, idx) {
  const topic = chatTopics.find((t) => t.id === topicId);
  if (!topic || !topic.items[idx]) return;
  const item = topic.items[idx];

  addMessage(item.q, "user");
  addTypingIndicator();

  setTimeout(() => {
    removeTypingIndicator();
    let answerHtml = `<div class="message-title">📖 जवाफ</div><p style="white-space:pre-line">${item.answer}</p>`;
    if (item.legal && item.legal.trim()) {
      answerHtml += `<div class="message-legal" style="margin-top:0.75rem;padding:0.65rem;border-radius:10px;background:linear-gradient(90deg,#ef4444,#fb923c);color:#fff;"><strong>⚠️ कानुनी परिणाम:</strong><div style="margin-top:4px;font-size:0.95em;">${item.legal}</div></div>`;
    }
    answerHtml += `<div style="margin-top:1rem;display:flex;gap:0.75rem;flex-wrap:wrap;"><button class="btn btn-primary" style="flex:1;min-width:140px;padding:8px 12px;font-size:0.9rem;" onclick="showPage('complaint')">🚔 Report to Police</button><button class="btn btn-primary" style="flex:1;min-width:140px;padding:8px 12px;font-size:0.9rem;" onclick="askQuestion('How to contact a lawyer?')">⚖️ Report to Lawyer</button></div>`;
    addMessage(answerHtml, "bot");
  }, 650);
}

function handleKeyword(text) {
  const lower = text.toLowerCase();

  // number selection
  const num = text.match(/\d+/);
  if (num) {
    const n = parseInt(num[0], 10);
    if (n >= 1 && n <= 7) return { type: "topic", value: n };
  }

  // keyword map
  const keywordMap = {
    लैंगिक: 1,
    समानता: 1,
    gender: 1,
    यौन: 2,
    उत्पीडन: 2,
    harassment: 2,
    घरेलु: 3,
    हिंसा: 3,
    साइबर: 4,
    अनलाइन: 4,
    cyber: 4,
    बेचबिखन: 5,
    करणी: 5,
    trafficking: 5,
    विवाह: 6,
    marital: 6,
    उजुरी: 7,
    गुनासो: 7,
    complaint: 7,
  };

  for (const key in keywordMap) {
    if (lower.includes(key)) {
      return { type: "topic", value: keywordMap[key] };
    }
  }

  return { type: "unknown" };
}

function sendMessage() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (!message) return;

  ensureChatInitialized();
  addMessage(message, "user");
  input.value = "";

  const intent = handleKeyword(message);

  if (intent.type === "topic") {
    openTopic(intent.value);
    return;
  }

  addTypingIndicator();
  setTimeout(() => {
    removeTypingIndicator();
    addMessage(
      "माफ गर्नुहोस् — कृपया १–७ मध्ये कुनै संख्या वा माथिका मुख्य विषयको शब्द प्रयोग गर्नुहोस्।",
      "bot"
    );
  }, 700);
}

function addMessage(text, sender) {
  const messagesContainer = document.getElementById("chatMessages");
  if (!messagesContainer) return;
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}`;
  messageDiv.innerHTML = `<div class="message-bubble">${text}</div>`;
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addFollowupSuggestions() {
  // Not used in new flow but kept for compatibility
}

function addTypingIndicator() {
  const messagesContainer = document.getElementById("chatMessages");
  if (!messagesContainer) return;
  const typingDiv = document.createElement("div");
  typingDiv.className = "message bot";
  typingDiv.id = "typingIndicator";
  typingDiv.innerHTML = `
            <div class="message-bubble">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = document.getElementById("typingIndicator");
  if (indicator) indicator.remove();
}

function askQuestion(question) {
  document.getElementById("chatInput").value = question;
  sendMessage();
}

// Voice Input using Web Speech API
let recognition = null;
let isListening = false;

function getVoiceButton() {
  // Try to find the voice button (works without changing HTML)
  return (
    document.querySelector('button[aria-label="Start voice input"]') ||
    document.getElementById("voiceButton")
  );
}

function ensureVoiceStatusRegion() {
  let region = document.getElementById("voiceStatus");
  if (!region) {
    region = document.createElement("div");
    region.id = "voiceStatus";
    region.className = "sr-only";
    region.setAttribute("aria-live", "polite");
    document.body.appendChild(region);
  }
  return region;
}

function initRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const rec = new SR();
  rec.lang = "ne-NP"; // Nepali primary
  try {
    // Some browsers may not support ne-NP, fall back to en-US
    rec.lang = Intl.DateTimeFormat().resolvedOptions().locale || "en-US";
  } catch (_) {}
  rec.interimResults = false;
  rec.continuous = false;
  return rec;
}

function startVoiceInput() {
  const btn = getVoiceButton();
  const status = ensureVoiceStatusRegion();

  if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
    alert(
      "Voice input is not supported in this browser. Please use Chrome/Edge or update your browser."
    );
    return;
  }

  if (!recognition) {
    recognition = initRecognition();
    if (!recognition) {
      alert("Unable to initialize voice input on this device.");
      return;
    }

    recognition.onstart = () => {
      isListening = true;
      if (btn) {
        btn.classList.add("listening", "btn-voice");
        btn.setAttribute("aria-pressed", "true");
      }
      status.textContent = "Listening… speak now";
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((res) => res[0] && res[0].transcript)
        .join(" ")
        .trim();
      const input = document.getElementById("chatInput");
      if (input && transcript) {
        input.value = transcript;
        // Auto-send after capture for smoother UX
        sendMessage();
      }
    };

    recognition.onerror = (e) => {
      // Common errors: 'not-allowed', 'no-speech', 'aborted'
      console.warn("Speech recognition error:", e.error);
      const friendly =
        e.error === "not-allowed"
          ? "Microphone permission denied. Please allow mic access."
          : e.error === "no-speech"
          ? "No speech detected. Please try again."
          : "Voice input error. Please try again.";
      status.textContent = friendly;
    };

    const resetState = () => {
      isListening = false;
      if (btn) {
        btn.classList.remove("listening");
        btn.setAttribute("aria-pressed", "false");
      }
      setTimeout(() => (status.textContent = ""), 1500);
    };

    recognition.onend = resetState;
    recognition.onaudioend = () => {
      // Some engines fire end later; ensure we stop promptly
      try {
        recognition.stop();
      } catch (_) {}
    };
  }

  // Toggle start/stop
  if (!isListening) {
    try {
      recognition.start();
    } catch (err) {
      // Safari/Chrome can throw if called twice
      console.warn("Recognition start error:", err);
    }
  } else {
    try {
      recognition.stop();
    } catch (_) {}
  }
}

// Accordion Toggle with ARIA Management
function toggleAccordion(header) {
  const content = header.nextElementSibling;
  const icon = header.querySelector("i");
  const isExpanded = header.getAttribute("aria-expanded") === "true";

  // Close all other accordions
  document.querySelectorAll(".accordion-header").forEach((otherHeader) => {
    if (otherHeader !== header) {
      const otherContent = otherHeader.nextElementSibling;
      const otherIcon = otherHeader.querySelector("i");
      otherHeader.setAttribute("aria-expanded", "false");
      otherContent.classList.remove("active");
      if (otherIcon) otherIcon.style.transform = "rotate(0deg)";
    }
  });

  // Toggle current accordion
  header.setAttribute("aria-expanded", !isExpanded);
  content.classList.toggle("active");
  if (icon) {
    icon.style.transform = content.classList.contains("active")
      ? "rotate(180deg)"
      : "rotate(0deg)";
  }
}

// File Upload Preview with Size Validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
let selectedFiles = [];

function handleFileUploadClick() {
  document.getElementById("fileInput")?.click();
}

document.getElementById("fileInput")?.addEventListener("change", function (e) {
  const files = Array.from(e.target.files);
  const fileListContainer = document.getElementById("fileList");

  if (!fileListContainer) return;

  // Validate file sizes
  const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
  if (oversizedFiles.length > 0) {
    alert(
      `The following files exceed 10MB limit:\n${oversizedFiles
        .map((f) => f.name)
        .join("\n")}`
    );
    return;
  }

  selectedFiles = files;
  fileListContainer.innerHTML = "";

  if (files.length > 0) {
    files.forEach((file, index) => {
      const fileItem = document.createElement("div");
      fileItem.className = "file-item";

      const fileSize = (file.size / 1024).toFixed(2); // Convert to KB
      const fileSizeText =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
          : `${fileSize} KB`;

      fileItem.innerHTML = `
        <div class="file-item-info">
          <i class="fas fa-file" aria-hidden="true"></i>
          <span>${file.name} (${fileSizeText})</span>
        </div>
        <button type="button" class="file-remove" onclick="removeFile(${index})" aria-label="Remove ${file.name}">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      `;

      fileListContainer.appendChild(fileItem);
    });
  }
});

function removeFile(index) {
  const fileInput = document.getElementById("fileInput");
  const dt = new DataTransfer();

  selectedFiles.forEach((file, i) => {
    if (i !== index) {
      dt.items.add(file);
    }
  });

  selectedFiles.splice(index, 1);
  fileInput.files = dt.files;

  // Trigger change event to update display
  fileInput.dispatchEvent(new Event("change", { bubbles: true }));
}

// Multi-step form navigation
let currentStep = 1;

function nextStep() {
  const currentStepEl = document.getElementById(`step${currentStep}`);
  const nextStepEl = document.getElementById(`step${currentStep + 1}`);

  if (currentStepEl && nextStepEl) {
    currentStepEl.classList.remove("active");
    nextStepEl.classList.add("active");
    currentStep++;
    updateProgressBar();
  }
}

function prevStep() {
  const currentStepEl = document.getElementById(`step${currentStep}`);
  const prevStepEl = document.getElementById(`step${currentStep - 1}`);

  if (currentStepEl && prevStepEl) {
    currentStepEl.classList.remove("active");
    prevStepEl.classList.add("active");
    currentStep--;
    updateProgressBar();
  }
}

function updateProgressBar() {
  const progressSteps = document.querySelectorAll(".step-dot");
  progressSteps.forEach((step, index) => {
    if (index < currentStep) {
      step.classList.add("active");
    } else {
      step.classList.remove("active");
    }
  });
}

// Smooth scroll for anchor links with safeguards
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    // Skip if href is just '#', has onclick attribute, or has data-page (page navigation)
    if (
      href === "#" ||
      this.getAttribute("onclick") ||
      this.getAttribute("data-page")
    ) {
      return;
    }
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      // Focus the target for accessibility
      if (
        target.hasAttribute("tabindex") ||
        target.tagName === "INPUT" ||
        target.tagName === "BUTTON"
      ) {
        target.focus();
      }
    }
  });
});

// Add entrance animations on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

document.querySelectorAll(".glass-card, .step, .right-card").forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(20px)";
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  observer.observe(el);
});

// Initialize
window.addEventListener("load", function () {
  console.log("Samanta Portal loaded successfully!");

  // Police Complaint Form Logic
  const complaintForm = document.getElementById("complaintForm");
  const submitBtn = document.getElementById("submitBtn");
  const clearBtn = document.getElementById("clearBtn");
  const successStep = document.getElementById("successStep");
  const dateUnknown = document.getElementById("dateUnknown");
  const incidentDate = document.getElementById("incidentDate");

  function showMessage(msg) {
    alert(msg);
  }

  function validateRequiredFields() {
    if (!complaintForm) return true;

    const requiredEls = Array.from(
      complaintForm.querySelectorAll("[required]")
    );
    for (const el of requiredEls) {
      if (!el.value || el.value.trim() === "") {
        el.focus();
        const labelEl = el.closest(".form-group")?.querySelector("label");
        const labelText = labelEl
          ? labelEl.innerText.split("\n")[0]
          : "Required field";
        showMessage("कृपया अनिवार्य विवरण भर्नुहोस्:\n\n" + labelText);
        return false;
      }
    }

    const phone = document.getElementById("phone");
    if (phone) {
      const phoneVal = phone.value.trim();
      const phoneRegex = /^[0-9]{7,15}$/;
      if (!phoneRegex.test(phoneVal)) {
        phone.focus();
        showMessage(
          "सम्पर्क नम्बर मान्य छैन। कृपया सही नम्बर लेख्नुहोस् (digits only)."
        );
        return false;
      }
    }

    return true;
  }

  // Handle date unknown checkbox
  if (dateUnknown && incidentDate) {
    dateUnknown.addEventListener("change", function () {
      if (this.checked) {
        incidentDate.disabled = true;
        incidentDate.removeAttribute("required");
        incidentDate.removeAttribute("aria-required");
        incidentDate.value = "";
      } else {
        incidentDate.disabled = false;
        incidentDate.setAttribute("required", "");
        incidentDate.setAttribute("aria-required", "true");
      }
    });
  }

  if (complaintForm && submitBtn) {
    complaintForm.addEventListener("submit", function (e) {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      if (!validateRequiredFields()) {
        submitBtn.disabled = false;
        submitBtn.textContent = "उजुरी पेश गर्नुहोस् / Submit Complaint";
        return;
      }

      setTimeout(() => {
        showMessage(
          "उजुरी सफलतापूर्वक दर्ता भयो।\nComplaint Submitted Successfully."
        );

        // Generate and display case ID
        const caseId = generateCaseId();
        const caseIdValue = document.getElementById("caseIdValue");
        if (caseIdValue) {
          caseIdValue.textContent = caseId;
        }

        // Show success screen
        if (complaintForm && successStep) {
          complaintForm.style.display = "none";
          successStep.style.display = "block";
        }

        submitBtn.disabled = false;
        submitBtn.textContent = "उजुरी पेश गर्नुहोस् / Submit Complaint";
      }, 800);
    });
  }

  if (clearBtn && complaintForm) {
    clearBtn.addEventListener("click", function () {
      if (
        confirm(
          "के तपाईँ पक्का गर्नुहुन्छ कि फाराम खाली गर्न? / Clear the form?"
        )
      ) {
        complaintForm.reset();
      }
    });
  }

  // Set initial active page in navigation
  const firstPage = document.querySelector(".page.active");
  if (firstPage) {
    const pageId = firstPage.id;
    document.querySelectorAll(".nav-links a").forEach((link) => {
      if (link.getAttribute("data-page") === pageId) {
        link.classList.add("active");
      }
    });
  }
});

// Mobile menu toggle function
function toggleMenu() {
  const navLinks = document.getElementById("navLinks");
  const hamburger = document.querySelector(".hamburger");

  if (navLinks) {
    navLinks.classList.toggle("active");
  }

  if (hamburger) {
    hamburger.classList.toggle("active");
  }
}
