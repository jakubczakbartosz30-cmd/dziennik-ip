# Dziennik IP – pełna wersja

Gotowa, mobilna aplikacja PWA działająca jako statyczna strona na Vercel.

## Zawartość
- Panel główny
- Gospodarstwo
- Działki i kwatery + mapa
- Dodaj Zabieg
- Historia zabiegów z wyszukiwaniem
- Obserwacje
- Nawożenie
- Dziennik IP
- Dokumenty
- Raporty / druk do PDF
- Eksport kopii danych do JSON
- zapis danych w pamięci urządzenia (localStorage)
- PWA / możliwość dodania do ekranu głównego

## Wdrożenie
Na GitHubie repozytorium powinno zawierać bezpośrednio:
index.html
styles.css
app.js
manifest.webmanifest

Po wypchnięciu zmian Vercel powinien automatycznie wykonać nowe wdrożenie.

Mapa korzysta z OpenStreetMap przez Leaflet, więc do działania mapy potrzebne jest połączenie z internetem.
