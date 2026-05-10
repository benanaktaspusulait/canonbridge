# Requirements Document

## Introduction

Integration Studio (mapping-studio-ui), kaynak JSON verilerini kanonik hedef şemaya dönüştüren kural tabanlı bir eşleme aracıdır. Uygulama Angular 17+ standalone bileşenler ve PrimeNG v17 ile geliştirilmiştir; IBM Plex Sans, Inter ve JetBrains Mono fontlarını, `#2563eb` birincil rengi ve dark mode desteğini içeren mevcut bir tasarım sistemine sahiptir.

Bu özellik, mevcut Integration Studio deneyimini **CanonBridge Mapping Wizard** modeline dönüştürür. Yeni akışın amacı, kullanıcının JSONata bilmeden kaynak JSON'u hedef Canonical Schema'ya güvenli, test edilebilir ve yayınlanabilir bir mapping paketine çevirmesidir. Wizard, kullanıcıyı büyük resmin karmaşasıyla baş başa bırakmaz; her adımda yalnızca o anda karar vermesi gereken alanı, dönüşümü veya doğrulama sonucunu gösterir.

Yeni Wizard 5 ana aşamadan oluşur:

1. Hoş geldin ve kaynak tanımlama
2. Hedef şemayı seçme ve eşleştirmeye hazırlanma
3. Kaptan köşkü: akıllı alan eşleştirme ve dönüşüm tasarımı
4. Bitmemiş işler: zorunlu alan uyarısı ve toplu tamamlama
5. Test, doğrula ve yayınla

---

## Glossary

- **Studio_Shell**: Tüm wizard akışını kapsayan üst düzey Angular bileşeni (`integration-studio.component`).
- **Mapping_Wizard**: Kaynak tanımlama, hedef şema seçimi, eşleme, eksik tamamlama, test ve yayınlama adımlarını yöneten 5 adımlı kullanıcı akışı.
- **Wizard_Nav**: Adım ilerleme durumunu gösteren ve adımlar arası gezinmeyi sağlayan navigasyon bileşeni.
- **Step_Indicator**: Wizard_Nav içindeki her adımı temsil eden görsel öğe (numara, etiket, durum ikonu).
- **Progress_Rail**: Adımlar arasındaki bağlantı çizgisi; tamamlanma durumunu renk ile gösterir.
- **Source_Intake**: Kaynak JSON yapıştırma, dosya yükleme ve opsiyonel canlı bağlantı girişlerini kapsayan 1. adım alt sistemi.
- **JSON_Editor**: Kaynak JSON verisinin girildiği, sözdizimi vurgulamalı metin alanı bileşeni.
- **Field_Tree**: Ayrıştırılmış JSON yapısını hiyerarşik olarak gösteren ağaç bileşeni.
- **Source_Stats**: Kaynak JSON için toplam alan, nesne, dizi, tip çakışması ve geçerlilik özetini gösteren bilgi bölümü.
- **Target_Schema_Selector**: Mevcut Canonical Schema seçimi veya JSON Schema yükleme işlemlerini sağlayan 2. adım alt sistemi.
- **Target_Schema_Tree**: Hedef şemanın zorunlu alanlar, tipler ve açıklamalar ile birlikte ağaç görünümü.
- **Mapping_Readiness_Summary**: Kaynak ve hedef analizinden üretilen zorunlu/opsiyonel alan sayısı, önerilen eşleme sayısı ve risk özetidir.
- **Mapping_Cockpit**: 3. adımda hedef alan yapılacaklar listesi, çalışma tezgahı ve canlı önizlemeyi yan yana gösteren ana eşleme ekranı.
- **Target_Todo_List**: Hedef şemadaki tüm alanları zorunluluk, eşleme durumu ve hata durumuna göre sıralayan yapılacaklar listesi.
- **Mapping_Workbench**: Seçili hedef alan için kaynak seçimi, dönüşüm tipi, dönüşüm parametreleri ve mini wizard akışlarını gösteren dinamik orta panel.
- **Transformation_Chain**: Filtreleme, sıralama, formatlama, varsayılan değer, koşul veya array map gibi birden fazla dönüşüm adımının sırayla uygulanması.
- **Array_Mini_Wizard**: Bir dizi hedef alanı için her elemanın alt alanlarını eşleştiren iç wizard.
- **Live_Preview**: Seçili hedef alanın anlık dönüşüm çıktısını, doğrulama durumunu ve yürütme süresini gösteren sağ panel.
- **JSONata_Formula_Mode**: Görsel kurallardan üretilen JSONata ifadesini gösteren ve yetkili kullanıcıların manuel müdahalesine izin veren gelişmiş mod.
- **Unfinished_Work**: 4. adımda eksik zorunlu alanları, hatalı eşlemeleri ve tamamlanmamış dönüşüm zincirlerini listeleyen kontrol noktası.
- **Diff_Viewer**: 5. adımda kaynak JSON ile dönüştürülmüş hedef JSON'u yan yana karşılaştıran görünüm.
- **Validation_Gate**: Test, şema doğrulama, fixture kapsamı ve yayınlama öncesi engelleyici kontrollerin bütünü.
- **Publish_Package**: Mapping JSONata dosyası, input schema referansı, canonical schema referansı, fixture'lar, config ve checksum bilgisinden oluşan yayınlanabilir paket.
- **Toast_Notification**: İşlem sonuçlarını bildiren geçici bildirim bileşeni.
- **Dark_Mode**: Koyu renk teması; `html.dark-mode` CSS sınıfı ile etkinleştirilir.
- **TransformKind**: Bir eşleme kuralının dönüşüm türü (direct, format_conversion, enum_map, default_value, conditional, array_map vb.).
- **MappingRule**: Kaynak yol, hedef alan, dönüşüm türü, parametreler, JSONata ifadesi ve doğrulama durumunu içeren kural nesnesi.
- **TargetField**: Kanonik şemadaki bir hedef alanı tanımlayan nesne (key, path, type, required, description).

---

## Requirements

### Requirement 1: Wizard Navigasyonu ve 5 Adımlı Yol Haritası

**User Story:** Bir entegrasyon geliştiricisi olarak, hangi adımda olduğumu, hangi adımların tamamlandığını ve beni neyin beklediğini net biçimde görmek istiyorum; böylece yüzlerce alanlık mapping sürecinde kaybolmadan ilerleyebilirim.

#### Kabul Kriterleri

1. THE Wizard_Nav SHALL 5 adımı sıralı biçimde görüntüler: Kaynak, Hedef, Eşleme, Eksikler, Test ve Yayın.
2. THE Wizard_Nav SHALL her adım için Step_Indicator öğelerini gösterir; her Step_Indicator adım numarasını, etiketini ve mevcut durumunu (beklemede / aktif / tamamlandı / hatalı / engelli) içerir.
3. WHEN bir adım tamamlandığında, THE Step_Indicator SHALL durum ikonunu numara yerine onay işareti olarak günceller ve tamamlanma rengini (`--color-success`) uygular.
4. WHEN bir adımda doğrulama hatası oluştuğunda, THE Step_Indicator SHALL hata ikonunu görüntüler ve hata rengini (`--color-error`) uygular.
5. THE Progress_Rail SHALL tamamlanan adımlar arasında animasyonlu dolum efekti ile ilerleme durumunu gösterir; tamamlanmamış adımlar arasında nötr renk kullanır.
6. WHEN kullanıcı tamamlanmış bir adımın Step_Indicator öğesine tıkladığında, THE Wizard_Nav SHALL o adıma doğrudan geçiş yapar.
7. WHEN kullanıcı henüz ulaşılmamış bir adımın Step_Indicator öğesine tıkladığında, THE Wizard_Nav SHALL geçişi engeller ve kullanıcının önce hangi zorunlu adımı tamamlaması gerektiğini belirten bir ipucu gösterir.
8. WHILE ekran genişliği 768px'den küçük olduğunda, THE Wizard_Nav SHALL aktif adımın etiketini ve "X / 5" formatında ilerleme sayacını gösterir; diğer adımlar kompakt simge olarak görüntülenir.
9. THE Wizard_Nav SHALL klavye navigasyonunu destekler; Sol/Sağ ok tuşları ile adımlar arasında geçiş yapılabilir ve Enter tuşu ile adım seçilebilir.
10. THE Studio_Shell SHALL her adım değişiminde aktif adımın başlığını, kısa amacını ve bir sonraki yapılacak işi görünür şekilde günceller.

---

### Requirement 2: Adım 1 - Kaynağı Tanımla

**User Story:** Bir entegrasyon geliştiricisi olarak, dönüştürmek istediğim kaynak JSON'u hızlıca sisteme tanıtmak, yapısını anında görmek ve hatalı JSON'u erken fark etmek istiyorum.

#### Kabul Kriterleri

1. THE Source_Intake SHALL JSON_Editor ve Field_Tree bileşenlerini yan yana iki sütunlu düzende görüntüler; sol sütun kaynak girişi, sağ sütun anlık ağaç görünümüdür.
2. THE JSON_Editor SHALL kullanıcının örnek JSON'u yapıştırmasını destekler ve sözdizimi vurgulama ile anahtar, değer, dizi ve nesne öğelerini farklı renklerle ayırt eder.
3. WHEN kullanıcı geçersiz JSON girdiğinde, THE JSON_Editor SHALL satır numarası, kolon ve hata açıklaması içeren anlık hata mesajını editörün altında gösterir.
4. WHEN kullanıcı geçerli JSON girdiğinde, THE Field_Tree SHALL 300ms gecikme ile otomatik olarak güncellenir; kullanıcının ayrıca analiz düğmesine basması gerekmez.
5. THE Source_Intake SHALL `.json` ve `.txt` dosyaları için sürükle-bırak yüklemeyi destekler; dosya sürüklendiğinde yükleme alanı görsel olarak vurgulanır.
6. WHEN JSON dosyası yüklendiğinde, THE Source_Intake SHALL dosya adını, boyutunu ve ayrıştırma durumunu JSON_Editor başlığında gösterir.
7. THE Source_Intake SHALL opsiyonel gelişmiş modda API endpoint'i, HTTP method, header ve kimlik bilgisi girilerek canlı örnek veri çekilmesini destekleyecek UI alanlarını sunar.
8. IF canlı bağlantı özelliği etkin değilse, THEN THE Source_Intake SHALL bu seçeneği pasif ama görünür bir gelişmiş seçenek olarak işaretler.
9. THE Field_Tree SHALL her düğüm için veri tipini (string, number, boolean, object, array, null) renkli rozet ile gösterir.
10. WHEN kullanıcı Field_Tree içindeki bir düğüme tıkladığında, THE Field_Tree SHALL düğümün tam JSONPath ve JSON Pointer yolunu detay panelinde gösterir.
11. WHEN kullanıcı Field_Tree içindeki bir yaprak düğümde kopyala aksiyonunu seçtiğinde, THE Field_Tree SHALL tam yolu panoya kopyalar ve kısa süreli bir "Kopyalandı" bildirimi gösterir.
12. THE Source_Stats SHALL toplam alan sayısı, iç içe nesne sayısı, dizi sayısı, top-level tip ve tespit edilen tip çakışmalarını gösterir.
13. IF kaynak JSON geçersizse, THEN THE Studio_Shell SHALL "İleri: Kaynağı Doğrula ve Devam Et" aksiyonunu devre dışı bırakır.
14. WHILE ekran genişliği 1100px'den küçük olduğunda, THE Source_Intake SHALL iki sütunlu düzeni tek sütunlu dikey düzene dönüştürür; Field_Tree, JSON_Editor'ın altında yer alır.
15. THE JSON_Editor SHALL minimum 200 satır veya 10.000 karakter uzunluğundaki JSON verilerini performans kaybı olmadan işler.

---

### Requirement 3: Adım 2 - Hedef Şemayı Belirle ve Hazırlık Analizi

**User Story:** Bir entegrasyon geliştiricisi olarak, hangi Canonical Schema'ya dönüşüm yapacağımı seçmek ve başlamadan önce kaç alanı eşlemem gerektiğini bilmek istiyorum.

#### Kabul Kriterleri

1. THE Target_Schema_Selector SHALL mevcut Canonical Schema listesini schema adı, versiyon, açıklama ve yayın durumu ile görüntüler.
2. THE Target_Schema_Selector SHALL kullanıcının `.json` uzantılı hedef şema dosyası yüklemesini destekler.
3. WHEN bir Canonical Schema seçildiğinde veya yüklendiğinde, THE Target_Schema_Tree SHALL hedef şemayı ağaç görünümünde gösterir.
4. THE Target_Schema_Tree SHALL zorunlu alanları yıldız, vurgu rengi ve "zorunlu" metin etiketiyle belirtir; durum bilgisi yalnızca renge bağlı olmaz.
5. THE Target_Schema_Tree SHALL her hedef alan için path, tip, açıklama, enum değerleri, format ve nested/array bağlamını gösterir.
6. WHEN seçilen şema `required` alanları içerdiğinde, THE Target_Schema_Selector SHALL bu alanları TargetField listesine zorunlu alan olarak aktarır.
7. WHEN kaynak ve hedef şema hazır olduğunda, THE Mapping_Readiness_Summary SHALL zorunlu hedef alan sayısını, opsiyonel hedef alan sayısını, toplam hedef alan sayısını ve tespit edilen dizi/nested alan sayısını gösterir.
8. THE Mapping_Readiness_Summary SHALL "İleri'ye tıkladığınızda sizi önce N zorunlu alanı eşleştirmeye yönlendireceğim" biçiminde kullanıcıyı bir sonraki adıma hazırlar.
9. IF hiçbir hedef şema seçilmemişse, THEN THE Studio_Shell SHALL 3. adıma geçişi engeller ve hedef şema seçilmesi gerektiğini belirtir.
10. IF hedef şema parse edilemiyorsa, THEN THE Target_Schema_Selector SHALL önceki geçerli hedef şema durumunu korur ve hatayı görünür şekilde listeler.
11. THE Target_Schema_Selector SHALL şemadan türetilen alanları elle eklenen alanlardan görsel olarak ayırt eder.
12. THE Target_Schema_Selector SHALL hedef schema değiştirildiğinde mevcut mapping kurallarını otomatik silmez; kullanıcıya hedef alan uyumsuzluklarını gösterir ve onaylı yeniden eşleme aksiyonu sunar.

---

### Requirement 4: Adım 3 - Kaptan Köşkü Genel Yerleşimi

**User Story:** Bir entegrasyon geliştiricisi olarak, tüm hedef alanları sistemli bir yapılacaklar listesi olarak görmek, seçili alan için yalnızca ilgili sorularla ilerlemek ve çıktıyı anında doğrulamak istiyorum.

#### Kabul Kriterleri

1. THE Mapping_Cockpit SHALL 3 sütunlu düzen kullanır: sol Target_Todo_List, orta Mapping_Workbench, sağ Live_Preview.
2. THE Target_Todo_List SHALL hedef şemadaki tüm alanları listeler; zorunlu alanları eşlenmemiş opsiyonel alanlardan önce gösterir.
3. THE Target_Todo_List SHALL her hedef alan için path, tip, zorunluluk, eşleme durumu ve hata durumunu gösterir.
4. WHEN bir hedef alan eşlendiğinde, THE Target_Todo_List SHALL ilgili alanı tamamlandı durumuna geçirir ve liste sıralamasında tamamlanmamış alanların altına taşır.
5. WHEN bir hedef alanda hata varsa, THE Target_Todo_List SHALL alanı hata durumunda gösterir ve hatanın kısa sebebini tooltip veya inline mesaj olarak sunar.
6. WHEN kullanıcı Target_Todo_List içinde bir hedef alana tıkladığında, THE Mapping_Workbench SHALL yalnızca o hedef alanın mapping kararlarını gösterecek şekilde güncellenir.
7. THE Mapping_Workbench SHALL seçili hedef alanın adını, tipini, açıklamasını, zorunluluk durumunu ve örnek beklenen değer formatını üst bölümde gösterir.
8. THE Mapping_Workbench SHALL kullanıcıya önce "Bu alan için kaynak neresi?" sorusunu sunar ve Source_Field_Selector üzerinden ağaçtan seçme, arama veya sürükleyip bırakma imkanı verir.
9. WHEN kullanıcı bir kaynak alan seçtiğinde, THE Mapping_Workbench SHALL kaynak alanın örnek değerini, tipini ve path bilgisini görünür şekilde gösterir.
10. THE Mapping_Workbench SHALL kaynak seçiminden sonra "Dönüşüm gerekiyor mu?" sorusunu sunar ve hedef tip/kaynak tipe göre önerilen dönüşüm seçeneklerini öne çıkarır.
11. THE Live_Preview SHALL orta paneldeki her değişiklikten sonra yalnızca seçili hedef alanın örnek çıktısını büyük ve okunabilir biçimde gösterir.
12. WHILE ekran genişliği 1280px'den küçük olduğunda, THE Mapping_Cockpit SHALL sağ Live_Preview panelini alt veya açılır panel olarak sunar; hedef yapılacaklar listesi kaybolmaz.
13. WHILE ekran genişliği 768px'den küçük olduğunda, THE Mapping_Cockpit SHALL hedef alan seçimi, çalışma tezgahı ve önizlemeyi sıralı tek sütunlu akışa dönüştürür.

---

### Requirement 5: Basit ve Orta Seviye Dönüşüm Diyalogları

**User Story:** Bir entegrasyon geliştiricisi olarak, JSONata yazmadan direct mapping, format dönüşümü, enum eşleme, varsayılan değer, koşul, birleştirme, matematik ve metin işlemlerini soru-cevap arayüzüyle tanımlamak istiyorum.

#### Kabul Kriterleri

1. THE Mapping_Workbench SHALL direct mapping için "Birebir Al" seçeneğini sunar ve seçildiğinde ek parametre istemeden MappingRule oluşturur.
2. WHEN kullanıcı "Format Değiştir" seçeneğini seçtiğinde, THE Mapping_Workbench SHALL girdi formatı, çıktı formatı ve gerekirse timezone alanlarını içeren dinamik panel açar.
3. THE format conversion panel SHALL tarih için ISO 8601, Unix timestamp ms, Unix timestamp saniye ve özel format seçeneklerini sunar.
4. THE format conversion panel SHALL sayı için number, integer, decimal string, rounding strategy ve decimal places seçeneklerini sunar.
5. WHEN kullanıcı "Değerleri Eşle" seçeneğini seçtiğinde, THE Mapping_Workbench SHALL büyüyebilir from/to tablosu, "+ Eşleme Ekle" aksiyonu ve eşleşmeyen değer davranışı seçeneklerini gösterir.
6. THE enum mapping panel SHALL eşleşmeyen değerler için default value, pass-through, null veya error seçeneklerini sunar.
7. WHEN kullanıcı "Boşsa Değer Ata" seçeneğini seçtiğinde, THE Mapping_Workbench SHALL default value girişi ve null, missing, empty string, zero, false seçeneklerini içeren "Neleri boş sayalım?" kontrolünü gösterir.
8. WHEN kullanıcı "Koşul Ekle" seçeneğini seçtiğinde, THE Mapping_Workbench SHALL IF, ELSE IF ve ELSE bloklarını oluşturabileceği kural arayüzünü gösterir.
9. THE conditional panel SHALL equals, not equals, greater than, greater/equal, less than, less/equal, contains, exists ve regex operatörlerini destekler.
10. WHEN kullanıcı "Birleştir" seçeneğini seçtiğinde, THE Mapping_Workbench SHALL "Alan Ekle" ve "Sabit Metin Ekle" aksiyonlarıyla sıralanabilir birleşim parçaları oluşturur.
11. WHEN kullanıcı "Hesapla" seçeneğini seçtiğinde, THE Mapping_Workbench SHALL toplama, çıkarma, çarpma, bölme, yuvarlama ve sabit/alan operand seçimini destekler.
12. WHEN kullanıcı "Metni Düzenle" seçeneğini seçtiğinde, THE Mapping_Workbench SHALL büyük harf, küçük harf, trim, replace, substring, regex replace ve normalize seçeneklerini sunar.
13. THE Mapping_Workbench SHALL her dönüşüm panelinde seçili kaynak değeri, beklenen hedef tipi ve anlık çıktı örneğini görünür tutar.
14. THE Mapping_Workbench SHALL dönüşüm parametrelerinde geçersiz giriş olduğunda kuralı kaydetmeyi engeller ve hatayı parametre alanının altında gösterir.
15. THE Studio_Shell SHALL görsel dönüşüm seçimlerinden her zaman deterministik JSONata ifadesi üretir.

---

### Requirement 6: Dizi, Filtre, Sıralama ve İç İçe Nesne Dönüşümleri

**User Story:** Bir entegrasyon geliştiricisi olarak, array ve nested object dönüşümlerini tek bir karmaşık ifade yazmadan zincir adımları ve mini wizard ile tamamlamak istiyorum.

#### Kabul Kriterleri

1. WHEN seçili kaynak alan array tipindeyse, THE Mapping_Workbench SHALL "Diziyi İşle" panelini önerilen dönüşüm olarak gösterir.
2. THE array operation panel SHALL "Her elemanı dönüştür", "Filtrele", "Sırala", "Say", "İlk elemanı al" ve "Son elemanı al" işlemlerini destekler.
3. THE array operation panel SHALL kullanıcının işlemleri Transformation_Chain olarak sıralamasına izin verir.
4. WHEN kullanıcı "Filtrele" adımı eklediğinde, THE Mapping_Workbench SHALL field/operator/value biçiminde filtre koşulu oluşturma arayüzü sunar.
5. THE filter panel SHALL array item içindeki alanları kaynak seçim ağacından seçilebilir hale getirir.
6. WHEN kullanıcı "Sırala" adımı eklediğinde, THE Mapping_Workbench SHALL sıralama alanı ve artan/azalan yön seçimini destekler.
7. WHEN kullanıcı "Her elemanı dönüştür" adımı eklediğinde, THE Mapping_Workbench SHALL Array_Mini_Wizard moduna geçer.
8. THE Array_Mini_Wizard SHALL yalnızca seçili array hedef alanının alt hedef alanlarını listeler.
9. THE Array_Mini_Wizard SHALL her array item alt alanı için direct mapping, format conversion, default value, conditional ve custom formula seçeneklerini destekler.
10. WHEN hedef alan object tipindeyse, THE Mapping_Workbench SHALL "Bu nesnenin alt alanlarını eşleştirmek ister misiniz?" sorusuyla nested object mapping akışını başlatır.
11. THE nested object flow SHALL alt alanları ayrı Target_Todo_List alt grubu olarak gösterir ve parent object tamamlanma durumunu alt alanların durumundan hesaplar.
12. THE Transformation_Chain SHALL her adım için yeniden sıralama, devre dışı bırakma, silme ve test etme aksiyonlarını destekler.
13. THE Live_Preview SHALL array dönüşümlerinde örnek ilk N elemanın çıktısını ve toplam eleman sayısını gösterir.
14. IF array dönüşümü boş sonuç üretirse, THEN THE Live_Preview SHALL bunu hata, uyarı veya geçerli boş sonuç olarak hedef şema gereksinimine göre sınıflandırır.

---

### Requirement 7: Özel JSONata Formül Modu ve Kural Senkronizasyonu

**User Story:** Bir ileri seviye entegrasyon geliştiricisi olarak, görsel wizard'ın ürettiği JSONata'yı incelemek ve gerektiğinde manuel formül ile genişletmek istiyorum.

#### Kabul Kriterleri

1. THE Mapping_Workbench SHALL her hedef alan için "Özel Formül" veya "Gelişmiş JSONata" bağlantısını görünür ama ikincil aksiyon olarak sunar.
2. WHEN kullanıcı JSONata_Formula_Mode'a geçtiğinde, THE Mapping_Workbench SHALL o ana kadar görsel seçimlerden üretilmiş JSONata ifadesini editörde gösterir.
3. THE JSONata_Formula_Mode SHALL syntax highlighting, parse validation, source path autocomplete ve kaynak yol çipi ekleme özelliklerini destekler.
4. WHEN kullanıcı manuel JSONata ifadesi yazdığında, THE MappingRule SHALL `manualOverride: true` durumuna geçer.
5. WHEN bir kural manual override durumundayken, THE Target_Todo_List ve Mapping_Workbench SHALL bu kuralı "Gelişmiş" rozetli gösterir.
6. IF manual override etkinse, THEN THE visual transform panel SHALL kullanıcının manuel kodu ezmeden görsel moda dönmesi için açık onay ister.
7. THE JSONata_Formula_Mode SHALL JSONata parse hatalarını satır/kolon ve mesaj ile gösterir.
8. THE JSONata_Formula_Mode SHALL ifade kaydedilmeden önce en az bir örnek kaynak JSON üzerinde başarıyla test edilmesini şart koşar.
9. THE Studio_Shell SHALL görsel kural modeli ile manuel JSONata arasındaki farkı "Özet" sekmesinde okunabilir biçimde gösterir.
10. THE Studio_Shell SHALL tüm mapping kurallarından birleşik, dışa aktarılabilir JSONata ifadesi üretir.
11. WHEN kullanıcı "İfadeyi Kopyala" aksiyonunu seçtiğinde, THE Studio_Shell SHALL birleşik JSONata ifadesini panoya kopyalar.
12. WHEN kullanıcı "İfadeyi İndir" aksiyonunu seçtiğinde, THE Studio_Shell SHALL birleşik JSONata ifadesini `mapping-preview.jsonata` adıyla indirir.

---

### Requirement 8: Canlı Önizleme, Validasyon ve Hata Yönlendirme

**User Story:** Bir entegrasyon geliştiricisi olarak, yaptığım her mapping değişikliğinin çıktısını ve doğrulama sonucunu anında görmek, hata varsa hangi kuraldan kaynaklandığını bilmek istiyorum.

#### Kabul Kriterleri

1. THE Live_Preview SHALL seçili hedef alan için kaynak örnek değerini, dönüştürülmüş hedef değerini ve hedef path bilgisini gösterir.
2. THE Live_Preview SHALL her değişiklikten sonra transformation preview çalıştırır ve yürütme süresini ms cinsinden gösterir.
3. WHEN preview başarılıysa, THE Live_Preview SHALL "Geçti" durumunu başarı rengi ve metin etiketi ile gösterir.
4. WHEN preview başarısızsa, THE Live_Preview SHALL JSONata hatası, tip dönüşümü hatası veya schema doğrulama hatası olarak sınıflandırılmış mesaj gösterir.
5. THE Live_Preview SHALL hata mesajını kullanıcıya teknik stack trace yerine düzeltilebilir aksiyon diliyle sunar.
6. THE Live_Preview SHALL seçili hedef alanın çıktısını tüm dönüştürülmüş JSON içinde değil, odaklı tek alan çıktısı olarak öncelikli gösterir.
7. THE Live_Preview SHALL gerektiğinde "Tam çıktıda göster" aksiyonu ile tüm canonical JSON önizlemesini açar.
8. THE Studio_Shell SHALL validation hatalarını hedef alan, kaynak alan, mapping rule veya schema rule ile ilişkilendirir.
9. WHEN kullanıcı bir validation hatasındaki "Kurala Git" aksiyonunu seçtiğinde, THE Studio_Shell SHALL 3. adıma döner ve ilgili hedef alanı Mapping_Workbench içinde açar.
10. THE Studio_Shell SHALL required target field eksiklerini blocking error olarak sınıflandırır.
11. THE Studio_Shell SHALL optional target field eksiklerini uyarı veya bilgi olarak gösterir; yayın gate'ini yalnızca konfigüre edilen politikalara göre etkiler.
12. THE Live_Preview SHALL kullanıcı typing yaparken pahalı dönüşümleri debounce eder ve asenkron işlem devam ederken küçük loading state gösterir.

---

### Requirement 9: Adım 4 - Bitmemiş İşler ve Toplu Tamamlama

**User Story:** Bir entegrasyon geliştiricisi olarak, yayınlama öncesinde eksik zorunlu alanları ve hatalı kuralları tek yerde görmek, her birine doğrudan geri dönüp tamamlamak istiyorum.

#### Kabul Kriterleri

1. THE Unfinished_Work SHALL zorunlu ama eşlenmemiş hedef alanları, hatalı mapping kurallarını ve test edilmemiş manual override kurallarını listeler.
2. IF tüm zorunlu alanlar başarıyla eşlenmiş ve geçerliyse, THEN THE Unfinished_Work SHALL başarı mesajı ve isteğe bağlı alanları kontrol etme aksiyonu gösterir.
3. IF eksikler varsa, THEN THE Unfinished_Work SHALL "Aşağıdaki N alan zorunlu olmasına rağmen tamamlanmadı" mesajını gösterir.
4. THE Unfinished_Work SHALL her eksik alan için hedef path, tip, açıklama, zorunluluk sebebi ve "Hemen Eşleştir" aksiyonu gösterir.
5. WHEN kullanıcı "Hemen Eşleştir" aksiyonunu seçtiğinde, THE Studio_Shell SHALL 3. adıma döner ve ilgili hedef alanı Mapping_Workbench içinde açar.
6. THE Unfinished_Work SHALL hatalı kural satırları için hata sebebi ve "Düzelt" aksiyonu gösterir.
7. THE Unfinished_Work SHALL optional alanları ayrı bir bölümde gösterir ve kullanıcının bunları intentional unmapped olarak işaretlemesine izin verir.
8. WHEN kullanıcı optional veya policy gereği izin verilen bir alanı intentional unmapped olarak işaretlediğinde, THE Studio_Shell SHALL gerekçe girmesini ister ve audit için saklar.
9. THE Unfinished_Work SHALL toplu tamamlama için "Zorunlu alanlara odaklan", "Hatalı kurallara odaklan" ve "Opsiyonelleri göster" filtrelerini sunar.
10. IF zorunlu eksik veya blocking error varsa, THEN THE Studio_Shell SHALL 5. adıma geçişi engeller.

---

### Requirement 10: Adım 5 - Son Test, Doğrula ve Yayınla

**User Story:** Bir entegrasyon geliştiricisi olarak, mapping'in sadece tek örnekte değil, farklı fixture ve hata senaryolarında da çalıştığını görüp kontrollü biçimde taslak kaydetmek veya yayınlamak istiyorum.

#### Kabul Kriterleri

1. THE final test step SHALL üst bölümde başarı/uyarı durum rozetini, toplam eşlenen alan sayısını, zorunlu alan kapsamını ve ileri seviye dönüşüm sayısını gösterir.
2. THE final test step SHALL kaynak JSON ve dönüştürülmüş canonical JSON'u Diff_Viewer içinde yan yana gösterir.
3. THE Diff_Viewer SHALL değişen, eklenen, eksik ve hatalı alanları görsel olarak vurgular.
4. THE final test step SHALL "Testi Genişlet" aksiyonu ile kullanıcının ek örnek JSON veya fixture yüklemesini sağlar.
5. THE final test step SHALL farklı senaryolar için valid, invalid, edge_case ve production_failure fixture etiketlerini destekler.
6. WHEN kullanıcı "Tüm Testleri Çalıştır" aksiyonunu seçtiğinde, THE Validation_Gate SHALL tüm fixture'lar için input schema validation, JSONata execution ve canonical schema validation çalıştırır.
7. THE Validation_Gate SHALL her fixture için geçti / başarısız / hata / waived durumunu gösterir.
8. THE Validation_Gate SHALL başarısız fixture için beklenen ve gerçek çıktı farklarını alan bazında gösterir.
9. THE final test step SHALL "Taslak Olarak Kaydet" aksiyonu ile mapping state, schema referansları, fixture'lar ve generated JSONata'yı draft olarak saklar.
10. THE final test step SHALL "Yayınla" aksiyonunu yalnızca required validation gates geçtiğinde etkinleştirir.
11. WHEN kullanıcı "Yayınla" aksiyonunu seçtiğinde, THE Studio_Shell SHALL yayınlama işlemini bilinçli ve geri alınamaz bir versiyonlama aksiyonu olarak onaylatır.
12. WHEN publish başarılı olduğunda, THE Studio_Shell SHALL immutable mapping version, artifact checksum, aktivasyon durumu ve audit event özetini gösterir.
13. IF publish başarısızsa, THEN THE Studio_Shell SHALL hatayı hangi gate veya servis adımının engellediğiyle birlikte gösterir.
14. THE Publish_Package SHALL transformer servisinin beklediği partner config layout'una export edilebilir olmalıdır.
15. THE final test step SHALL kullanıcıya oluşturulan mapping version numarasını ve canonical schema version referansını gösterir.

---

### Requirement 11: Mapping Rule Veri Modeli ve Kalıcılık

**User Story:** Bir platform mimarı olarak, görsel wizard'da yapılan her tercihin deterministik, versiyonlanabilir ve transformer runtime tarafından yeniden üretilebilir bir mapping modeline dönüşmesini istiyorum.

#### Kabul Kriterleri

1. THE Studio_Shell SHALL her hedef alan için en fazla bir aktif MappingRule üretir; aynı hedef path tekrar eşlenmek istenirse kullanıcıya çakışma gösterir.
2. THE MappingRule SHALL targetPath, sourcePath, transformKind, transformConfig, generatedJsonata, manualOverride, validationState ve updatedAt alanlarını içerir.
3. THE MappingRule SHALL array mapping ve nested object mapping için childRules veya eşdeğer hiyerarşik yapı destekler.
4. THE Studio_Shell SHALL görsel mapping modelinden generatedJsonata alanını deterministik biçimde üretir.
5. THE Studio_Shell SHALL draft autosave sırasında kaynak JSON, hedef schema referansı, MappingRule listesi, fixture state ve validation sonuçlarını birlikte saklar.
6. THE Studio_Shell SHALL draft autosave operasyonlarını idempotent olarak yürütür.
7. WHEN kullanıcı bir mapping rule silerse, THE Studio_Shell SHALL ilgili hedef alanı unmapped durumuna çeker ve kullanıcıya undo aksiyonu sunar.
8. WHEN kullanıcı benzer bir mapping rule çoğaltırsa, THE Studio_Shell SHALL hedef path seçilene kadar çoğaltılmış kuralı geçici/incomplete durumda tutar.
9. THE Studio_Shell SHALL her mapping değişikliğinde özet diff üretebilir: değişen source path, target path, transformKind ve transformConfig.
10. THE Studio_Shell SHALL published mapping version üzerinde doğrudan değişiklik yapılmasını engeller; değişiklik için yeni draft oluşturulur.

---

### Requirement 12: Yükleme Durumları ve Kullanıcı Geri Bildirimi

**User Story:** Bir entegrasyon geliştiricisi olarak, gerçekleştirdiğim işlemlerin sonucunu anında görmek istiyorum; uygulamanın yanıt verip vermediğini her zaman anlayabilmeliyim.

#### Kabul Kriterleri

1. WHEN herhangi bir asenkron işlem 200ms'den uzun sürüyorsa, THE Studio_Shell SHALL ilgili bileşende iskelet yükleme animasyonu gösterir.
2. WHEN bir işlem başarıyla tamamlandığında, THE Toast_Notification SHALL sağ üst köşede 3 saniye görünür kalacak şekilde yeşil başarı bildirimi gösterir.
3. WHEN bir işlem hatayla sonuçlandığında, THE Toast_Notification SHALL kırmızı hata bildirimi gösterir; bildirim kullanıcı kapatana kadar ekranda kalır.
4. THE Studio_Shell SHALL form alanlarında anlık doğrulama uygular; hata mesajları ilgili alanın altında kırmızı renkte gösterilir.
5. WHEN kullanıcı kaydedilmemiş değişikliklerle sayfadan ayrılmaya çalıştığında, THE Studio_Shell SHALL değişikliklerin kaybolacağını bildiren bir onay diyaloğu gösterir.
6. THE Studio_Shell SHALL her adım geçişinde sayfa başına yumuşak kaydırma uygular.
7. WHEN JSON analizi çalışıyorsa, THE Field_Tree SHALL iskelet satırlar ile yükleme durumunu gösterir; analiz tamamlandığında içerik animasyonlu biçimde belirir.
8. THE Studio_Shell SHALL uzun süren transform preview işlemlerinde iptal edilebilir veya son isteği geçerli sayan concurrency davranışı uygular.
9. THE Studio_Shell SHALL kritik publish aksiyonlarında inline progress state gösterir; kullanıcı publish durumunu refresh yapmadan takip edebilir.

---

### Requirement 13: Renk Sistemi, Boşluk ve Görsel Hiyerarşi

**User Story:** Bir entegrasyon geliştiricisi olarak, uygulamanın görsel olarak tutarlı, hiyerarşik ve göze hoş gelen bir tasarıma sahip olmasını istiyorum; önemli bilgiler öne çıksın, ikincil bilgiler geri planda kalsın.

#### Kabul Kriterleri

1. THE Studio_Shell SHALL birincil eylemler için `#2563eb` (mavi), başarı durumları için `#10b981` (yeşil), uyarılar için `#f59e0b` (amber) ve hatalar için `#ef4444` (kırmızı) renk kodlamasını tutarlı biçimde uygular.
2. THE Studio_Shell SHALL bileşenler arası boşluk için 4px tabanlı ızgara sistemini kullanır; iç boşluklar 8px'in katları olur.
3. THE Studio_Shell SHALL birincil başlıklar için IBM Plex Sans 700, ikincil başlıklar için IBM Plex Sans 600, gövde metni için Inter 400 ve kod içeriği için JetBrains Mono 400 font ağırlıklarını uygular.
4. THE Studio_Shell SHALL kart bileşenlerinde mevcut tasarım sistemiyle uyumlu köşe yarıçapı, 1px kenarlık ve katmanlı gölge kullanır.
5. THE Studio_Shell SHALL etkileşimli öğelerde hover durumunda 150ms geçiş animasyonu uygular.
6. THE Studio_Shell SHALL odak durumunu tüm etkileşimli öğelerde 2px mavi dış çizgi ile belirtir; klavye navigasyonu için erişilebilirlik sağlanır.
7. THE Studio_Shell SHALL tablo başlıklarını 600 ağırlık ve kontrollü harf aralığı ile görüntüler; veri satırlarından görsel olarak ayrışır.
8. THE Mapping_Cockpit SHALL kullanıcının seçili hedef alanını görsel hiyerarşinin merkezi yapar; kaynak ve önizleme panelleri bu seçime bağlı ikincil bağlam olarak çalışır.
9. THE Studio_Shell SHALL visible in-app metinlerde gereksiz öğretici açıklamalar yerine durum, karar ve aksiyon odaklı kısa metinler kullanır.

---

### Requirement 14: Dark Mode Desteği

**User Story:** Bir entegrasyon geliştiricisi olarak, dark mode'da çalışırken tüm bileşenlerin tutarlı ve okunabilir görünmesini istiyorum.

#### Kabul Kriterleri

1. THE Studio_Shell SHALL `html.dark-mode` CSS sınıfı aktif olduğunda tüm bileşenleri dark mode renk paletine geçirir; hiçbir bileşen açık tema renkleriyle görünmez.
2. THE Studio_Shell SHALL dark mode'da arka plan rengi olarak `#0f172a`, kart arka planı için `#1e293b` ve metin rengi için `#f1f5f9` kullanır.
3. THE JSON_Editor SHALL dark mode'da sözdizimi vurgulama renklerini koyu tema için optimize edilmiş paletten uygular; kontrast oranı WCAG AA standardını karşılar.
4. THE Studio_Shell SHALL dark mode geçişini 200ms animasyonla gerçekleştirir; ani renk değişimi olmaz.
5. THE Studio_Shell SHALL dark mode'da gölge efektlerini daha yüksek opaklıkla uygular; açık temada kullanılan ince gölgeler dark mode'da görünmez hale gelmez.
6. THE Diff_Viewer, Live_Preview ve JSONata_Formula_Mode SHALL dark mode'da kod, diff ve hata vurgularını okunabilir kontrastla gösterir.

---

### Requirement 15: Mobil ve Tablet Uyumu

**User Story:** Bir entegrasyon geliştiricisi olarak, tablet veya mobil cihazdan da temel işlemleri gerçekleştirebilmek istiyorum; dokunmatik ekranda kullanım rahat olsun.

#### Kabul Kriterleri

1. WHILE ekran genişliği 768px'den küçük olduğunda, THE Studio_Shell SHALL tüm çok sütunlu düzenleri tek sütunlu dikey düzene dönüştürür.
2. WHILE ekran genişliği 768px'den küçük olduğunda, THE Studio_Shell SHALL tüm dokunmatik hedeflerin minimum 44x44px boyutunda olmasını sağlar.
3. WHILE ekran genişliği 768px'den küçük olduğunda, THE Target_Todo_List SHALL kompakt durum rozetleriyle filtrelenebilir liste görünümüne geçer.
4. WHILE ekran genişliği 768px'den küçük olduğunda, THE Mapping_Workbench SHALL tam genişlikte görünür ve dönüşüm panelleri dikey kartlar olarak sıralanır.
5. WHILE ekran genişliği 768px'den küçük olduğunda, THE Live_Preview SHALL alt drawer veya tam ekran modal olarak açılır.
6. WHILE ekran genişliği 768px'den küçük olduğunda, THE MappingRule listeleri kart tabanlı görünüme geçer; her kural ayrı kart olarak gösterilir.
7. THE Studio_Shell SHALL dokunmatik kaydırma için `-webkit-overflow-scrolling: touch` ve `overscroll-behavior: contain` özelliklerini uygular.
8. WHILE ekran genişliği 1024px ile 1280px arasında olduğunda, THE Studio_Shell SHALL tablet düzenini uygular; Target_Todo_List daraltılabilir, Mapping_Workbench ana panel, Live_Preview ikincil panel olur.

---

### Requirement 16: Erişilebilirlik

**User Story:** Bir entegrasyon geliştiricisi olarak, yardımcı teknolojiler kullanarak da uygulamanın tüm işlevlerine erişebilmek istiyorum.

#### Kabul Kriterleri

1. THE Studio_Shell SHALL tüm etkileşimli öğelerde anlamlı `aria-label` veya `aria-labelledby` nitelikleri kullanır.
2. THE Wizard_Nav SHALL `role="navigation"` ve `aria-label="Adım gezinimi"` nitelikleriyle işaretlenir; aktif adım `aria-current="step"` ile belirtilir.
3. THE Studio_Shell SHALL dinamik içerik değişikliklerini (doğrulama sonuçları, yükleme durumları) `aria-live="polite"` bölgeleri aracılığıyla ekran okuyuculara bildirir.
4. THE Studio_Shell SHALL renk körü kullanıcılar için durum bilgisini yalnızca renge değil, ikon ve metin etiketine de dayandırır.
5. THE Studio_Shell SHALL metin ve arka plan rengi kombinasyonlarında WCAG 2.1 AA standardına göre minimum 4.5:1 kontrast oranını sağlar.
6. THE Studio_Shell SHALL tüm form alanlarını ilgili `<label>` öğesiyle ilişkilendirir; `for`/`id` bağlantısı veya `aria-labelledby` kullanılır.
7. THE Field_Tree ve Target_Schema_Tree SHALL klavye ile expand/collapse, seçim ve kopyalama işlemlerini destekler.
8. THE Mapping_Workbench SHALL drag-and-drop gerektiren tüm işlemler için klavye ve düğme tabanlı alternatif aksiyon sunar.
9. THE Diff_Viewer SHALL farkları yalnızca renk ile değil, metin etiketi ve ikon ile de belirtir.

---

### Requirement 17: Performans ve Ölçeklenebilirlik

**User Story:** Bir entegrasyon geliştiricisi olarak, büyük JSON verileri veya çok sayıda hedef alan ile çalışırken uygulamanın yavaşlamamasını istiyorum.

#### Kabul Kriterleri

1. THE Studio_Shell SHALL ilk anlamlı içerik boyamasını 1.5 saniyenin altında gerçekleştirir.
2. THE JSON_Editor SHALL 50KB'a kadar JSON verilerini 500ms içinde ayrıştırır ve Field_Tree'yi günceller.
3. THE Source_Intake SHALL MVP kapsamında 1 MB'a kadar sample payload'ları UI kilitlenmeden işler.
4. THE Target_Todo_List SHALL 500 hedef alana kadar filtreleme, arama ve durum güncellemelerini akıcı biçimde yapar.
5. THE MappingRule listeleri SHALL 100 adede kadar kuralı sanal kaydırma olmadan, 100'den fazla kuralı sanal kaydırma ile akıcı biçimde görüntüler.
6. THE Studio_Shell SHALL Angular OnPush değişim algılama stratejisini kullanır; gereksiz yeniden render işlemleri önlenir.
7. THE Studio_Shell SHALL animasyonlar için CSS `transform` ve `opacity` özelliklerini kullanır; `width`, `height` veya `top/left` animasyonlarından kaçınır.
8. THE Live_Preview SHALL JSONata evaluation işlemlerini debounce eder ve aynı anda çakışan preview isteklerinde son isteğin sonucunu geçerli kabul eder.
9. THE Studio_Shell SHALL büyük tree yapılarında node virtualisation veya lazy expand stratejisi kullanır.
10. THE Validation_Gate SHALL fixture testlerini kullanıcıya progress göstererek çalıştırır ve uzun koşularda UI thread'i bloke etmez.

---

### Requirement 18: Güvenlik, Yetki ve Audit

**User Story:** Bir tenant admin veya platform mimarı olarak, mapping değişikliklerinin yetkili kişilerce yapılmasını, hassas örnek verilerin korunmasını ve publish aksiyonlarının izlenebilir olmasını istiyorum.

#### Kabul Kriterleri

1. THE Studio_Shell SHALL draft oluşturma, mapping düzenleme, validation çalıştırma, review submit, approve ve publish aksiyonları için ayrı permission kontrolleri uygular.
2. THE Source_Intake SHALL sample JSON içinde olası PII alanları için uyarı gösterir ve maskelenebilir alanları işaretlemeye izin verir.
3. THE Studio_Shell SHALL hassas sample değerlerini saklamadan önce masking politikasına uygun şekilde işler.
4. THE Studio_Shell SHALL mapping rule değişiklikleri, schema değişiklikleri, fixture değişiklikleri, validation run, approval ve publish aksiyonlarını audit event olarak kaydeder.
5. THE Publish_Package SHALL immutable version oluşturur; published artifact sonradan düzenlenemez.
6. THE Studio_Shell SHALL rollback veya supersede aksiyonlarını ayrı audit event olarak kaydeder.
7. THE Studio_Shell SHALL tenant verilerini tenant boundary dışında göstermemelidir.
8. THE JSONata_Formula_Mode SHALL yalnızca izinli kullanıcılar için manuel edit imkanı sunar; izin yoksa generated expression read-only görüntülenir.
9. THE Validation_Gate SHALL publish öncesinde en az bir başarılı valid fixture ve canonical schema validation koşulunu zorunlu tutar.
10. THE Studio_Shell SHALL publish sonucunda owner, reviewer, version, timestamp, validation run id ve artifact checksum bilgilerini gösterir.

---

## Overall Acceptance Criteria

- A user can paste or upload sample JSON and immediately see an expandable source tree with quick statistics.
- A user can select or upload a Canonical Schema and see required target fields clearly marked.
- A user can complete a 5-step Mapping Wizard without writing JSONata.
- A user can map direct fields, format conversions, enum mappings, defaults, conditions, concatenations, calculations, string operations, arrays and nested objects through visual dialogs.
- Advanced users can inspect and edit generated JSONata in a controlled formula mode.
- The system always shows focused live preview and actionable validation errors for the currently selected target field.
- Required target fields cannot be accidentally skipped; the Unfinished Work step blocks progress until they are mapped or explicitly resolved.
- The final step can run fixture-based tests, compare source and target JSON, save draft and publish an immutable mapping version.
- Published artifacts can be exported to the transformer service partner config layout.
- Every publish action records owner, reviewer, version, timestamp, validation run and artifact checksums.
