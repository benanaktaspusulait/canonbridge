# Requirements Document

## Introduction

Integration Studio (mapping-studio-ui), kaynak JSON verilerini kanonik hedef şemasına dönüştüren kural tabanlı bir eşleme aracıdır. Uygulama Angular 17+ standalone bileşenler ve PrimeNG v17 ile geliştirilmiştir; IBM Plex Sans, Inter ve JetBrains Mono fontlarını, `#2563eb` birincil rengi ve dark mode desteğini içeren mevcut bir tasarım sistemine sahiptir.

Bu özellik, mevcut 4 adımlı wizard akışının (Source → Canonical → Mapping → Validate) görsel tasarımını, kullanıcı deneyimini ve etkileşim kalitesini kapsamlı biçimde yenilemektedir. Yeniden tasarım; adım gezinimini sezgisel hale getirmeyi, her adımın görsel hiyerarşisini güçlendirmeyi, kullanıcı geri bildirim mekanizmalarını zenginleştirmeyi ve mobil/tablet uyumunu iyileştirmeyi hedeflemektedir.

---

## Glossary

- **Studio_Shell**: Tüm wizard akışını kapsayan üst düzey Angular bileşeni (`integration-studio.component`).
- **Wizard_Nav**: Adım ilerleme durumunu gösteren ve adımlar arası gezinmeyi sağlayan navigasyon bileşeni.
- **Step_Indicator**: Wizard_Nav içindeki her adımı temsil eden görsel öğe (numara, etiket, durum ikonu).
- **Progress_Rail**: Adımlar arasındaki bağlantı çizgisi; tamamlanma durumunu renk ile gösterir.
- **Source_Panel**: 1. adımda JSON girişi ve ağaç görünümünü barındıran panel.
- **JSON_Editor**: Kaynak JSON verisinin girildiği veya yüklendiği metin alanı bileşeni.
- **Field_Tree**: Ayrıştırılmış JSON yapısını hiyerarşik olarak gösteren ağaç bileşeni.
- **Canonical_Table**: 2. adımda hedef alanların tanımlandığı tablo bileşeni.
- **Mapping_Table**: 3. adımda eşleme kurallarının listelendiği tablo bileşeni.
- **Rule_Inspector**: 3. adımda seçili kuralın detaylarını düzenlemeye yarayan yan panel.
- **Validate_Panel**: 4. adımda test çalıştırma, doğrulama sonuçları ve yayınlama işlemlerini barındıran panel.
- **Output_Panel**: 4. adımda dönüştürülmüş JSON çıktısını gösteren panel.
- **Loading_Overlay**: Asenkron işlemler sırasında gösterilen yükleme durumu bileşeni.
- **Toast_Notification**: İşlem sonuçlarını bildiren geçici bildirim bileşeni.
- **Dark_Mode**: Koyu renk teması; `html.dark-mode` CSS sınıfı ile etkinleştirilir.
- **TransformKind**: Bir eşleme kuralının dönüşüm türü (direct, date_format, enum_map vb.).
- **MappingRule**: Kaynak yol, hedef alan ve dönüşüm parametrelerini içeren kural nesnesi.
- **TargetField**: Kanonik şemadaki bir hedef alanı tanımlayan nesne (key, type, required, description).

---

## Requirements

### Requirement 1: Wizard Navigasyonu ve İlerleme Göstergesi

**User Story:** Bir entegrasyon geliştiricisi olarak, hangi adımda olduğumu ve önceki adımları tamamlayıp tamamlamadığımı net biçimde görmek istiyorum; böylece akışta kaybolmadan ilerleyebilirim.

#### Kabul Kriterleri

1. THE Wizard_Nav SHALL her adım için Step_Indicator öğelerini sıralı biçimde görüntüler; her Step_Indicator adım numarasını, etiketini ve mevcut durumunu (beklemede / aktif / tamamlandı / hatalı) içerir.
2. WHEN bir adım tamamlandığında, THE Step_Indicator SHALL durum ikonunu numara yerine onay işareti (✓) olarak günceller ve tamamlanma rengini (`--color-success`) uygular.
3. WHEN bir adımda doğrulama hatası oluştuğunda, THE Step_Indicator SHALL hata ikonunu (⚠) görüntüler ve hata rengini (`--color-error`) uygular.
4. THE Progress_Rail SHALL tamamlanan adımlar arasında animasyonlu dolum efekti ile ilerleme durumunu gösterir; tamamlanmamış adımlar arasında nötr renk kullanır.
5. WHEN kullanıcı tamamlanmış bir adımın Step_Indicator öğesine tıkladığında, THE Wizard_Nav SHALL o adıma doğrudan geçiş yapar.
6. WHEN kullanıcı henüz ulaşılmamış bir adımın Step_Indicator öğesine tıkladığında, THE Wizard_Nav SHALL geçişi engeller ve kullanıcıya sıralı ilerleme gerektiğini belirten bir ipucu gösterir.
7. WHILE ekran genişliği 768px'den küçük olduğunda, THE Wizard_Nav SHALL yalnızca aktif adımın etiketini ve "X / 4" formatında ilerleme sayacını gösterir; diğer adımlar simge olarak küçültülür.
8. THE Wizard_Nav SHALL klavye navigasyonunu destekler; Sol/Sağ ok tuşları ile adımlar arasında geçiş yapılabilir ve Enter tuşu ile adım seçilebilir.

---

### Requirement 2: Adım 1 — Kaynak JSON Girişi ve Ağaç Görünümü

**User Story:** Bir entegrasyon geliştiricisi olarak, kaynak JSON verisini kolayca girebilmek ve yapısını anlamlı biçimde görebilmek istiyorum; böylece hangi alanların mevcut olduğunu hızla kavrayabilirim.

#### Kabul Kriterleri

1. THE Source_Panel SHALL JSON_Editor ve Field_Tree bileşenlerini yan yana iki sütunlu düzende görüntüler; her sütun eşit genişlikte ve bağımsız kaydırılabilir olur.
2. THE JSON_Editor SHALL sözdizimi vurgulama (syntax highlighting) ile JSON içeriğini görüntüler; anahtar, değer, dizi ve nesne öğeleri farklı renklerle ayırt edilir.
3. WHEN kullanıcı JSON_Editor içine geçersiz JSON girdiğinde, THE JSON_Editor SHALL satır numarası ve hata açıklaması içeren bir hata mesajını editörün altında anlık olarak gösterir.
4. WHEN kullanıcı JSON_Editor içine geçerli JSON girdiğinde, THE Field_Tree SHALL 300ms gecikme ile otomatik olarak güncellenir; kullanıcının "Analiz Et" düğmesine basması gerekmez.
5. THE Field_Tree SHALL her düğüm için veri tipini (string, number, boolean, object, array, null) renkli rozet ile gösterir.
6. WHEN kullanıcı Field_Tree içindeki bir yaprak düğüme tıkladığında, THE Field_Tree SHALL o düğümün tam yolunu panoya kopyalar ve kısa süreli bir "Kopyalandı" bildirimi gösterir.
7. THE Source_Panel SHALL sürükle-bırak (drag-and-drop) ile JSON dosyası yüklemeyi destekler; dosya sürüklendiğinde JSON_Editor alanı görsel olarak vurgulanır.
8. WHEN JSON dosyası yüklendiğinde, THE Source_Panel SHALL dosya adını ve boyutunu JSON_Editor başlığında gösterir.
9. WHILE ekran genişliği 1100px'den küçük olduğunda, THE Source_Panel SHALL iki sütunlu düzeni tek sütunlu dikey düzene dönüştürür; Field_Tree, JSON_Editor'ın altında yer alır.
10. THE JSON_Editor SHALL minimum 200 satır veya 10.000 karakter uzunluğundaki JSON verilerini performans kaybı olmadan işler.

---

### Requirement 3: Adım 2 — Kanonik Alan Tanımı

**User Story:** Bir entegrasyon geliştiricisi olarak, hedef şema alanlarını hızlı ve net biçimde tanımlayabilmek istiyorum; tip ve zorunluluk bilgisi görsel olarak öne çıksın.

#### Kabul Kriterleri

1. THE Canonical_Table SHALL her satırda alan adı, veri tipi, zorunluluk durumu ve açıklama sütunlarını görüntüler; veri tipi renkli rozet ile, zorunluluk durumu toggle switch ile gösterilir.
2. THE Canonical_Table SHALL veri tipi rozetlerini şu renk kodlamasıyla görüntüler: `string` için mavi, `number` için mor, `date` için turuncu.
3. WHEN zorunluluk toggle'ı aktif olduğunda, THE Canonical_Table SHALL ilgili satırı görsel olarak vurgular (sol kenarda renkli çizgi veya arka plan tonu farkı).
4. WHEN kullanıcı "Alan Ekle" düğmesine tıkladığında, THE Canonical_Table SHALL yeni satırı tablonun sonuna ekler ve yeni satırın alan adı hücresini otomatik olarak odaklar.
5. THE Canonical_Table SHALL satır sırasını sürükle-bırak ile değiştirmeyi destekler; sürükleme sırasında hedef konum görsel olarak belirtilir.
6. WHEN kullanıcı bir alanı silmek istediğinde ve tabloda birden fazla alan varsa, THE Canonical_Table SHALL silme işlemini onay diyaloğu olmadan gerçekleştirir ve geri alma (undo) seçeneği sunar.
7. IF tabloda hiç alan tanımlanmamışsa, THEN THE Canonical_Table SHALL "Sonraki Adım" düğmesini devre dışı bırakır ve kullanıcıya en az bir alan gerektiğini belirten bir mesaj gösterir.
8. THE Canonical_Table SHALL alan adı girişinde boşluk ve özel karakter kullanımını engeller; geçersiz karakter girildiğinde anlık uyarı gösterir.

---

### Requirement 4: Adım 3 — Eşleme Kuralları ve Kural Denetçisi

**User Story:** Bir entegrasyon geliştiricisi olarak, eşleme kurallarını kolayca oluşturup düzenleyebilmek ve hangi kuralın seçili olduğunu net biçimde görebilmek istiyorum.

#### Kabul Kriterleri

1. THE Mapping_Table SHALL seçili satırı sol kenarda belirgin bir renkli çizgi ve hafif arka plan vurgusu ile işaretler; seçim durumu tablo kaydırıldığında da korunur.
2. WHEN kullanıcı Mapping_Table'da bir satıra tıkladığında, THE Rule_Inspector SHALL 150ms animasyonla seçili kuralın detaylarını gösterir; önceki kural içeriği fade-out ile kaybolur.
3. THE Rule_Inspector SHALL "Görsel", "Gelişmiş" ve "Özet" sekmelerini içerir; aktif sekme alt çizgi animasyonu ile vurgulanır.
4. WHEN bir kural gelişmiş ifade (advancedExpression) içerdiğinde, THE Mapping_Table SHALL ilgili satırda "Gelişmiş" rozetini mavi renkte gösterir ve görsel dönüşüm seçeneklerini devre dışı bırakır.
5. THE Rule_Inspector SHALL "Görsel" sekmesinde seçili dönüşüm türüne göre dinamik parametre alanlarını gösterir; parametre alanları geçiş sırasında animasyonlu biçimde görünür/gizlenir.
6. WHEN kullanıcı Rule_Inspector'daki "Gelişmiş" sekmesinde bir kaynak yol çipine tıkladığında, THE Rule_Inspector SHALL o yolu imleç konumuna ekler; mevcut metin üzerine yazmaz.
7. THE Mapping_Table SHALL eşleme kurallarını sürükle-bırak ile yeniden sıralamayı destekler.
8. WHEN kullanıcı yeni kural eklediğinde, THE Mapping_Table SHALL yeni kuralı tablonun sonuna ekler, otomatik olarak seçer ve Rule_Inspector'ı "Görsel" sekmesinde açar.
9. THE Rule_Inspector SHALL "Özet" sekmesinde seçili kuralın insan tarafından okunabilir açıklamasını gösterir ve tek tıkla panoya kopyalama imkânı sunar.
10. WHILE ekran genişliği 1100px'den küçük olduğunda, THE Mapping_Table SHALL tam genişlikte görüntülenir ve Rule_Inspector alt kısımda ayrı bir panel olarak açılır.
11. THE Mapping_Table SHALL kural sayısı 20'yi aştığında sanal kaydırma (virtual scrolling) kullanır; performans kaybı olmadan 200+ kural görüntülenebilir.

---

### Requirement 5: Adım 4 — Doğrulama ve Yayınlama

**User Story:** Bir entegrasyon geliştiricisi olarak, eşleme sonuçlarını anlamlı biçimde görmek ve doğrulama hatalarını hızla anlayabilmek istiyorum; yayınlama işleminin başarılı olduğundan emin olmak istiyorum.

#### Kabul Kriterleri

1. WHEN kullanıcı "Testi Çalıştır" düğmesine tıkladığında, THE Validate_Panel SHALL düğmeyi yükleme durumuna geçirir (spinner + "Çalışıyor..." etiketi) ve işlem tamamlanana kadar devre dışı bırakır.
2. WHEN test başarıyla tamamlandığında, THE Validate_Panel SHALL başarı durumunu yeşil onay ikonu ve animasyonlu geçişle gösterir; doğrulama mesajları liste halinde görüntülenir.
3. WHEN test başarısız olduğunda, THE Validate_Panel SHALL hata durumunu kırmızı uyarı ikonu ile gösterir; her hata mesajı hangi alana ait olduğunu açıkça belirtir ve ilgili kurala hızlı erişim bağlantısı içerir.
4. THE Output_Panel SHALL dönüştürülmüş JSON çıktısını sözdizimi vurgulama ile görüntüler; tek tıkla panoya kopyalama ve JSON dosyası olarak indirme seçenekleri sunar.
5. WHEN "Yayınla" düğmesine tıklandığında ve doğrulama başarılıysa, THE Validate_Panel SHALL yayınlama işlemini gerçekleştirir ve başarı durumunu konfeti animasyonu ile kutlar.
6. WHEN "Yayınla" düğmesine tıklandığında ve doğrulama başarısız ise, THE Validate_Panel SHALL yayınlama işlemini engeller ve kullanıcıyı hataları düzeltmeye yönlendiren bir mesaj gösterir.
7. THE Validate_Panel SHALL alternatif fixture JSON girişini destekler; alternatif test sonuçları ana test sonuçlarından görsel olarak ayrı bölümde gösterilir.
8. WHEN alternatif fixture JSON'u geçersizse, THE Validate_Panel SHALL satır numarası ve hata açıklaması içeren anlık hata mesajı gösterir.
9. THE Output_Panel SHALL çıktı JSON'unu hem ham metin hem de ağaç görünümü olarak görüntüleme seçeneği sunar; kullanıcı iki görünüm arasında geçiş yapabilir.

---

### Requirement 6: Yükleme Durumları ve Kullanıcı Geri Bildirimi

**User Story:** Bir entegrasyon geliştiricisi olarak, gerçekleştirdiğim işlemlerin sonucunu anında görmek istiyorum; uygulamanın yanıt verip vermediğini her zaman anlayabilmeliyim.

#### Kabul Kriterleri

1. WHEN herhangi bir asenkron işlem 200ms'den uzun sürüyorsa, THE Studio_Shell SHALL ilgili bileşende iskelet yükleme (skeleton loading) animasyonu gösterir.
2. WHEN bir işlem başarıyla tamamlandığında, THE Toast_Notification SHALL sağ üst köşede 3 saniye görünür kalacak şekilde yeşil başarı bildirimi gösterir.
3. WHEN bir işlem hatayla sonuçlandığında, THE Toast_Notification SHALL kırmızı hata bildirimi gösterir; bildirim kullanıcı kapatana kadar ekranda kalır.
4. THE Studio_Shell SHALL form alanlarında anlık doğrulama (inline validation) uygular; hata mesajları ilgili alanın altında kırmızı renkte gösterilir.
5. WHEN kullanıcı kaydedilmemiş değişikliklerle sayfadan ayrılmaya çalıştığında, THE Studio_Shell SHALL değişikliklerin kaybolacağını bildiren bir onay diyaloğu gösterir.
6. THE Studio_Shell SHALL her adım geçişinde sayfa başına yumuşak kaydırma (smooth scroll) uygular.
7. WHEN JSON analizi çalışıyorsa, THE Field_Tree SHALL iskelet satırlar ile yükleme durumunu gösterir; analiz tamamlandığında içerik animasyonlu biçimde belirir.

---

### Requirement 7: Renk Sistemi, Boşluk ve Görsel Hiyerarşi

**User Story:** Bir entegrasyon geliştiricisi olarak, uygulamanın görsel olarak tutarlı, hiyerarşik ve göze hoş gelen bir tasarıma sahip olmasını istiyorum; önemli bilgiler öne çıksın, ikincil bilgiler geri planda kalsın.

#### Kabul Kriterleri

1. THE Studio_Shell SHALL birincil eylemler için `#2563eb` (mavi), başarı durumları için `#10b981` (yeşil), uyarılar için `#f59e0b` (amber) ve hatalar için `#ef4444` (kırmızı) renk kodlamasını tutarlı biçimde uygular.
2. THE Studio_Shell SHALL bileşenler arası boşluk için 4px tabanlı ızgara sistemini kullanır; iç boşluklar (padding) 8px'in katları olur.
3. THE Studio_Shell SHALL birincil başlıklar için IBM Plex Sans 700, ikincil başlıklar için IBM Plex Sans 600, gövde metni için Inter 400 ve kod içeriği için JetBrains Mono 400 font ağırlıklarını uygular.
4. THE Studio_Shell SHALL kart bileşenlerinde 14px köşe yarıçapı, 1px kenarlık ve çok katmanlı gölge (box-shadow) kullanır; dark mode'da gölge opaklığı artırılır.
5. THE Studio_Shell SHALL etkileşimli öğelerde (düğme, satır, sekme) hover durumunda 150ms geçiş animasyonu uygular.
6. THE Studio_Shell SHALL odak (focus) durumunu tüm etkileşimli öğelerde 2px mavi dış çizgi (outline) ile belirtir; klavye navigasyonu için erişilebilirlik sağlanır.
7. THE Studio_Shell SHALL tablo başlıklarını küçük harf, 600 ağırlık ve 0.06em harf aralığı ile görüntüler; veri satırlarından görsel olarak ayrışır.

---

### Requirement 8: Dark Mode Desteği

**User Story:** Bir entegrasyon geliştiricisi olarak, dark mode'da çalışırken tüm bileşenlerin tutarlı ve okunabilir görünmesini istiyorum.

#### Kabul Kriterleri

1. THE Studio_Shell SHALL `html.dark-mode` CSS sınıfı aktif olduğunda tüm bileşenleri dark mode renk paletine geçirir; hiçbir bileşen açık tema renkleriyle görünmez.
2. THE Studio_Shell SHALL dark mode'da arka plan rengi olarak `#0f172a` (Slate 900), kart arka planı için `#1e293b` (Slate 800) ve metin rengi için `#f1f5f9` (Slate 100) kullanır.
3. THE JSON_Editor SHALL dark mode'da sözdizimi vurgulama renklerini koyu tema için optimize edilmiş paletten uygular; kontrast oranı WCAG AA standardını karşılar.
4. THE Studio_Shell SHALL dark mode geçişini 200ms animasyonla gerçekleştirir; ani renk değişimi olmaz.
5. THE Studio_Shell SHALL dark mode'da gölge efektlerini daha yüksek opaklıkla uygular; açık temada kullanılan ince gölgeler dark mode'da görünmez hale gelmez.

---

### Requirement 9: Mobil ve Tablet Uyumu

**User Story:** Bir entegrasyon geliştiricisi olarak, tablet veya mobil cihazdan da temel işlemleri gerçekleştirebilmek istiyorum; dokunmatik ekranda kullanım rahat olsun.

#### Kabul Kriterleri

1. WHILE ekran genişliği 768px'den küçük olduğunda, THE Studio_Shell SHALL tüm çok sütunlu düzenleri tek sütunlu dikey düzene dönüştürür.
2. WHILE ekran genişliği 768px'den küçük olduğunda, THE Studio_Shell SHALL tüm dokunmatik hedeflerin (düğme, satır, sekme) minimum 44x44px boyutunda olmasını sağlar.
3. WHILE ekran genişliği 768px'den küçük olduğunda, THE Mapping_Table SHALL yatay kaydırma yerine kart tabanlı liste görünümüne geçer; her kural ayrı bir kart olarak gösterilir.
4. WHILE ekran genişliği 768px'den küçük olduğunda, THE Rule_Inspector SHALL tam ekran modal olarak açılır; kural düzenleme tamamlandığında modal kapanır.
5. THE Studio_Shell SHALL dokunmatik kaydırma (touch scroll) için `-webkit-overflow-scrolling: touch` ve `overscroll-behavior: contain` özelliklerini uygular.
6. WHILE ekran genişliği 1024px ile 1280px arasında olduğunda, THE Studio_Shell SHALL tablet düzenini uygular; Mapping_Table ve Rule_Inspector yan yana görüntülenir ancak Rule_Inspector genişliği 280px ile sınırlandırılır.

---

### Requirement 10: Erişilebilirlik

**User Story:** Bir entegrasyon geliştiricisi olarak, yardımcı teknolojiler (ekran okuyucu, klavye navigasyonu) kullanarak da uygulamanın tüm işlevlerine erişebilmek istiyorum.

#### Kabul Kriterleri

1. THE Studio_Shell SHALL tüm etkileşimli öğelerde anlamlı `aria-label` veya `aria-labelledby` nitelikleri kullanır.
2. THE Wizard_Nav SHALL `role="navigation"` ve `aria-label="Adım gezinimi"` nitelikleriyle işaretlenir; aktif adım `aria-current="step"` ile belirtilir.
3. THE Studio_Shell SHALL dinamik içerik değişikliklerini (doğrulama sonuçları, yükleme durumları) `aria-live="polite"` bölgeleri aracılığıyla ekran okuyuculara bildirir.
4. THE Studio_Shell SHALL renk körü kullanıcılar için durum bilgisini yalnızca renge değil, ikon ve metin etiketine de dayandırır.
5. THE Studio_Shell SHALL metin ve arka plan rengi kombinasyonlarında WCAG 2.1 AA standardına göre minimum 4.5:1 kontrast oranını sağlar.
6. THE Studio_Shell SHALL tüm form alanlarını ilgili `<label>` öğesiyle ilişkilendirir; `for`/`id` bağlantısı veya `aria-labelledby` kullanılır.

---

### Requirement 11: Performans

**User Story:** Bir entegrasyon geliştiricisi olarak, büyük JSON verileri veya çok sayıda kural ile çalışırken uygulamanın yavaşlamamasını istiyorum.

#### Kabul Kriterleri

1. THE Studio_Shell SHALL ilk anlamlı içerik boyamasını (First Contentful Paint) 1.5 saniyenin altında gerçekleştirir.
2. THE JSON_Editor SHALL 50KB'a kadar JSON verilerini 500ms içinde ayrıştırır ve Field_Tree'yi günceller.
3. THE Mapping_Table SHALL 100 adede kadar kuralı sanal kaydırma olmadan, 100'den fazla kuralı sanal kaydırma ile akıcı biçimde (60fps) görüntüler.
4. THE Studio_Shell SHALL Angular OnPush değişim algılama stratejisini kullanır; gereksiz yeniden render işlemleri önlenir.
5. THE Studio_Shell SHALL animasyonlar için CSS `transform` ve `opacity` özelliklerini kullanır; `width`, `height` veya `top/left` animasyonlarından kaçınılır.

