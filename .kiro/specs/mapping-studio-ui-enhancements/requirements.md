# Requirements Document

## Introduction

Bu belge, **CanonBridge Mapping Studio UI** uygulamasının mevcut `integration-studio` bileşenini kapsamlı bir **Mapping Wizard** deneyimine dönüştürmek için gerekli ürün ve UI gereksinimlerini tanımlar.

Amaç yalnızca JSONata ifade girişini iyileştirmek değildir. Asıl hedef, kullanıcının JSONata bilmeden kaynak JSON'u hedef Canonical Schema'ya dönüştürebilmesi, yüzlerce alanlık dönüşümde kaybolmaması, zorunlu alanları atlamaması, mapping sonucunu fixture'larla test edebilmesi ve güvenli biçimde yayınlayabilmesidir.

Mapping Wizard 5 ana aşamadan oluşur:

1. **Kaynağı Tanımla**: Örnek JSON yapıştır, dosya yükle veya gelişmiş modda canlı örnek veri çek.
2. **Hedefi Belirle**: Canonical Schema seç veya yükle, zorunlu alanları ve eşleme kapsamını gör.
3. **Kaptan Köşkü**: Hedef odaklı yapılacaklar listesiyle alan alan eşleştir, dönüşüm mantığını görsel diyaloglarla kur.
4. **Bitmemiş İşler**: Eksik zorunlu alanları, hatalı kuralları ve tamamlanmamış dönüşümleri tek yerde tamamla.
5. **Test, Doğrula ve Yayınla**: Fixture testlerini çalıştır, diff'i incele, taslak kaydet veya immutable mapping version yayınla.

Planlanan geliştirmeler bu Wizard deneyimi içinde şu teknik yetenekleri de kapsar:

- `mappings/schemas/` ve `mappings/partners/` dizinlerindeki JSON Schema dosyalarının UI'a yüklenmesi.
- Input Schema ve Canonical Schema doğrulamasının AJV ile yapılması.
- Canonical Schema'dan hedef alan önerilerinin üretilmesi.
- Partner/event fixture listesinin yönetilmesi ve toplu test edilmesi.
- Görsel kurallardan deterministik, dışa aktarılabilir JSONata üretilmesi.

---

## Glossary

- **Integration_Studio**: `mapping-studio-ui` uygulamasındaki `IntegrationStudioComponent`; Mapping Wizard akışının ana bileşeni.
- **Mapping_Wizard**: Kaynak tanımlama, hedef şema seçimi, eşleme, eksik tamamlama, test ve yayınlama adımlarından oluşan 5 adımlı akış.
- **Wizard_Nav**: Adım ilerleme durumunu gösteren navigasyon bileşeni.
- **Step_Indicator**: Her wizard adımını numara, etiket ve durum ikonuyla gösteren öğe.
- **Source_Intake**: Kaynak JSON yapıştırma, dosya yükleme ve opsiyonel canlı bağlantı girişlerini kapsayan alt sistem.
- **JSON_Editor**: JSON içeriğini syntax highlighting, satır/kolon hata mesajı ve kopyalama desteğiyle gösteren editör.
- **Field_Tree**: Kaynak JSON yapısını hiyerarşik olarak gösteren, tip rozetleri ve path kopyalama sağlayan ağaç.
- **Source_Stats**: Kaynak JSON için toplam alan, nested object, array ve tip çakışması özetini gösteren panel.
- **Schema_Loader**: Input Schema ve Canonical Schema dosyalarını yükleyen, ayrıştıran ve UI state'e bağlayan alt sistem.
- **Input_Schema**: `mappings/partners/<partner>/<event>/input.vN.schema.json` dosyası; ham partner verisinin doğrulandığı şema.
- **Canonical_Schema**: `mappings/schemas/canonical/` altındaki hedef JSON Schema dosyası.
- **Target_Schema_Selector**: Canonical Schema seçimi veya dosyadan yükleme deneyimi.
- **Target_Schema_Tree**: Hedef şemayı zorunlu alan, tip, açıklama, enum ve format bilgileriyle gösteren ağaç.
- **Mapping_Readiness_Summary**: Kaynak ve hedef analizinden üretilen zorunlu/opsiyonel alan sayısı ve risk özeti.
- **Target_Todo_List**: Hedef şemadaki tüm alanları zorunluluk, eşleme ve hata durumuna göre sıralayan yapılacaklar listesi.
- **Mapping_Cockpit**: 3. adımda Target_Todo_List, Mapping_Workbench ve Live_Preview panellerini bir araya getiren ana ekran.
- **Mapping_Workbench**: Seçili hedef alan için kaynak seçimi, dönüşüm tipi ve parametrelerini soru-cevap mantığıyla yöneten panel.
- **Transformation_Chain**: Array filter, sort, map, default, format veya condition gibi dönüşüm adımlarının sıralı zinciri.
- **Array_Mini_Wizard**: Array içindeki her elemanın alt alanlarını eşlemek için açılan iç wizard.
- **Live_Preview**: Seçili hedef alanın anlık çıktısını, validasyon durumunu ve yürütme süresini gösteren panel.
- **JSONata_Engine**: Tarayıcıda çalışan `jsonata` kütüphanesi.
- **JSONata_Formula_Mode**: Görsel kurallardan üretilen JSONata'yı gösteren ve yetkili kullanıcıların manuel düzenleme yapabildiği mod.
- **Expression_Preview**: Tüm MappingRule listesinden üretilen dışa aktarılabilir JSONata ifadesi.
- **MappingRule**: `targetPath`, `sourcePath`, `transformKind`, `transformConfig`, `generatedJsonata`, `manualOverride` ve `validationState` içeren kural nesnesi.
- **TransformKind**: Bir dönüşüm türü; direct, format_conversion, enum_map, default_value, conditional, concat, math, string_operation, array_operation, nested_object veya custom_jsonata olabilir.
- **Unfinished_Work**: Eksik zorunlu alanları, hatalı kuralları ve test edilmemiş manuel ifadeleri listeleyen 4. adım.
- **Fixture_Runner**: Birden fazla fixture dosyasını sırayla çalıştıran ve sonuçları karşılaştıran test alt sistemi.
- **Fixture**: `mappings/partners/<partner>/<event>/fixtures/` altındaki `*.input.json` ve `*.expected.json` çifti.
- **Fixture_Result**: Fixture için gerçek çıktı ile beklenen çıktının karşılaştırma sonucu.
- **Diff_Viewer**: Kaynak JSON, beklenen çıktı ve gerçek canonical output farklarını yan yana gösteren görünüm.
- **AJV_Validator**: Tarayıcıda çalışan `ajv` kütüphanesi; JSON Schema doğrulaması yapan motor.
- **Validation_Gate**: Publish öncesi input schema, JSONata execution, canonical schema ve fixture coverage kontrollerinin bütünü.
- **Publish_Package**: Mapping JSONata, schema referansları, fixture'lar, config ve checksum bilgilerini içeren yayınlanabilir paket.
- **Partner_Config**: `mappings/partners/<partner>/<event>/config.json` dosyası.

---

## Requirements

### Requirement 1: 5 Adımlı Wizard Navigasyonu

**User Story:** Bir entegrasyon geliştiricisi olarak, hangi adımda olduğumu, hangi adımların tamamlandığını ve neyin eksik kaldığını net görmek istiyorum; böylece uzun mapping sürecinde kaybolmadan ilerleyebilirim.

#### Kabul Kriterleri

1. THE Mapping_Wizard SHALL 5 adımı sıralı biçimde gösterir: Kaynak, Hedef, Eşleme, Eksikler, Test ve Yayın.
2. THE Wizard_Nav SHALL her adım için Step_Indicator görüntüler; her Step_Indicator adım numarası, etiket ve durum içerir.
3. THE Step_Indicator SHALL durumları beklemede, aktif, tamamlandı, hatalı ve engelli olarak temsil eder.
4. WHEN bir adım tamamlandığında, THE Step_Indicator SHALL tamamlandı ikonunu ve başarı rengini uygular.
5. WHEN bir adımda blocking error varsa, THE Step_Indicator SHALL hata ikonunu ve hata rengini uygular.
6. WHEN kullanıcı tamamlanmış bir adıma tıkladığında, THE Mapping_Wizard SHALL o adıma doğrudan döner.
7. WHEN kullanıcı henüz kilidi açılmamış bir adıma tıkladığında, THE Mapping_Wizard SHALL geçişi engeller ve önce tamamlanması gereken işi açıklar.
8. WHILE ekran genişliği 768px'den küçük olduğunda, THE Wizard_Nav SHALL "X / 5" ilerleme bilgisini ve aktif adım etiketini gösterir.
9. THE Wizard_Nav SHALL klavye ile gezinmeyi destekler; Sol/Sağ ok tuşları adımlar arasında hareket eder, Enter aktif adıma geçer.
10. THE Mapping_Wizard SHALL kullanıcı bir adımdan çıkmadan önce kaydedilmemiş veya geçersiz state varsa inline uyarı gösterir.

---

### Requirement 2: Adım 1 - Kaynak JSON Tanımlama

**User Story:** Bir entegrasyon geliştiricisi olarak, dönüştürmek istediğim kaynak JSON'u hızlıca sisteme tanıtmak ve yapısını anında görmek istiyorum.

#### Kabul Kriterleri

1. THE Source_Intake SHALL sol tarafta JSON_Editor, sağ tarafta Field_Tree olacak şekilde iki panelli düzen sunar.
2. THE JSON_Editor SHALL örnek JSON yapıştırmayı, `.json` ve `.txt` dosya yüklemeyi destekler.
3. WHEN kullanıcı geçersiz JSON girerse, THE JSON_Editor SHALL satır, kolon ve hata açıklaması içeren anlık hata gösterir.
4. WHEN kullanıcı geçerli JSON girerse, THE Field_Tree SHALL 300ms debounce ile otomatik güncellenir.
5. THE Field_Tree SHALL her node için field adı, tam path, tip rozeti, array göstergesi ve örnek değer gösterir.
6. WHEN kullanıcı bir Field_Tree node'u seçerse, THE Source_Intake SHALL JSONPath ve JSON Pointer değerlerini detay bölümünde gösterir.
7. WHEN kullanıcı path kopyalama aksiyonunu seçerse, THE Source_Intake SHALL path'i panoya kopyalar ve toast bildirimi gösterir.
8. THE Source_Stats SHALL toplam alan, nested object, array ve tespit edilen tip çakışması sayısını gösterir.
9. THE Source_Intake SHALL gelişmiş modda API endpoint, method, headers ve credentials alanlarıyla canlı örnek veri çekme UI'ını sunar.
10. IF canlı veri çekme backend desteği yoksa, THEN THE Source_Intake SHALL bu bölümü disabled preview olarak gösterir.
11. IF kaynak JSON geçersizse, THEN THE Mapping_Wizard SHALL 2. adıma geçişi engeller.
12. THE Source_Intake SHALL 1 MB'a kadar sample payload'ları UI'ı kilitlemeden işlemelidir.

---

### Requirement 3: Adım 2 - Hedef Canonical Schema Seçimi

**User Story:** Bir entegrasyon geliştiricisi olarak, hangi hedef Canonical Schema'ya dönüşüm yapacağımı seçmek ve zorunlu alanları başlamadan önce görmek istiyorum.

#### Kabul Kriterleri

1. THE Target_Schema_Selector SHALL mevcut Canonical Schema listesini ad, versiyon, açıklama ve durum bilgisiyle gösterir.
2. THE Target_Schema_Selector SHALL kullanıcının `.json` uzantılı Canonical Schema dosyası yüklemesine izin verir.
3. WHEN geçerli bir Canonical Schema seçildiğinde, THE Target_Schema_Tree SHALL şemayı ağaç görünümünde gösterir.
4. THE Target_Schema_Tree SHALL zorunlu alanları yıldız, metin etiketi ve durum ikonu ile belirtir.
5. THE Target_Schema_Tree SHALL field path, tip, format, enum değerleri, açıklama, array ve nested object bağlamını gösterir.
6. THE Schema_Loader SHALL canonical schema `required` alanlarını ayrıştırır ve TargetField listesine aktarır.
7. THE Schema_Loader SHALL `payload.properties` altındaki alanları dolaşır ve hedef alan önerileri üretir.
8. WHEN schema property tipi `"integer"` ise, THE Schema_Loader SHALL bunu `number` hedef tipiyle eşler.
9. WHEN schema property tipi `"array"` veya `"object"` ise, THE Schema_Loader SHALL alanı nested/array bağlamıyla ekler; düz string'e indirgeme yapmaz.
10. THE Mapping_Readiness_Summary SHALL zorunlu alan sayısı, opsiyonel alan sayısı, toplam hedef alan sayısı ve array/nested alan sayısını gösterir.
11. THE Mapping_Readiness_Summary SHALL kullanıcıya 3. adımda önce kaç zorunlu alanla başlayacağını açıklar.
12. IF hedef schema parse edilemezse, THEN THE Target_Schema_Selector SHALL önceki geçerli schema state'ini korur ve hatayı gösterir.

---

### Requirement 4: Input Schema Yükleme ve Kaynak Doğrulama

**User Story:** Bir entegrasyon geliştiricisi olarak, partner input schema dosyasını yükleyip ham payload'ın beklenen kontrata uyup uymadığını wizard içinde görmek istiyorum.

#### Kabul Kriterleri

1. WHEN kullanıcı "Input Schema Yükle" aksiyonunu seçtiğinde, THE Schema_Loader SHALL yalnızca `.json` dosya seçimine izin verir.
2. WHEN geçerli bir Input Schema yüklendiğinde, THE Schema_Loader SHALL schema `title` ve `$id` değerlerini UI'da gösterir.
3. IF dosya geçerli JSON değilse, THEN THE Schema_Loader SHALL "Geçersiz JSON dosyası: [hata mesajı]" hatasını gösterir ve önceki schema state'ini korur.
4. IF schema kök tipi `object` değilse, THEN THE Schema_Loader SHALL "Desteklenmeyen şema: kök nesne tipi bekleniyor" uyarısını gösterir.
5. WHEN Input Schema yüklüyken kaynak JSON değişirse, THE AJV_Validator SHALL kaynak JSON'u schema'ya karşı yeniden doğrular.
6. THE AJV_Validator SHALL input validation hatalarını schema path, instance path ve mesaj bilgisiyle listeler.
7. THE Schema_Loader SHALL Input Schema properties değerlerinden kaynak alan önerileri çıkarır ve source path listesine ekler.
8. THE Schema_Loader SHALL yüklenen şemayı sayfa yenilenmeden tarayıcı oturumu boyunca bellekte tutar.

---

### Requirement 5: Adım 3 - Kaptan Köşkü ve Hedef Odaklı Eşleme

**User Story:** Bir entegrasyon geliştiricisi olarak, hedef alanları yapılacaklar listesi gibi görüp her hedef alan için tek tek doğru dönüşüm kararını vermek istiyorum.

#### Kabul Kriterleri

1. THE Mapping_Cockpit SHALL üç ana panelden oluşur: Target_Todo_List, Mapping_Workbench ve Live_Preview.
2. THE Target_Todo_List SHALL tüm hedef alanları listeler ve zorunlu unmapped alanları en üstte gösterir.
3. THE Target_Todo_List SHALL her alan için path, tip, required/optional durumu, mapped/unmapped durumu ve validation state gösterir.
4. WHEN bir alan başarıyla eşlenirse, THE Target_Todo_List SHALL alanı tamamlandı durumuna geçirir ve tamamlanmamış alanların altına taşır.
5. WHEN kullanıcı bir hedef alan seçerse, THE Mapping_Workbench SHALL yalnızca o hedef alanın dönüşüm kararlarını gösterir.
6. THE Mapping_Workbench SHALL kullanıcıya önce "Bu alan için kaynak neresi?" sorusunu gösterir.
7. THE Mapping_Workbench SHALL kaynak alan seçimini Field_Tree'den tıklama, arama veya drag-and-drop ile destekler.
8. WHEN kaynak alan seçildiğinde, THE Mapping_Workbench SHALL kaynak path, tip ve örnek değer bilgisini gösterir.
9. THE Mapping_Workbench SHALL kaynak seçiminden sonra "Dönüşüm gerekiyor mu?" sorusunu gösterir.
10. THE Mapping_Workbench SHALL hedef tip ve kaynak tipe göre önerilen TransformKind seçeneklerini önceliklendirir.
11. THE Live_Preview SHALL yalnızca seçili hedef alanın üretilen değerini, validation durumunu ve çalışma süresini gösterir.
12. THE Live_Preview SHALL gerektiğinde "Tam canonical çıktıda göster" aksiyonu sunar.

---

### Requirement 6: Görsel Dönüşüm Diyalogları

**User Story:** Bir entegrasyon geliştiricisi olarak, JSONata yazmadan JSONata'nın temel ve ileri dönüşüm yeteneklerini görsel seçimlerle kullanmak istiyorum.

#### Kabul Kriterleri

1. THE Mapping_Workbench SHALL direct mapping için "Birebir Al" seçeneği sunar ve ek parametre istemeden kural oluşturur.
2. THE Mapping_Workbench SHALL format conversion için input format, output format ve timezone alanlarını gösterir.
3. THE format conversion panel SHALL ISO 8601, Unix ms, Unix seconds ve özel tarih formatlarını destekler.
4. THE format conversion panel SHALL number/integer dönüşümü, rounding strategy ve decimal places seçeneklerini destekler.
5. THE Mapping_Workbench SHALL enum mapping için from/to tablosu, "+ Eşleme Ekle" ve unmatched behavior kontrollerini gösterir.
6. THE enum mapping panel SHALL unmatched behavior olarak default value, pass-through, null ve error seçeneklerini sunar.
7. THE Mapping_Workbench SHALL default value için null, missing, empty string, zero ve false değerlerini "boş" kabul etme seçenekleri sunar.
8. THE Mapping_Workbench SHALL conditional mapping için IF, ELSE IF ve ELSE blokları oluşturmayı destekler.
9. THE conditional panel SHALL equals, not equals, gt, gte, lt, lte, contains, exists ve regex operatörlerini destekler.
10. THE Mapping_Workbench SHALL concatenation için "Alan Ekle" ve "Sabit Metin Ekle" aksiyonlarıyla sıralanabilir parça listesi sunar.
11. THE Mapping_Workbench SHALL mathematical operation için toplama, çıkarma, çarpma, bölme, round, floor ve ceil seçeneklerini sunar.
12. THE Mapping_Workbench SHALL string operation için uppercase, lowercase, trim, replace, substring ve regex replace seçeneklerini sunar.
13. THE Mapping_Workbench SHALL her görsel dönüşümden deterministik `generatedJsonata` üretir.
14. IF dönüşüm parametresi eksik veya geçersizse, THEN THE Mapping_Workbench SHALL kural kaydını engeller ve alan bazlı hata gösterir.

---

### Requirement 7: Array, Filtre, Sıralama ve Nested Object Dönüşümleri

**User Story:** Bir entegrasyon geliştiricisi olarak, array ve nested object dönüşümlerini karmaşık JSONata yazmadan zincir adımları ve mini wizard ile tanımlamak istiyorum.

#### Kabul Kriterleri

1. WHEN kaynak alan array tipindeyse, THE Mapping_Workbench SHALL "Diziyi İşle" dönüşüm panelini önerir.
2. THE array operation panel SHALL "Her elemanı dönüştür", "Filtrele", "Sırala", "Say", "İlk elemanı al" ve "Son elemanı al" seçeneklerini destekler.
3. THE array operation panel SHALL dönüşüm adımlarını Transformation_Chain olarak sıralamaya izin verir.
4. WHEN kullanıcı "Filtrele" eklediğinde, THE Mapping_Workbench SHALL field/operator/value biçiminde koşul arayüzü sunar.
5. WHEN kullanıcı "Sırala" eklediğinde, THE Mapping_Workbench SHALL item field ve artan/azalan yön seçimi sunar.
6. WHEN kullanıcı "Her elemanı dönüştür" seçtiğinde, THE Mapping_Workbench SHALL Array_Mini_Wizard açar.
7. THE Array_Mini_Wizard SHALL yalnızca seçili array hedef alanının alt alanlarını gösterir.
8. THE Array_Mini_Wizard SHALL alt alanlar için direct, format, default, condition, enum ve custom JSONata seçeneklerini destekler.
9. WHEN hedef alan object tipindeyse, THE Mapping_Workbench SHALL nested object alt alan eşleme akışını başlatır.
10. THE nested object flow SHALL parent object tamamlanma durumunu child mapping durumlarından hesaplar.
11. THE Transformation_Chain SHALL her adım için yeniden sıralama, silme, devre dışı bırakma ve test etme aksiyonu sunar.
12. THE Live_Preview SHALL array dönüşümünde örnek ilk N elemanı ve toplam eleman sayısını gösterir.

---

### Requirement 8: Özel JSONata Formül Modu

**User Story:** Bir ileri seviye entegrasyon geliştiricisi olarak, görsel wizard'ın ürettiği JSONata'yı incelemek ve gerektiğinde manuel olarak düzenlemek istiyorum.

#### Kabul Kriterleri

1. THE Mapping_Workbench SHALL her hedef alan için "Özel Formül" veya "Gelişmiş JSONata" bağlantısı sunar.
2. WHEN kullanıcı JSONata_Formula_Mode'a geçtiğinde, THE Mapping_Workbench SHALL mevcut görsel kuraldan üretilen JSONata'yı editörde gösterir.
3. THE JSONata_Formula_Mode SHALL syntax highlighting, parse validation ve source path autocomplete destekler.
4. WHEN kullanıcı manuel ifade yazarsa, THE MappingRule SHALL `manualOverride: true` olarak işaretlenir.
5. WHEN kural manual override durumundaysa, THE Target_Todo_List SHALL kuralı "Gelişmiş" rozetiyle gösterir.
6. IF kullanıcı manual override kuralı görsel moda döndürmek isterse, THEN THE Mapping_Workbench SHALL manuel kodun ezileceğini açıkça onaylatır.
7. THE JSONata_Formula_Mode SHALL kaydetmeden önce ifadenin en az bir örnek kaynak JSON üzerinde test edilmesini şart koşar.
8. THE JSONata_Formula_Mode SHALL parse hatalarını satır/kolon ve hata mesajıyla gösterir.
9. WHEN kullanıcının manuel JSONata yetkisi yoksa, THEN THE JSONata_Formula_Mode SHALL generated expression'ı read-only gösterir.

---

### Requirement 9: Dışa Aktarılabilir JSONata İfade Önizlemesi

**User Story:** Bir entegrasyon geliştiricisi olarak, görsel kurallardan üretilen tam JSONata ifadesini kopyalamak veya dosya olarak indirmek istiyorum.

#### Kabul Kriterleri

1. THE Integration_Studio SHALL tüm MappingRule listesinden birleşik JSONata ifadesi üretir.
2. THE Expression_Preview SHALL her hedef path için `targetKey: <expression>` biçiminde çıktı üretir.
3. WHEN bir kural manual override içeriyorsa, THE Expression_Preview SHALL bu kural için manuel JSONata ifadesini kullanır.
4. WHEN kullanıcı "İfadeyi Kopyala" aksiyonunu seçerse, THE Integration_Studio SHALL birleşik JSONata ifadesini panoya kopyalar.
5. WHEN kullanıcı "İfadeyi İndir" aksiyonunu seçerse, THE Integration_Studio SHALL ifadeyi `mapping-preview.jsonata` adıyla indirir.
6. THE Expression_Preview SHALL 500 karakteri aşan ifadeleri kaydırılabilir alanda gösterir.
7. THE Expression_Preview SHALL generated mode ile manual override mode farkını görünür şekilde işaretler.

---

### Requirement 10: Canlı Önizleme ve Hata Yönlendirme

**User Story:** Bir entegrasyon geliştiricisi olarak, yaptığım değişikliğin sonucunu anında görmek ve hata varsa doğrudan ilgili kurala gidebilmek istiyorum.

#### Kabul Kriterleri

1. THE Live_Preview SHALL seçili hedef alan için kaynak değer, dönüştürülmüş değer ve validation state gösterir.
2. THE Live_Preview SHALL her değişiklikten sonra JSONata_Engine ile preview çalıştırır.
3. THE Live_Preview SHALL yürütme süresini ms cinsinden gösterir.
4. WHEN preview başarılıysa, THE Live_Preview SHALL "Geçti" durumunu gösterir.
5. WHEN preview başarısızsa, THE Live_Preview SHALL hatayı JSONata, type conversion veya schema validation olarak sınıflandırır.
6. THE AJV_Validator SHALL canonical schema hatalarını `instancePath` ve `message` bilgisiyle gösterir.
7. WHEN validation error `instancePath` bir target path ile eşleşirse, THE Integration_Studio SHALL ilgili Target_Todo_List satırını hata durumunda vurgular.
8. WHEN kullanıcı "Kurala Git" aksiyonunu seçerse, THE Integration_Studio SHALL ilgili hedef alanı Mapping_Workbench içinde açar.
9. THE Live_Preview SHALL pahalı preview işlemlerini debounce eder ve eşzamanlı isteklerde son sonucu geçerli kabul eder.

---

### Requirement 11: Adım 4 - Bitmemiş İşler

**User Story:** Bir entegrasyon geliştiricisi olarak, yayınlama öncesinde eksik zorunlu alanları ve hatalı dönüşümleri tek yerde görmek istiyorum.

#### Kabul Kriterleri

1. THE Unfinished_Work SHALL zorunlu ama unmapped hedef alanları listeler.
2. THE Unfinished_Work SHALL hatalı MappingRule ve test edilmemiş manual override kurallarını listeler.
3. IF eksik yoksa, THEN THE Unfinished_Work SHALL "Tüm zorunlu alanlar başarıyla eşleştirildi" mesajını gösterir.
4. IF eksik varsa, THEN THE Unfinished_Work SHALL "Aşağıdaki N zorunlu alan tamamlanmadı" mesajını gösterir.
5. THE Unfinished_Work SHALL her eksik alan için hedef path, tip, açıklama ve "Hemen Eşleştir" aksiyonu gösterir.
6. WHEN kullanıcı "Hemen Eşleştir" aksiyonunu seçerse, THE Mapping_Wizard SHALL 3. adıma döner ve ilgili hedef alanı açar.
7. THE Unfinished_Work SHALL optional alanları ayrı bölümde gösterir.
8. THE Unfinished_Work SHALL optional alanların intentional unmapped olarak gerekçeyle işaretlenmesini destekler.
9. IF blocking error veya eksik zorunlu alan varsa, THEN THE Mapping_Wizard SHALL 5. adıma geçişi engeller.

---

### Requirement 12: Fixture Runner ve Toplu Test

**User Story:** Bir entegrasyon geliştiricisi olarak, bir partner/event için tanımlı tüm fixture'ları çalıştırıp mapping'in yalnızca happy path'te değil edge case'lerde de çalıştığını doğrulamak istiyorum.

#### Kabul Kriterleri

1. THE Fixture_Runner SHALL birden fazla fixture satırı görüntüler; her satır isim, giriş JSON, beklenen çıktı JSON ve durum içerir.
2. WHEN kullanıcı "Fixture Ekle" aksiyonunu seçerse, THE Fixture_Runner SHALL boş input ve expected output alanlarıyla yeni fixture satırı ekler.
3. WHEN kullanıcı "Dosyadan Yükle" aksiyonunu seçerse, THE Fixture_Runner SHALL `.json` dosyasını ilgili fixture alanına yükler.
4. WHEN kullanıcı "Config Yükle" aksiyonunu seçerse, THE Fixture_Runner SHALL `config.json` dosyasını ayrıştırır.
5. WHEN config dosyası `fixtures` dizisi içerirse, THE Fixture_Runner SHALL her fixture yolu için satır oluşturur.
6. IF config dosyasında `fixtures` alanı yoksa, THEN THE Fixture_Runner SHALL bilgi mesajı gösterir.
7. WHEN kullanıcı "Tümünü Çalıştır" aksiyonunu seçerse, THE Fixture_Runner SHALL her fixture için input schema validation, JSONata execution ve canonical schema validation çalıştırır.
8. WHEN gerçek çıktı beklenen çıktıyla tam eşleşirse, THE Fixture_Runner SHALL fixture sonucunu "Geçti" olarak işaretler.
9. WHEN gerçek çıktı beklenen çıktıyla eşleşmezse, THE Fixture_Runner SHALL fixture sonucunu "Başarısız" olarak işaretler ve farkları listeler.
10. IF JSONata execution hata verirse, THEN THE Fixture_Runner SHALL fixture sonucunu "Hata" olarak işaretler ve hata mesajını gösterir.
11. WHEN tüm testler tamamlandığında, THE Fixture_Runner SHALL "N/M geçti" özetini gösterir.
12. THE Fixture_Runner SHALL fixture satırı silmeyi destekler; silme diğer satırları etkilemez.

---

### Requirement 13: Diff Viewer ve Son Test Ekranı

**User Story:** Bir entegrasyon geliştiricisi olarak, son yayından önce kaynak JSON, beklenen çıktı ve üretilen canonical output farkını net görmek istiyorum.

#### Kabul Kriterleri

1. THE final test step SHALL üst bölümde toplam eşlenen alan, zorunlu alan kapsamı, ileri dönüşüm sayısı ve validation summary gösterir.
2. THE Diff_Viewer SHALL kaynak JSON ve dönüştürülmüş canonical JSON'u yan yana gösterir.
3. WHEN fixture expected output varsa, THE Diff_Viewer SHALL beklenen ve gerçek output farklarını da yan yana gösterebilir.
4. THE Diff_Viewer SHALL yalnızca farklı alanları vurgular; eşleşen alanları normal görünümde tutar.
5. THE Diff_Viewer SHALL her farklı alan için beklenen değer, gerçek değer ve path bilgisini gösterir.
6. IF expected output boşsa, THEN THE Diff_Viewer SHALL karşılaştırma yapmaz ve yalnızca gerçek çıktıyı gösterir.
7. THE final test step SHALL "Testi Genişlet" aksiyonu ile yeni sample veya fixture yüklemeyi destekler.
8. THE final test step SHALL fixture tipleri olarak valid, invalid, edge_case ve production_failure etiketlerini destekler.

---

### Requirement 14: Draft Kaydetme, Publish ve Immutable Versioning

**User Story:** Bir platform mimarı olarak, mapping değişikliklerinin taslak olarak saklanmasını, review ve publish kapılarından geçmesini ve yayınlanan versiyonların değiştirilemez olmasını istiyorum.

#### Kabul Kriterleri

1. THE Integration_Studio SHALL mapping state, source sample, schema referansları, MappingRule listesi, generated JSONata ve fixture state'i draft olarak saklar.
2. THE Integration_Studio SHALL autosave operasyonlarını idempotent olarak yürütür.
3. THE final test step SHALL "Taslak Olarak Kaydet" aksiyonu sunar.
4. THE final test step SHALL "Yayınla" aksiyonunu yalnızca Validation_Gate başarıyla geçtiğinde etkinleştirir.
5. THE Validation_Gate SHALL en az bir valid fixture, başarılı JSONata execution ve başarılı canonical schema validation gerektirir.
6. WHEN kullanıcı "Yayınla" aksiyonunu seçerse, THE Integration_Studio SHALL yayınlamanın immutable version oluşturacağını onaylatır.
7. WHEN publish başarılı olursa, THE Integration_Studio SHALL mapping version, artifact checksum, canonical schema version ve activation state gösterir.
8. THE Publish_Package SHALL transformer servisinin beklediği partner config layout'una export edilebilir olmalıdır.
9. THE published mapping version SHALL doğrudan düzenlenemez; değişiklik için yeni draft oluşturulur.
10. THE Integration_Studio SHALL rollback veya supersede aksiyonlarını ayrı audit event olarak kaydeder.

---

### Requirement 15: Mevcut Özelliklerin Korunması ve Geçiş

**User Story:** Bir entegrasyon geliştiricisi olarak, mevcut Integration Studio özelliklerinin yeni Wizard deneyimine taşınırken kaybolmamasını istiyorum.

#### Kabul Kriterleri

1. THE Integration_Studio SHALL mevcut serbest JSONata ifade girişini JSONata_Formula_Mode altında korur.
2. THE Integration_Studio SHALL mevcut tarayıcıda gerçek zamanlı JSONata değerlendirme davranışını Live_Preview içinde korur.
3. THE Integration_Studio SHALL mevcut görsel dönüşüm kuralı davranışlarını Mapping_Workbench dönüşüm panellerine taşır.
4. THE Integration_Studio SHALL mevcut alternatif fixture girişini Fixture_Runner içinde tek fixture olarak migrate eder.
5. WHEN yeni schema veya fixture özellikleri kullanılmadığında, THE Integration_Studio SHALL demo verisiyle çalışmaya devam eder.
6. THE Integration_Studio SHALL eski 4 adımlı state varsa, bunu yeni 5 adımlı Mapping_Wizard state'ine kayıpsız migrate eder.
7. THE Integration_Studio SHALL eski mapping rule modelindeki alanları yeni MappingRule modeline deterministik biçimde dönüştürür.

---

### Requirement 16: Güvenlik, Yetki ve Audit

**User Story:** Bir tenant admin olarak, mapping değişikliklerinin yetkili kişilerce yapılmasını ve publish aksiyonlarının izlenebilir olmasını istiyorum.

#### Kabul Kriterleri

1. THE Integration_Studio SHALL draft create, draft update, validate, review submit, approve, publish ve rollback için ayrı permission kontrolleri uygular.
2. THE Source_Intake SHALL olası PII alanları için uyarı gösterir.
3. THE Source_Intake SHALL hassas sample alanlarını maskelenebilir olarak işaretlemeye izin verir.
4. THE Integration_Studio SHALL mapping rule, schema, fixture, validation run, approval ve publish değişikliklerini audit event olarak kaydeder.
5. THE Publish_Package SHALL owner, reviewer, version, timestamp, validation run id ve artifact checksum bilgilerini içerir.
6. THE Integration_Studio SHALL tenant verilerini tenant boundary dışında göstermemelidir.
7. THE JSONata_Formula_Mode SHALL manuel düzenlemeyi yalnızca yetkili kullanıcılara açar.

---

### Requirement 17: Kullanıcı Geri Bildirimi, Erişilebilirlik ve Responsive Davranış

**User Story:** Bir entegrasyon geliştiricisi olarak, uygulamanın her durumda yanıt verdiğini, erişilebilir olduğunu ve tablet/mobil ekranlarda temel işlemleri desteklediğini görmek istiyorum.

#### Kabul Kriterleri

1. WHEN herhangi bir asenkron işlem 200ms'den uzun sürerse, THE Integration_Studio SHALL ilgili panelde loading veya skeleton state gösterir.
2. WHEN işlem başarılı olursa, THE Integration_Studio SHALL başarı toast bildirimi gösterir.
3. WHEN işlem hata verirse, THE Integration_Studio SHALL kapatılana kadar görünen hata toast bildirimi gösterir.
4. THE Integration_Studio SHALL tüm form alanları için inline validation mesajı gösterir.
5. THE Integration_Studio SHALL kaydedilmemiş değişikliklerle sayfadan çıkılırken onay diyaloğu gösterir.
6. THE Integration_Studio SHALL tüm etkileşimli öğeler için anlamlı `aria-label` veya `aria-labelledby` kullanır.
7. THE Wizard_Nav SHALL `role="navigation"` ve `aria-current="step"` kullanır.
8. THE Integration_Studio SHALL renk körü kullanıcılar için durum bilgisini yalnızca renge dayandırmaz; ikon ve metin etiketi kullanır.
9. WHILE ekran genişliği 768px'den küçük olduğunda, THE Integration_Studio SHALL çok sütunlu düzenleri tek sütunlu dikey düzene dönüştürür.
10. WHILE ekran genişliği 768px'den küçük olduğunda, THE Integration_Studio SHALL dokunmatik hedefleri minimum 44x44px yapar.
11. THE Field_Tree, Target_Schema_Tree ve Target_Todo_List SHALL klavye ile kullanılabilir olmalıdır.
12. THE Integration_Studio SHALL WCAG 2.1 AA kontrast gereksinimlerini karşılar.

---

### Requirement 18: Performans ve Ölçeklenebilirlik

**User Story:** Bir entegrasyon geliştiricisi olarak, büyük JSON payload'ları ve yüzlerce hedef alanla çalışırken UI'ın akıcı kalmasını istiyorum.

#### Kabul Kriterleri

1. THE Integration_Studio SHALL ilk anlamlı içerik boyamasını 1.5 saniyenin altında gerçekleştirir.
2. THE JSON_Editor SHALL 50KB'a kadar JSON verisini 500ms içinde ayrıştırır.
3. THE Source_Intake SHALL MVP kapsamında 1 MB'a kadar sample payload'ı UI kilitlenmeden işler.
4. THE Field_Tree SHALL büyük node sayılarında lazy expand veya virtualization kullanır.
5. THE Target_Todo_List SHALL 500 hedef alana kadar arama, filtreleme ve durum güncellemesini akıcı biçimde yapar.
6. THE MappingRule listeleri SHALL 100'den fazla kuralda virtual scrolling kullanır.
7. THE Live_Preview SHALL JSONata evaluation işlemlerini debounce eder.
8. THE Fixture_Runner SHALL fixture testlerini progress göstererek çalıştırır ve UI thread'i bloke etmez.
9. THE Integration_Studio SHALL Angular OnPush change detection stratejisini kullanır.
10. THE Integration_Studio SHALL animasyonlarda `transform` ve `opacity` kullanır; layout thrashing yaratacak animasyonlardan kaçınır.

---

## Overall Acceptance Criteria

- Kullanıcı örnek JSON yapıştırabilir veya yükleyebilir ve anında kaynak ağaç görünümü ile istatistikleri görebilir.
- Kullanıcı Canonical Schema seçebilir veya yükleyebilir ve zorunlu hedef alanları açıkça görebilir.
- Kullanıcı 5 adımlı Mapping Wizard akışını JSONata yazmadan tamamlayabilir.
- Kullanıcı direct mapping, format dönüşümü, enum mapping, default value, conditional, concatenation, math, string operation, array operation ve nested object dönüşümlerini görsel diyaloglarla tanımlayabilir.
- İleri seviye kullanıcılar generated JSONata'yı kontrollü formül modunda inceleyebilir ve düzenleyebilir.
- Sistem her hedef alan için canlı önizleme, validation state ve actionable error gösterir.
- Eksik zorunlu alanlar 4. adımda yakalanır ve publish öncesi engellenir.
- Kullanıcı fixture listesi oluşturabilir, config dosyasından fixture yükleyebilir ve tüm fixture'ları toplu çalıştırabilir.
- Son test ekranı kaynak, beklenen ve gerçek output farklarını diff viewer ile gösterebilir.
- Mapping draft olarak kaydedilebilir, validation gate başarıyla geçerse immutable version olarak yayınlanabilir.
- Published artifacts transformer servisinin beklediği partner config layout'una export edilebilir.
- Her publish aksiyonu owner, reviewer, version, timestamp, validation run id ve artifact checksum bilgileriyle audit edilir.
