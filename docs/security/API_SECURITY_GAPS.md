# API Guvenligi Eksik Analizi

Tarih: 2026-05-19

Kapsam: `services/mapping-studio-api`, UI'nin API kullanim sekli, mevcut Docker/demo konfigurasyonu ve tenant izolasyonu.

## Bu Calismada Kapatilanlar

- `tenants` tablosu eklendi ve mevcut tek tenant `tenant-acme` bu tabloya tasindi.
- `tenants` tablosuna singleton index eklendi; veritabaninda ikinci tenant satiri acilmasi engellendi.
- Tum tenant-scoped tablolarin `tenant_id` kolonlari `tenants(id)` foreign key'i ile baglandi.
- Cocuk kayitlarda cross-tenant referans riskini azaltmak icin mapping, partner, credential ve log iliskilerine composite tenant foreign key'leri eklendi.
- `X-Tenant-Id` bos geldiginde tek tenant olarak `tenant-acme` enjekte eden, farkli tenant denenirse 403 donduren `SingleTenantContextFilter` eklendi.
- Tenant id dogrulamasi resource'lara dagitilmis manuel header kontrollerinden merkezi `TenantContext` servisine tasindi; bos tenant single-tenant modda `tenant-acme` olarak normalize ediliyor, farkli tenant 403 aliyor.
- Runtime proxy endpointleri artik genel auth bypass listesinde degil; JWT veya API key gerektiriyor.
- Login token'i imzasiz base64 yerine HS256 imzali compact JWT formatina tasindi.
- Production ortaminda default API key, default JWT secret, default credential encryption key, localhost/wildcard CORS ve public docs ile startup fail-fast yapacak validator eklendi.
- RBAC filter eklendi; admin, integration_author, operator ve viewer rolleri endpoint/method bazinda ayrildi.
- Rate limit filter tekrar aktif hale getirildi; proxy endpointleri de rate limit kapsaminda. Filter request basina DB lookup yapmiyor ve API key client id'leri hash fingerprint ile tutuluyor.
- Swagger/OpenAPI public docs default kapali hale getirildi, sadece dev/test profillerinde acik.
- HTTP request body limiti `HTTP_MAX_BODY_SIZE` ile default `1M` olarak tanimlandi.
- Auth failure, tenant mismatch, RBAC denial ve credential create/disable/rotate failure olaylari audit log'a failure olarak yaziliyor.

## Kapatilan Kritik Eksikler

| Oncelik | Alan | Durum |
| --- | --- | --- |
| P0 | Runtime proxy auth | Kapandi. `api/proxy/` artik auth filter bypass listesinde degil. |
| P0 | JWT | Kapandi. Login tokenlari HS256 imzali JWT olarak uretilip signature/issuer/expiry ile dogrulaniyor. |
| P0 | Prod secret defaults | Kapandi. Production environment'ta insecure defaultlar startup'i durduruyor. |
| P1 | RBAC | Kapandi. Merkezi `RoleAuthorizationFilter` admin/author/operator/viewer ayrimini uyguluyor. |
| P1 | Rate limit | Kapandi. Filter provider olarak aktif ve proxy endpointleri de limitleniyor. |
| P1 | Swagger/OpenAPI | Kapandi. Public docs default kapali; dev/test disinda env ile bilincli acilmasi gerekiyor. |
| P1 | Tenant kaynagi | Kapandi. DB singleton constraint, request filter ve merkezi `TenantContext` ayni `tenant-acme` kaynagini kullaniyor. |
| P2 | CORS | Kapandi. Production validator wildcard/localhost/bos origin konfigurasyonunu reddediyor. |
| P2 | Request body limit | Kapandi. Default body limit `1M`; `HTTP_MAX_BODY_SIZE` ile degistirilebilir. |
| P2 | Audit coverage | Kapandi. Auth failure, tenant denial, RBAC denial ve credential mutation failure event'leri audit event'i olarak kaydediliyor. |

## Kalan Bilincli Backlog

- OIDC/JWKS entegrasyonu halen opsiyonel. Lokal login tokenlari HS256 ile guvenli hale geldi; enterprise ortam icin RS256/JWKS/OIDC zorunlu hale getirilebilir.
- Multi-tenant mode tekrar acilacaksa `TenantContext` davranisi explicit tenant membership/authorization kontroluyle genisletilmeli; mevcut hedef bilerek tek tenant.
- Enterprise SSO gereksinimi cikarsa HS256 lokal token yerine RS256/JWKS/OIDC dogrulamasina gecis planlanmali.

## Notlar

- Sistem su an single-tenant olarak kilitlendi; `tenant-acme` disindaki tenant denemeleri API katmaninda 403, DB katmaninda FK/singleton constraint ile reddedilir.
- Veritabanindaki eski `tenant-demo` verileri daha once `V24` ve `V28` ile `tenant-acme` altinda birlestirilmis. `V37` bunu tenant tablosu ve foreign key'lerle kalici hale getirir.
