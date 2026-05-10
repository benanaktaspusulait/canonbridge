# Requirements Document

## Introduction

Bu belge, **CanonBridge Mapping Studio UI** uygulamasının mevcut `integration-studio` bileşenine yapılacak geliştirmeleri tanımlar. Mevcut özellikler şunlardır: serbest JSONata ifade girişi, tarayıcıda gerçek zamanlı JSONata değerlendirmesi, görsel dönüşüm katmanı ve dışa aktarılabilir ifade önizlemesi.

Planlanan geliştirmeler iki ana eksende yoğunlaşmaktadır:

1. **Şema Yükleme**: `mappings/schemas/` ve `mappings/partners/` dizinlerindeki JSON Schema dosyalarının UI'a yüklenerek giriş doğrulaması ve hedef alan önerilerinde kullanılması.
2. **Fixture Listesi Genişletme**: Tek bir alternatif fixture yerine, bir partner/event için tanımlı tüm fixture dosyalarının listelenerek toplu test edilmesi.

**Sözlük:**

- **Integration_Studio**: `mapping-studio-ui` uygulamasındaki `IntegrationStudioComponent`; JSONata eşleme kurallarının görsel olarak oluşturulduğu ve test edildiği bileşen.
- **Schema_Loader**: Kullanıcının `mappings/schemas/` veya `mappings/partners/` dizinlerinden JSON Schema dosyası yüklemesini sağlayan UI alt sistemi.
- **Fixture_Runner**: Birden fazla fixture dosyasını sırayla çalıştıran ve sonuçları karşılaştıran test alt sistemi.
- **JSONata_Engine**: Tarayıcıda çalışan `jsonata` kütüphanesi; ifadeleri değerlendiren motor.
- **Canonical_Schema**: `mappings/schemas/canonical/` altındaki hedef JSON Schema dosyası; dönüşüm çıktısının doğrulandığı şema.
- **Input_Schema**: `mappings/partners/<partner>/<event>/input.vN.schema.json` dosyası; ham partner verisinin doğrulandığı şema.
- **Fixture**: `mappings/partners/<partner>/<event>/fixtures/` altındaki `*.input.json` ve `*.expected.json` çifti.
- **Fixture_Result**: Bir fixture için gerçek çıktı ile beklenen çıktının karşılaştırma sonucu (geçti / başarısız / hata).
- **AJV_Validator**: Tarayıcıda çalışan `ajv` kütüphanesi; JSON Schema doğrulaması yapan motor.
- **Expression_Preview**: Görsel dönüşüm kuralından otomatik üretilen JSONata ifadesi; kopyalanabilir metin.
- **Partner_Config**: `mappings/partners/<partner>/<event>/config.json` dosyası; partner/event yapılandırması.

---

## Requirements

### Requirement 1: Giriş Şeması Yükleme ve Doğrulama

**User Story:** Bir entegrasyon geliştiricisi olarak, `mappings/partners/` dizininden bir Input Schema yüklemek istiyorum; böylece ham partner verisinin şemaya uygunluğunu Integration Studio içinde doğrulayabileyim.

#### Kabul Kriterleri

1. WHEN kullanıcı "Şema Yükle" düğmesine tıkladığında, THE Schema_Loader SHALL tarayıcının dosya seçici diyaloğunu açar ve yalnızca `.json` uzantılı dosyaların seçilmesine izin verir.
2. WHEN kullanıcı geçerli bir JSON Schema dosyası seçtiğinde, THE Schema_Loader SHALL dosyayı ayrıştırır ve şema başlığını (`title` alanı) ile `$id` değerini UI'da görüntüler.
3. IF seçilen dosya geçerli bir JSON belgesi değilse, THEN THE Schema_Loader SHALL "Geçersiz JSON dosyası: [hata mesajı]" biçiminde bir hata mesajı görüntüler ve önceki şema durumunu korur.
4. IF seçilen dosya geçerli JSON ancak `type: "object"` içermiyorsa, THEN THE Schema_Loader SHALL "Desteklenmeyen şema: kök nesne tipi bekleniyor" uyarısını görüntüler.
5. WHEN bir Input Schema yüklendiğinde, THE AJV_Validator SHALL mevcut kaynak JSON'ı bu şemaya karşı doğrular ve doğrulama hatalarını satır bazında listeler.
6. WHILE bir Input Schema yüklü durumdayken, THE Schema_Loader SHALL şema özelliklerinden (`properties`) türetilen kaynak alan yollarını `sourcePaths` listesine ekler.
7. THE Schema_Loader SHALL yüklenen şemayı tarayıcı oturumu boyunca bellekte tutar; sayfa yenilenmeden şema kaybolmaz.

---

### Requirement 2: Canonical Şema Yükleme ve Çıktı Doğrulama

**User Story:** Bir entegrasyon geliştiricisi olarak, `mappings/schemas/canonical/` dizininden bir Canonical Schema yüklemek istiyorum; böylece dönüşüm çıktısının hedef şemaya uygunluğunu Integration Studio içinde doğrulayabileyim.

#### Kabul Kriterleri

1. WHEN kullanıcı "Canonical Şema Yükle" düğmesine tıkladığında, THE Schema_Loader SHALL tarayıcının dosya seçici diyaloğunu açar ve yalnızca `.json` uzantılı dosyaların seçilmesine izin verir.
2. WHEN geçerli bir Canonical Schema yüklendiğinde, THE Schema_Loader SHALL şemanın `required` alanlarını ayrıştırır ve bu alanları hedef alan listesine (`targetFields`) otomatik olarak ekler.
3. WHEN geçerli bir Canonical Schema yüklendiğinde ve dönüşüm çalıştırıldığında, THE AJV_Validator SHALL dönüşüm çıktısını bu şemaya karşı doğrular.
4. IF dönüşüm çıktısı Canonical Schema doğrulamasından geçemezse, THEN THE AJV_Validator SHALL her doğrulama hatasını `instancePath` ve `message` bilgisiyle listeler.
5. WHEN Canonical Schema doğrulaması başarılı olduğunda, THE Integration_Studio SHALL doğrulama durumunu "Şema Geçerli ✓" olarak işaretler.
6. THE Schema_Loader SHALL aynı anda yalnızca bir Canonical Schema tutabilir; yeni bir şema yüklendiğinde önceki şema ve türetilen hedef alanlar temizlenir.

---

### Requirement 3: Şema Özelliklerinden Hedef Alan Önerisi

**User Story:** Bir entegrasyon geliştiricisi olarak, yüklenen Canonical Schema'dan hedef alanların otomatik olarak önerilmesini istiyorum; böylece hedef alanları elle girmek zorunda kalmayayım.

#### Kabul Kriterleri

1. WHEN bir Canonical Schema yüklendiğinde, THE Schema_Loader SHALL şemanın `payload.properties` nesnesini dolaşır ve her özellik için `key`, `type` ve `required` bilgilerini çıkarır.
2. WHEN şemadan türetilen hedef alanlar `targetFields` listesine eklendiğinde, THE Integration_Studio SHALL mevcut elle girilmiş alanları korur ve şemadan gelen alanları bunların altına ekler.
3. WHEN bir şema özelliğinin tipi `"string"`, `"number"` veya `"integer"` ise, THE Schema_Loader SHALL bu tipi `TargetField.type` alanına karşılık gelen değerle eşler (`"integer"` → `"number"`).
4. IF bir şema özelliğinin tipi `"array"` veya `"object"` ise, THEN THE Schema_Loader SHALL bu alanı `type: "string"` olarak ekler ve açıklama alanına `"[array]"` veya `"[object]"` etiketini yazar.
5. THE Schema_Loader SHALL şemadan türetilen alanları elle eklenen alanlardan görsel olarak ayırt eder (örneğin farklı renk veya ikon ile).

---

### Requirement 4: Fixture Listesi Görüntüleme ve Toplu Test

**User Story:** Bir entegrasyon geliştiricisi olarak, bir partner/event için tanımlı tüm fixture dosyalarını listelemek ve hepsini tek seferde çalıştırmak istiyorum; böylece eşleme kurallarımın tüm test senaryolarını karşıladığını doğrulayabileyim.

#### Kabul Kriterleri

1. THE Fixture_Runner SHALL en az 2 fixture girişini aynı anda görüntüleyebilir; her giriş bir isim, giriş JSON alanı ve beklenen çıktı JSON alanından oluşur.
2. WHEN kullanıcı "Fixture Ekle" düğmesine tıkladığında, THE Fixture_Runner SHALL listeye boş bir giriş JSON alanı ve boş bir beklenen çıktı alanı içeren yeni bir fixture satırı ekler.
3. WHEN kullanıcı bir fixture satırındaki "Dosyadan Yükle" düğmesine tıkladığında, THE Fixture_Runner SHALL tarayıcının dosya seçici diyaloğunu açar ve seçilen `.json` dosyasının içeriğini ilgili alana yükler.
4. WHEN kullanıcı "Tümünü Çalıştır" düğmesine tıkladığında, THE Fixture_Runner SHALL listedeki her fixture için mevcut eşleme kurallarını çalıştırır ve her birinin sonucunu hesaplar.
5. WHEN bir fixture için gerçek çıktı ile beklenen çıktı tam olarak eşleştiğinde, THE Fixture_Runner SHALL o satırı "Geçti ✓" olarak işaretler.
6. WHEN bir fixture için gerçek çıktı ile beklenen çıktı eşleşmediğinde, THE Fixture_Runner SHALL o satırı "Başarısız ✗" olarak işaretler ve farklı olan alanları listeler.
7. IF bir fixture için JSONata değerlendirmesi hata verirse, THEN THE Fixture_Runner SHALL o satırı "Hata ⚠" olarak işaretler ve hata mesajını görüntüler.
8. WHEN "Tümünü Çalıştır" tamamlandığında, THE Fixture_Runner SHALL özet olarak "N/M geçti" biçiminde toplam sonucu görüntüler.
9. THE Fixture_Runner SHALL bir fixture satırını listeden kaldırmak için "Sil" düğmesi sunar; silme işlemi diğer satırları etkilemez.

---

### Requirement 5: Fixture Karşılaştırma Sonuçlarının Görselleştirilmesi

**User Story:** Bir entegrasyon geliştiricisi olarak, başarısız fixture testlerinde gerçek çıktı ile beklenen çıktı arasındaki farkı görsel olarak görmek istiyorum; böylece hangi alanın yanlış dönüştürüldüğünü hızlıca tespit edebileyim.

#### Kabul Kriterleri

1. WHEN bir fixture "Başarısız ✗" durumundayken kullanıcı o satıra tıkladığında, THE Fixture_Runner SHALL gerçek çıktı ile beklenen çıktıyı yan yana görüntüler.
2. WHEN gerçek çıktı ile beklenen çıktı yan yana görüntülendiğinde, THE Fixture_Runner SHALL yalnızca farklı olan alanları vurgular; eşleşen alanlar normal renkte gösterilir.
3. THE Fixture_Runner SHALL her farklı alan için `beklenen: <değer>` ve `gerçek: <değer>` bilgisini görüntüler.
4. IF beklenen çıktı alanı boşsa, THEN THE Fixture_Runner SHALL karşılaştırma yapmaz ve yalnızca gerçek çıktıyı görüntüler.

---

### Requirement 6: Partner Config Dosyasından Fixture Listesi Yükleme

**User Story:** Bir entegrasyon geliştiricisi olarak, `config.json` dosyasını yükleyerek o partner/event için tanımlı fixture yollarını otomatik olarak Fixture Runner'a aktarmak istiyorum; böylece fixture dosyalarını tek tek eklemek zorunda kalmayayım.

#### Kabul Kriterleri

1. WHEN kullanıcı "Config Yükle" düğmesine tıkladığında, THE Fixture_Runner SHALL tarayıcının dosya seçici diyaloğunu açar ve yalnızca `.json` uzantılı dosyaların seçilmesine izin verir.
2. WHEN geçerli bir `config.json` dosyası yüklendiğinde ve dosya `fixtures` dizisi içeriyorsa, THE Fixture_Runner SHALL `fixtures` dizisindeki her yol için bir fixture satırı oluşturur ve yol adını satır ismi olarak kullanır.
3. IF yüklenen `config.json` dosyası `fixtures` alanı içermiyorsa, THEN THE Fixture_Runner SHALL "Bu config dosyasında fixture tanımı bulunamadı" bilgi mesajını görüntüler.
4. IF yüklenen dosya geçerli bir JSON belgesi değilse, THEN THE Fixture_Runner SHALL "Geçersiz config dosyası: [hata mesajı]" hata mesajını görüntüler.
5. WHEN config dosyasından fixture satırları oluşturulduğunda, THE Fixture_Runner SHALL mevcut fixture listesini temizlemez; yeni satırlar mevcut listenin sonuna eklenir.

---

### Requirement 7: Dışa Aktarılabilir JSONata İfade Önizlemesi

**User Story:** Bir entegrasyon geliştiricisi olarak, görsel eşleme kurallarından üretilen tam JSONata ifadesini kopyalamak veya dosya olarak indirmek istiyorum; böylece bu ifadeyi `inbound.vN.jsonata` dosyasına yapıştırabileyim.

#### Kabul Kriterleri

1. THE Integration_Studio SHALL tüm eşleme kurallarından birleşik bir JSONata ifadesi üretir; bu ifade her kural için `targetKey: <ifade>` biçiminde bir nesne oluşturur.
2. WHEN kullanıcı "İfadeyi Kopyala" düğmesine tıkladığında, THE Integration_Studio SHALL birleşik JSONata ifadesini sistem panosuna kopyalar.
3. WHEN kullanıcı "İfadeyi İndir" düğmesine tıkladığında, THE Integration_Studio SHALL birleşik JSONata ifadesini `mapping-preview.jsonata` adıyla tarayıcı indirme mekanizması aracılığıyla indirir.
4. WHEN bir kural `jsonataExpression` alanı doluysa, THE Integration_Studio SHALL bu ifadeyi doğrudan kullanır; görsel dönüşüm parametrelerini yok sayar.
5. THE Integration_Studio SHALL üretilen ifadeyi sözdizimi renklendirmesi olmadan düz metin olarak görüntüler; ifade 500 karakteri aşarsa kaydırılabilir bir alanda gösterilir.

---

### Requirement 8: Şema Doğrulama Hatalarının Kaynak Alanlarla İlişkilendirilmesi

**User Story:** Bir entegrasyon geliştiricisi olarak, AJV doğrulama hatalarının hangi eşleme kuralından kaynaklandığını görmek istiyorum; böylece hatayı düzeltmek için doğrudan ilgili kurala gidebileyim.

#### Kabul Kriterleri

1. WHEN AJV_Validator bir doğrulama hatası ürettiğinde ve hata `instancePath` değeri bir `targetKey` ile eşleştiğinde, THE Integration_Studio SHALL ilgili eşleme kuralı satırını hata durumunda vurgular.
2. WHEN kullanıcı vurgulanan hatalı kural satırına tıkladığında, THE Integration_Studio SHALL kural denetçisini (`Rule Inspector`) o kural için açar.
3. THE AJV_Validator SHALL her doğrulama hatasını `alan: <targetKey>, hata: <message>` biçiminde listeler.
4. IF doğrulama hatası bir `targetKey` ile eşleşmiyorsa, THEN THE AJV_Validator SHALL hatayı genel doğrulama hataları bölümünde görüntüler.

---

### Requirement 9: Mevcut Özelliklerin Korunması

**User Story:** Bir entegrasyon geliştiricisi olarak, mevcut Integration Studio özelliklerinin yeni geliştirmelerden etkilenmemesini istiyorum; böylece mevcut iş akışım kesintisiz devam etsin.

#### Kabul Kriterleri

1. THE Integration_Studio SHALL mevcut 4 adımlı sihirbaz akışını (Kaynak, Canonical, Eşleme, Doğrulama) korur; yeni özellikler bu adımların içine veya ek panel olarak entegre edilir.
2. THE Integration_Studio SHALL görsel dönüşüm kuralları tablosunu ve kural denetçisini mevcut davranışıyla korur.
3. THE Integration_Studio SHALL serbest JSONata ifade girişini ve tarayıcıda gerçek zamanlı değerlendirmeyi mevcut davranışıyla korur.
4. THE Integration_Studio SHALL mevcut tek alternatif fixture alanını Fixture Runner ile değiştirmez; Fixture Runner ayrı bir sekme veya panel olarak sunulur.
5. WHEN yeni şema yükleme veya fixture özellikleri kullanılmadığında, THE Integration_Studio SHALL mevcut demo verisiyle tam işlevsel olarak çalışmaya devam eder.
