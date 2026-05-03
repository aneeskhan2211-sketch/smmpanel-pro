export type Language = "en" | "hi" | "hinglish" | "ar";

export type TranslationKey =
  | "nav.dashboard"
  | "nav.new_order"
  | "nav.services"
  | "nav.orders"
  | "nav.subscriptions"
  | "nav.api"
  | "nav.wallet"
  | "nav.support"
  | "nav.settings"
  | "nav.bundles"
  | "nav.calculator"
  | "nav.ai_tools"
  | "nav.admin_panel"
  | "nav.add_funds"
  | "dashboard.welcome"
  | "dashboard.total_orders"
  | "dashboard.active_orders"
  | "dashboard.completed_orders"
  | "dashboard.wallet_balance"
  | "dashboard.recent_orders"
  | "dashboard.quick_order"
  | "dashboard.daily_reward"
  | "dashboard.claim_reward"
  | "dashboard.reward_claimed"
  | "dashboard.your_level"
  | "dashboard.referral_code"
  | "dashboard.spin_wheel"
  | "order.status.pending"
  | "order.status.processing"
  | "order.status.active"
  | "order.status.completed"
  | "order.status.cancelled"
  | "order.status.partial"
  | "order.status.refunded"
  | "order.status.failed"
  | "order.place_order"
  | "order.quantity"
  | "order.link"
  | "order.service"
  | "order.total_price"
  | "order.delivery_time"
  | "order.estimated_delivery"
  | "order.tracking"
  | "payment.add_funds"
  | "payment.amount"
  | "payment.currency"
  | "payment.pay_now"
  | "payment.success"
  | "payment.failed"
  | "payment.processing"
  | "payment.wallet_balance"
  | "payment.transaction_history"
  | "service.basic"
  | "service.recommended"
  | "service.premium"
  | "service.most_popular"
  | "service.best_quality"
  | "service.fast_delivery"
  | "service.refill_guarantee"
  | "service.high_retention"
  | "service.low_drop_rate"
  | "service.priority_delivery"
  | "service.safer_growth"
  | "service.success_rate"
  | "service.retention_score"
  | "service.delivery_speed"
  | "service.support_level"
  | "service.book_now"
  | "service.order_now"
  | "service.compare_tiers"
  | "service.premium_cta"
  | "service.limited_slots"
  | "service.high_demand"
  | "support.open_ticket"
  | "support.my_tickets"
  | "support.send_message"
  | "support.ticket_status"
  | "support.priority"
  | "support.ticket_created"
  | "common.loading"
  | "common.error"
  | "common.success"
  | "common.cancel"
  | "common.confirm"
  | "common.save"
  | "common.close"
  | "common.search"
  | "common.filter"
  | "common.copy"
  | "common.copied"
  | "common.view_all"
  | "common.back"
  | "common.select_tier";

type Translations = Record<TranslationKey, string>;
export type TranslationMap = Record<Language, Translations>;

export const translations: TranslationMap = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.new_order": "New Order",
    "nav.services": "Services",
    "nav.orders": "My Orders",
    "nav.subscriptions": "Subscriptions",
    "nav.api": "API",
    "nav.wallet": "Wallet",
    "nav.support": "Support",
    "nav.settings": "Settings",
    "nav.bundles": "Bundles",
    "nav.calculator": "Calculator",
    "nav.ai_tools": "AI Tools",
    "nav.admin_panel": "Admin Panel",
    "nav.add_funds": "Add Funds",
    "dashboard.welcome": "Welcome back",
    "dashboard.total_orders": "Total Orders",
    "dashboard.active_orders": "Active Orders",
    "dashboard.completed_orders": "Completed",
    "dashboard.wallet_balance": "Wallet Balance",
    "dashboard.recent_orders": "Recent Orders",
    "dashboard.quick_order": "Quick Order",
    "dashboard.daily_reward": "Daily Reward",
    "dashboard.claim_reward": "Claim ₹10 Reward",
    "dashboard.reward_claimed": "Reward Claimed!",
    "dashboard.your_level": "Your Level",
    "dashboard.referral_code": "Referral Code",
    "dashboard.spin_wheel": "Spin Wheel",
    "order.status.pending": "Pending",
    "order.status.processing": "Processing",
    "order.status.active": "Active",
    "order.status.completed": "Completed",
    "order.status.cancelled": "Cancelled",
    "order.status.partial": "Partial",
    "order.status.refunded": "Refunded",
    "order.status.failed": "Failed",
    "order.place_order": "Place Order",
    "order.quantity": "Quantity",
    "order.link": "Link / URL",
    "order.service": "Service",
    "order.total_price": "Total Price",
    "order.delivery_time": "Delivery Time",
    "order.estimated_delivery": "Est. Delivery",
    "order.tracking": "Track Order",
    "payment.add_funds": "Add Funds",
    "payment.amount": "Amount",
    "payment.currency": "Currency",
    "payment.pay_now": "Pay Now",
    "payment.success": "Payment Successful",
    "payment.failed": "Payment Failed",
    "payment.processing": "Processing Payment",
    "payment.wallet_balance": "Wallet Balance",
    "payment.transaction_history": "Transaction History",
    "service.basic": "Basic",
    "service.recommended": "Recommended",
    "service.premium": "Premium",
    "service.most_popular": "Most Popular",
    "service.best_quality": "Best Quality",
    "service.fast_delivery": "Fast Delivery",
    "service.refill_guarantee": "Refill Guarantee",
    "service.high_retention": "High Retention",
    "service.low_drop_rate": "Low Drop Rate",
    "service.priority_delivery": "Priority Delivery",
    "service.safer_growth": "Safer Growth",
    "service.success_rate": "Success Rate",
    "service.retention_score": "Retention Score",
    "service.delivery_speed": "Delivery Speed",
    "service.support_level": "Support Level",
    "service.book_now": "Book Now",
    "service.order_now": "Order Now",
    "service.compare_tiers": "Compare Tiers",
    "service.premium_cta":
      "Premium services are designed for users who want stable growth, better retention, and safer delivery.",
    "service.limited_slots": "Limited slots today",
    "service.high_demand": "High demand service",
    "support.open_ticket": "Open Ticket",
    "support.my_tickets": "My Tickets",
    "support.send_message": "Send Message",
    "support.ticket_status": "Ticket Status",
    "support.priority": "Priority",
    "support.ticket_created": "Ticket Created",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.save": "Save",
    "common.close": "Close",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.copy": "Copy",
    "common.copied": "Copied!",
    "common.view_all": "View All",
    "common.back": "Back",
    "common.select_tier": "Select Tier",
  },
  hi: {
    "nav.dashboard": "डैशबोर्ड",
    "nav.new_order": "नया ऑर्डर",
    "nav.services": "सेवाएं",
    "nav.orders": "मेरे ऑर्डर",
    "nav.subscriptions": "सब्सक्रिप्शन",
    "nav.api": "एपीआई",
    "nav.wallet": "वॉलेट",
    "nav.support": "सहायता",
    "nav.settings": "सेटिंग्स",
    "nav.bundles": "बंडल",
    "nav.calculator": "कैलकुलेटर",
    "nav.ai_tools": "AI टूल्स",
    "nav.admin_panel": "एडमिन पैनल",
    "nav.add_funds": "फंड जोड़ें",
    "dashboard.welcome": "वापस स्वागत है",
    "dashboard.total_orders": "कुल ऑर्डर",
    "dashboard.active_orders": "सक्रिय ऑर्डर",
    "dashboard.completed_orders": "पूर्ण",
    "dashboard.wallet_balance": "वॉलेट बैलेंस",
    "dashboard.recent_orders": "हाल के ऑर्डर",
    "dashboard.quick_order": "त्वरित ऑर्डर",
    "dashboard.daily_reward": "दैनिक इनाम",
    "dashboard.claim_reward": "₹10 इनाम लें",
    "dashboard.reward_claimed": "इनाम मिला!",
    "dashboard.your_level": "आपका स्तर",
    "dashboard.referral_code": "रेफरल कोड",
    "dashboard.spin_wheel": "स्पिन व्हील",
    "order.status.pending": "प्रतीक्षित",
    "order.status.processing": "प्रक्रिया में",
    "order.status.active": "सक्रिय",
    "order.status.completed": "पूर्ण",
    "order.status.cancelled": "रद्द",
    "order.status.partial": "आंशिक",
    "order.status.refunded": "वापस",
    "order.status.failed": "विफल",
    "order.place_order": "ऑर्डर दें",
    "order.quantity": "मात्रा",
    "order.link": "लिंक / URL",
    "order.service": "सेवा",
    "order.total_price": "कुल मूल्य",
    "order.delivery_time": "डिलीवरी समय",
    "order.estimated_delivery": "अनुमानित डिलीवरी",
    "order.tracking": "ऑर्डर ट्रैक करें",
    "payment.add_funds": "फंड जोड़ें",
    "payment.amount": "राशि",
    "payment.currency": "मुद्रा",
    "payment.pay_now": "अभी भुगतान करें",
    "payment.success": "भुगतान सफल",
    "payment.failed": "भुगतान विफल",
    "payment.processing": "भुगतान प्रक्रिया में",
    "payment.wallet_balance": "वॉलेट बैलेंस",
    "payment.transaction_history": "लेनदेन इतिहास",
    "service.basic": "बेसिक",
    "service.recommended": "अनुशंसित",
    "service.premium": "प्रीमियम",
    "service.most_popular": "सर्वाधिक लोकप्रिय",
    "service.best_quality": "सर्वश्रेष्ठ गुणवत्ता",
    "service.fast_delivery": "तेज़ डिलीवरी",
    "service.refill_guarantee": "रिफिल गारंटी",
    "service.high_retention": "उच्च रिटेंशन",
    "service.low_drop_rate": "कम ड्रॉप दर",
    "service.priority_delivery": "प्राथमिकता डिलीवरी",
    "service.safer_growth": "सुरक्षित विकास",
    "service.success_rate": "सफलता दर",
    "service.retention_score": "रिटेंशन स्कोर",
    "service.delivery_speed": "डिलीवरी गति",
    "service.support_level": "सहायता स्तर",
    "service.book_now": "अभी बुक करें",
    "service.order_now": "अभी ऑर्डर करें",
    "service.compare_tiers": "स्तर तुलना",
    "service.premium_cta":
      "प्रीमियम सेवाएं उन उपयोगकर्ताओं के लिए हैं जो स्थिर विकास, बेहतर रिटेंशन और सुरक्षित डिलीवरी चाहते हैं।",
    "service.limited_slots": "आज सीमित स्लॉट",
    "service.high_demand": "अधिक मांग वाली सेवा",
    "support.open_ticket": "टिकट खोलें",
    "support.my_tickets": "मेरे टिकट",
    "support.send_message": "संदेश भेजें",
    "support.ticket_status": "टिकट स्थिति",
    "support.priority": "प्राथमिकता",
    "support.ticket_created": "टिकट बनाया गया",
    "common.loading": "लोड हो रहा है...",
    "common.error": "त्रुटि",
    "common.success": "सफलता",
    "common.cancel": "रद्द करें",
    "common.confirm": "पुष्टि करें",
    "common.save": "सहेजें",
    "common.close": "बंद करें",
    "common.search": "खोजें",
    "common.filter": "फ़िल्टर",
    "common.copy": "कॉपी करें",
    "common.copied": "कॉपी हो गया!",
    "common.view_all": "सभी देखें",
    "common.back": "वापस",
    "common.select_tier": "स्तर चुनें",
  },
  hinglish: {
    "nav.dashboard": "Dashboard",
    "nav.new_order": "Naya Order",
    "nav.services": "Services",
    "nav.orders": "Mere Orders",
    "nav.subscriptions": "Subscriptions",
    "nav.api": "API",
    "nav.wallet": "Wallet",
    "nav.support": "Support",
    "nav.settings": "Settings",
    "nav.bundles": "Bundles",
    "nav.calculator": "Calculator",
    "nav.ai_tools": "AI Tools",
    "nav.admin_panel": "Admin Panel",
    "nav.add_funds": "Funds Add Karo",
    "dashboard.welcome": "Wapas Swagat Hai",
    "dashboard.total_orders": "Total Orders",
    "dashboard.active_orders": "Active Orders",
    "dashboard.completed_orders": "Complete",
    "dashboard.wallet_balance": "Wallet Balance",
    "dashboard.recent_orders": "Recent Orders",
    "dashboard.quick_order": "Quick Order",
    "dashboard.daily_reward": "Daily Reward",
    "dashboard.claim_reward": "₹10 Reward Lo",
    "dashboard.reward_claimed": "Reward Mila!",
    "dashboard.your_level": "Tumhara Level",
    "dashboard.referral_code": "Referral Code",
    "dashboard.spin_wheel": "Spin Karo",
    "order.status.pending": "Pending",
    "order.status.processing": "Processing",
    "order.status.active": "Active",
    "order.status.completed": "Complete",
    "order.status.cancelled": "Cancel",
    "order.status.partial": "Partial",
    "order.status.refunded": "Refund Hua",
    "order.status.failed": "Failed",
    "order.place_order": "Order Lagao",
    "order.quantity": "Quantity",
    "order.link": "Link / URL",
    "order.service": "Service",
    "order.total_price": "Total Price",
    "order.delivery_time": "Delivery Time",
    "order.estimated_delivery": "Est. Delivery",
    "order.tracking": "Order Track Karo",
    "payment.add_funds": "Funds Add Karo",
    "payment.amount": "Amount",
    "payment.currency": "Currency",
    "payment.pay_now": "Abhi Pay Karo",
    "payment.success": "Payment Ho Gaya",
    "payment.failed": "Payment Failed",
    "payment.processing": "Processing Ho Raha Hai",
    "payment.wallet_balance": "Wallet Balance",
    "payment.transaction_history": "Transaction History",
    "service.basic": "Basic",
    "service.recommended": "Recommended",
    "service.premium": "Premium",
    "service.most_popular": "Sabse Popular",
    "service.best_quality": "Best Quality",
    "service.fast_delivery": "Fast Delivery",
    "service.refill_guarantee": "Refill Guarantee",
    "service.high_retention": "High Retention",
    "service.low_drop_rate": "Kam Drop Rate",
    "service.priority_delivery": "Priority Delivery",
    "service.safer_growth": "Safe Growth",
    "service.success_rate": "Success Rate",
    "service.retention_score": "Retention Score",
    "service.delivery_speed": "Delivery Speed",
    "service.support_level": "Support Level",
    "service.book_now": "Book Karo",
    "service.order_now": "Order Karo",
    "service.compare_tiers": "Tiers Compare Karo",
    "service.premium_cta":
      "Premium services un logon ke liye hai jo stable growth, better retention aur safer delivery chahte hain.",
    "service.limited_slots": "Aaj limited slots hain",
    "service.high_demand": "Bahut demand hai",
    "support.open_ticket": "Ticket Kholo",
    "support.my_tickets": "Mere Tickets",
    "support.send_message": "Message Bhejo",
    "support.ticket_status": "Ticket Status",
    "support.priority": "Priority",
    "support.ticket_created": "Ticket Ban Gaya",
    "common.loading": "Load Ho Raha Hai...",
    "common.error": "Error",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.save": "Save Karo",
    "common.close": "Band Karo",
    "common.search": "Dhundho",
    "common.filter": "Filter",
    "common.copy": "Copy",
    "common.copied": "Copy Ho Gaya!",
    "common.view_all": "Sab Dekho",
    "common.back": "Wapas",
    "common.select_tier": "Tier Chuno",
  },
  ar: {
    "nav.dashboard": "لوحة التحكم",
    "nav.new_order": "طلب جديد",
    "nav.services": "الخدمات",
    "nav.orders": "طلباتي",
    "nav.subscriptions": "الاشتراكات",
    "nav.api": "API",
    "nav.wallet": "المحفظة",
    "nav.support": "الدعم",
    "nav.settings": "الإعدادات",
    "nav.bundles": "الحزم",
    "nav.calculator": "الحاسبة",
    "nav.ai_tools": "أدوات AI",
    "nav.admin_panel": "لوحة الإدارة",
    "nav.add_funds": "إضافة رصيد",
    "dashboard.welcome": "مرحباً بعودتك",
    "dashboard.total_orders": "إجمالي الطلبات",
    "dashboard.active_orders": "الطلبات النشطة",
    "dashboard.completed_orders": "مكتمل",
    "dashboard.wallet_balance": "رصيد المحفظة",
    "dashboard.recent_orders": "الطلبات الأخيرة",
    "dashboard.quick_order": "طلب سريع",
    "dashboard.daily_reward": "المكافأة اليومية",
    "dashboard.claim_reward": "احصل على مكافأة ₹10",
    "dashboard.reward_claimed": "تم الحصول على المكافأة!",
    "dashboard.your_level": "مستواك",
    "dashboard.referral_code": "رمز الإحالة",
    "dashboard.spin_wheel": "اعجلة الحظ",
    "order.status.pending": "قيد الانتظار",
    "order.status.processing": "قيد المعالجة",
    "order.status.active": "نشط",
    "order.status.completed": "مكتمل",
    "order.status.cancelled": "ملغى",
    "order.status.partial": "جزئي",
    "order.status.refunded": "مُسترد",
    "order.status.failed": "فشل",
    "order.place_order": "تقديم الطلب",
    "order.quantity": "الكمية",
    "order.link": "الرابط / URL",
    "order.service": "الخدمة",
    "order.total_price": "السعر الإجمالي",
    "order.delivery_time": "وقت التسليم",
    "order.estimated_delivery": "التسليم المتوقع",
    "order.tracking": "تتبع الطلب",
    "payment.add_funds": "إضافة رصيد",
    "payment.amount": "المبلغ",
    "payment.currency": "العملة",
    "payment.pay_now": "ادفع الآن",
    "payment.success": "تمت الدفعة بنجاح",
    "payment.failed": "فشل الدفع",
    "payment.processing": "جاري معالجة الدفع",
    "payment.wallet_balance": "رصيد المحفظة",
    "payment.transaction_history": "سجل المعاملات",
    "service.basic": "أساسي",
    "service.recommended": "موصى به",
    "service.premium": "مميز",
    "service.most_popular": "الأكثر شعبية",
    "service.best_quality": "أفضل جودة",
    "service.fast_delivery": "توصيل سريع",
    "service.refill_guarantee": "ضمان الإعادة",
    "service.high_retention": "احتفاظ عالٍ",
    "service.low_drop_rate": "معدل انخفاض منخفض",
    "service.priority_delivery": "توصيل أولوي",
    "service.safer_growth": "نمو آمن",
    "service.success_rate": "معدل النجاح",
    "service.retention_score": "نقاط الاحتفاظ",
    "service.delivery_speed": "سرعة التسليم",
    "service.support_level": "مستوى الدعم",
    "service.book_now": "احجز الآن",
    "service.order_now": "اطلب الآن",
    "service.compare_tiers": "مقارنة المستويات",
    "service.premium_cta":
      "الخدمات المميزة مصممة للمستخدمين الذين يريدون نموًا مستقرًا واحتفاظًا أفضل وتسليمًا أكثر أمانًا.",
    "service.limited_slots": "مقاعد محدودة اليوم",
    "service.high_demand": "خدمة عالية الطلب",
    "support.open_ticket": "فتح تذكرة",
    "support.my_tickets": "تذاكري",
    "support.send_message": "إرسال رسالة",
    "support.ticket_status": "حالة التذكرة",
    "support.priority": "الأولوية",
    "support.ticket_created": "تم إنشاء التذكرة",
    "common.loading": "جاري التحميل...",
    "common.error": "خطأ",
    "common.success": "نجاح",
    "common.cancel": "إلغاء",
    "common.confirm": "تأكيد",
    "common.save": "حفظ",
    "common.close": "إغلاق",
    "common.search": "بحث",
    "common.filter": "تصفية",
    "common.copy": "نسخ",
    "common.copied": "تم النسخ!",
    "common.view_all": "عرض الكل",
    "common.back": "رجوع",
    "common.select_tier": "اختر المستوى",
  },
};
