# API Guvenligi Eksik Analizi

Tarih: 2026-05-18

Kapsam: `services/mapping-studio-api`, UI'nin API kullanim sekli, mevcut Docker/demo konfigurasyonu ve tenant izolasyonu.

## Bu Calismada Kapatilanlar

- `tenants` tablosu eklendi ve mevcut tek tenant `tenant-acme` bu tabloya tasindi.
- `tenants` tablosuna singleton index eklendi; veritabaninda ikinci tenant satiri acilmasi engellendi.
- Tum tenant-scoped tablolarin `tenant_id` kolonlari `tenants(id)` foreign key'i ile baglandi.
- Cocuk kayitlarda cross-tenant referans riskini azaltmak icin mapping, partner, credential ve log iliskilerine composite tenant foreign key'leri eklendi.
- `X-Tenant-Id` bos geldiginde tek tenant olarak `tenant-acme` enjekte eden, farkli tenant denenirse 403 donduren `SingleTenantContextFilter` eklendi.

## Kritik Eksikler

| Oncelik | Alan | Bulgu | Risk | Onerilen aksiyon |
| --- | --- | --- | --- | --- |
| P0 | Runtime proxy auth | `ApiAuthenticationFilter` su an `api/proxy/` path'lerini auth bypass ediyor. | Mapping proxy endpointleri tenant header bilen herhangi bir istemciden tetiklenebilir. | Proxy endpointlerini de API key/JWT veya mapping-level inbound credential ile koru. Public webhook gibi gercekten acik endpointleri ayri path ve imza dogrulama ile ayir. |
| P0 | JWT | `JwtService` base64 formatinda imzasiz/ev yapimi token uretiyor; `SECRET` sabiti kullanilmiyor. | Token icerigi degistirilebilir, roller/tenant taklit edilebilir. | SmallRye JWT/OIDC dogrulamasina gec; HS256 kullanilacaksa HMAC imza zorunlu olsun, tercihen RS256/JWKS. |
| P0 | Prod secret defaults | `JWT_SECRET_KEY`, credential encryption key ve `dev-api-key` defaultlari production'da calisir durumda. | Zayif varsayilanlarla deployment acilabilir. | Production profile'da bu degerler bos/default ise startup fail etsin. Secretlari env/secret manager uzerinden zorunlu kil. |
| P1 | RBAC | SecurityContext role tasiyor ama resource metodlarinda `@RolesAllowed` yok. | Authenticated her kullanici admin yuzeylerine erisebilir. | Admin/editor/viewer permission matrisini resource metodlarina uygula. |
| P1 | Rate limit | `canonbridge.ratelimit.enabled=false` default. Proxy endpointleri de rate limitten muaf. | Brute force, proxy abuse ve maliyetli outbound cagri riski. | Production'da default true yap; proxy icin mapping/API-key bazli limit uygula. |
| P1 | Swagger/OpenAPI | Swagger UI her ortamda include ediliyor ve auth bypass listesinde. | Prod API yuzeyi kolayca kesfedilir. | Prod'da swagger kapali olsun veya admin auth arkasina alinsin. |
| P1 | Tenant kaynagi | Bir cok resource `@HeaderParam("X-Tenant-Id")` okuyor. Yeni filter tek tenant icin normalize ediyor, fakat uzun vadede tenant request header'dan degil token/context'ten gelmeli. | Multi-tenant'a donuste header spoofing riski geri gelir. | Tenant okumasini merkezi `TenantContext` servisine tasi; resource'lar header okumayi biraksin. |
| P2 | CORS | Default originler localhost icin dogru, ancak production'da env verilmezse dev originleri acik kalir. | Yanlis prod konfigunde tarayici tabanli kotuye kullanim yuzeyi buyur. | Prod profile'da `CORS_ALLOWED_ORIGINS` zorunlu olsun; wildcard kabul edilmesin. |
| P2 | Request body limit | Uygulama configinde Quarkus HTTP body limitleri gorunmuyor. | Buyuk payload ile memory/CPU baskisi. | `quarkus.http.limits.max-body-size` ve endpoint bazli payload limitleri ekle. |
| P2 | Audit coverage | Basarili/hatali kritik security olaylari tam auditlenmiyor: auth failure, tenant mismatch, credential rotation failure. | Olay sonrasi inceleme eksik kalir. | Security filter ve credential islemlerine audit event ekle. |

## Tavsiye Edilen Siralama

1. P0: Proxy auth bypass'i kapat, gercek JWT/OIDC dogrulamasina gec, production secret defaultlarini fail-closed yap.
2. P1: RBAC annotationlarini ve proxy rate limiting'i ekle.
3. P1/P2: Swagger, CORS ve body limitlerini production profile'a bagla.
4. P2: TenantContext refactor'u ve audit coverage iyilestirmeleri.

## Notlar

- Sistem su an single-tenant olarak kilitlendi; `tenant-acme` disindaki tenant denemeleri API katmaninda 403, DB katmaninda FK/singleton constraint ile reddedilir.
- Veritabanindaki eski `tenant-demo` verileri daha once `V24` ve `V28` ile `tenant-acme` altinda birlestirilmis. `V37` bunu tenant tablosu ve foreign key'lerle kalici hale getirir.
