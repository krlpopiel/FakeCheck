# 🔍 FakeCheck — Wtyczka do weryfikacji informacji

> Nakładka przeglądarkowa pomagająca w debunkingu fake newsów, krok po kroku.

---

## 📋 Spis treści

- [O projekcie](#o-projekcie)
- [Funkcje](#funkcje)
- [Struktura projektu](#struktura-projektu)
- [Instalacja](#instalacja)
- [Jak używać](#jak-używać)
- [System oceny — buźka](#system-oceny--buźka)
- [Kroki weryfikacji](#kroki-weryfikacji)
- [Persystencja danych](#persystencja-danych)
- [Technologie](#technologie)
- [Zasoby i metodologia](#zasoby-i-metodologia)
- [Licencja](#licencja)

---

## O projekcie

**FakeCheck** to wtyczka do przeglądarki Chrome (Manifest V3), która wyświetla interaktywną nakładkę nad każdą stroną internetową. Pomaga użytkownikom przeprowadzić rzetelną weryfikację informacji zgodnie z uznawanymi metodologiami fact-checkingowymi, takimi jak **SIFT** i standardy [Nauki Sprawdza / UW](https://naukasprawdza.uw.edu.pl/).

Nakładka prowadzi użytkownika przez 6 kroków weryfikacji, a w prawym dolnym rogu ekranu wyświetla **animowaną buźkę**, która zmienia wyraz twarzy i kolor w zależności od liczby ukończonych kroków — od czerwonej smutnej `:(` do zielonej uśmiechniętej `:)`.

---

## Funkcje

- **Overlay jako Shadow DOM** — izolowany od stylów każdej strony, działa wszędzie
- **6 kroków weryfikacji** z rozwijanymi opisami (accordion)
- **Buźka PNG** w prawym dolnym rogu — dynamicznie zmienia się w czasie rzeczywistym
- **System oceny 0–6** z trzema stanami wizualnymi
- **Persystencja stanu per URL** — checkboxy pamiętają stan po odświeżeniu
- **Linki do metodologii** — Nauka Sprawdza UW (SIFT, 4 Metody)
- **Pasek postępu** wizualizujący aktualny wynik
- **Reset stanu** dla bieżącej strony
- **Zero zależności zewnętrznych** — czysty Vanilla JS
- **Działa offline** — nie wymaga połączenia z internetem

---

## Struktura projektu

```
fakecheck-extension/
│
├── manifest.json              # Konfiguracja wtyczki (Manifest V3)
├── background.js              # Service worker — obsługa zdarzeń
├── content.js                 # Wstrzykiwanie overlaya do strony
│
├── overlay/
│   ├── overlay.html           # Struktura nakładki (Shadow DOM)
│   ├── overlay.css            # Style nakładki
│   └── overlay.js             # Logika checkboxów, accordion, buźki
│
├── faces/
│   ├── face_sad.png           # Czerwona smutna buźka (wynik 0–2)
│   ├── face_neutral.png       # Żółta obojętna buźka (wynik 3–4)
│   └── face_happy.png         # Zielona uśmiechnięta buźka (wynik 5–6)
│
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Instalacja

### Wymagania

- Przeglądarka **Google Chrome** w wersji 88 lub nowszej (obsługa Manifest V3)
- Opcjonalnie: Microsoft Edge, Brave lub inny browser oparty na Chromium

### Krok po kroku

1. **Pobierz lub sklonuj repozytorium:**

   ```bash
   git clone https://github.com/twoj-nick/fakecheck-extension.git
   cd fakecheck-extension
   ```

2. **Otwórz Chrome i przejdź do menedżera rozszerzeń:**

   ```
   chrome://extensions/
   ```

3. **Włącz tryb dewelopera** — przełącznik w prawym górnym rogu strony.

4. **Kliknij "Załaduj rozpakowane"** i wskaż folder `fakecheck-extension/`.

5. **Gotowe!** Ikona FakeCheck pojawi się w pasku narzędzi przeglądarki.

> 💡 Jeśli ikona nie jest widoczna, kliknij ikonę puzzla 🧩 w pasku Chrome i przypnij FakeCheck.

---

## Jak używać

1. **Wejdź na dowolną stronę internetową**, którą chcesz zweryfikować.

2. **Kliknij ikonę FakeCheck** w pasku narzędzi **lub** kliknij **buźkę** widoczną w prawym dolnym rogu ekranu.

3. **Overlay wysunie się** z prawej strony — zobaczysz listę 6 kroków weryfikacji.

4. **Kliknij `▼`** przy dowolnym kroku, aby rozwinąć szczegółowy opis, jak go wykonać.

5. **Zaznaczaj checkboxy** kolejnych kroków w miarę ich realizacji.

6. **Obserwuj buźkę** — zmienia się dynamicznie wraz z Twoim postępem.

7. Po weryfikacji możesz **zresetować stan** przyciskiem na dole overlaya.

---

## System oceny — buźka

Buźka w prawym dolnym rogu to wizualny wskaźnik postępu weryfikacji. Zmienia się automatycznie po każdym zaznaczeniu lub odznaczeniu checkboxa.

| Wynik | Buźka | Kolor | Znaczenie |
|-------|-------|-------|-----------|
| 0 – 2 | 😞 `face_sad.png` | 🔴 Czerwony `#e74c3c` | Weryfikacja niepełna — zachowaj ostrożność |
| 3 – 4 | 😐 `face_neutral.png` | 🟡 Żółty `#f39c12` | Częściowo zweryfikowano — sprawdź dalej |
| 5 – 6 | 😊 `face_happy.png` | 🟢 Zielony `#27ae60` | Weryfikacja kompletna — informacja sprawdzona |

> Buźka posiada pulsujący cień w kolorze odpowiadającym aktualnemu stanowi. Po zaznaczeniu wszystkich 6 kroków wyświetlana jest animacja potwierdzająca.

---

## Kroki weryfikacji

Wtyczka prowadzi przez 6 kluczowych kroków rzetelnej weryfikacji informacji:

| # | Krok | Co sprawdzasz? |
|---|------|----------------|
| 1 | **Zidentyfikuj konkretne twierdzenia** | Co dokładnie jest twierdzone? Kto, kiedy, gdzie? |
| 2 | **Znajdź pierwotne źródło** | Skąd pochodzi informacja? Czy to cytat z drugiej ręki? |
| 3 | **Oceń wiarygodność źródła** | Kto za nim stoi? Jakie ma intencje i historię rzetelności? |
| 4 | **Szukaj potwierdzenia w innych źródłach** | Fact Check Tools API, Google Dorks, niezależne redakcje |
| 5 | **Skonsultuj się z ekspertami** | Co mówią naukowcy, instytucje, organizacje branżowe? |
| 6 | **Oceń kontekst publikacji** | Dlaczego teraz? Czy zdjęcia/wideo nie są wyrwane z kontekstu? |

Każdy krok zawiera rozwijany panel z konkretnym przewodnikiem jak go przeprowadzić, w tym wskazówki dotyczące narzędzi takich jak **Google Fact Check Tools** i technik **Google Dorks**.

---

## Persystencja danych

Stan checkboxów jest zapisywany lokalnie w `chrome.storage.local` w powiązaniu z URL bieżącej strony.

- ✅ Po odświeżeniu strony — checkboxy pamiętają stan
- ✅ Po powrocie na tę samą stronę — stan zostaje przywrócony
- ✅ Każda strona ma **niezależny** stan weryfikacji
- 🔄 Przycisk **"Resetuj"** w stopce overlaya czyści dane dla bieżącego URL

Dane przechowywane są wyłącznie lokalnie na urządzeniu użytkownika. Wtyczka nie wysyła żadnych danych na zewnętrzne serwery.

---

## Technologie

| Technologia | Zastosowanie |
|-------------|--------------|
| **JavaScript (Vanilla)** | Cała logika wtyczki — zero frameworków |
| **Shadow DOM** | Izolacja CSS overlaya od stylów strony |
| **Chrome Extensions API (MV3)** | Manifest V3, service worker, `chrome.storage` |
| **CSS Transitions** | Płynne animacje buźki, accordion, slide-in |
| **chrome.storage.local** | Persystencja stanu per URL |

---

## Zasoby i metodologia

FakeCheck opiera się na metodologii weryfikacji opracowanej przez badaczy i organizacje fact-checkingowe:

### 📚 Nauka Sprawdza — Uniwersytet Warszawski

- [**Vademecum weryfikacji — 4 Metody**](https://naukasprawdza.uw.edu.pl/vademecum/#4Metody)
  Kompleksowy przewodnik po metodach weryfikacji informacji w internecie.

- [**Metoda SIFT**](https://naukasprawdza.uw.edu.pl/vademecum/#MetodySIFT)
  **S**top → **I**nvestigate the source → **F**ind better coverage → **T**race claims
  Szybka, skuteczna metoda oceny wiarygodności źródeł.

### 🔧 Narzędzia zewnętrzne (linki w overlay)

- [Google Fact Check Tools Explorer](https://toolbox.google.com/factcheck/explorer) — baza zweryfikowanych twierdzeń
- Techniki **Google Dorks** — zaawansowane zapytania wyszukiwarkowe do weryfikacji

---

## Licencja

Ten projekt jest udostępniony na licencji **MIT**.

```
MIT License — możesz używać, kopiować, modyfikować i dystrybuować
ten projekt, pod warunkiem zachowania informacji o autorze.
```

---

<div align="center">

Zbudowane z myślą o walce z dezinformacją 🛡️

**[⬆ Powrót na górę](#-fakecheck--wtyczka-do-weryfikacji-informacji)**

</div>
