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
- **Tryb Jasny i Ciemny** — dynamiczny przełącznik motywu z automatycznym wykrywaniem preferencji systemowych
- **6 kroków weryfikacji** z rozwijanymi opisami (accordion)
- **Buźka PNG** w prawym dolnym rogu — dynamicznie zmienia się w czasie rzeczywistym
- **System oceny 0–6** z trzema stanami wizualnymi
- **Persystencja stanu per URL** — checkboxy pamiętają stan po odświeżeniu
- **Persystencja motywu** — wtyczka zapamiętuje wybrany tryb (jasny/ciemny)
- **Linki do metodologii** — Nauka Sprawdza UW (SIFT, 4 Metody)
- **Pasek postępu** wizualizujący aktualny wynik
- **Reset stanu** dla bieżącej strony
- **Zero zależności zewnętrznych** — czysty Vanilla JS
- **Działa offline** — nie wymaga połączenia z internetem (poza linkami zewnętrznymi)

---

## Struktura projektu

```
fakecheck-extension/
│
├── manifest.json              # Konfiguracja wtyczki (Manifest V3)
├── background.js              # Service worker — obsługa zdarzeń (np. skrót klawiszowy)
├── content.js                 # Główna logika — wstrzykiwanie Shadow DOM, obsługa UI i stanu
├── overlay.css                # Zaawansowane style (zmienne CSS dla motywów, animacje)
│
├── faces/                     # Dynamiczne wskaźniki postępu
│   ├── face_sad.PNG           # Czerwona smutna buźka (wynik 0–2)
│   ├── face_neutral.PNG       # Żółta obojętna buźka (wynik 3–4)
│   └── face_happy.PNG         # Zielona uśmiechnięta buźka (wynik 5–6)
│
├── logo/                      # Branding dostosowany do motywów
│   ├── logo_blue.PNG          # Logo dla trybu jasnego
│   └── logo_white.PNG         # Logo dla trybu ciemnego
│
└── icons/                     # Ikony rozszerzenia
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

4. **Kliknij `▼`** lub **tytuł kroku**, aby rozwinąć szczegółowy opis, jak go wykonać.

5. **Zaznaczaj checkboxy** kolejnych kroków w miarę ich realizacji.

6. **Obserwuj buźkę** — zmienia się dynamicznie wraz z Twoim postępem.

7. **Zmień motyw** — użyj przełącznika ☀️/🌙 w stopce panelu, aby dostosować wygląd do swoich preferencji.

---

## System oceny — buźka

Buźka w prawym dolnym rogu to wizualny wskaźnik postępu weryfikacji. Zmienia się automatycznie po każdym zaznaczeniu lub odznaczeniu checkboxa.

| Wynik | Buźka | Kolor | Znaczenie |
|-------|-------|-------|-----------|
| 0 – 2 | 😞 `face_sad.PNG` | 🔴 Czerwony | Weryfikacja niepełna — zachowaj ostrożność |
| 3 – 4 | 😐 `face_neutral.PNG` | 🟡 Żółty | Częściowo zweryfikowano — sprawdź dalej |
| 5 – 6 | 😊 `face_happy.PNG` | 🟢 Zielony | Weryfikacja kompletna — informacja sprawdzona |

> Buźka posiada pulsujący cień w kolorze odpowiadającym aktualnemu stanowi. Po zaznaczeniu wszystkich 6 kroków wyświetlana jest animacja "celebracji" i konfetti.

---

## Kroki weryfikacji

Wtyczka prowadzi przez 6 kluczowych kroków rzetelnej weryfikacji informacji:

| # | Krok | Co sprawdzasz? |
|---|------|----------------|
| 1 | **Zidentyfikuj twierdzenia** | Co dokładnie jest twierdzone? Kto, kiedy, gdzie? Oddziel fakty od opinii. |
| 2 | **Znajdź pierwotne źródło** | Skąd pochodzi informacja? Czy to cytat z drugiej ręki? Cofnij się do źródła. |
| 3 | **Oceń wiarygodność źródła** | Kto za nim stoi? Intencje, historia rzetelności. Metoda **SIFT**. |
| 4 | **Szukaj potwierdzenia** | Inne niezależne źródła, Fact Check Tools API, Google Dorks. |
| 5 | **Skonsultuj się z ekspertami** | Co mówią naukowcy, instytucje, organizacje branżowe? |
| 6 | **Oceń kontekst** | Dlaczego teraz? Czy zdjęcia nie są wyrwane z kontekstu? Emocjonalność przekazu. |

Każdy krok zawiera rozwijany panel z konkretnym przewodnikiem jak go przeprowadzić.

---

## Persystencja danych

Wtyczka dba o Twoją wygodę, zapamiętując stan pracy:

- **Stan weryfikacji:** Zapisywany w `chrome.storage.local` per URL. Po powrocie na stronę Twoje postępy są przywracane.
- **Wybrany motyw:** Rozszerzenie pamięta, czy preferujesz tryb jasny, czy ciemny, niezależnie od odwiedzanej strony.
- **Prywatność:** Dane przechowywane są wyłącznie lokalnie na Twoim urządzeniu. Wtyczka nie śledzi Twojej aktywności ani nie wysyła danych na zewnętrzne serwery.

---

## Technologie

| Technologia | Zastosowanie |
|-------------|--------------|
| **JavaScript (Vanilla)** | Cała logika wtyczki — brak zbędnych bibliotek |
| **Shadow DOM** | Pełna izolacja wizualna od strony hosta |
| **CSS Variables (Theming)** | Zaawansowany system motywów (Light/Dark mode) |
| **Chrome Extensions API (MV3)** | Nowoczesny standard Manifest V3 |
| **Web Animations API** | Płynne przejścia, celebracja postępu, konfetti |
| **chrome.storage.local** | Persystencja stanu i ustawień użytkownika |

---

## Zasoby i metodologia

FakeCheck opiera się na metodologii weryfikacji opracowanej przez badaczy i organizacje fact-checkingowe:

### 📚 Nauka Sprawdza — Uniwersytet Warszawski

- [**Vademecum weryfikacji — 4 Metody**](https://naukasprawdza.uw.edu.pl/vademecum/#4Metody)
- [**Metoda SIFT**](https://naukasprawdza.uw.edu.pl/vademecum/#MetodySIFT) — Stop, Investigate, Find, Trace.

### 🔧 Przydatne Narzędzia

- **Google Fact Check Tools** — weryfikacja gotowych twierdzeń.
- **Google Dorks** — techniki zaawansowanego wyszukiwania do debunkingu.

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
