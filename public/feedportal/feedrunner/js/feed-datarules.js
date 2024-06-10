const processStringRules = (rule, count) => {
  var data = [];
  var options = {};
  if (rule.rule === 'alpha') {
    options = {
      length: {
        min: rule.minLength,
        max: rule.maxLength
      },
      casing: rule.casing
    }

    for (var i=0; i<count; i++) {
      data.push(window.faker.string.alpha(options));
    }
  } else if (rule.rule === 'alphanumeric') {
    options = {
      length: {
        min: rule.minLength,
        max: rule.maxLength
      },
      casing: rule.casing
    }

    for (var i=0; i<count; i++) {
      data.push(window.faker.string.alphanumeric(options));
    }
  } else if (rule.rule === 'enum') {
    let enumObj = {};
    let enumValue = {};
    rule.enum.forEach((t) => {
      enumObj[`'${t}'`] = t;
    })
    enumValue = Object.freeze(enumObj);

    for (var i=0; i<count; i++) {
      data.push(window.faker.helpers.enumValue(enumValue));
    }
  } else if (rule.rule === 'words') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.lorem.words(rule.count));
    }
  } else if (rule.rule === 'nanoid') {
    options = {
      min: rule.minLength,
      max: rule.maxLength
    }

    for (var i=0; i<count; i++) {
      data.push(window.faker.string.nanoid(options));
    }
  } else if (rule.rule === 'numeric') {
    options = {
      length: {
        min: rule.minLength,
        max: rule.maxLength
      },
      allowLeadingZeros: rule.leadingZeros
    }

    for (var i=0; i<count; i++) {
      data.push(window.faker.string.numeric(options));
    }
  } else if (rule.rule === 'symbol') {
    options = {
      min: rule.minLength,
      max: rule.maxLength
    }

    for (var i=0; i<count; i++) {
      data.push(window.faker.string.symbol(options));
    }
  } else if (rule.rule === 'uuid') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.string.uuid());
    }
  } else if (rule.rule === 'fromRegExp') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.helpers.fromRegExp(rule.pattern));
    }
  } else if (rule.rule === 'phoneNumber') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.phone.number());
    }
  } else if (rule.rule === 'json') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.datatype.json());
    }
  }

  return count === 1 ? data[0] : data;
}

const processNullRules = (rule, count) => {
  var data = [];
  var options = {};

  if (rule.rule === 'null') {
    for (var i=0; i<count; i++) {
      data.push(null);
    }
  } else if (rule.rule === 'empty') {
    for (var i=0; i<count; i++) {
      data.push('');
    }
  }
  return count === 1 ? data[0] : data;
}

const processNumberRules = (rule, count) => {
  var data = [];
  var options = {};
  if (rule.rule === 'int') {
    options = {
      min: rule.minimum,
      max: rule.maximum
    }

    for (var i=0; i<count; i++) {
      data.push(window.faker.number.int(options));
    }
  } else if (rule.rule === 'float') {
    options = {
      min: rule.minimum,
      max: rule.maximum,
      fractionDigits: parseInt(rule.fractionDigits)
    }

    for (var i=0; i<count; i++) {
      data.push(window.faker.number.float(options));
    }
  }

  return count === 1 ? data[0] : data;
}

const processBooleanRules = (rule, count) => {
  var data = [];

  if (rule.rule === 'boolean') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.datatype.boolean());
    }
    
  }

  return count === 1 ? data[0] : data;
}

const processDateRules = (rule, count) => {
  var data = [];
  var options = {};

  if (rule.rule === 'anytime') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.date.anytime());
    }
  } else if (rule.rule === 'future') {
    options = {
      years: rule.years
    }

    for (var i=0; i<count; i++) {
      data.push(window.faker.date.future(options));
    }
  } else if (rule.rule === 'past') {
    options = {
      years: rule.years
    }

    for (var i=0; i<count; i++) {
      data.push(window.faker.date.past(options));
    }
  } else if (rule.rule === 'recent') {
    options = {
      days: rule.days
    }

    for (var i=0; i<count; i++) {
      data.push(window.faker.date.recent(options));
    }
  } else if (rule.rule === 'soon') {
    options = {
      days: rule.days
    }

    for (var i=0; i<count; i++) {
      data.push(window.faker.date.soon(options));
    }
  } else if (rule.rule === 'month') {
    options = {
      abbreviated: rule.abbreviated
    }

    for (var i=0; i<count; i++) {
      data.push(window.faker.date.month(options));
    }
  } else if (rule.rule === 'weekday') {
    options = {
      abbreviated: rule.abbreviated
    }

    for (var i=0; i<count; i++) {
      data.push(window.faker.date.weekday(options));
    }
  }

  return count === 1 ? data[0] : data;
}
const processLoremRules = (rule, count) => {
  var data = [];
  var options = {};

  if (rule.rule === 'lines') {
    options = {
      min: rule.minimum,
      max: rule.maximum
    }

    for (var i=0; i<count; i++) {
      data.push(window.faker.lorem.lines(options));
    }
  } else if (rule.rule === 'paragraph') {
    options = {
      min: rule.minimum,
      max: rule.maximum
    }

    for (var i=0; i<count; i++) {
      data.push(window.faker.lorem.paragraphs(options));
    }
  } else if (rule.rule === 'sentence') {
    options = {
      min: rule.minimum,
      max: rule.maximum
    }

    for (var i=0; i<count; i++) {
      data.push(window.faker.lorem.sentence(options));
    }
  } else if (rule.rule === 'text') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.lorem.text());
    }
  } else if (rule.rule === 'word') {
    options = {
      length: {
        min: rule.minimum,
        max: rule.maximum
      }
    }

    for (var i=0; i<count; i++) {
      data.push(window.faker.lorem.word(options));
    }
  }

  return count === 1 ? data[0] : data;
}

const processPersonRules = (rule, count) => {
  var data = [];

  if (rule.rule === 'prefix') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.person.prefix());
    }
  } else if (rule.rule === 'firstName') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.person.firstName());
    }
  } else if (rule.rule === 'lastName') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.person.lastName());
    }
  } else if (rule.rule === 'middleName') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.person.middleName());
    }
  } else if (rule.rule === 'fullName') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.person.fullName());
    }
  } else if (rule.rule === 'suffix') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.person.suffix());
    }
  } else if (rule.rule === 'sex') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.person.sex());
    }
  } else if (rule.rule === 'jobTitle') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.person.jobTitle());
    }
  } else if (rule.rule === 'jobDescriptor') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.person.jobDescriptor());
    }
  } else if (rule.rule === 'jobType') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.person.jobType());
    }
  }

  return count === 1 ? data[0] : data;
}

const processLocationRules = (rule, count) => {
  var data = [];
  var options = {};

  if (rule.rule === 'buildingNumber') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.location.buildingNumber());
    }
  } else if (rule.rule === 'street') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.location.street());
    }
  } else if (rule.rule === 'streetAddress') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.location.streetAddress());
    }
  } else if (rule.rule === 'city') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.location.city());
    }
  } else if (rule.rule === 'state') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.location.state());
    }
  } else if (rule.rule === 'zipCode') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.location.zipCode());
    }
  } else if (rule.rule === 'country') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.location.countryCode());
    }
  } else if (rule.rule === 'countryCode') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.location.countryCode());
    }
  } else if (rule.rule === 'latitude') {
    options = {
      min: rule.minimum,
      max: rule.maximum,
      precision: parseInt(rule.precision)
    }

    for (var i=0; i<count; i++) {
      data.push(window.faker.location.latitude(options));
    }
  } else if (rule.rule === 'longitude') {
    options = {
      min: rule.minimum,
      max: rule.maximum,
      precision: parseInt(rule.precision)
    }

    for (var i=0; i<count; i++) {
      data.push(window.faker.location.longitude(options));
    }
  } else if (rule.rule === 'timeZone') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.location.timeZone());
    }
  }

  return count === 1 ? data[0] : data;
}

const processFinanceRules = (rule, count) => {
  var data = [];
  var options = {};

  if (rule.rule === 'accountNumber') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.finance.accountNumber());
    }
  } else if (rule.rule === 'amount') {
    options = {
      min: rule.minimum,
      max: rule.maximum,
    }

    for (var i=0; i<count; i++) {
      data.push(window.faker.finance.amount(options));
    }
  } else if (rule.rule === 'swiftOrBic') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.finance.bic());
    }
  } else if (rule.rule === 'creditCardNumber') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.finance.creditCardNumber());
    }
  } else if (rule.rule === 'creditCardNumber') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.finance.creditCardNumber());
    }
  } else if (rule.rule === 'currencyCode') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.finance.currencyCode());
    }
  } else if (rule.rule === 'currencyName') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.finance.currencyName());
    }
  } else if (rule.rule === 'currencySymbol') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.finance.currencySymbol());
    }
  } else if (rule.rule === 'bitcoinAddress') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.finance.bitcoinAddress());
    }
  } else if (rule.rule === 'ethereumAddress') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.finance.ethereumAddress());
    }
  } else if (rule.rule === 'transactionDescription') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.finance.transactionDescription());
    }
  } else if (rule.rule === 'transactionType') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.finance.transactionType());
    }
  }

  return count === 1 ? data[0] : data;
}

const processAirlineRules = (rule, count) => {
  var data = [];
  var options = {};

  if (rule.rule === 'airline') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.airline.airline());
    }
  } else if (rule.rule === 'airplane') {
    for (var i=0; i<count; i++) {
      data.push(() => {
        let ap = window.faker.airline.airplane();
        return `${ap.name} [${ap.iataTypeCode}]`
      });
    }
  } else if (rule.rule === 'airport') {
    for (var i=0; i<count; i++) {
      data.push(() => {
        let ap = window.faker.airline.airport();
        return `${ap.name} [${ap.iataCode}]`
      });
    }
  } else if (rule.rule === 'airportName') {
    for (var i=0; i<count; i++) {
      data.push(() => {
        let ap = window.faker.airline.airport();
        return ap.name;
      });
    }
  } else if (rule.rule === 'airportCode') {
    for (var i=0; i<count; i++) {
      data.push(() => {
        let ap = window.faker.airline.airport();
        return ap.iataCode;
      });
    }
  } else if (rule.rule === 'flightNumber') {
    options = {
      length: {
        min: rule.minimum,
        max: rule.maximum
      },
      addLeadingZeros: rule.leadingZeros
    }

    for (var i=0; i<count; i++) {
      data.push(window.faker.airline.flightNumber(options));
    }
  }

  return count === 1 ? data[0] : data;
}

const processCommerceRules = (rule, count) => {
  var data = [];
  var options = {};

  if (rule.rule === 'companyName') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.company.name());
    }
  } else if (rule.rule === 'department') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.commerce.department());
    }
  } else if (rule.rule === 'isbn') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.commerce.isbn());
    }
  } else if (rule.rule === 'price') {
    options = {
      min: rule.minimum,
      max: rule.maximum,
    }

    for (var i=0; i<count; i++) {
      data.push(window.faker.commerce.price(options));
    }
  } else if (rule.rule === 'product') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.commerce.product());
    }
  } else if (rule.rule === 'productDescription') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.commerce.productDescription());
    }
  } else if (rule.rule === 'productName') {
    for (var i=0; i<count; i++) {
      data.push(window.faker.commerce.productName());
    }
  }

  return count === 1 ? data[0] : data;
}

const generateObject = (obj) => {
  var data = {};
  var keys = Object.keys(obj);
  keys.forEach(key => {
    if (obj[key].type === 'object')
      data[key] = generateObject(obj[key].properties);
    else if (obj[key].type === 'array')
      data[key] = generateArray(obj[key]);
    else
      data[key] = fakeDataValueGenerator(obj[key])
  })

  return data;
}

const processObjectRules = (payload, count) => {
  var data = [];

  for (var i=0; i<count; i++) {
    data.push(generateObject(payload));
  }

  return count === 1 ? data[0] : data;
}

const generateArray = (obj) => {
  var data = [];
  for (var i=0; i<3; i++) {
    if (obj.subType === 'object')
      data.push(generateObject(obj.properties));
    else if (obj.subType === 'string') {
      data.push(fakeDataValueGenerator(obj));
    }
  }

  return data;
}