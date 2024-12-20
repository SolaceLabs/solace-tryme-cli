import { faker } from '@faker-js/faker';
import { fakeDataValueGenerator } from './feed-datahelper';
import { parseBoolean } from '../utils/parse';

export const processStringRules = (rule:any, count:number) => {
  var data: any[] = [];
  var options:any = {};
  var val:any = '';
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
      if (rule.type === 'integer') {
        try {
          val = parseInt(faker.helpers.enumValue(enumValue));
        } catch (error: any) {
          val = faker.helpers.enumValue(enumValue);
        }
        data.push(val);
      } else if (rule.type === 'number') {
        try {
          val = parseFloat(faker.helpers.enumValue(enumValue));
        } catch (error: any) {
          val = faker.helpers.enumValue(enumValue);
        }
        data.push(val);
      } else if (rule.type === 'boolean') {
        try {
          val = parseBoolean(faker.helpers.enumValue(enumValue));
        } catch (error: any) {
          val = faker.helpers.enumValue(enumValue);
        }
        data.push(val);
      } else {
        data.push(faker.helpers.enumValue(enumValue));
      }
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
  } else if (rule.rule === 'static') {
    for (var i=0; i<count; i++) {
      data.push(rule.static);
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
  } else if (rule.rule === 'countUp') {
    rule.current = rule.current === undefined ? rule.start : rule.current;
    for (var i=0; i<count; i++) {
      data.push(rule.current);
      rule.current += rule.change;
    }
  } else if (rule.rule === 'countDown') {
    rule.current = rule.current === undefined ? rule.start : rule.current;
    for (var i=0; i<count; i++) {
      data.push(rule.current);
      rule.current -= rule.change;
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

  if (rule.rule === 'currentDate') {
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
    
    for (var i=0; i<count; i++) {
        const [{ value: month }, , { value: day }, , { value: year }] = formatter.formatToParts(new Date());
      if (rule.format === 'MM-DD-YYYY')
        data.push(`${month}-${day}-${year}`);
      else if (rule.format === 'DD-MM-YYYY')
        data.push(`${day}-${month}-${year}`);
    }
  } else if (rule.rule === 'currentDateWithTime') {
    let formatter = new Intl.DateTimeFormat("en-US", {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });

    for (var i=0; i<count; i++) {
      let date = new Date();
      const [{ value: month }, , { value: day }, , { value: year }] = formatter.formatToParts(date);

      // Extract time components
      const hours24 = date.getHours();
      const hours12 = hours24 % 12 || 12; // Convert to 12-hour format
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const amPm = hours24 < 12 ? 'AM' : 'PM';

      if (rule.format === 'MM-DD-YYYY HH:mm:ss')
        data.push(`${month}-${day}-${year} ${String(hours24).padStart(2, '0')}:${minutes}:${seconds}`);
      else if (rule.format === 'MM-DD-YYYY hh:mm:ss a')
        data.push(`${month}-${day}-${year} ${hours12}:${minutes}:${seconds} ${amPm}`);
      else if (rule.format === 'MM-DD-YYYY HH:mm:ss')
        data.push(`${day}-${month}-${year} ${String(hours24).padStart(2, '0')}:${minutes}:${seconds}`);
      else if (rule.format === 'MM-DD-YYYY hh:mm:ss a')
        data.push(`${day}-${month}-${year} ${hours12}:${minutes}:${seconds} ${amPm}`);
    }
  } else if (rule.rule === 'currentTime') {
    let formatter = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: rule.format.endsWith('a') ? true : false,
    });

    for (var i=0; i<count; i++) {
      let date = new Date();
      data.push(formatter.format(date));
    }
  } else if (rule.rule === 'anytime') {
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
export const processInternetRules = (rule:any, count:number) => {
  var data: any[] = [];
  if (rule.rule === 'domainName') {
    for (var i=0; i<count; i++) {
      let value = faker.internet.domainName();
      data.push(rule.casing === 'mixed' ? value : rule.casing === 'upper' ? value.toUpperCase() : value.toLowerCase());
    }
  } else if (rule.rule === 'domainWord') {
    for (var i=0; i<count; i++) {
      let value = faker.internet.domainWord();
      data.push(rule.casing === 'mixed' ? value : rule.casing === 'upper' ? value.toUpperCase() : value.toLowerCase());
    }
  } else if (rule.rule === 'email') {
    for (var i=0; i<count; i++) {
      let value = faker.internet.email();
      data.push(rule.casing === 'mixed' ? value : rule.casing === 'upper' ? value.toUpperCase() : value.toLowerCase());
    }
  } else if (rule.rule === 'emoji') {
    for (var i=0; i<count; i++) {
      data.push(faker.internet.emoji());
    }
  } else if (rule.rule === 'ipv4') {
    for (var i=0; i<count; i++) {
      data.push(faker.internet.ipv4());
    }
  } else if (rule.rule === 'ipv6') {
    for (var i=0; i<count; i++) {
      data.push(faker.internet.ipv6());
    }
  } else if (rule.rule === 'mac') {
    for (var i=0; i<count; i++) {
      data.push(faker.internet.mac());
    }
  } else if (rule.rule === 'url') {
    for (var i=0; i<count; i++) {
      let value = faker.internet.url();
      data.push(rule.casing === 'mixed' ? value : rule.casing === 'upper' ? value.toUpperCase() : value.toLowerCase());
    }
  } else if (rule.rule === 'username') {
    for (var i=0; i<count; i++) {
      let value = faker.internet.userName();
      data.push(rule.casing === 'mixed' ? value : rule.casing === 'upper' ? value.toUpperCase() : value.toLowerCase());
    }
  }

  return count === 1 ? data[0] : data;
}

const generateObject = (obj:any) => {
  var data:any = {};
  var keys = Object.keys(obj ? obj : {});
  keys.forEach(key => {
    if (obj[key].type === 'object')
      data[key] = generateObject(obj[key].properties);
    else if (obj[key].type === 'array')
      data[key] = generateArray(obj[key]);
    else if (typeof obj[key] === 'object' && !Object.keys(obj[key]).length)
      data[key] = {}; // empty object (should we consider undefined!!)
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

export const processBaseObjectRules = (payload:any, count:number) => {
  var data: any[] = [];

  for (var i=0; i<count; i++) {
    data.push(fakeDataValueGenerator(payload));
  }

  return count === 1 ? data[0] : data;
}

const generateArray = (obj:any) => {
  var data:any = [];
  if (obj.items && Object.keys(obj.items).length === 0)
    return data;
  var count = obj.rule.count ? obj.rule.count : 2;
  for (var i=0; i<count; i++) {
    if (obj.subType === 'object')
      data.push(generateObject(obj?.items?.properties ? obj.items.properties : obj.properties));
    else if (obj.subType === 'array')
      data.push(generateObject(obj.items));
    // else if (obj.subType === 'string') {
    else
      data.push(fakeDataValueGenerator(obj));  
  }

  return data;
}
