# Dokument wymagań produktu (PRD) - Peerscope

## 1. Przegląd produktu

Peerscope to aplikacja internetowa zaprojektowana, aby pomóc użytkownikom w uzyskaniu głębszego, bardziej obiektywnego zrozumienia ich relacji interpersonalnych. Umożliwia tworzenie szczegółowych profili znajomych, rodziny czy współpracowników, a następnie analizowanie rzeczywistych lub hipotetycznych interakcji (zdarzeń) z ich udziałem przy pomocy sztucznej inteligencji. Głównym celem aplikacji jest dostarczenie użytkownikom różnych perspektyw na dane sytuacje, co może pomóc w lepszym zrozumieniu innych, rozwiązywaniu konfliktów i podejmowaniu bardziej świadomych decyzji w relacjach. Dodatkowe funkcje, takie jak generowanie sugestii prezentów, mają na celu dalsze wspieranie użytkownika w budowaniu i utrzymywaniu wartościowych więzi.

## 2. Problem użytkownika

Analiza relacji z innymi ludźmi jest z natury subiektywna. Często patrzymy na sytuacje wyłącznie z własnej perspektywy, co utrudnia obiektywną ocenę zachowań i motywacji drugiej osoby. Prowadzi to do nieporozumień, trudności w komunikacji i poczucia niepewności, jak postąpić w danej sytuacji. Brakuje narzędzia, które pomogłoby spojrzeć na interakcje z różnych punktów widzenia, uwzględniając unikalny charakter i kontekst każdej osoby zaangażowanej w relację. Peerscope ma na celu wypełnienie tej luki, oferując platformę do ustrukturyzowanej analizy, która wspiera empatię i zrozumienie.

## 3. Wymagania funkcjonalne

### 3.1. System Kont Użytkowników

- Użytkownicy mogą rejestrować konto za pomocą adresu e-mail i hasła.
- Użytkownicy mogą logować się do swojego konta.
- System zapewnia, że dane każdego użytkownika są prywatne i dostępne tylko dla niego.

### 3.2. Zarządzanie Postaciami

- Użytkownik może stworzyć swój własny profil, który jest traktowany jako specjalny typ "Postaci".
- Użytkownik może tworzyć profile dla innych osób (Postaci), podając takie informacje jak: imię, rola w życiu użytkownika (z predefiniowanej listy z opcją "Inny"), opis, cechy charakteru i główne motywacje/cele.
- Użytkownik może przesłać plik graficzny jako awatar dla każdej Postaci.
- Podczas tworzenia opisu Postaci, użytkownik może skorzystać z gotowych szablonów (np. dla współpracownika), które wstawiają do pola opisu pomocnicze pytania/nagłówki.
- Użytkownik może przeglądać listę wszystkich stworzonych przez siebie Postaci w formie kart.
- Użytkownik może edytować każdą istniejącą Postać.
- Użytkownik może usunąć Postać. Usunięcie jest realizowane jako "soft delete", co oznacza, że Postać nie jest widoczna na liście, ale jej dane są zachowane w systemie w celu utrzymania integralności historycznych Zdarzeń.
- Użytkownik może zaktualizować datę ostatniej interakcji z daną Postacią.

### 3.3. Zarządzanie Zdarzeniami

- Użytkownik może tworzyć nowe Zdarzenia (zarówno przeszłe, jak i hipotetyczne).
- Zdarzenie jest definiowane przez tytuł, datę, opis oraz listę uczestników (wybranych spośród istniejących Postaci, w tym profilu samego użytkownika).
- Użytkownik może edytować istniejące Zdarzenia.

### 3.4. Moduł Analizy AI

- Dostępne są dwa typy analizy:
  1.  "Mediacja" - analiza Zdarzenia, która przedstawia sytuację z perspektywy każdego z uczestników. Wynik jest ustrukturyzowany i podzielony na sekcje.
  2.  "Sugestia prezentu" - analiza profilu Postaci w celu wygenerowania propozycji prezentów.
- Każdy użytkownik ma dzienny limit 2 analiz. Limit resetuje się o północy (UTC).
- System wyświetla nieblokujący wskaźnik ładowania podczas przetwarzania analizy przez AI.
- W przypadku błędu analizy, system wyświetla przyjazny komunikat z opcją ponowienia próby.
- Użytkownik może ocenić każdą odpowiedź AI za pomocą ikony "kciuk w górę" lub "kciuk w dół".
- Jeśli od ostatniej interakcji z Postacią zaangażowaną w Zdarzenie minęło więcej niż 2 tygodnie, system wyświetli ostrzeżenie o możliwej niedokładności analizy.

### 3.5. Interfejs i Doświadczenie Użytkownika (UI/UX)

- Nowy użytkownik po zalogowaniu widzi "pusty stan" (empty state) z wyraźnym wezwaniem do działania (call to action), np. stworzenia pierwszej Postaci.
- Powracający użytkownik widzi ekran główny (dashboard) z listą ostatnio używanych Postaci oraz głównymi przyciskami akcji ("Dodaj zdarzenie", "Stwórz postać").
- Aplikacja udostępnia statyczny, nieinteraktywny przykład Postaci i Zdarzenia, aby pokazać użytkownikowi potencjał narzędzia.

## 4. Granice produktu

### Co wchodzi w zakres MVP:

- Aplikacja internetowa dostępna przez przeglądarkę.
- Pełna funkcjonalność opisana w sekcji 3: zarządzanie kontami, Postaciami, Zdarzeniami oraz analizy AI.
- Ręczne wprowadzanie wszystkich danych przez użytkownika.

### Co NIE wchodzi w zakres MVP:

- Aplikacje mobilne (iOS, Android).
- Integracje z zewnętrznymi platformami (np. mediami społecznościowymi, kalendarzami) w celu automatycznego importowania danych.
- Zaawansowane funkcje personalizacji interfejsu.
- System ról i uprawnień (poza podziałem na osobne konta użytkowników).
- Funkcje społecznościowe (np. udostępnianie profili, zdarzeń).

## 5. Historyjki użytkowników

### 5.0 start

- ID: US-LandingPage
- Tytuł: Strona Glowna
- Opis: Przedstawienie wartości aplikacji i zachęcenie do rejestracji. | Opis produktu, korzyści, zrzuty ekranu, wezwanie do działania (CTA). | `Header`, `HeroSection`, `FeaturesSection`, `CallToAction`, `Footer`. | Semantyczny HTML dla SEO i a11y.
- Kryteria akceptacji:
  1. Strona główna jest dostępna pod adresem `/`.
  2. Zawiera sekcje: `Header`, `HeroSection`, `FeaturesSection`, `CallToAction`, `Footer`.
  3. Prezentuje jasny opis produktu oraz korzyści płynące z korzystania z aplikacji.
  4. Użytkownik widzi zrzuty ekranu aplikacji lub graficzne przykłady działania.
  5. Widoczne jest wyraźne wezwanie do działania (CTA), prowadzące do rejestracji.
  6. Całość struktury strony opiera się na semantycznym HTML, poprawnym dla SEO i dostępności (a11y).
  7. Na ekranach mobilnych layout jest responsywny i czytelny.
  8. Sekcja `Header` zawiera logo aplikacji oraz linki do logowania/rejestracji.

- ID: US-000
- Tytuł: Dashboard
- Opis: Po pomyślnej rejestracji jest automatycznie logowany i przekierowywany na Pulpit (/dashboard), który jest w stanie "Onboarding". Klika CTA "Stwórz swój profil", co prowadzi go do formularza Tworzenia Postaci (/characters/new) z preselekcją dla profilu własnego.
- Kryteria akceptacji:
  1.  Uzytkownik po zalogowaniu jest przekierowany na Pulpit
  2.  Pulpit to strona typu Dashboard gdzie po lewej stronie znajduje się menu z takimi pozycjami jak "Postacie" oraz "Zdarzenia"
  3.  W centralnej części dashboardu jeśli uzytkownik nie wybrał ani Postaci ani Zdarzen następuje zachowanie:
      1.  Jeśli uzytkownik nie ma swojego profilu widoczny jest przycisk "Stwórz swoj profil"
      2.  Jeśli uzytkownik ma juz swoj profil zostaje przeniesiony na podstrone Postaci
  4.  Dashboard powinien zawierać elementy strony głównej takie jak Header oraz Footer.

### 5.1. Uwierzytelnianie i Zarządzanie Kontem

- ID: US-001
- Tytuł: Rejestracja nowego użytkownika
- Opis: Jako nowy użytkownik, chcę móc założyć konto w aplikacji przy użyciu mojego adresu e-mail i hasła, aby móc bezpiecznie przechowywać moje dane.
- Kryteria akceptacji:
  1.  Formularz rejestracji zawiera pola na adres e-mail, hasło i potwierdzenie hasła.
  2.  System waliduje poprawność formatu adresu e-mail.
  3.  System sprawdza, czy hasła w obu polach są identyczne.
  4.  Po pomyślnej rejestracji, jestem automatycznie zalogowany i przekierowany do ekranu startowego aplikacji (empty state).
  5.  Jeśli adres e-mail jest już zajęty, system wyświetla odpowiedni komunikat błędu.

- ID: US-002
- Tytuł: Logowanie użytkownika
- Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się do aplikacji przy użyciu mojego e-maila i hasła, aby uzyskać dostęp do moich danych.
- Kryteria akceptacji:
  1.  Formularz logowania zawiera pola na adres e-mail i hasło.
  2.  Po poprawnym wprowadzeniu danych, jestem zalogowany i przekierowany na mój ekran główny (dashboard).
  3.  Przycisk Login in zamienia się w przycisk Signout kiedy uzytkownik jest zalogowany. Przycisk Signn in nie jest widoczny dla zalogowanego uzytkownika
  4.  W przypadku podania błędnego e-maila lub hasła, system wyświetla stosowny komunikat.

### 5.2. Zarządzanie Postaciami

- ID: US-003
- Tytuł: Tworzenie profilu własnego
- Opis: Jako nowy użytkownik, po pierwszym zalogowaniu, chcę być zachęcony do stworzenia profilu dla samego siebie, aby móc później dodawać siebie jako uczestnika zdarzeń.
- Kryteria akceptacji:
  1.  Na ekranie "empty state" widoczny jest przycisk CTA prowadzący do formularza tworzenia Postaci.
  2.  Formularz tworzenia Postaci pozwala mi na wpisanie swojego imienia, dodanie awatara, opisu, cech charakteru i motywacji.
  3.  Po zapisaniu, mój profil pojawia się na liście Postaci.

- ID: US-004
- Tytuł: Tworzenie nowej Postaci
- Opis: Jako użytkownik, chcę móc stworzyć profil dla innej osoby, aby móc analizować interakcje z nią.
- Kryteria akceptacji:
  1.  Mogę otworzyć formularz tworzenia nowej Postaci z ekranu głównego.
  2.  Formularz zawiera pola: imię, rola (lista wyboru: Przyjaciel, Współpracownik, Członek rodziny, Partner, Inny), opis, cechy charakteru (pole tekstowe z sugestią oddzielania przecinkami), motywacje/cele (pole tekstowe z sugestią oddzielania przecinkami).
  3.  Mogę opcjonalnie przesłać plik graficzny jako awatar Postaci.
  4.  Po zapisaniu formularza, nowa Postać jest widoczna na liście Postaci.

- ID: US-005
- Tytuł: Użycie szablonu podczas tworzenia Postaci
- Opis: Jako użytkownik, tworząc nową Postać, chcę mieć możliwość użycia szablonu opisu, aby łatwiej mi było wypełnić profil.
- Kryteria akceptacji:
  1.  W formularzu tworzenia Postaci, po wybraniu roli (np. "Współpracownik"), pojawia się opcja użycia szablonu.
  2.  Po kliknięciu, pole opisu zostaje wypełnione tekstem szablonu (np. "Jakie są jego/jej główne obowiązki? Jakie są nasze relacje w pracy?").
  3.  Mogę dowolnie edytować lub usunąć wstawiony tekst szablonu.

- ID: US-006
- Tytuł: Przeglądanie listy Postaci
- Opis: Jako użytkownik, chcę widzieć listę wszystkich moich Postaci, aby mieć szybki przegląd osób, które dodałem.
- Kryteria akceptacji:
  1.  Na ekranie głównym wyświetlana jest siatka lub lista kart.
  2.  Każda karta reprezentuje jedną Postać i zawiera jej awatar oraz imię.
  3.  Karty są posortowane, np. alfabetycznie lub według daty ostatniej modyfikacji.

- ID: US-007
- Tytuł: Edycja Postaci
- Opis: Jako użytkownik, chcę móc edytować informacje o istniejącej Postaci, aby moje dane były zawsze aktualne.
- Kryteria akceptacji:
  1.  Z poziomu widoku Postaci mogę przejść do trybu edycji.
  2.  Formularz edycji jest wypełniony istniejącymi danymi Postaci.
  3.  Mogę zmienić dowolne pole, w tym awatar.
  4.  Po zapisaniu zmian, informacje o Postaci są zaktualizowane w całej aplikacji.

- ID: US-008
- Tytuł: Usuwanie Postaci
- Opis: Jako użytkownik, chcę móc usunąć Postać, której nie chcę już śledzić.
- Kryteria akceptacji:
  1.  Na stronie szczegółów Postaci znajduje się opcja "Usuń".
  2.  System prosi o potwierdzenie usunięcia.
  3.  Po potwierdzeniu, Postać znika z listy Postaci (soft-delete).
  4.  Historyczne Zdarzenia, w których Postać brała udział, pozostają nienaruszone i nadal wyświetlają imię usuniętej Postaci.

### 5.3. Zarządzanie Zdarzeniami

- ID: US-0089
- Tytuł: Przeglądanie listy Zdarzeń
- Opis: Jako użytkownik, chcę widzieć listę wszystkich zdarzeń, aby mieć szybki przegląd zdarzeń, które dodałem
- Kryteria akceptacji:
  1.  Klkiając w menu po lewej na "Zdarzenia" powinienem zostać przeniesiony na podstronę `/events`, która reprezenutje listę zdarzeń
  2.  Zdarzenia powinny być zaprezentowane w formie listy, lista zdarzen powinna zawierać tytuł, datę stworzenia oraz listę w niej partycypujących w formie małych kółek z avatarem.
  3.  Lista jest posortowana, np. alfabetycznie lub według daty ostatniej modyfikacji.

- ID: US-009
- Tytuł: Tworzenie nowego Zdarzenia
- Opis: Jako użytkownik, chcę móc dodać nowe Zdarzenie, aby przeanalizować konkretną sytuację.
- Kryteria akceptacji:
  1.  Mogę otworzyć formularz tworzenia Zdarzenia z ekranu głównego.
  2.  Formularz zawiera pola: tytuł, data (z możliwością wyboru daty przeszłej lub przyszłej), opis sytuacji.
  3.  Mogę wybrać co najmniej dwóch uczestników Zdarzenia z listy moich Postaci (włączając mój profil).
  4.  Po zapisaniu, Zdarzenie jest dostępne na liście Zdarzeń.

- ID: US-010
- Tytuł: Edycja Zdarzenia
- Opis: Jako użytkownik, chcę móc edytować istniejące Zdarzenie, aby poprawić lub uzupełnić jego opis.
- Kryteria akceptacji:
  1.  Mogę otworzyć istniejące Zdarzenie w trybie edycji.
  2.  Wszystkie pola formularza są wypełnione zapisanymi danymi.
  3.  Mogę zmodyfikować tytuł, datę, opis i listę uczestników.
  4.  Zmiany są zapisywane po zatwierdzeniu.

### 5.4. Analiza AI

- ID: US-011
- Tytuł: Uruchomienie analizy Zdarzenia
- Opis: Jako użytkownik, po opisaniu Zdarzenia, system wykonuje analizę AI, aby uzyskać różne perspektywy na sytuację.
- Kryteria akceptacji:
  1.  Na stronie Zdarzenia po jego zapisaniu następuje automatyczna analiza
  2.  Po kliknięciu przycisku, system sprawdza, czy mam dostępny dzienny limit analiz.
  3.  Jeśli limit jest dostępny, rozpoczyna się analiza, a na ekranie pojawia się wskaźnik ładowania.
  4.  Jeśli limit nie jest dostępny uzytkownik dostaje informacje, ze wykorzystal dzienny limit analiz.
  5.  Po zakończeniu analizy, jej wynik jest wyświetlany w ustrukturyzowanej formie (np. sekcje dla perspektywy każdej z Postaci).
      1.  Wynik powinien być osobnym polem tekstowym. Idealnie będzie jeśli po wykonaniu analizy, modal dodawania zdarzenia przesunie się w lewo wynik analizy będzie po prawej
  6.  Mój dzienny limit analiz zostaje zmniejszony o jeden.

- ID: US-012
- Tytuł: Uruchomienie sugestii prezentu
- Opis: Jako użytkownik, chcę móc poprosić AI o sugestie prezentów dla danej Postaci na podstawie jej profilu.
- Kryteria akceptacji:
  1.  Na stronie profilu Postaci znajduje się przycisk "Zasugeruj prezent".
  2.  Po kliknięciu, system sprawdza dostępność limitu analiz.
  3.  Jeśli limit jest dostępny, rozpoczyna się generowanie sugestii, a na ekranie pojawia się wskaźnik ładowania.
  4.  Wynik jest wyświetlany w formie listy propozycji prezentów.
  5.  Mój dzienny limit analiz zostaje zmniejszony o jeden.

- ID: US-013
- Tytuł: Obsługa limitu analiz AI
- Opis: Jako użytkownik, chcę być poinformowany, gdy wyczerpię mój dzienny limit analiz.
- Kryteria akceptacji:
  1.  Gdy próbuję uruchomić analizę (Zdarzenia lub prezentu) po wyczerpaniu limitu, przycisk jest nieaktywny lub po kliknięciu pojawia się komunikat.
  2.  Komunikat informuje mnie, że limit został wyczerpany i kiedy zostanie odnowiony (np. "Spróbuj ponownie jutro").

- ID: US-014
- Tytuł: Ocenianie odpowiedzi AI
- Opis: Jako użytkownik, chcę móc ocenić jakość odpowiedzi AI, aby pomóc w doskonaleniu modelu.
- Kryteria akceptacji:
  1.  Pod każdą wygenerowaną odpowiedzią AI znajdują się ikony "kciuk w górę" i "kciuk w dół".
  2.  Mogę kliknąć jedną z ikon, aby zapisać moją ocenę.
  3.  Po kliknięciu, system rejestruje moją opinię (bez widocznej dla mnie informacji zwrotnej poza np. zmianą koloru ikony).

- ID: US-015
- Tytuł: Ostrzeżenie o nieaktualnych danych
- Opis: Jako użytkownik, chcę otrzymać ostrzeżenie, jeśli analiza dotyczy Postaci, z którą dawno nie miałem interakcji.
- Kryteria akceptacji:
  1.  Przed uruchomieniem analizy Zdarzenia, system sprawdza datę ostatniej interakcji dla wszystkich uczestników.
  2.  Jeśli dla którejkolwiek Postaci data ta jest starsza niż 2 tygodnie (lub nie została ustawiona), pod wynikiem analizy pojawia się komunikat ostrzegawczy.
  3.  Komunikat informuje, że "Opis postaci może być nieaktualny, co mogło wpłynąć na dokładność analizy".

## 6. Metryki sukcesu

1.  Zaangażowanie w tworzenie danych (Engagement):
    - Metryka: Średnia liczba Postaci stworzonych przez aktywnego użytkownika.
    - Cel: Wzrost tej wartości w czasie, co wskazuje na postrzeganą użyteczność aplikacji.

2.  Wykorzystanie kluczowej funkcji (Core Feature Adoption):
    - Metryka: Stosunek liczby przeprowadzonych analiz do liczby posiadanych Postaci.
    - Cel: Utrzymanie wysokiego wskaźnika, co oznacza, że użytkownicy aktywnie korzystają z funkcji analitycznych.

3.  Postrzegana jakość analizy (Perceived Value):
    - Metryka: Procentowy udział ocen "kciuk w górę" we wszystkich ocenionych odpowiedziach AI.
    - Cel: Osiągnięcie i utrzymanie wysokiego poziomu satysfakcji (>80%).

4.  Retencja użytkowników (Retention):
    - Metryka: Wskaźnik powrotu użytkowników po 30 dniach od rejestracji.
    - Cel: Osiągnięcie stabilnego wskaźnika retencji, dowodzącego, że aplikacja rozwiązuje realny problem.
