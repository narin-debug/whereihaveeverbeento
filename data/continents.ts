export type ContinentKey =
  | "asia"
  | "europe"
  | "africa"
  | "northAmerica"
  | "southAmerica"
  | "oceania"
  | "antarctica";

// Keyed identically to capital-coordinates.ts (ISO 3166-1 numeric id, or the
// topojson name itself for the handful of disputed regions with no ISO code)
// so every entry in data/countries.ts resolves to a continent.
export const countryContinents: Record<string, ContinentKey> = {
  "100": "europe", // Bulgaria
  "104": "asia", // Myanmar
  "108": "africa", // Burundi
  "112": "europe", // Belarus
  "116": "asia", // Cambodia
  "120": "africa", // Cameroon
  "124": "northAmerica", // Canada
  "140": "africa", // Central African Republic
  "144": "asia", // Sri Lanka
  "148": "africa", // Chad
  "152": "southAmerica", // Chile
  "156": "asia", // China
  "158": "asia", // Taiwan
  "170": "southAmerica", // Colombia
  "178": "africa", // Republic of the Congo
  "180": "africa", // Democratic Republic of the Congo
  "188": "northAmerica", // Costa Rica
  "191": "europe", // Croatia
  "192": "northAmerica", // Cuba
  "196": "europe", // Cyprus
  "203": "europe", // Czech Republic
  "204": "africa", // Benin
  "208": "europe", // Denmark
  "214": "northAmerica", // Dominican Republic
  "218": "southAmerica", // Ecuador
  "222": "northAmerica", // El Salvador
  "226": "africa", // Equatorial Guinea
  "231": "africa", // Ethiopia
  "232": "africa", // Eritrea
  "233": "europe", // Estonia
  "238": "southAmerica", // Falkland Islands
  "242": "oceania", // Fiji
  "246": "europe", // Finland
  "250": "europe", // France
  "260": "antarctica", // French Southern Territories
  "262": "africa", // Djibouti
  "266": "africa", // Gabon
  "268": "asia", // Georgia
  "270": "africa", // Gambia
  "275": "asia", // Palestine
  "276": "europe", // Germany
  "288": "africa", // Ghana
  "300": "europe", // Greece
  "304": "northAmerica", // Greenland
  "320": "northAmerica", // Guatemala
  "324": "africa", // Guinea
  "328": "southAmerica", // Guyana
  "332": "northAmerica", // Haiti
  "340": "northAmerica", // Honduras
  "348": "europe", // Hungary
  "352": "europe", // Iceland
  "356": "asia", // India
  "360": "asia", // Indonesia
  "364": "asia", // Iran
  "368": "asia", // Iraq
  "372": "europe", // Ireland
  "376": "asia", // Israel
  "380": "europe", // Italy
  "384": "africa", // Cote d'Ivoire
  "388": "northAmerica", // Jamaica
  "392": "asia", // Japan
  "398": "asia", // Kazakhstan
  "400": "asia", // Jordan
  "404": "africa", // Kenya
  "408": "asia", // North Korea
  "410": "asia", // South Korea
  "414": "asia", // Kuwait
  "417": "asia", // Kyrgyzstan
  "418": "asia", // Laos
  "422": "asia", // Lebanon
  "426": "africa", // Lesotho
  "428": "europe", // Latvia
  "430": "africa", // Liberia
  "434": "africa", // Libya
  "440": "europe", // Lithuania
  "442": "europe", // Luxembourg
  "450": "africa", // Madagascar
  "454": "africa", // Malawi
  "458": "asia", // Malaysia
  "466": "africa", // Mali
  "478": "africa", // Mauritania
  "484": "northAmerica", // Mexico
  "496": "asia", // Mongolia
  "498": "europe", // Moldova
  "499": "europe", // Montenegro
  "504": "africa", // Morocco
  "508": "africa", // Mozambique
  "512": "asia", // Oman
  "516": "africa", // Namibia
  "524": "asia", // Nepal
  "528": "europe", // Netherlands
  "540": "oceania", // New Caledonia
  "548": "oceania", // Vanuatu
  "554": "oceania", // New Zealand
  "558": "northAmerica", // Nicaragua
  "562": "africa", // Niger
  "566": "africa", // Nigeria
  "578": "europe", // Norway
  "586": "asia", // Pakistan
  "591": "northAmerica", // Panama
  "598": "oceania", // Papua New Guinea
  "600": "southAmerica", // Paraguay
  "604": "southAmerica", // Peru
  "608": "asia", // Philippines
  "616": "europe", // Poland
  "620": "europe", // Portugal
  "624": "africa", // Guinea-Bissau
  "626": "asia", // Timor-Leste
  "630": "northAmerica", // Puerto Rico
  "634": "asia", // Qatar
  "642": "europe", // Romania
  "643": "europe", // Russia
  "646": "africa", // Rwanda
  "682": "asia", // Saudi Arabia
  "686": "africa", // Senegal
  "688": "europe", // Serbia
  "694": "africa", // Sierra Leone
  "703": "europe", // Slovakia
  "704": "asia", // Vietnam
  "705": "europe", // Slovenia
  "706": "africa", // Somalia
  "710": "africa", // South Africa
  "716": "africa", // Zimbabwe
  "724": "europe", // Spain
  "728": "africa", // South Sudan
  "729": "africa", // Sudan
  "732": "africa", // Western Sahara
  "740": "southAmerica", // Suriname
  "748": "africa", // Eswatini
  "752": "europe", // Sweden
  "756": "europe", // Switzerland
  "760": "asia", // Syria
  "762": "asia", // Tajikistan
  "764": "asia", // Thailand
  "768": "africa", // Togo
  "780": "northAmerica", // Trinidad and Tobago
  "784": "asia", // United Arab Emirates
  "788": "africa", // Tunisia
  "792": "asia", // Turkiye
  "795": "asia", // Turkmenistan
  "800": "africa", // Uganda
  "804": "europe", // Ukraine
  "807": "europe", // North Macedonia
  "818": "africa", // Egypt
  "826": "europe", // United Kingdom
  "834": "africa", // Tanzania
  "840": "northAmerica", // United States
  "854": "africa", // Burkina Faso
  "858": "southAmerica", // Uruguay
  "860": "asia", // Uzbekistan
  "862": "southAmerica", // Venezuela
  "887": "asia", // Yemen
  "894": "africa", // Zambia
  "032": "southAmerica", // Argentina
  "044": "northAmerica", // Bahamas
  "076": "southAmerica", // Brazil
  "068": "southAmerica", // Bolivia
  "084": "northAmerica", // Belize
  "072": "africa", // Botswana
  "024": "africa", // Angola
  "012": "africa", // Algeria
  "050": "asia", // Bangladesh
  "064": "asia", // Bhutan
  "004": "asia", // Afghanistan
  "051": "asia", // Armenia
  "040": "europe", // Austria
  "008": "europe", // Albania
  "056": "europe", // Belgium
  "090": "oceania", // Solomon Islands
  "036": "oceania", // Australia
  "031": "asia", // Azerbaijan
  "096": "asia", // Brunei
  "010": "antarctica", // Antarctica
  "N. Cyprus": "europe",
  Somaliland: "africa",
  "070": "europe", // Bosnia and Herzegovina
  Kosovo: "europe",
};
