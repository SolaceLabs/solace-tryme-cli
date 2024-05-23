export const fakerRulesJson = {
  "StringRules": {
    "description": "Module to generate string related entries",
    "rules": {
      "alpha": { 
        "minLength": 10,
        "maxLength": 100,
        "casing": "mixed",
        "description": "Generating a string consisting of letters in the English alphabet." 
      },
      "alphanumeric": { 
        "minLength": 10,
        "maxLength": 100,
        "casing": "mixed",
        "description": "Generating a string consisting of alpha characters and digits." 
      },
      "enum": { 
        "enum": '',
        "description": "Returns a random value from an Enum object" 
      },
      "words": { 
        "count": 5,
        "description": "Returns a string containing a number of space separated random words."
      },
      "nanoid": { 
        "minLength": 5,
        "maxLength": 5,
        "description": "Generates a Nano ID." 
      },
      "numeric": { 
        "minLength": 5,
        "maxLength": 5,
        "leadingZeros": false,
        "description": "Generates a given length string of digits." 
      },
      "symbol": { 
        "minLength": 5,
        "maxLength": 5,
        "description": "Returns a string containing only special characters" 
      },
      "uuid": { 
        "description": "Returns a UUID v4 (Universally Unique Identifier)." 
      },
      "fromRegExp": { 
        "pattern": "^[A-Za-z]$",
        "description": "Generates a string matching the given regex like expressions"
      },
      "phoneNumber": { 
        "description": "Returns a random phone number"      
      },
      "json": { 
        "description": "Returns a string representing JSON object with 7 pre-defined properties."      
      }
    }
  },
  "NullRules": {
    "description": "Module to generate null or empty values.",
    "rules": {
      "null": { 
        "description": "Returns null value" 
      },
      "empty": { 
        "description": "Returns an empty string" 
      }
    }
  },
  "NumberRules": {
    "description": "Module to generate numbers of any kind.",
    "rules": {
      "float": { 
        "minimum": 0,
        "maximum": 1000,
        "fractionDigits": 2,
        "description": "Returns a single random floating-point number"
      },
      "int": { 
        "minimum": 0,
        "maximum": 1000,
        "description": "Returns a single random integer.",
      }
    }
  },
  "BooleanRules": {
    "description": "Module to generate boolean values.",
    "rules": {
      "boolean": { 
        "description": "Returns the boolean value true or false"
      }
    }
  },
  "DateRules": {
    "description": "Module to generate dates",
    "rules": {
      "anytime": { 
        "description": "Generates a random date that can be either in the past or in the future." 
      },
      "future": { 
        "years": 10,
        "description": "Generates a random date in the future." 
      },
      "past": { 
        "years": 10,
        "description": "Generates a random date in the past." 
      },
      "recent": { 
        "days": 10,
        "description": "Generates a random date in the recent past." 
      },
      "soon": { 
        "days": 10,
        "description": "Generates a random date in the near future." 
      },
      "month": { 
        "abbreviated": false,
        "description": "Returns a random name of a month." 
      },
      "weekday": { 
        "abbreviated": false,
        "description": "Returns a random day of the week." 
      }
    }
  },
  "LoremRules": {
    "description": "Module to generate random texts and words",
    "rules": {
      "lines": { 
        "minimum": 2,
        "maximum": 5,
        "description": "Generates the given number lines of lorem separated by '\n'."
      },
      "paragraph": { 
        "minimum": 2,
        "maximum": 5,
        "description": "Generates a paragraph with the given number of sentences."
      },
      "sentence": { 
        "minimum": 5,
        "maximum": 10,
        "description": "Generates a space separated list of words."
      },
      "text": { 
        "description": "Generates a random text based on a random lorem method." 
      },
      "word": { 
        "minimum": 5,
        "maximum": 10,
        "description": "Generates a word of a specified length." 
      }
    }
  },
  "PersonRules": {
    "description": "Module to generate people's personal information such as names and job titles.",
    "rules": {
      "prefix": { 
        "description": "Returns a random person prefix." 
      },
      "firstName": { 
        "description": "Returns a random first name."
      },
      "lastName": { 
        "description": "Returns a random last name." 
      },
      "middleName": { 
        "description": "Returns a random middle name." 
      },
      "fullName": { 
        "description": "Generates a random full name." 
      },
      "suffix": { 
        "description": "Returns a random person suffix." 
      },
      "sex": { 
        "description": "Returns a random sex." 
      },
      "jobTitle": { 
        "description": "Generates a random job title." 
      },
      "jobDescriptor": { 
        "description": "Generates a random job descriptor." 
      },
      "jobType": { 
        "description": "Generates a random job type." 
      }
    }    
  },
  "LocationRules": {
    "description": "Module to generate addresses and locations",
    "rules": {
      "buildingNumber": { 
        "description": "Generates a random building number." 
      },
      "street": { 
        "description": "Generates a random localized street name." 
      },
      "streetAddress": { 
        "description": "Generates a random localized street address." 
      },
      "city": { 
        "description": "Generates a random localized city name." 
      },
      "state": { 
        "description": "Returns a random localized state." 
      },
      "zipCode": { 
        "description": "Generates random zip code from specified format."
      },
      "country": { 
        "description": "Returns a random country name." 
      },
      "countryCode": { 
        "description": "Returns a random ISO_3166-1 country code." 
      },
      "latitude": { 
        "minimum": -90,
        "maximum": 90,
        "precision": 4,
        "description": "Generates a random latitude." 
      },
      "longitude": { 
        "minimum": -90,
        "maximum": 90,
        "precision": 4,
        "description": "Generates a random longitude." 
      },
      "timeZone": { 
        "description": "Returns a random time zone." 
      }
    }
  },
  // "InternetRules": {
  //   "description": "Module to generate internet related entries",
  //   "rules": {
  //     "domainName": { 
  //       "description": "Generates a random domain name." 
  //     },
  //     "email": { 
  //       "description": "Generates a random email address." 
  //     },
  //     "emoji": { 
  //       "description": "Generates a random emoji." 
  //     },
  //     "ipv4": { 
  //       "description": "Generates a random IPv4 address." 
  //     },
  //     "ipv6": { 
  //       "description": "Generates a random IPv6 address." 
  //     },
  //     "mac": { 
  //       "description": "Generates a random mac address." 
  //     },
  //     "password": { 
  //       "length": 15,
  //       "description": "Generates a random password." 
  //     },
  //     "url": { 
  //       "description": "Generates a random http(s) url." 
  //     },
  //     "userName": { 
  //       "description": "Generates a random username."
  //     }
  //   }
  // },
  "FinanceRules": {
    "description": "Module to generate finance and money related entries",
    "rules": {
      "accountNumber": { 
        "description": "Generates a random account number." 
      },
      "amount": { 
        "minimum": 0,
        "maximum": 1000,
        "description": "Generates a random amount between the given bounds." 
      },
      "swiftOrBic": { 
        "description": "Generates a random SWIFT/BIC code based on the ISO-9362 format." 
      },
      "creditCardIssuer": { 
        "description": "Returns a random credit card issuer." 
      },
      "creditCardNumber": { 
        "description": "Generates a random credit card number." 
      },
      "currencyCode": { 
        "description": "Returns a random currency code." 
      },
      "currencyName": { 
        "description": "Returns a random currency name." 
      },
      "currencySymbol": { 
        "description": "Returns a random currency symbol." 
      },
      "bitcoinAddress": { 
        "description": "Generates a random Bitcoin address." 
      },
      "ethereumAddress": { 
        "description": "Creates a random, non-checksum Ethereum address." 
      },
      "transactionDescription": { 
        "description": "Generates a random transaction description." 
      },
      "transactionType": { 
        "description": "Returns a random transaction type."
      }
    }
  },
  // "VehicleRules": {
  //   "description": "Module to generate vehicle related entries",
  //   "rules": {
  //     "manufacturer": { 
  //       "description": "Returns a manufacturer name." 
  //     },
  //     "model": { 
  //       "description": "Returns a vehicle model." 
  //     },
  //     "type": { 
  //       "description": "Returns a vehicle type." 
  //     },
  //     "vehicle": { 
  //       "description": "Returns a random vehicle." 
  //     },
  //     "vin": { 
  //       "description": "Returns a vehicle identification number (VIN)." 
  //     },
  //     "vrm": { 
  //       "description": "Returns a vehicle registration number (VRM)"
  //     }
  //   }
  // },
  "AirlineRules": {
    "description": "Module to generate airline and airport related data.",
    "rules": {
      "airline": { 
        "description": "Generates a random airline." 
      },
      "airplane": { 
        "description": "Generates a random airplane." 
      },
      "airport": { 
        "description": "Generates a random airport name with code." 
      },
      "airportName": { 
        "description": "Generates a random airport name." 
      },
      "airportCode": { 
        "description": "Generates a random airport code." 
      },
      "flightNumber": { 
        "minimum": 1,
        "maximum": 3,
        "leadingZeros": false,
        "description": "Returns a random flight number." 
      }
    }
  },
  "CommerceRules": {
    "description": "Module to generate commerce and product related entries.",
    "rules": {
      "companyName": { 
        "description": "Generates a random company name." 
      },
      "department": { 
        "description": "Returns a random department inside a shop." 
      },
      "isbn": { 
        "description": "Returns a random ISBN identifier." 
      },
      "price": { 
        "minimum": 1,
        "maximum": 999,
        "description": "Generates a random price between min and max."
      },
      "product": { 
        "description": "Returns a random short product name." 
      },
      "productDescription": { 
        "description": "Returns a random product description." 
      },
      "productName": { 
        "description": "Generates a random descriptive product name."
      }
    }
  },
  // "ArrayRules": {
  //   "description": "Generates array of fake items of specified type.",
  //   "rules": {
  //     "float": { 
  //       "minimum": 0,
  //       "maximum": 1000,
  //       "length": 10,
  //       "description": "Returns an array of random floating-point numbers"
  //     },
  //     "int": { 
  //       "minimum": 0,
  //       "maximum": 1000,
  //       "length": 10,
  //       "description": "Returns an array of random integers."
  //     },
  //     "boolean": { 
  //       "length": 10,
  //       "description": "Returns an array of random boolean value true or false"
  //     },
  //     "phoneNumber": { 
  //       "length": 10,
  //       "description": "Generates an array of random phone numbers."
  //     },
  //     "date": { 
  //       "length": 10,
  //       "description": "Generates an array of random dates that can be either in the past or in the future." 
  //     },
  //     // "text": { 
  //     //   "length": 10,
  //     //   "description": "Generates an array of text based on a random lorem method." 
  //     // },
  //     "word": { 
  //       "length": 10,
  //       "description": "Generates an array of words of a specified length." 
  //     },
  //     "companyName": { 
  //       "length": 10,
  //       "description": "Generates an array of random company names." 
  //     },
  //     "firstName": { 
  //       "length": 10,
  //       "description": "Returns an array of random first name." 
  //     },
  //     "fullName": { 
  //       "length": 10,
  //       "description": "Generates an array of random full names." 
  //     },
  //     "city": { 
  //       "length": 10,
  //       "description": "Generates an array of random localized city names." 
  //     },
  //     "country": { 
  //       "length": 10,
  //       "description": "Returns an array of random country names." 
  //     },
  //     // "latitude": { 
  //     //   "length": 10,
  //     //   "description": "Generates a random latitude." 
  //     // },
  //     // "longitude": { 
  //     //   "length": 10,
  //     //   "description": "Generates a random longitude." 
  //     // },
  //     // "ipv4": { 
  //     //   "length": 10,
  //     //   "description": "Generates a random IPv4 address." 
  //     // },
  //     // "url": { 
  //     //   "length": 10,
  //     //   "description": "Generates a random http(s) url." 
  //     // },
  //     // "creditCardNumber": { 
  //     //   "length": 10,
  //     //   "description": "Generates a random credit card number." 
  //     // },
  //     // "currencyCode": { 
  //     //   "length": 10,
  //     //   "description": "Returns a random currency code." 
  //     // },
  //     // "isbn": { 
  //     //   "length": 10,
  //     //   "description": "Returns a random ISBN identifier." 
  //     // },
  //     // "price": { 
  //     //   "length": 10,
  //     //   "description": "Generates a price between min and max." 
  //     // },
  //     "product": { 
  //       "length": 10,
  //       "description": "Returns a short product name." 
  //     }
  //   }
  // }
}
