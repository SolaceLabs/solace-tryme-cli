import { faker } from '@faker-js/faker';
import { fakeDataValueGenerator } from './feed-datahelper';

export const processStringRules = (rule:any, count:number) => {
  var data: any[] = [];
  var options:any = {};
  if (rule.rule === 'alpha') {
    options = {
      length: {
        min: rule.minLength,
        max: rule.maxLength
      },
      casing: rule.casing
    }

    for (var i=0; i<count; i++) {
      data.push(faker.string.alpha(options));
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
      data.push(faker.string.alphanumeric(options));
    }
  } else if (rule.rule === 'enum') {
    let enumObj:any = {};
    let enumValue:any = {};
    rule.enum.forEach((t: string) => {
      enumObj[`'${t}'`] = t;
    })
    enumValue = Object.freeze(enumObj);

    for (var i=0; i<count; i++) {
      data.push(faker.helpers.enumValue(enumValue));
    }
  } else if (rule.rule === 'words') {
    for (var i=0; i<count; i++) {
      data.push(faker.lorem.words(rule.count));
    }
  } else if (rule.rule === 'nanoid') {
    options = {
      min: rule.minLength,
      max: rule.maxLength
    }

    for (var i=0; i<count; i++) {
      data.push(faker.string.nanoid(options));
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
      data.push(faker.string.numeric(options));
    }
  } else if (rule.rule === 'symbol') {
    options = {
      min: rule.minLength,
      max: rule.maxLength
    }

    for (var i=0; i<count; i++) {
      data.push(faker.string.symbol(options));
    }
  } else if (rule.rule === 'uuid') {
    for (var i=0; i<count; i++) {
      data.push(faker.string.uuid());
    }
  } else if (rule.rule === 'fromRegExp') {
    for (var i=0; i<count; i++) {
      data.push(faker.helpers.fromRegExp(rule.pattern));
    }
  } else if (rule.rule === 'phoneNumber') {
    for (var i=0; i<count; i++) {
      data.push(faker.phone.number());
    }
  } else if (rule.rule === 'json') {
    for (var i=0; i<count; i++) {
      data.push(faker.datatype.json());
    }
  }

  return count === 1 ? data[0] : data;
}

export const processNullRules = (rule:any, count:number) => {
  var data: any[] = [];
  var options:any = {};

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

export const processNumberRules = (rule:any, count:number) => {
  var data: any[] = [];
  var options:any = {};
  if (rule.rule === 'int') {
    options = {
      min: rule.minimum,
      max: rule.maximum
    }

    for (var i=0; i<count; i++) {
      data.push(faker.number.int(options));
    }
  } else if (rule.rule === 'float') {
    options = {
      min: rule.minimum,
      max: rule.maximum,
      fractionDigits: parseInt(rule.fractionDigits)
    }

    for (var i=0; i<count; i++) {
      data.push(faker.number.float(options));
    }
  }

  return count === 1 ? data[0] : data;
}

export const processBooleanRules = (rule:any, count:number) => {
  var data: any[] = [];

  if (rule.rule === 'boolean') {
    for (var i=0; i<count; i++) {
      data.push(faker.datatype.boolean());
    }
    
  }

  return count === 1 ? data[0] : data;
}

export const processDateRules = (rule:any, count:number) => {
  var data: any[] = [];
  var options:any = {};

  if (rule.rule === 'anytime') {
    for (var i=0; i<count; i++) {
      data.push(new Date(faker.date.anytime()).toDateString());
    }
  } else if (rule.rule === 'future') {
    options = {
      years: rule.years
    }

    for (var i=0; i<count; i++) {
      data.push(new Date(faker.date.future(options)).toDateString());
    }
  } else if (rule.rule === 'past') {
    options = {
      years: rule.years
    }

    for (var i=0; i<count; i++) {
      data.push(new Date(faker.date.past(options)).toDateString());
    }
  } else if (rule.rule === 'recent') {
    options = {
      days: rule.days
    }

    for (var i=0; i<count; i++) {
      data.push(new Date(faker.date.recent()).toDateString());
    }
  } else if (rule.rule === 'soon') {
    options = {
      days: rule.days
    }

    for (var i=0; i<count; i++) {
      data.push(new Date(faker.date.soon()).toDateString());
    }
  } else if (rule.rule === 'month') {
    options = {
      abbreviated: rule.abbreviated
    }

    for (var i=0; i<count; i++) {
      data.push(faker.date.month(options));
    }
  } else if (rule.rule === 'weekday') {
    options = {
      abbreviated: rule.abbreviated
    }

    for (var i=0; i<count; i++) {
      data.push(faker.date.weekday(options));
    }
  }

  return count === 1 ? data[0] : data;
}
export const processLoremRules = (rule:any, count:number) => {
  var data: any[] = [];
  var options:any = {};

  if (rule.rule === 'lines') {
    options = {
      min: rule.minimum,
      max: rule.maximum
    }

    for (var i=0; i<count; i++) {
      data.push(faker.lorem.lines(options));
    }
  } else if (rule.rule === 'paragraph') {
    options = {
      min: rule.minimum,
      max: rule.maximum
    }

    for (var i=0; i<count; i++) {
      data.push(faker.lorem.paragraphs(options));
    }
  } else if (rule.rule === 'sentence') {
    options = {
      min: rule.minimum,
      max: rule.maximum
    }

    for (var i=0; i<count; i++) {
      data.push(faker.lorem.sentence(options));
    }
  } else if (rule.rule === 'text') {
    for (var i=0; i<count; i++) {
      data.push(faker.lorem.text());
    }
  } else if (rule.rule === 'word') {
    options = {
      length: {
        min: rule.minimum,
        max: rule.maximum
      }
    }

    for (var i=0; i<count; i++) {
      data.push(faker.lorem.word(options));
    }
  }

  return count === 1 ? data[0] : data;
}
export const processPersonRules = (rule:any, count:number) => {
  var data: any[] = [];

  if (rule.rule === 'prefix') {
    for (var i=0; i<count; i++) {
      data.push(faker.person.prefix());
    }
  } else if (rule.rule === 'firstName') {
    for (var i=0; i<count; i++) {
      data.push(faker.person.firstName());
    }
  } else if (rule.rule === 'lastName') {
    for (var i=0; i<count; i++) {
      data.push(faker.person.lastName());
    }
  } else if (rule.rule === 'middleName') {
    for (var i=0; i<count; i++) {
      data.push(faker.person.middleName());
    }
  } else if (rule.rule === 'fullName') {
    for (var i=0; i<count; i++) {
      data.push(faker.person.fullName());
    }
  } else if (rule.rule === 'suffix') {
    for (var i=0; i<count; i++) {
      data.push(faker.person.suffix());
    }
  } else if (rule.rule === 'sex') {
    for (var i=0; i<count; i++) {
      data.push(faker.person.sex());
    }
  } else if (rule.rule === 'jobTitle') {
    for (var i=0; i<count; i++) {
      data.push(faker.person.jobTitle());
    }
  } else if (rule.rule === 'jobDescriptor') {
    for (var i=0; i<count; i++) {
      data.push(faker.person.jobDescriptor());
    }
  } else if (rule.rule === 'jobType') {
    for (var i=0; i<count; i++) {
      data.push(faker.person.jobType());
    }
  }

  return count === 1 ? data[0] : data;
}
export const processLocationRules = (rule:any, count:number) => {
  var data: any[] = [];
  var options:any = {};

  if (rule.rule === 'buildingNumber') {
    for (var i=0; i<count; i++) {
      data.push(faker.location.buildingNumber());
    }
  } else if (rule.rule === 'street') {
    for (var i=0; i<count; i++) {
      data.push(faker.location.street());
    }
  } else if (rule.rule === 'streetAddress') {
    for (var i=0; i<count; i++) {
      data.push(faker.location.streetAddress());
    }
  } else if (rule.rule === 'city') {
    for (var i=0; i<count; i++) {
      data.push(faker.location.city());
    }
  } else if (rule.rule === 'state') {
    for (var i=0; i<count; i++) {
      data.push(faker.location.state());
    }
  } else if (rule.rule === 'zipCode') {
    for (var i=0; i<count; i++) {
      data.push(faker.location.zipCode());
    }
  } else if (rule.rule === 'country') {
    for (var i=0; i<count; i++) {
      data.push(faker.location.countryCode());
    }
  } else if (rule.rule === 'countryCode') {
    for (var i=0; i<count; i++) {
      data.push(faker.location.countryCode());
    }
  } else if (rule.rule === 'latitude') {
    options = {
      min: rule.minimum,
      max: rule.maximum,
      precision: parseInt(rule.precision)
    }

    for (var i=0; i<count; i++) {
      data.push(faker.location.latitude(options));
    }
  } else if (rule.rule === 'longitude') {
    options = {
      min: rule.minimum,
      max: rule.maximum,
      precision: parseInt(rule.precision)
    }

    for (var i=0; i<count; i++) {
      data.push(faker.location.longitude(options));
    }
  } else if (rule.rule === 'timeZone') {
    for (var i=0; i<count; i++) {
      data.push(faker.location.timeZone());
    }
  }

  return count === 1 ? data[0] : data;
}
export const processFinanceRules = (rule:any, count:number) => {
  var data: any[] = [];
  var options:any = {};

  if (rule.rule === 'accountNumber') {
    for (var i=0; i<count; i++) {
      data.push(faker.finance.accountNumber());
    }
  } else if (rule.rule === 'amount') {
    options = {
      min: rule.minimum,
      max: rule.maximum,
    }

    for (var i=0; i<count; i++) {
      data.push(faker.finance.amount(options));
    }
  } else if (rule.rule === 'swiftOrBic') {
    for (var i=0; i<count; i++) {
      data.push(faker.finance.bic());
    }
  } else if (rule.rule === 'creditCardNumber') {
    for (var i=0; i<count; i++) {
      data.push(faker.finance.creditCardNumber());
    }
  } else if (rule.rule === 'creditCardNumber') {
    for (var i=0; i<count; i++) {
      data.push(faker.finance.creditCardNumber());
    }
  } else if (rule.rule === 'currencyCode') {
    for (var i=0; i<count; i++) {
      data.push(faker.finance.currencyCode());
    }
  } else if (rule.rule === 'currencyName') {
    for (var i=0; i<count; i++) {
      data.push(faker.finance.currencyName());
    }
  } else if (rule.rule === 'currencySymbol') {
    for (var i=0; i<count; i++) {
      data.push(faker.finance.currencySymbol());
    }
  } else if (rule.rule === 'bitcoinAddress') {
    for (var i=0; i<count; i++) {
      data.push(faker.finance.bitcoinAddress());
    }
  } else if (rule.rule === 'ethereumAddress') {
    for (var i=0; i<count; i++) {
      data.push(faker.finance.ethereumAddress());
    }
  } else if (rule.rule === 'transactionDescription') {
    for (var i=0; i<count; i++) {
      data.push(faker.finance.transactionDescription());
    }
  } else if (rule.rule === 'transactionType') {
    for (var i=0; i<count; i++) {
      data.push(faker.finance.transactionType());
    }
  }

  return count === 1 ? data[0] : data;
}
export const processAirlineRules = (rule:any, count:number) => {
  var data: any[] = [];
  var options:any = {};

  if (rule.rule === 'airline') {
    for (var i=0; i<count; i++) {
      data.push(faker.airline.airline());
    }
  } else if (rule.rule === 'airplane') {
    for (var i=0; i<count; i++) {
      data.push(() => {
        let ap = faker.airline.airplane();
        return `${ap.name} [${ap.iataTypeCode}]`
      });
    }
  } else if (rule.rule === 'airport') {
    for (var i=0; i<count; i++) {
      data.push(() => {
        let ap = faker.airline.airport();
        return `${ap.name} [${ap.iataCode}]`
      });
    }
  } else if (rule.rule === 'airportName') {
    for (var i=0; i<count; i++) {
      data.push(() => {
        let ap = faker.airline.airport();
        return ap.name;
      });
    }
  } else if (rule.rule === 'airportCode') {
    for (var i=0; i<count; i++) {
      data.push(() => {
        let ap = faker.airline.airport();
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
      data.push(faker.airline.flightNumber(options));
    }
  }

  return count === 1 ? data[0] : data;
}
export const processCommerceRules = (rule:any, count:number) => {
  var data: any[] = [];
  var options:any = {};

  if (rule.rule === 'companyName') {
    for (var i=0; i<count; i++) {
      data.push(faker.company.name());
    }
  } else if (rule.rule === 'department') {
    for (var i=0; i<count; i++) {
      data.push(faker.commerce.department());
    }
  } else if (rule.rule === 'isbn') {
    for (var i=0; i<count; i++) {
      data.push(faker.commerce.isbn());
    }
  } else if (rule.rule === 'price') {
    options = {
      min: rule.minimum,
      max: rule.maximum,
    }

    for (var i=0; i<count; i++) {
      data.push(faker.commerce.price(options));
    }
  } else if (rule.rule === 'product') {
    for (var i=0; i<count; i++) {
      data.push(faker.commerce.product());
    }
  } else if (rule.rule === 'productDescription') {
    for (var i=0; i<count; i++) {
      data.push(faker.commerce.productDescription());
    }
  } else if (rule.rule === 'productName') {
    for (var i=0; i<count; i++) {
      data.push(faker.commerce.productName());
    }
  }

  return count === 1 ? data[0] : data;
}

const generateObject = (obj:any) => {
  var data:any = {};
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

export const processObjectRules = (payload:any, count:number) => {
  var data: any[] = [];

  for (var i=0; i<count; i++) {
    data.push(generateObject(payload));
  }

  return count === 1 ? data[0] : data;
}

const generateArray = (obj:any) => {
  var data:any = [];
  for (var i=0; i<3; i++) {
    if (obj.subType === 'object')
      data.push(generateObject(obj.properties));
    else if (obj.subType === 'string') {
      data.push(fakeDataValueGenerator(obj));
    }
  }

  return data;
}