# Sosyal Ag Analizi - Sinav Calisma Paketi (Ilk 4 Unite)

Bu paket, hocanin verdigi sinav dagilimina gore hazirlandi:
- Toplam 15 soru
- Yaklasik 5 hesaplama + 10 kavramsal
- Kapsam: Unites 1-4

---

## 1) Tek Sayfalik Hesaplama Formul Fisi (Unite 2-3-4)

### A) Baglanti sayisi ve yogunluk
- **Maksimum baglanti (yonlu):** `Lmax = N(N-1)`
- **Maksimum baglanti (yonsuz):** `Lmax = N(N-1)/2`
- **Yogunluk (yonlu):** `D = L / [N(N-1)]`
- **Yogunluk (yonsuz):** `D = L / [N(N-1)/2]`

### B) Derece ve ortalama derece
- **Yonsuz agda ortalama derece:** `<k> = 2L/N`
- **Yonlu agda ortalama derece:** `<k> = L/N`
- **Yonlu agda bir dugum:** `k_toplam = k_gelen + k_giden`

### C) Derece dagilimi
- **Genel:** `p(k) = Nk / N`
  - `Nk`: k dereceye sahip dugum sayisi
  - `N`: toplam dugum sayisi

### D) Komsuluk matrisi ozet
- Baglanti varsa `Aij = 1`, yoksa `Aij = 0` (tartili aglarda 1 yerine agirlik yazilir)
- **Yonsuz ag:** matris simetrik (`Aij = Aji`)
- **Yonlu ag:** simetrik olmak zorunda degil

### E) Patika, jeodezik uzaklik, yaricap
- **En kisa patika / jeodezik uzaklik:** `dij`
- **Ortalama patika (yonsuz):** `<d> = [2 / N(N-1)] * Sum(dij)` (i<j)
- **Ortalama patika (yonlu):** `<d> = [1 / N(N-1)] * Sum(dij)` (i!=j)
- **Yaricap (diameter):** agdaki en buyuk jeodezik uzaklik

### F) Kumelenme katsayisi (Unite 3)
- **Yerel katsayi:** `Ci = 2Li / [ki(ki-1)]`
  - `ki`: i dugumunun komsu sayisi


  - `Li`: i dugumunun komsulari arasindaki baglanti sayisi
- **Ortalama kumelenme:** `<C> = (1/N) * Sum(Ci)`

### G) Rassal ag ve olasilik (Unite 3)
- `p = z/(N-1) ~ z/N` (buyuk N'de)
- Rassal ag derece dagilimi buyuk agda Poisson'a yaklasir

### H) Olcekten bagimsizlik ve kuvvet yasasi (Unite 4)
- **Kuvvet yasasi:** `P(x) ~ x^-alpha`
- **Log donusum:** `ln P(x) = -alpha ln x + sabit`
- **Tercihli baglanti olasiligi:** `P(ki) = ki / Sum(ki)`

---

## 2) Hesaplama Pratik Seti (12 Kisa Soru + Cevap)

### Soru 1
`N=8` yonlu ag icin `Lmax`?
- **Cozum:** `Lmax = 8*7 = 56`
- **Cevap:** `56`

### Soru 2
`N=8` yonsuz ag icin `Lmax`?
- **Cozum:** `Lmax = 8*7/2 = 28`
- **Cevap:** `28`


 
### Soru 3
Yonsuz agda `N=10, L=18`. Ortalama derece?
- **Cozum:** `<k> = 2L/N = 36/10 = 3.6`
- **Cevap:** `3.6`

### Soru 4
Yonlu agda `N=25, L=100`. Ortalama derece?
- **Cozum:** `<k> = L/N = 100/25 = 4`
- **Cevap:** `4`

### Soru 5
Yonlu agda `N=6, L=18`. Yogunluk?
- **Cozum:** `D = 18/[6*5] = 18/30 = 0.60`
- **Cevap:** `0.60`

### Soru 6
Yonsuz agda `N=7, L=12`. Yogunluk?
- **Cozum:** `D = 12 / [7*6/2] = 12/21 = 0.571`
- **Cevap:** `0.571`

### Soru 7
Toplam `N=20` dugumlu agda `k=3` dereceye sahip `Nk=5` dugum var. `p(3)`?
- **Cozum:** `p(3)=Nk/N=5/20=0.25`
- **Cevap:** `0.25`

### Soru 8
Bir dugumun gelen derecesi `3`, giden derecesi `5`. Toplam derece?
- **Cozum:** `k=3+5=8`
- **Cevap:** `8`

### Soru 9
Yonsuz agda `N=5`, dugum ciftleri arasi en kisa patikalar toplami `16`. Ortalama patika?
- **Cozum:** `<d> = [2/(5*4)]*16 = (2/20)*16 = 1.6`
- **Cevap:** `1.6`

### Soru 10
Bir dugum icin `ki=5`, komsular arasi baglanti sayisi `Li=6`. `Ci`?
- **Cozum:** `Ci = 2*6 / [5*4] = 12/20 = 0.6`
- **Cevap:** `0.6`

### Soru 11
Bes dugum icin `Ci` degerleri: `0.5, 1.0, 0.25, 0.75, 0.5`. Ortalama kumelenme?
- **Cozum:** `<C> = (0.5+1+0.25+0.75+0.5)/5 = 3/5 = 0.6`
- **Cevap:** `0.6`

### Soru 12
Tercihli baglanti: dugum dereceleri `[2, 3, 5, 10]`. 10 dereceli dugume baglanma olasiligi?
- **Cozum:** Toplam derece = `20`, `P=10/20=0.5`
- **Cevap:** `0.5`

---

## 3) Kavramsal Hizli Tekrar Listesi (40 Madde)

1. Ag = dugumler + baglantilar.
2. Cizge, agin gosterimidir; agdan daha genis kavram degildir.
3. Karmasik sistemlerin temel ozellikleri: buyukluk, cok boyutluluk, kolay tanimlanamazlik, kestirilemezlik.
4. Sosyal aglarda dugumler aktor olabilir.
5. Yonlu agda ok vardir, yonu bellidir.
6. Yonsuz agda baglantinin yonu yoktur.
7. Tartili agda baglantilarin gucu/agirligi farklidir.
8. Tartisiz agda baglantilar esit degerli kabul edilir.
9. Uclu kapanma: ortak arkadasi olanlarin bag kurma olasiligi artar.
10. Derece = bir dugumun komsu sayisi.
11. Yonlu agda gelen ve giden derece ayri dusunulur.
12. Yuksek dereceli dugumler merkez dugum (hub) olabilir.
13. Derece dagilimi, agin yapisal imzasidir.
14. Komsuluk matrisi agi tablo olarak temsil eder.
15. Yonsuz ag matrisi simetriktir.
16. Gercek aglarin cogu seyrektir (L, Lmax'ten cok kucuk).
17. Tek parcali ag: tek tip dugum.
18. Iki parcali ag: iki tip dugum (musteri-urun gibi).
19. Patika: baglanti dizisi.
20. En kisa patika: iki dugum arasi minimum sicrama.
21. Ortalama patika, tum dugum ciftleri arasinda ortalama en kisa mesafedir.
22. Jeodezik uzaklik, en kisa patika uzunlugudur.
23. Yaricap, agdaki en buyuk jeodezik uzakliktir.
24. Rassal ag Erdös-Renyi modeline dayanir.
25. Rassal agda baglar sabit olasilikla olusur.
26. Rassal ag derece dagilimi buyuk N'de Poisson'a yaklasir.
27. Alti adim hipotezi: insanlar arasi mesafe az adimlidir.
28. Kucuk dunya aglari: kisa global patika + yuksek yerel kumelenme.
29. Siniflayici ag: benzer derece dugumler birbirine baglanir.
30. Siniflayici olmayan ag: yuksek derece, dusuk dereceye baglanmaya meyilli.
31. Sosyal aglar genelde siniflayici yapidadir.
32. Teknolojik/biyolojik aglar siklikla siniflayici olmayan yapidadir.
33. Merkez dugumler hedef alininca bazi aglar kirilgan hale gelir.
34. Internet yapisi rassal degil, merkez dugumlu yapidadir.
35. Olcekten bagimsiz aglarda az sayida dugum cok baglanti alir.
36. Tercihli baglanti: yeni dugum, populer dugume baglanma egilimindedir.
37. Kuvvet yasasi dagilimlari kalin kuyrukludur.
38. `alpha` buyudukce kuyruk incelir.
39. Aglar buyudukce dev bilesen olusabilir.
40. Dinamik aglarda yaricap zamanla azalip dengelenebilir.

---

## 4) Unte Sonu Testlerden Secili Soru Analizi (Ilk 4 Unite)

Asagidaki secim, PDF'deki "Kendimizi Sinayalim" sorularindan alinmistir.
Her soru icin: **dogru secenek** + **yanlis yaptiysan bakilacak konu**.

### Unite 1
- "Cizgeleri aglarin ... olarak dusunebiliriz."  
  - **Dogru:** `c) iskeletleri`
  - **Yanlissa:** Ag-cizge farkini tekrar et.
- "N ve L bir agdaki ... ve ... sayilarini gosterir."  
  - **Dogru:** `c) dugum - toplam baglanti`
  - **Yanlissa:** N, L, ag buyuklugu sembollerini tekrar et.
- "Kucuk dunya hipotezini ortaya koyan arastirmaci?"  
  - **Dogru:** `d) Stanley Milgram`
  - **Yanlissa:** Ag bilimi tarihini tekrar et.

### Unite 2
- "Ok varsa ag nasildir?"  
  - **Dogru:** `a) yonlu`
  - **Yanlissa:** Yonlu/yonsuz cizim yorumunu tekrar et.
- "Ortak arkadas nedeniyle bag olusmasi?"  
  - **Dogru:** `e) uclu kapanma`
  - **Yanlissa:** Ikili-uclu baglanti ve triad mantigini tekrar et.
- "N=5 icin maksimum baglanti sayisi?"  
  - **Dogru:** `a) 10`
  - **Yanlissa:** `N(N-1)/2` formulunu tekrar et.
- "Tum ciftler icin en kisa patikalarin ortalamasi?"  
  - **Dogru:** `a) ortalama patika uzunlugu`
  - **Yanlissa:** Patika-jeodezik-ortalama ayrimini tekrar et.

### Unite 3
- "Sabit olasilikla baglanan model?"  
  - **Dogru:** `b) rassal ag`
  - **Yanlissa:** Erdös-Renyi mantigini tekrar et.
- "Rassal ag derece dagilimi buyuk agda neye yaklasir?"  
  - **Dogru:** `d) Poisson`
  - **Yanlissa:** Binom -> Poisson gecisini tekrar et.
- "Kisa patika + yuksek kumelenme hangi ag?"  
  - **Dogru:** `c) kucuk dunya`
  - **Yanlissa:** Kucuk dunya kriterini tekrar et.
- "Milgram deneyini internette tekrar eden?"  
  - **Dogru:** `c) Duncan Watts`
  - **Yanlissa:** Alti adim hipotezi notlarini tekrar et.

### Unite 4
- "Aglar buyurken dugumler ... baglanti yapar."  
  - **Dogru:** `c) tercihli baglanti`
  - **Yanlissa:** Preferential attachment mantigini tekrar et.
- "Kuvvet yasasi genel bicimi?"  
  - **Dogru:** `b) P(x) ~ x^-alpha`
  - **Yanlissa:** Kuvvet yasasi formunu ezberle.
- "Yaricap nedir?"  
  - **Dogru:** `a) herhangi iki dugum arasindaki maksimum uzaklik`
  - **Yanlissa:** Yaricap-jeodezik tanimlarini tekrar et.
- "Etkin yaricap hangi persantil?"  
  - **Dogru:** `d) 90`
  - **Yanlissa:** Persantil ve etkin yaricap notuna geri don.

### Hizli Yanlis Analizi Sablonu
Her yanlis icin 3 adim:
1. **Neden yanlis yaptim?** (kavram karisimi / formul unutma / islem hatasi)
2. **Hangi konuya ait?** (Unite + alt baslik)
3. **Kapatma hareketi:** 1 benzer soru daha cozumlu coz.

---

## 5) Sinav Oncesi Mini Deneme (15 Soru)

Dagilim: 5 hesaplama + 10 kavramsal

### A) Hesaplama (1-5)
1. Yonsuz agda `N=9` icin `Lmax` kac?
2. Yonlu agda `N=12, L=48` ise `<k>` kac?
3. Yonlu agda `N=10, L=30` ise yogunluk kac?
4. Bir dugum icin `ki=4`, komsular arasi baglanti `Li=3`. `Ci` kac?
5. Derece listesi `[1,2,2,3,4,4,4,5]` icin `p(4)` kac?

### B) Kavramsal (6-15)
6. Yonlu ve yonsuz ag arasindaki temel fark nedir?
7. Uclu kapanma neyi aciklar?
8. Rassal aglarin derece dagilimi buyuk N'de hangi dagilima yaklasir?
9. Kucuk dunya aginin iki temel ozelligi nedir?
10. Siniflayici ve siniflayici olmayan ag farki nedir?
11. Tercihli baglanti ne demektir?
12. Olcekten bagimsiz agda merkez dugumler neden olusur?
13. Kuvvet yasasi grafikleri neden log-log duzlemde incelenir?
14. Yaricap ile etkin yaricap farki nedir?
15. Gercek aglarda "seyreklik" ne demektir?

### Mini Deneme Cevap Anahtari
1) `36`  
2) `4` (`48/12`)  
3) `30/90 = 0.333`  
4) `2*3/(4*3)=0.5`  
5) `3/8 = 0.375`  
6) Yonlu agda yon var, yonsuzda yok.  
7) Ortak baglarin yeni bag olusturma egilimini aciklar.  
8) Poisson.  
9) Kisa ortalama patika + yuksek kumelenme.  
10) Benzer derece-benzer derece baglanmasi vs yuksek-dusuk derece baglanmasi.  
11) Yeni dugumlerin yuksek dereceli dugume baglanma egilimi.  
12) "Zenginin daha zengin olmasi" mekanizmasi.  
13) Kuvvet yasasi iliskisi log-logda dogrusal gorunur.  
14) Yaricap max uzaklik; etkin yaricap uzaklik dagiliminin 90. persantili.  
15) Gercek bag sayisinin maksimum olasi bag sayisina gore cok kucuk olmasi.

---

## Son Kullanim Onerisi (Kisa)
- Once formul fisini 20-30 dk ezber + 6 hizli hesaplama.
- Sonra kavramsal 40 maddeyi sesli tekrar.
- Ardindan secili test analizi.
- En son mini denemeyi sure tutarak coz (25-30 dk).

