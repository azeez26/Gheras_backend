# Gheras Backend (منصة غراس الزراعية)

مشروع برمجي متكامل (MEAN Stack) مخصص لمنصة **غراس**، يهدف إلى توفير مساحة متكاملة لزراعة الأسطح، منتدى تفاعلي للمجتمع الزراعي، مدونة إرشادية، ومتجر إلكتروني شامل لبيع المستلزمات الزراعية والشتلات.

---

## Tech Stack (التقنيات المستخدمة)

- **Node.js** & **Express.js** (Backend Framework)
- **MongoDB** & **Mongoose ODM** (Database & Schemas)
- **Cloudinary** (Cloud Media & Image Storage)
- **JWT (JSON Web Tokens)** (Authentication & Role-based Authorization)
- **Multer** (Handling multipart/form-data for file uploads)

---

## Admin Dashboard Features (مميزات لوحة تحكم الأدمن)

### 1. المتجر (Store)

- **إدارة المنتجات:** إضافة، تعديل، حذف المنتجات، وتصنيفها مع التحكم الكامل في المخزون.
- **إدارة الطلبات:** تتبع الطلبات وتحديث حالتها (قيد الانتظار، تم الشحن، تم الإلغاء).
- **إدارة الدفع:** متابعة المدفوعات، طرق الدفع، وتأكيد المعاملات المالية.
- **التقارير والمبيعات:** عرض تقارير المبيعات الشهرية، أرباح المتجر، المنتجات الأكثر مبيعاً، وتحليل الأداء.
- **إدارة العملاء:** استعراض بيانات العملاء وتاريخ عمليات الشراء الخاصة بهم.

### 2. الويكي والمقالات (Wiki & Blog)

- **إدارة المقالات:** إضافة، تعديل، حذف المقالات، وتصنيفها ضمن دليل غراس الزراعي.
- **مراجعة المحتوى:** مراجعة، الموافقة على، أو رفض المقالات والمشاركات الواردة من المستخدمين.
- **إدارة المستخدمين:** ترقية صلاحيات المستخدمين لمنحهم صلاحيات الكتابة والمراجعة (Editors).

### 3. المنتدى المجتمعي (Community Forum)

- **إدارة المواضيع والمشاركات:** التحكم الكامل في حذف أو تعديل المواضيع والمشاركات المخالفة.
- **إدارة الأعضاء:** إدارة صلاحيات الأعضاء (حظر، تنبيه، أو رفع الرتبة).
- **إدارة الفئات:** إضافة، تعديل، وحذف فئات المنتدى.
- **الاحصائيات والتقارير:** تتبع عدد التفاعلات، إجمالي المواضيع، وأكثر المواضيع زيارة وتداولاً.

---

## API Endpoints Documentation

### 1. Admin & Auth APIs (الإدارة والمستخدمين)

- `POST /api/admin/login` - تسجیل دخول الأدمن
- `PUT /api/admin/change-password` - تغيير كلمة المرور
- `POST /api/admin/users` - إضافة مستخدم جديد وإدارة الصلاحيات

### 2. Store APIs (إدارة المتجر)

- `GET /api/admin/products` - عرض جميع المنتجات
- `POST /api/admin/products` - إضافة منتج جديد (مع دعم رفع الصور عبر Cloudinary)
- `PUT /api/admin/products/{productId}` - تحديث بيانات منتج
- `DELETE /api/admin/products/{productId}` - حذف منتج
- `GET /api/admin/orders` - عرض طلبات المتجر
- `PUT /api/admin/orders/{orderId}` - تحديث حالة الطلب
- `GET /api/admin/payments` - التحقق من وتتبع المدفوعات

### 3. Wiki & Blog APIs (الويكي والمقالات)

- `GET /api/admin/wiki` - عرض جميع مقالات الويكي
- `POST /api/admin/wiki` - إضافة مقال جديد
- `PUT /api/admin/wiki/{articleId}` - تعديل مقال
- `DELETE /api/admin/wiki/{articleId}` - حذف مقال
- `GET /api/admin/wiki/pending` - عرض المقالات الجديدة التي تنتظر المراجعة

### 4. Forum APIs (إدارة المنتدى)

- `GET /api/admin/forum` - عرض مواضيع المنتدى
- `POST /api/admin/forum` - إضافة موضوع جديد
- `PUT /api/admin/forum/{topicId}` - تعديل موضوع
- `DELETE /api/admin/forum/{topicId}` - حذف موضوع
- `GET /api/admin/forum/posts` - عرض المشاركات
- `DELETE /api/admin/forum/posts/{postId}` - حذف مشاركة مخالفة
- `PUT /api/admin/forum/users/{userId}/ban` - حظر عضو من المنتدى
- `PUT /api/admin/forum/users/{userId}/promote` - ترقية رتبة عضو

---

## Dashboard Controller Architecture

الـ Controllers الخاصة بلوحة التحكم مصممة هندسياً للتعامل مع العمليات التالية:

- **استرجاع البيانات (Data Retrieval):** جلب وعرض البيانات المهيكلة للـ المنتجات، الطلبات، المقالات، والمواضيع بصيغة JSON.
- **تنفيذ العمليات (Business Logic):** إدارة طلبات التعديل، الحذف، والإضافة مع ضمان سلامة البيانات ومزامنتها مع قاعدة البيانات.
- **التحقق من الصلاحيات (Authorization):** التأكد من أن المستخدم الحالي يمتلك صلاحيات `Admin` كافية لتنفيذ الطلب قبل معالجته.
- **الاستجابة الموحدة (Standardized Responses):** الرد على الـ Requests بحالة الطلب (`success` / `error`) مع الرسائل والأكواد المناسبة.

---

## Getting Started (التشغيل المحلي)

1. قم بعمل Clone للريبو:
   ```bash
   git clone [https://github.com/your-username/gheras-backend.git](https://github.com/your-username/gheras-backend.git)
   ```
