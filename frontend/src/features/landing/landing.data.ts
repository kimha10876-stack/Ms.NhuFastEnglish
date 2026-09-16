import {
  Award,
  BookOpen,
  CalendarCheck,
  ClipboardCheck,
  Gift,
  Globe,
  Laptop,
  Megaphone,
  MessageCircle,
  Percent,
  Rocket,
  Smile,
  Sparkles,
  Target,
  MapPin,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export const LANDING_CONTACT = {
  messengerUrl: 'https://m.me/ms.nhufastenglishh',
  zaloPhone: '0976389166',
  zaloDisplay: '097 638 91 66',
  email: 'msnhufastenglish@gmail.com',
  city: 'TP.HCM',
  cityLabel: 'Thành phố Hồ Chí Minh',
}

export const ZALO_LOGO_URL = 'https://page.widget.zalo.me/static/images/2.0/Logo.svg'

export const PRICE_FROM = '83K'
export const PRICE_TAGLINE = 'Chất lượng thật, giá không tưởng'

export const IMAGES = {
  msNhu: '/images/ms-nhu-trao-chung-chi.jpg',
  foreignTeacher: '/images/giao-vien-nuoc-ngoai.jpg',
  classForeignTeacher: '/images/lop-hoc-gv-nuoc-ngoai.jpg',
  classGroup: '/images/lop-hoc-nhom.jpg',
  classPhoto: '/images/lop-hoc-chup-anh.jpg',
  examIdp: '/images/hoc-vien-di-thi-idp.jpg',
  examSelfie: '/images/hoc-vien-idp-selfie.jpg',
  examWaiting: '/images/hoc-vien-cho-thi.jpg',
  cert1: '/images/chung-chi-ielts-1.jpg',
  cert2: '/images/chung-chi-ielts-2.jpg',
  cert3: '/images/chung-chi-ielts-3.jpg',
} as const

export const MASCOTS = {
  waveHi: '/images/mascots/wave-hi.png',
  letsLearn: '/images/mascots/lets-learn.png',
  pointUp: '/images/mascots/point-up.png',
  thumbsUp: '/images/mascots/thumbs-up.png',
  reading: '/images/mascots/reading.png',
  backpackWalk: '/images/mascots/backpack-walk.png',
  ieltsCard: '/images/mascots/ielts-card.png',
  celebrateCert: '/images/mascots/celebrate-cert.png',
} as const

export type MascotKey = keyof typeof MASCOTS

export const heroHighlights = [
  { text: `Học phí chỉ từ ${PRICE_FROM}/giờ học — từ cơ bản đến nâng cao.`, dot: 'bg-primary-500' },
  { text: 'Chuyên lộ trình CẤP TỐC và MẤT GỐC cho mọi trình độ.', dot: 'bg-orange-500' },
  { text: 'Lớp 1-1 hoặc nhóm nhỏ với 100% giáo viên nước ngoài.', dot: 'bg-sky-500' },
  { text: 'Test đầu vào miễn phí, có lộ trình rồi mới bắt đầu học.', dot: 'bg-emerald-500' },
]

export const heroAvatars = [IMAGES.examIdp, IMAGES.classGroup, IMAGES.examSelfie, IMAGES.classPhoto]

interface TrustStat {
  icon: LucideIcon
  value: string
  title: string
  desc: string
}

/** Stats bar kiểu IEC — số liệu placeholder, user chỉnh sau */
export const trustStats: TrustStat[] = [
  {
    icon: Users,
    value: '5000+',
    title: 'Học viên đồng hành',
    desc: 'Niềm tin từ hơn 5.000 học viên và phụ huynh.',
  },
  {
    icon: TrendingUp,
    value: '100%',
    title: 'Giáo viên nước ngoài',
    desc: 'Native speaker cho lớp giao tiếp & luyện Speaking.',
  },
  {
    icon: MapPin,
    value: LANDING_CONTACT.city,
    title: 'Trung tâm tại TP.HCM',
    desc: `Hotline ${LANDING_CONTACT.zaloDisplay} — học online & offline.`,
  },
]

export interface HallOfFameEntry {
  name: string
  achievement: string
  photo: string
}

/** Bảng vàng — ảnh thật; tên/điểm cần xác nhận với học viên trước khi quảng cáo */
export const hallOfFame: HallOfFameEntry[] = [
  { name: 'Học viên IELTS', achievement: 'Nhận chứng chỉ IELTS', photo: IMAGES.cert1 },
  { name: 'Học viên IELTS', achievement: 'Đạt mục tiêu band', photo: IMAGES.cert2 },
  { name: 'Học viên IELTS', achievement: 'Hoàn thành khóa học', photo: IMAGES.cert3 },
  { name: 'Học viên lớp nhóm', achievement: 'Đồng hành thi IDP', photo: IMAGES.examIdp },
  { name: 'Học viên', achievement: 'Tự tin giao tiếp', photo: IMAGES.examSelfie },
  { name: 'Học viên', achievement: 'Hoàn thành lộ trình', photo: IMAGES.msNhu },
]

interface Promo {
  icon: LucideIcon
  title: string
  desc: string
  tag: string
  bar: string
  tile: string
  badge: string
}

export const promos: Promo[] = [
  {
    icon: Percent,
    title: 'Giảm 10% học phí',
    desc: 'Áp dụng khi bạn đăng ký combo 3 tháng — càng học dài, học phí mỗi giờ càng tiết kiệm.',
    tag: 'Combo 3 tháng',
    bar: 'from-rose-400 to-pink-600',
    tile: 'bg-rose-100 text-rose-700',
    badge: 'bg-rose-50 text-rose-700',
  },
  {
    icon: Gift,
    title: 'Tặng 1 buổi học mỗi tháng',
    desc: 'Mỗi tháng bạn được tặng thêm một buổi học cùng giáo viên nước ngoài, hoàn toàn miễn phí.',
    tag: 'Giáo viên nước ngoài',
    bar: 'from-sky-400 to-blue-600',
    tile: 'bg-sky-100 text-sky-700',
    badge: 'bg-sky-50 text-sky-700',
  },
  {
    icon: ClipboardCheck,
    title: 'Test đầu vào miễn phí',
    desc: 'Kiểm tra trình độ và nhận tư vấn lộ trình trước khi quyết định — không mất phí, không ràng buộc.',
    tag: 'Miễn phí 100%',
    bar: 'from-emerald-400 to-teal-600',
    tile: 'bg-emerald-100 text-emerald-700',
    badge: 'bg-emerald-50 text-emerald-700',
  },
]

export interface Course {
  slug: string
  name: string
  icon: LucideIcon
  level: string
  target: string
  desc: string
  /** Mô tả lộ trình — hiển thị trên trang chi tiết chương trình */
  roadmap: string
  bullets: string[]
  image: string
  bar: string
  tile: string
  soft: string
  text: string
  border: string
  /** Nút CTA + icon check trên card khóa học */
  accentBtn: string
}

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug)
}

export const courses: Course[] = [
  {
    slug: 'ielts',
    name: 'IELTS',
    icon: Award,
    level: 'Mọi trình độ',
    target: '5.0 – 7.5+',
    desc: 'Luyện đủ 4 kỹ năng theo tiêu chí chấm thi, tập trung nâng band Writing và Speaking.',
    roadmap:
      'Lộ trình IELTS được chia theo band hiện tại: làm quen format đề, luyện từng kỹ năng, rồi thi thử định kỳ. Writing và Speaking được chữa chi tiết từng buổi; Listening và Reading bám chiến lược làm bài và quản lý thời gian.',
    bullets: [
      'Lộ trình cá nhân hóa theo band hiện tại',
      'Chữa Writing & Speaking chi tiết',
      'Chiến lược làm bài từng dạng câu hỏi',
    ],
    image: IMAGES.examIdp,
    bar: 'from-sky-400 to-blue-600',
    tile: 'bg-sky-100 text-sky-700',
    soft: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'hover:border-sky-400',
    accentBtn: 'bg-sky-600 hover:bg-sky-700',
  },
  {
    slug: 'toeic',
    name: 'TOEIC',
    icon: Target,
    level: 'Cơ bản → Nâng cao',
    target: '500 – 900+',
    desc: 'Học đúng trọng tâm đề thi, luyện phản xạ Listening và kỹ thuật xử lý Reading nhanh.',
    roadmap:
      'Từ nền tảng ngữ pháp và từ vựng trọng tâm TOEIC, học viên luyện part-by-part, làm đề có phân tích lỗi sai và mẹo quản lý thời gian. Mục tiêu tăng điểm ổn định qua từng giai đoạn: 500 → 650 → 800+.',
    bullets: [
      'Bám sát format đề thi mới nhất',
      'Luyện đề có phân tích lỗi sai',
      'Mẹo quản lý thời gian làm bài',
    ],
    image: IMAGES.classForeignTeacher,
    bar: 'from-violet-400 to-purple-600',
    tile: 'bg-violet-100 text-violet-700',
    soft: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'hover:border-violet-400',
    accentBtn: 'bg-violet-600 hover:bg-violet-700',
  },
  {
    slug: 'giao-tiep',
    name: 'Giao tiếp',
    icon: MessageCircle,
    level: 'Mất gốc → Tự tin',
    target: 'Nói tự nhiên',
    desc: 'Học để dùng được ngay trong công việc và cuộc sống, nói nhiều hơn nghe giảng.',
    roadmap:
      'Bắt đầu từ phát âm và mẫu câu giao tiếp hằng ngày, sau đó mở rộng chủ đề công việc, du lịch, học tập. Mỗi buổi ưu tiên thời gian nói với giáo viên nước ngoài, sửa lỗi phát âm và ngữ điệu ngay trong lớp.',
    bullets: [
      '100% giáo viên nước ngoài',
      'Chủ đề thực tế đi làm, du lịch',
      'Sửa phát âm và ngữ điệu từng buổi',
    ],
    image: IMAGES.foreignTeacher,
    bar: 'from-rose-400 to-pink-600',
    tile: 'bg-rose-100 text-rose-700',
    soft: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'hover:border-rose-400',
    accentBtn: 'bg-rose-600 hover:bg-rose-700',
  },
  {
    slug: 'cap-1-2-3',
    name: 'Cấp 1-2-3',
    icon: BookOpen,
    level: 'Học sinh phổ thông',
    target: 'Nền tảng + điểm cao',
    desc: 'Xây nền tảng vững cho học sinh, song song cải thiện điểm số trên lớp.',
    roadmap:
      'Lộ trình đồng bộ chương trình phổ thông: củng cố ngữ pháp, từ vựng theo unit, luyện kỹ năng nghe-nói-đọc-viết trong SGK. Phụ huynh nhận báo cáo tiến độ định kỳ để theo dõi sự tiến bộ của con.',
    bullets: [
      'Đồng bộ với chương trình ở trường',
      'Bổ trợ ngữ pháp và từ vựng gốc',
      'Báo cáo tiến độ cho phụ huynh',
    ],
    image: IMAGES.classPhoto,
    bar: 'from-emerald-400 to-teal-600',
    tile: 'bg-emerald-100 text-emerald-700',
    soft: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'hover:border-emerald-400',
    accentBtn: 'bg-teal-600 hover:bg-teal-700',
  },
  {
    slug: 'cap-toc',
    name: 'Cấp tốc',
    icon: Rocket,
    level: 'Deadline gấp',
    target: 'Tăng nhanh 1-3 tháng',
    desc: 'Dành cho bạn cần kết quả gấp để thi, xét tuyển hay đi làm — học dày, học đúng chỗ yếu.',
    roadmap:
      'Sau test đầu vào, giáo viên thiết kế lộ trình rút gọn bám deadline: tập trung kỹ năng yếu nhất, tăng số buổi luyện tập và thi thử. Phù hợp khi bạn cần nâng band hoặc điểm số trong 1–3 tháng.',
    bullets: [
      'Kiểm tra trình độ trước khi vào lộ trình',
      'Tăng số buổi, thu gọn nội dung',
      'Bám sát mục tiêu và mốc thời gian',
    ],
    image: IMAGES.classGroup,
    bar: 'from-orange-400 to-red-500',
    tile: 'bg-orange-100 text-orange-700',
    soft: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'hover:border-orange-400',
    accentBtn: 'bg-orange-600 hover:bg-orange-700',
  },
  {
    slug: 'mat-goc',
    name: 'Mất gốc',
    icon: Sparkles,
    level: 'Bắt đầu từ số 0',
    target: 'Vững nền tảng',
    desc: 'Học lại từ đầu không áp lực: phát âm, từ vựng, ngữ pháp nền và câu giao tiếp cơ bản.',
    roadmap:
      'Giai đoạn 1: bảng chữ cái, phát âm và từ vựng cơ bản. Giai đoạn 2: mẫu câu giao tiếp đơn giản. Giai đoạn 3: ghép câu, hội thoại ngắn và tự tin nói trong lớp nhỏ — tốc độ chậm, lặp lại đến khi hiểu.',
    bullets: [
      'Bắt đầu từ phát âm và bảng chữ',
      'Tốc độ chậm, lặp lại đến khi hiểu',
      'Giáo viên kiên nhẫn, lớp siêu nhỏ',
    ],
    image: IMAGES.msNhu,
    bar: 'from-primary-400 to-amber-500',
    tile: 'bg-primary-100 text-primary-800',
    soft: 'bg-primary-50',
    text: 'text-primary-800',
    border: 'hover:border-primary-400',
    accentBtn: 'bg-[#222222] hover:bg-[#333333]',
  },
]

interface ProcessStep {
  step: string
  icon: LucideIcon
  title: string
  desc: string
  tile: string
}

export const processSteps: ProcessStep[] = [
  {
    step: '01',
    icon: ClipboardCheck,
    title: 'Test đầu vào miễn phí',
    desc: 'Kiểm tra 4 kỹ năng để biết chính xác bạn đang ở đâu và yếu ở phần nào.',
    tile: 'bg-emerald-100 text-emerald-700',
  },
  {
    step: '02',
    icon: Target,
    title: 'Nhận lộ trình cá nhân hóa',
    desc: 'Ms Nhu tư vấn trực tiếp, thiết kế lộ trình sát mục tiêu và thời gian của bạn.',
    tile: 'bg-sky-100 text-sky-700',
  },
  {
    step: '03',
    icon: Users,
    title: 'Vào lớp 1-1 hoặc nhóm nhỏ',
    desc: 'Học online hay offline đều được, giờ học linh hoạt theo lịch cá nhân.',
    tile: 'bg-violet-100 text-violet-700',
  },
  {
    step: '04',
    icon: CalendarCheck,
    title: 'Ghi nhận tiến bộ hàng tháng',
    desc: 'Đánh giá định kỳ mỗi tháng để điều chỉnh lộ trình cho phù hợp.',
    tile: 'bg-orange-100 text-orange-700',
  },
]

interface Strength {
  icon: LucideIcon
  title: string
  desc: string
  tile: string
  glow: string
}

export interface CoreValue {
  icon: LucideIcon
  title: string
  desc: string
  side: 'left' | 'right'
}

/** Section giá trị cốt lõi — layout IEC, 3 trái + 3 phải */
export const coreValues: CoreValue[] = [
  {
    icon: Globe,
    title: 'Giáo viên nước ngoài đồng hành',
    desc: 'Học và giao tiếp cùng giáo viên bản ngữ trong môi trường tích cực, giúp phát triển phát âm chuẩn, phản xạ tự nhiên và sự tự tin.',
    side: 'left',
  },
  {
    icon: Megaphone,
    title: 'Speaking là nền tảng',
    desc: 'Xây dựng khả năng giao tiếp qua hoạt động tương tác, thảo luận và thực hành tiếng Anh trong học tập và cuộc sống.',
    side: 'left',
  },
  {
    icon: Sparkles,
    title: 'Học qua trải nghiệm',
    desc: 'Các hoạt động ngoại khóa và tình huống thực tế giúp học viên vận dụng tiếng Anh tự nhiên, không học vẹt.',
    side: 'left',
  },
  {
    icon: Users,
    title: 'Môi trường truyền cảm hứng',
    desc: 'Lớp học hiện đại, lớp nhỏ và hoạt động đa dạng tạo không gian năng động, khuyến khích học viên khám phá và sáng tạo.',
    side: 'right',
  },
  {
    icon: UserCheck,
    title: 'Đồng hành cùng học viên',
    desc: 'Theo sát hành trình học tập qua đánh giá định kỳ và báo cáo tiến độ — phụ huynh và học viên luôn nắm rõ kết quả.',
    side: 'right',
  },
  {
    icon: Target,
    title: 'Lộ trình theo mục tiêu',
    desc: 'Chương trình cá nhân hóa từ mất gốc đến luyện thi IELTS, TOEIC — bám sát mục tiêu và thời gian của từng học viên tại TP.HCM.',
    side: 'right',
  },
]

export const strengths: Strength[] = [
  {
    icon: Wallet,
    title: `Học phí chỉ từ ${PRICE_FROM}/giờ`,
    desc: `${PRICE_TAGLINE} — học phí minh bạch theo giờ, không phí ẩn, có ưu đãi khi đăng ký dài hạn.`,
    tile: 'bg-primary-100 text-primary-800',
    glow: 'bg-primary-200/50',
  },
  {
    icon: Globe,
    title: 'Giáo viên giàu kinh nghiệm',
    desc: 'Ms Nhu cùng đội ngũ giáo viên chuẩn quốc tế — 100% giáo viên nước ngoài cho lớp giao tiếp và luyện Speaking.',
    tile: 'bg-sky-100 text-sky-700',
    glow: 'bg-sky-200/50',
  },
  {
    icon: Smile,
    title: 'Môi trường học năng động',
    desc: 'Học mà không stress — lớp nhỏ, nhiều hoạt động, tập trung luyện phản xạ tự nhiên thay vì học vẹt.',
    tile: 'bg-rose-100 text-rose-700',
    glow: 'bg-rose-200/50',
  },
  {
    icon: UserCheck,
    title: 'Lớp học cá nhân hóa',
    desc: 'Lộ trình riêng cho từng người, sát mục tiêu và trình độ của bạn sau buổi test đầu vào.',
    tile: 'bg-violet-100 text-violet-700',
    glow: 'bg-violet-200/50',
  },
  {
    icon: Rocket,
    title: 'Chuyên cấp tốc & mất gốc',
    desc: 'Cần gấp thì học dày và thu gọn nội dung; mất gốc thì bắt đầu lại từ phát âm, chậm mà chắc.',
    tile: 'bg-orange-100 text-orange-700',
    glow: 'bg-orange-200/50',
  },
  {
    icon: Laptop,
    title: 'Học online hoặc offline',
    desc: 'Chủ động chọn hình thức và giờ học, có hệ thống theo dõi bài tập và tiến độ trực tuyến.',
    tile: 'bg-emerald-100 text-emerald-700',
    glow: 'bg-emerald-200/50',
  },
]

export interface TeacherCategory {
  title: string
  desc: string
  photo: string
}

/** Ảnh collage tròn — phần intro giáo viên */
export const teacherCollage = [
  IMAGES.classForeignTeacher,
  IMAGES.foreignTeacher,
  IMAGES.msNhu,
  IMAGES.classPhoto,
] as const

/** Card danh mục giáo viên — layout IEC */
export const teacherCategories: TeacherCategory[] = [
  {
    title: 'Giáo viên IELTS',
    desc: 'Hướng dẫn chiến lược, mục tiêu band và chuẩn đầu ra theo tiêu chí chấm thi.',
    photo: IMAGES.examIdp,
  },
  {
    title: 'Giáo viên Giao tiếp',
    desc: '100% giáo viên nước ngoài — xây phản xạ nói và sự tự tin qua tương tác thực tế.',
    photo: IMAGES.foreignTeacher,
  },
  {
    title: 'Giáo viên Mất gốc',
    desc: 'Kiên nhẫn dẫn dắt từ phát âm, bảng chữ đến câu giao tiếp cơ bản — không áp lực.',
    photo: IMAGES.msNhu,
  },
  {
    title: 'Giáo viên Cấp tốc',
    desc: 'Tập trung điểm yếu, tăng cường buổi học và bám sát deadline thi hoặc công việc.',
    photo: IMAGES.classGroup,
  },
]

export const galleryImages = [
  { src: IMAGES.classGroup, alt: 'Cả lớp cùng giáo viên nước ngoài', caption: 'Cả lớp cùng giáo viên nước ngoài' },
  { src: IMAGES.classForeignTeacher, alt: 'Buổi học với giáo viên nước ngoài', caption: 'Buổi học 100% tiếng Anh' },
  { src: IMAGES.examIdp, alt: 'Học viên đi thi IELTS tại IDP', caption: 'Đồng hành ngày thi IELTS tại IDP' },
  { src: IMAGES.examSelfie, alt: 'Học viên chụp ảnh trước giờ thi', caption: 'Trước giờ thi cùng cả lớp' },
  { src: IMAGES.classPhoto, alt: 'Học viên chụp ảnh cuối buổi học', caption: 'Buổi học kết thúc bằng một tấm ảnh' },
  { src: IMAGES.examWaiting, alt: 'Học viên chờ vào phòng thi', caption: 'Chờ tới lượt vào phòng thi' },
]

export const certificateImages = [
  { src: IMAGES.cert1, alt: 'Học viên nhận chứng chỉ IELTS cùng Ms Nhu' },
  { src: IMAGES.cert2, alt: 'Học viên nhận chứng chỉ IELTS cùng Ms Nhu' },
  { src: IMAGES.cert3, alt: 'Học viên nhận chứng chỉ IELTS cùng Ms Nhu' },
]

export interface NewsEventItem {
  id: string
  slug: string
  title: string
  excerpt?: string
  image?: string
}

/** Tin tức & sự kiện — dummy, thay bằng API blog sau */
export const newsEventsDummy: NewsEventItem[] = [
  {
    id: '1',
    slug: 'hoc-tieng-anh-giua-nha-sach-ms-nhu',
    title: 'HỌC TIẾNG ANH GIỮA NHÀ SÁCH — TRẢI NGHIỆM ĐỘC ĐÁO TẠI MS NHU',
    excerpt:
      'Một buổi học thật đặc biệt khi học viên được cùng giáo viên bản ngữ thực hành giao tiếp trong không gian lớp học năng động tại TP.HCM [...]',
    image: IMAGES.classForeignTeacher,
  },
  {
    id: '2',
    slug: 'trai-he-song-ngu-2025',
    title: 'TRẠI HÈ SONG NGỮ 2025 — VUI CHƠI, HỌC TẬP VÀ BỨT PHÁ TIẾNG ANH',
    excerpt:
      'Chương trình trại hè song ngữ dành cho học sinh tiểu học với hoạt động ngoại khóa, giao tiếp cùng giáo viên nước ngoài mỗi ngày [...]',
    image: IMAGES.classGroup,
  },
  {
    id: '3',
    slug: 'top-10-trung-tam-tieng-anh-uy-tin',
    title: 'TOP 10+ TRUNG TÂM TIẾNG ANH UY TÍN TẠI TP.HCM — MS NHU FAST ENGLISH',
    excerpt:
      'Ms Nhu Fast English được nhiều phụ huynh tin chọn nhờ học phí hợp lý, 100% giáo viên nước ngoài cho lớp giao tiếp và lộ trình cá nhân hóa [...]',
    image: IMAGES.examIdp,
  },
  {
    id: '4',
    slug: '5-phuong-phap-hoc-tieng-anh-cap-1',
    title: '5 PHƯƠNG PHÁP HỌC TIẾNG ANH CẤP 1 BỐ MẸ CẦN BIẾT',
    excerpt:
      '5 phương pháp học tiếng Anh cấp 1 bố mẹ cần biết để con học hiệu quả ngay từ những bước đầu tiên [...]',
  },
  {
    id: '5',
    slug: 'lop-ielts-cap-toc-2025',
    title: 'LỚP IELTS CẤP TỐC 2025: 72 GIỜ BỨT PHÁ — TỰ TIN — BỨT BAND',
    excerpt: 'Khóa IELTS cấp tốc tập trung kỹ năng yếu, luyện đề và chữa bài chi tiết từng buổi [...]',
    image: IMAGES.examSelfie,
  },
  {
    id: '6',
    slug: 'workshop-speaking-native',
    title: 'WORKSHOP SPEAKING CÙNG NATIVE TEACHER — LUYỆN PHẢN XẠ TỰ NHIÊN',
    image: IMAGES.foreignTeacher,
  },
  {
    id: '7',
    slug: 'uu-dai-dang-ky-combo-3-thang',
    title: 'ƯU ĐÃI ĐĂNG KÝ COMBO 3 THÁNG — GIẢM 10% HỌC PHÍ',
    image: IMAGES.classPhoto,
  },
  {
    id: '8',
    slug: 'top-phuong-phap-luyen-ielts-speaking',
    title: 'TOP 5 PHƯƠNG PHÁP LUYỆN IELTS SPEAKING HIỆU QUẢ TẠI NHÀ',
    excerpt: 'Gợi ý luyện Speaking mỗi ngày dù bận rộn — phù hợp học viên tự ôn tại nhà [...]',
    image: IMAGES.examWaiting,
  },
  {
    id: '9',
    slug: 'khai-giang-lop-mat-goc-thang-9',
    title: 'Khai giảng lớp mất gốc tháng 9 — Số lượng có hạn',
    excerpt: 'Lớp nhỏ, tốc độ chậm, giáo viên theo sát từng học viên cho đến khi nắm vững nền tảng [...]',
  },
  {
    id: '10',
    slug: 'hoc-vien-dat-ielts-7-0',
    title: 'CHÚC MỪNG HỌC VIÊN ĐẠT IELTS 7.0 SAU 4 THÁNG HỌC TẠI MS NHU',
    image: IMAGES.cert1,
  },
  {
    id: '11',
    slug: 'test-dau-vao-mien-phi',
    title: 'TEST ĐẦU VÀO MIỄN PHÍ — NHẬN LỘ TRÌNH CÁ NHÂN HÓA',
    excerpt: 'Đăng ký test và tư vấn lộ trình trước khi quyết định học — không mất phí, không bắt buộc [...]',
    image: IMAGES.msNhu,
  },
  {
    id: '12',
    slug: 'lop-giao-tiep-1-1-gv-nuoc-ngoai',
    title: 'LỚP GIAO TIẾP 1-1 VỚI GIÁO VIÊN NƯỚC NGOÀI — LỊCH LINH HOẠT',
    image: IMAGES.classForeignTeacher,
  },
  {
    id: '13',
    slug: 'meo-hoc-tu-vung-hieu-qua',
    title: 'MẸO HỌC TỪ VỰNG HIỆU QUẢ CHO NGƯỜI MẤT GỐC',
    excerpt: 'Cách ghi nhớ từ vựng bền vững mà không cần học vẹt — áp dụng ngay sau mỗi buổi học [...]',
  },
  {
    id: '14',
    slug: 'su-kien-open-day-ms-nhu',
    title: 'OPEN DAY MS NHU — TRẢI NGHIỆM LỚP HỌC THỰC TẾ MIỄN PHÍ',
    image: IMAGES.classGroup,
  },
  {
    id: '15',
    slug: 'luyen-thi-toeic-550',
    title: 'KHÓA LUYỆN THI TOEIC 550+ — TẬP TRUNG PHẦN THI YẾU',
    excerpt: 'Lộ trình ngắn gọn, bám sát đề thi thật, phù hợp nhân viên văn phòng cần chứng chỉ gấp [...]',
    image: IMAGES.examIdp,
  },
  {
    id: '16',
    slug: 'chia-se-kinh-nghiem-thi-ielts',
    title: 'CHIA SẺ KINH NGHIỆM THI IELTS TỪ HỌC VIÊN MS NHU',
    image: IMAGES.cert2,
  },
  {
    id: '17',
    slug: 'uu-dai-hoc-sinh-moi-tot-nghiep',
    title: 'ƯU ĐÃI HỌC SINH MỚI TỐT NGHIỆP — GIẢM HỌC PHÍ THÁNG ĐẦU',
  },
  {
    id: '18',
    slug: 'workshop-phat-am-chuan',
    title: 'WORKSHOP PHÁT ÂM CHUẨN — SỬA LỖI PHÁT ÂM THƯỜNG GẶP',
    excerpt: 'Buổi workshop miễn phí giúp học viên nhận diện và sửa các lỗi phát âm hay gặp [...]',
    image: IMAGES.foreignTeacher,
  },
  {
    id: '19',
    slug: 'lich-khai-giang-thang-10',
    title: 'LỊCH KHAI GIẢNG THÁNG 10 — ĐĂNG KÝ SỚM GIỮ CHỖ',
    image: IMAGES.classPhoto,
  },
  {
    id: '20',
    slug: 'hoc-tieng-anh-online-hieu-qua',
    title: 'HỌC TIẾNG ANH ONLINE CÓ HIỆU QUẢ KHÔNG? — GÓC NHÌN TỪ MS NHU',
    excerpt: 'Khi nào nên học online, khi nào nên học offline — và cách kết hợp cả hai [...]',
  },
  {
    id: '21',
    slug: 'giao-vien-nuoc-ngoai-ms-nhu',
    title: 'ĐỘI NGŨ GIÁO VIÊN NƯỚC NGOÀI TẠI MS NHU — CHUẨN GIAO TIẾP THỰC TẾ',
    image: IMAGES.foreignTeacher,
  },
  {
    id: '22',
    slug: 'ket-qua-hoc-vien-thang-8',
    title: 'TỔNG KẾT KẾT QUẢ HỌC VIÊN THÁNG 8 — NHIỀU BẠN ĐẠT MỤC TIÊU',
    excerpt: 'Cập nhật kết quả học viên thi IELTS, TOEIC và phản hồi từ phụ huynh trong tháng qua [...]',
    image: IMAGES.cert3,
  },
  {
    id: '23',
    slug: 'lo-trinh-ielts-6-thang',
    title: 'LỘ TRÌNH IELTS 6 THÁNG CHO NGƯỜI MẤT GỐC — CÓ THẬT KHÔNG?',
  },
  {
    id: '24',
    slug: 'su-kien-trao-chung-chi',
    title: 'SỰ KIỆN TRAO CHỨNG CHỈ CHO HỌC VIÊN HOÀN THÀNH KHÓA HỌC',
    image: IMAGES.msNhu,
  },
  {
    id: '25',
    slug: 'tip-luyen-nghe-ielts',
    title: 'TIP LUYỆN NGHE IELTS CHO NGƯỜI MỚI BẮT ĐẦU',
    excerpt: 'Luyện nghe từng bước — từ nhận diện từ khóa đến hiểu ý chính và chi tiết [...]',
    image: IMAGES.examWaiting,
  },
  {
    id: '26',
    slug: 'dang-ky-tu-van-truc-tuyen',
    title: 'ĐĂNG KÝ TƯ VẤN TRỰC TUYẾN — NHẬN LỘ TRÌNH TRONG 24H',
  },
  {
    id: '27',
    slug: 'cam-nhan-phu-huynh-hoc-vien',
    title: 'CẢM NHẬN PHỤ HUYNH & HỌC VIÊN SAU 3 THÁNG HỌC TẠI MS NHU',
    excerpt: 'Những chia sẻ chân thực từ phụ huynh và học viên về tiến bộ sau khóa học [...]',
    image: IMAGES.examSelfie,
  },
]

/**
 * Nội dung mẫu — thay bằng review thật (kèm tên và kết quả học viên đồng ý công khai)
 * trước khi chạy quảng cáo.
 */
interface Testimonial {
  initials: string
  name: string
  meta: string
  result: string
  quote: string
  avatar: string
  badge: string
  tint: string
}

export const testimonials: Testimonial[] = [
  {
    initials: 'IE',
    name: 'Học viên lớp IELTS',
    meta: 'Lộ trình cá nhân hóa',
    result: 'Đạt mục tiêu',
    quote:
      'Trước khi học mình gần như mất gốc ngữ pháp. Ms Nhu kiểm tra trình độ rồi làm lộ trình riêng, học tới đâu chắc tới đó nên mình tự tin hơn nhiều khi vào phòng thi.',
    avatar: 'from-violet-400 to-purple-600',
    badge: 'bg-violet-100 text-violet-700',
    tint: 'bg-violet-50',
  },
  {
    initials: 'CT',
    name: 'Học viên lớp cấp tốc',
    meta: 'Nhân viên văn phòng',
    result: 'Thi gấp',
    quote:
      'Mình cần chứng chỉ gấp để xét nội bộ nên chọn lớp cấp tốc. Giáo viên tập trung đúng phần mình yếu, mỗi buổi đều có bài luyện và chữa lỗi rất kỹ.',
    avatar: 'from-sky-400 to-blue-600',
    badge: 'bg-sky-100 text-sky-700',
    tint: 'bg-sky-50',
  },
  {
    initials: 'GT',
    name: 'Học viên lớp Giao tiếp',
    meta: 'Lớp 1-1 với giáo viên nước ngoài',
    result: 'Tự tin nói',
    quote:
      'Học 1-1 với giáo viên nước ngoài nên mình buộc phải nói suốt buổi. Ban đầu hơi ngại nhưng sau vài tuần thì phản xạ nhanh hơn hẳn, đi họp với khách nước ngoài đã đỡ căng.',
    avatar: 'from-rose-400 to-pink-600',
    badge: 'bg-rose-100 text-rose-700',
    tint: 'bg-rose-50',
  },
]

export const faqs = [
  {
    q: 'Học phí bao nhiêu một giờ?',
    a: 'Học phí chỉ từ 83.000đ/giờ học, tùy theo khóa và hình thức lớp (1-1 hoặc nhóm nhỏ). Đăng ký combo 3 tháng được giảm thêm 10%. Bạn để lại thông tin để nhận báo giá chi tiết cho đúng lộ trình của mình.',
  },
  {
    q: 'Mình mất gốc hoàn toàn thì học được không?',
    a: 'Được. Đây là nhóm học viên chúng tôi nhận nhiều nhất. Lớp mất gốc bắt đầu lại từ phát âm, từ vựng và ngữ pháp nền, tốc độ chậm và lặp lại đến khi bạn thật sự hiểu.',
  },
  {
    q: 'Có được học thử hay test trước không?',
    a: 'Có. Bạn được test đầu vào miễn phí và nhận tư vấn lộ trình trước khi quyết định đăng ký — không mất phí và không bắt buộc phải học.',
  },
  {
    q: 'Giáo viên nước ngoài dạy những lớp nào?',
    a: 'Giáo viên nước ngoài phụ trách lớp Giao tiếp và phần luyện Speaking của các khóa IELTS, TOEIC. Ngoài ra mỗi tháng học viên được tặng thêm một buổi học cùng giáo viên nước ngoài.',
  },
  {
    q: 'Mình cần thi gấp trong 1-2 tháng thì có kịp không?',
    a: 'Lớp cấp tốc được thiết kế cho đúng trường hợp này: tăng số buổi mỗi tuần, thu gọn nội dung và chỉ tập trung vào phần đang kéo điểm bạn xuống. Hãy nói rõ mốc thi để chúng tôi tính lộ trình phù hợp.',
  },
  {
    q: 'Học online và offline khác nhau thế nào?',
    a: 'Nội dung và giáo viên như nhau. Lớp online tiện cho bạn ở xa hoặc lịch thay đổi nhiều, lớp offline phù hợp nếu bạn cần không khí lớp học để giữ động lực. Bài tập và tiến độ đều theo dõi trên hệ thống.',
  },
]

export const workingHours = [
  { label: 'Thứ 2 – Thứ 6', time: '08:00 – 21:00' },
  { label: 'Thứ 7 – Chủ nhật', time: '08:00 – 18:00' },
]

export function settingValue(
  items: { key: string; value: string }[] | undefined,
  key: string,
  fallback = ''
) {
  return items?.find((s) => s.key === key)?.value?.trim() || fallback
}
