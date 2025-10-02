- [Data Generation Rules](#data-generation-rules)
- [Supported Regular Expression](#supported-regular-expression)

## Data Generation Rules

| Rules Group | Rule | Parameters |
| --- | --- | --- |
| **StringRules**  <br>Module to generate string related entries | _**alpha**_  <br>Generating a string consisting of letters in the English alphabet. | minLength \[default: 10\]  <br>maxLength \[default: 100\]  <br>casing \[default: mixed\] |
|     | _**alphanumeric**_  <br>Generating a string consisting of alpha characters and digits. | minLength \[default: 10\]  <br>maxLength \[default: 100\]  <br>casing \[default: mixed\] |
|     | _**enum**_  <br>Returns a random value from an Enum object |     |
|     | _**words**_  <br>Returns a string containing a number of space separated random words. | count \[default: 5\] |
|     | _**nanoid**_  <br>Generates a Nano ID. | minLength \[default: 5\]  <br>maxLength \[default: 5\] |
|     | _**numeric**_  <br>Generates a given length string of digits. | minLength \[default: 5\]  <br>maxLength \[default: 5\]  <br>leadingZeros \[default: false\] |
|     | _**static**_  <br>Assign a static value. |
|     | _**symbol**_  <br>Returns a string containing only special characters | minLength \[default: 5\]  <br>maxLength \[default: 5\] |
|     | _**uuid**_  <br>Returns a UUID v4 (Universally Unique Identifier). |
|     | _**fromRegExp**_  <br>Generates a string matching the given regex like expressions | pattern [ default: `^[A-Za-z]$` ] |
|     | _**phoneNumber**_  <br>Returns a random phone number |
|     | _**json**_  <br>Returns a string representing JSON object with 7 pre-defined properties. |
| **NullRules**  <br>Module to generate null or empty values. | _**null**_  <br>Returns null value |
|     | _**empty**_  <br>Returns an empty string |
| **NumberRules**  <br>Module to generate numbers of any kind. | _**float**_  <br>Returns a single random floating-point number | minimum \[default: 0\]  <br>maximum \[default: 1000\]  <br>fractionDigits \[default: 2\] |
|     | _**int**_  <br>Returns a single random integer. | minimum \[default: 0\]  <br>maximum \[default: 1000\] |
|     | _**countUp**_  <br>Generates an incremental number. | start \[default: 1\]  <br>change \[default: 1\] |
|     | _**countDown**_  <br>Generates a decremental number. | start \[default: 9999999\]  <br>change \[default: 1\] |
| **BooleanRules**  <br>Module to generate boolean values. | _**boolean**_  <br>Returns the boolean value true or false |
| **DateRules**  <br>Module to generate dates | _**currentDate**_  <br>Returns a current date | format \[default: MM-DD-YYYY\] |
|     | _**timeStamp**_  <br>Returns current time as timestamp, the number of seconds since January 1, 1970 UTC |
|     | _**currentDateWithTime**_  <br>Returns a current date with time | format \[default: MM-DD-YYYY HH:mm:ss\] |
|     | _**currentTime**_  <br>Returns a current time | format \[default: HH:mm:ss\] |
|     | _**anytime**_  <br>Generates a random date that can be either in the past or in the future. |
|     | _**future**_  <br>Generates a random date in the future. | years \[default: 10\] |
|     | _**past**_  <br>Generates a random date in the past. | years \[default: 10\] |
|     | _**recent**_  <br>Generates a random date in the recent past. | days \[default: 10\] |
|     | _**soon**_  <br>Generates a random date in the near future. | days \[default: 10\] |
|     | _**month**_  <br>Returns a random name of a month. | abbreviated \[default: false\] |
|     | _**weekday**_  <br>Returns a random day of the week. | abbreviated \[default: false\] |
| **LoremRules**  <br>Module to generate random texts and words | _**lines**_  <br>Generates the given number lines of lorem separated by ' | minimum \[default: 2\]  <br>maximum \[default: 5\] |
|     | _**paragraph**_  <br>Generates a paragraph with the given number of sentences. | minimum \[default: 2\]  <br>maximum \[default: 5\] |
|     | _**sentence**_  <br>Generates a space separated list of words. | minimum \[default: 5\]  <br>maximum \[default: 10\] |
|     | _**text**_  <br>Generates a random text based on a random lorem method. |
|     | _**word**_  <br>Generates a word of a specified length. | minimum \[default: 5\]  <br>maximum \[default: 10\] |
| **PersonRules**  <br>Module to generate people's personal information such as names and job titles. | _**prefix**_  <br>Returns a random person prefix. |
|     | _**firstName**_  <br>Returns a random first name. |
|     | _**lastName**_  <br>Returns a random last name. |
|     | _**middleName**_  <br>Returns a random middle name. |
|     | _**fullName**_  <br>Generates a random full name. |
|     | _**suffix**_  <br>Returns a random person suffix. |
|     | _**sex**_  <br>Returns a random sex. |
|     | _**jobTitle**_  <br>Generates a random job title. |
|     | _**jobDescriptor**_  <br>Generates a random job descriptor. |
|     | _**jobType**_  <br>Generates a random job type. |
| **LocationRules**  <br>Module to generate addresses and locations | _**buildingNumber**_  <br>Generates a random building number. |
|     | _**street**_  <br>Generates a random localized street name. |
|     | _**streetAddress**_  <br>Generates a random localized street address. |
|     | _**city**_  <br>Generates a random localized city name. |
|     | _**state**_  <br>Returns a random localized state. |
|     | _**zipCode**_  <br>Generates random zip code from specified format. |
|     | _**country**_  <br>Returns a random country name. |
|     | _**countryCode**_  <br>Returns a random ISO\_3166-1 country code. |
|     | _**latitude**_  <br>Generates a random latitude. | minimum \[default: -90\]  <br>maximum \[default: 90\]  <br>precision \[default: 4\] |
|     | _**longitude**_  <br>Generates a random longitude. | minimum \[default: -180\]  <br>maximum \[default: 180\]  <br>precision \[default: 4\] |
|     | _**timeZone**_  <br>Returns a random time zone. |
| **InternetRules**  <br>Module to generate internet related entries | _**domainName**_  <br>Generates a random domain name. | casing \[default: lower\] |
|     | _**domainWord**_ |     |
|     | _**email**_  <br>Generates a random email address. | casing \[default: lower\]  <br>emoji  <br>Generates a random emoji. |
|     | _**emoji**_ |
|     | _**ipv4**_  <br>Generates a random IPv4 address. |
|     | _**ipv6**_  <br>Generates a random IPv6 address. |
|     | _**mac**_  <br>Generates a random mac address. |
|     | _**url**_  <br>Generates a random http(s) url. | casing \[default: lower\] |
|     | _**username**_  <br>Generates a random username. | casing \[default: lower\] |
| **FinanceRules**  <br>Module to generate finance and money related entries | _**accountNumber**_  <br>Generates a random account number. |
|     | _**amount**_  <br>Generates a random amount between the given bounds. | minimum \[default: 0\]  <br>maximum \[default: 1000\] |
|     | _**swiftOrBic**_  <br>Generates a random SWIFT/BIC code based on the ISO-9362 format. |
|     | _**creditCardIssuer**_  <br>Returns a random credit card issuer. |
|     | _**creditCardNumber**_  <br>Generates a random credit card number. |
|     | _**currencyCode**_  <br>Returns a random currency code. |
|     | _**currencyName**_  <br>Returns a random currency name. |
|     | _**currencySymbol**_  <br>Returns a random currency symbol. |
|     | _**bitcoinAddress**_  <br>Generates a random Bitcoin address. |
|     | _**ethereumAddress**_  <br>Creates a random, non-checksum Ethereum address. |
|     | _**transactionDescription**_  <br>Generates a random transaction description. |
|     | _**transactionType**_  <br>Returns a random transaction type. |
| **AirlineRules**  <br>Module to generate airline and airport related data. | _**airline**_  <br>Generates a random airline. | airplane  <br>Generates a random airplane.  <br>airport |
|     | _**airplane**_  <br>Generates a random airplane. |
|     | _**airport**_  <br>Generates a random airport name with code. |
|     | _**airportName**_  <br>Generates a random airport name. |
|     | _**airportCode**_  <br>Generates a random airport code. |
|     | _**flightNumber**_  <br>Returns a random flight number. | minimum \[default: 1\]  <br>maximum \[default: 3\]  <br>leadingZeros \[default: false\] |
| **CommerceRules**  <br>Module to generate commerce and product related entries. | _**companyName**_  <br>Generates a random company name. |
|     | _**department**_  <br>Returns a random department inside a shop. |
|     | _**isbn**_  <br>Returns a random ISBN identifier. |
|     | _**price**_  <br>Generates a random price between min and max. | minimum \[default: 1\]  <br>maximum \[default: 999\] |
|     | _**product**_  <br>Returns a random short product name. |
|     | _**productDescription**_  <br>Returns a random product description. |
|     | _**productName**_  <br>Generates a random descriptive product name. |     |

## Supported Regular Expression

| #   | Rule | Description |
| --- | --- | --- |
| 1.  | x{times} | Repeat the x exactly times times. |
| 2.  | x{min,max} | Repeat the x min to max times. |
| 3.  | x-y | Randomly get a character between x and y (inclusive). |
| 4.  | x-y{times} | Randomly get a character between x and y (inclusive) and repeat it times times. |
| 5.  | x-y{min,max} | Randomly get a character between x and y (inclusive) and repeat it min to max times. |
| 6.  | ^... | Randomly get an ASCII number or letter character that is not in the given range. (e.g. ^0-9 will get a random non-numeric character). |
| 7.  | -... | Include dashes in the range. Must be placed after the negate character ^ and before any character sets if used (e.g. ^-0-9 will not get any numeric characters or dashes). |
| 8.  | x?  | Randomly decide to include or not include x. |
| 9.  | x-y? | Randomly decide to include or not include characters between x and y (inclusive). |
| 10. | x*  | Repeat x 0 or more times. |
| 11. | x+  | Repeat x 1 or more times. |
| 12. | x-y* | Repeat characters between x and y (inclusive) 0 or more times. |
| 13. | x-y+ | Repeat characters between x and y (inclusive) 1 or more times. |