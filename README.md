# Rif — Proof of Creative Process

Rif är en webb3-applikation där användare kan dokumentera sin kreativa process genom att skapa projekt och koppla ljudfiler (soundbites) till dem. Projekten och soundbites lagras på Ethereum Sepolia-blockkedjan, medan själva ljudfilerna och metadata lagras på IPFS via Pinata.

---

## Kontrakt

**`contracts/rif.sol`**
Solidity-kontraktet som körs på Ethereum Sepolia. Innehåller två struct:ar — `Project` och `Soundbite` — med tillhörande mappings och funktioner för att skapa projekt, lägga till soundbites och läsa data. Kontraktsadressen hanteras i `config/contracts.js`.

---

## Frontend

### Komponenter

**`components/App.jsx`**
Rotkomponent med routing. Hanterar två rutter: startsidan (`/`) och dashboarden (`/dashboard`).

**`components/LandingPage.jsx`**
Startsida med inloggning via MetaMask och en accordion för "Vad är Rif?".

**`components/RifDashboard.jsx`**
Huvudvy efter inloggning. Samlar alla paneler och modaler, hanterar state för vilka modaler som är öppna och triggar uppdatering av projektlistan när något ändras.

**`components/Navbar.jsx`**
Navigationsfält i dashboardens header.

**`components/YourProjects.jsx`**
Panel som hämtar och listar den inloggade användarens egna projekt från kontraktet. Klick på ett projekt öppnar `ProjectDetailModal`.

**`components/ProjectDetailModal.jsx`**
Modal som visar ett projekts detaljer och laddar dess soundbites från kontraktet. Varje soundbite hämtar sin metadata från IPFS och renderar en audiospelare om filen är ljud.

**`components/AddSoundbiteButton.jsx`**
Modal för att ladda upp en ljudfil till IPFS och registrera soundbiten on-chain. Filen laddas upp till Pinata, metadata-JSON laddas upp separat, och sedan skickas en transaktion till kontraktet med metadata-CID:n.

**`components/CreateNewProject.jsx`**
Modal för att skapa ett nytt projekt. Skickar en transaktion till kontraktet och sparar tx-hash lokalt via `rifProjectRecords`.

**`components/CreateNewProjectResult.jsx`**
Modal som visas efter att ett projekt skapats, med länk till transaktionen på Sepolia Etherscan.

**`components/ExploreProjects.jsx`**
Modal som hämtar alla projekt från kontraktet och låter användaren söka på titel, beskrivning eller wallet-adress.

**`components/WhatIsRif.jsx`**
Informationsmodal om vad Rif är.

---

### Kontext

**`context/WalletContext.jsx`** + **`context/walletContext.js`** + **`context/useWallet.js`**
React-kontext för wallet-state. Hanterar MetaMask-anslutning, frånkoppling och exponerar `account`, `isConnecting` och `connectError` till hela appen.

---

### Utils

**`utils/ipfsUpload.js`**
Laddar upp filer och JSON-objekt till IPFS via Pinata REST API. Returnerar CID och gateway-URL.

**`utils/rifContractRead.js`**
Skapar en read-only instans av Rif-kontraktet kopplad till användarens wallet-provider. Returnerar `null` om användaren inte är på Sepolia.

**`utils/rifChain.js`**
Läser aktiv kedja från wallet och erbjuder funktioner för att kontrollera och byta till Ethereum Sepolia.

**`utils/rifProjectRecords.js`**
Sparar och läser projekt-metadata (tx-hash, titel, beskrivning) i `localStorage` per wallet-adress. Används för att visa Etherscan-länk till skapande-transaktionen.

**`utils/rifSoundbiteRecords.js`**
Sparar lokala soundbite-poster i `localStorage` per wallet och projekt, som logg vid sidan av on-chain-datan.

---

### Config

**`config/contracts.js`**
Kontraktsadress och nätverks-ID för Ethereum Sepolia. Uppdatera `rif`-adressen efter varje redeploy.

**`config/getRifAddress.js`**
Returnerar kontraktsadressen för ett givet nätverks-ID, eller kastar fel om nätverket inte stöds.
