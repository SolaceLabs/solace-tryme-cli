function validateAPIVariableRule() {
  let ruleSet = $('#parameterRuleSets').val();
  let rule = $('#parameterRules').val();
  let valid = true;

  let param = $("#parameterTopicVariableName").text();
  
  var feed = JSON.parse(localStorage.getItem('currentFeed'));
  var apiVar= feed.rules.rules[param];

  if (ruleSet === 'StringRules') {
    let minimum = undefined;
    let maximum = undefined;
    let enumValues = undefined;
    let count = undefined;
    let pattern = undefined;

    if (rule === 'alpha' || rule === 'alphanumeric' || rule === 'nanoid' || rule === 'sample' || rule === 'symbol' || rule === 'numeric') {
      minimum = parseInt($('#p_minimum').first().val())
      maximum = parseInt($('#p_maximum').first().val())
      if (isNaN(minimum) || minimum < 1) {
        document.getElementById('p_minimum').setCustomValidity('Invalid minimum value!');
        document.getElementById('p_minimum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_minimum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_minimum').setCustomValidity('');
      }
      
      if (isNaN(maximum) || maximum < 1) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_maximum').setCustomValidity('');
      }

      if (valid && maximum < minimum) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      }
    } else if (rule === 'enum') {
      let values = $('#p_enums').first().val();
      if (!values) {
        document.getElementById('p_enums').setCustomValidity('Missing enumeration values!');
        document.getElementById('p_enums').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_enums')), 3000);
        valid = false;
      } else {
        document.getElementById('p_enums').setCustomValidity('');
      }
      
      enumValues = values.split(',').map(item=>item.trim())
    } else if (rule === 'words') {
      count = parseInt($('#p_count').first().val())
      if (isNaN(count) || count < 1) {
        document.getElementById('p_count').setCustomValidity('Invalid works count!');
        document.getElementById('p_count').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_count')), 3000);
        valid = false;
      } else {
        document.getElementById('p_count').setCustomValidity('');
      }
    } else if (rule === 'fromRegExp') {
      pattern = $('#p_regexp').val()
      if (!pattern.length) {
        document.getElementById('p_regexp').setCustomValidity('Missing regular expression!');
        document.getElementById('p_regexp').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_regexp')), 3000);
        valid = false;
      } else {
        document.getElementById('p_regexp').setCustomValidity('');
      }
    } else if (rule === 'uuid' || rule === 'json' || rule === 'phoneNumber') {
      // regular flow would set this up
    }

    if (valid) {
      apiVar.rule = {
        name: apiVar.rule.name,
        type: apiVar.rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
      }

      if (minimum !== undefined) 
        apiVar.rule.minLength = minimum;
      if (maximum !== undefined) 
        apiVar.rule.maxLength = maximum;
      if (enumValues !== undefined) 
        apiVar.rule.enum = enumValues;
        if (count !== undefined) 
        apiVar.rule.count = count;
      if (pattern !== undefined) 
        apiVar.rule.pattern = pattern;
      if (rule === 'alpha' || rule === 'alphanumeric')
        apiVar.rule.casing = $('#p_casing').selectpicker('val');
      if (rule === 'numeric')
        apiVar.rule.leadingZeros = $('#p_leading_zeros').is(':checked')

      console.log(apiVar.rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'NullRules') {
    apiVar.rule = {
      name: apiVar.rule.name,
      type: apiVar.rule.type,
      group: $('#parameterRuleSets').selectpicker('val'),
      rule: $('#parameterRules').selectpicker('val'),
    }

    console.log(apiVar.rule);
    localStorage.setItem('changed', true);
    localStorage.setItem('currentFeed', JSON.stringify(feed));

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'NumberRules') {
    let minimum = parseInt($('#p_minimum').first().val())
    let maximum = parseInt($('#p_maximum').first().val())

    if (isNaN(minimum)) {
      document.getElementById('p_minimum').setCustomValidity('Invalid minimum value!');
      document.getElementById('p_minimum').reportValidity();
      setTimeout(() => clearValidationError(document.getElementById('p_minimum')), 3000);
      valid = false;
    } else {
      document.getElementById('p_minimum').setCustomValidity('');
    }
    
    if (isNaN(maximum)) {
      document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
      document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
    } else {
      document.getElementById('p_maximum').setCustomValidity('');
    }

    if (valid && maximum < minimum) {
      document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
      document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
    }

    if (valid) {
      apiVar.rule = {
        name: apiVar.rule.name,
        type: apiVar.rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
        minimum: minimum,
        maximum: maximum,
      }

      if (rule === 'float')
        apiVar.rule.fractionDigits = parseInt($('#p_fraction').selectpicker('val')),

      console.log(apiVar.rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'FinanceRules') {
    let minimum = undefined; 
    let maximum = undefined;

    if (rule === 'amount') {
      minimum = parseInt($('#p_minimum').first().val())
      maximum = parseInt($('#p_maximum').first().val())

      if (isNaN(minimum) || minimum < 0) {
        document.getElementById('p_minimum').setCustomValidity('Invalid minimum value!');
        document.getElementById('p_minimum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_minimum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_minimum').setCustomValidity('');
      }
      
      if (isNaN(maximum) || maximum < 0) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_maximum').setCustomValidity('');
      }
  
      if (valid && maximum < minimum) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      }
    }

    if (valid) {
      apiVar.rule = {
        name: apiVar.rule.name,
        type: apiVar.rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
      }      

      if (rule === 'amount') {
        apiVar.rule.minimum = minimum;
        apiVar.rule.maximum = maximum;
      }

      console.log(apiVar.rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'AirlineRules') {
    let minimum = undefined;
    let maximum = undefined;

    if (rule === 'flightNumber') {
      minimum = parseInt($('#p_minimum').first().val())
      maximum = parseInt($('#p_maximum').first().val())
      
      if (isNaN(minimum) || minimum < 1) {
        document.getElementById('p_minimum').setCustomValidity('Invalid minimum value!');
        document.getElementById('p_minimum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_minimum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_minimum').setCustomValidity('');
      }
      
      if (isNaN(maximum) || maximum < 1) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_maximum').setCustomValidity('');
      }

      if (valid &&  maximum < minimum) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      }
    }

    if (valid) {
      apiVar.rule = {
        name: apiVar.rule.name,
        type: apiVar.rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
      }

      if (rule === 'flightNumber') {
        apiVar.rule.minimum = minimum;
        apiVar.rule.maximum = maximum;
        apiVar.rule.leadingZeros = $('#p_leading_zeros').is(':checked')      
      }

      console.log(apiVar.rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'LocationRules') {
    let minimum = undefined;
    let maximum = undefined;

    if (rule === 'latitude' || rule === 'longitude') {
      minimum = parseInt($('#p_minimum').first().val())
      maximum = parseInt($('#p_maximum').first().val())
      
      if (isNaN(minimum)) {
        document.getElementById('p_minimum').setCustomValidity('Invalid minimum value!');
        document.getElementById('p_minimum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_minimum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_minimum').setCustomValidity('');
      }
      
      if (isNaN(maximum)) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_maximum').setCustomValidity('');
      }
        
      // if (valid && maximum < minimum) {
      //   document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
      //   document.getElementById('p_maximum').reportValidity();
      //   setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
      //   valid = false;
      // }  
    }

    if (valid) {
      apiVar.rule = {
        name: apiVar.rule.name,
        type: apiVar.rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
      }

      if (rule === 'latitude' || rule === 'longitude') {
        apiVar.rule.minimum = minimum;
        apiVar.rule.maximum = maximum;
        apiVar.rule.precision = parseInt($('#p_precision').selectpicker('val'));
      }

      console.log(apiVar.rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'CommerceRules') {
    if (rule === 'price') {
      minimum = parseInt($('#p_minimum').first().val())
      maximum = parseInt($('#p_maximum').first().val())
      if (isNaN(minimum) || minimum < 1) {
        document.getElementById('p_minimum').setCustomValidity('Invalid minimum value!');
        document.getElementById('p_minimum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_minimum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_minimum').setCustomValidity('');
      }

      if (isNaN(maximum) || maximum < 1) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_maximum').setCustomValidity('');
      }

      if (valid && maximum < minimum) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      }
    }

    if (valid) {
      apiVar.rule = {
        name: apiVar.rule.name,
        type: apiVar.rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
      }

      if (rule === 'price') {
        apiVar.rule.minimum = minimum;
        apiVar.rule.maximum = maximum;
      }

      console.log(apiVar.rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'BooleanRules') {
    apiVar.rule = {
      name: apiVar.rule.name,
      type: apiVar.rule.type,
      group: $('#parameterRuleSets').selectpicker('val'),
      rule: $('#parameterRules').selectpicker('val'),
    }

    console.log(apiVar.rule);
    localStorage.setItem('changed', true);
    localStorage.setItem('currentFeed', JSON.stringify(feed));

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'PersonRules') {
    apiVar.rule = {
      name: apiVar.rule.name,
      type: apiVar.rule.type,
      group: $('#parameterRuleSets').selectpicker('val'),
      rule: $('#parameterRules').selectpicker('val'),
    }

    console.log(apiVar.rule);
    localStorage.setItem('changed', true);
    localStorage.setItem('currentFeed', JSON.stringify(feed));

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'DateRules') {
    let years = undefined;
    let days = undefined;

    if (rule === 'future' || rule === 'past') {
      years = parseInt($('#p_years').first().val())
      if (isNaN(years) || years < 1) {
        document.getElementById('p_years').setCustomValidity('Invalid years value!');
        document.getElementById('p_years').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_years')), 3000);
        valid = false;
      } else {
        document.getElementById('p_years').setCustomValidity('');
      }
    } else if (rule === 'recent' || rule === 'soon') {
      days = parseInt($('#p_days').first().val())
      if (isNaN(days) || days < 1) {
        document.getElementById('p_days').setCustomValidity('Invalid days value!');
        document.getElementById('p_days').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_days')), 3000);
        valid = false;
      } else {
        document.getElementById('p_days').setCustomValidity('');
      }
    }

    if (valid) {
      apiVar.rule = {
        name: apiVar.rule.name,
        type: apiVar.rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
      }

      if (years)
        apiVar.rule.years = years;
      if (days)
        apiVar.rule.days = days;

      if (rule === 'month' || rule === 'weekday')
        apiVar.rule.abbreviated = $('#p_abbreviated').is(':checked');

      console.log(apiVar.rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'LoremRules') {
    let minimum = undefined;
    let maximum = undefined;

    if (rule === 'lines' || rule === 'paragraph' || rule === 'sentence' || rule === 'word') {
      minimum = parseInt($('#p_minimum').first().val())
      maximum = parseInt($('#p_maximum').first().val())
      if (isNaN(minimum) || minimum < 1) {
        document.getElementById('p_minimum').setCustomValidity('Invalid minimum value!');
        document.getElementById('p_minimum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_minimum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_minimum').setCustomValidity('');
      }

      if (isNaN(maximum) || maximum < 1) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_maximum').setCustomValidity('');
      }

      if (valid && maximum < minimum) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      }
    }

    if (valid) {
      apiVar.rule = {
        name: apiVar.rule.name,
        type: apiVar.rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
      }

      if (rule === 'lines' || rule === 'paragraph' || rule === 'sentence' || rule === 'word') {
        apiVar.rule.minimum = minimum;
        apiVar.rule.maximum = maximum;
      }

      console.log(apiVar.rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  }
}

function validateTopicVariableRule() {
  let ruleSet = $('#parameterRuleSets').val();
  let rule = $('#parameterRules').val();
  let valid = true;

  let topic = $("#parameterTopicName").text();
  let message = $("#parameterMessageName").text();
  let param = $("#parameterTopicVariableName").text();
  
  var feed = JSON.parse(localStorage.getItem('currentFeed'));
  var topicVar= feed.rules.find(r => r.topic === topic && r.messageName === message);

  if (ruleSet === 'StringRules') {
    let minimum = undefined;
    let maximum = undefined;
    let enumValues = undefined;
    let count = undefined;
    let pattern = undefined;

    if (rule === 'alpha' || rule === 'alphanumeric' || rule === 'nanoid' || rule === 'sample' || rule === 'symbol' || rule === 'numeric') {
      minimum = parseInt($('#p_minimum').first().val())
      maximum = parseInt($('#p_maximum').first().val())
      if (isNaN(minimum) || minimum < 1) {
        document.getElementById('p_minimum').setCustomValidity('Invalid minimum value!');
        document.getElementById('p_minimum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_minimum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_minimum').setCustomValidity('');
      }
      
      if (isNaN(maximum) || maximum < 1) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_maximum').setCustomValidity('');
      }

      if (valid && maximum < minimum) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      }
    } else if (rule === 'enum') {
      let values = $('#p_enums').first().val();
      if (!values) {
        document.getElementById('p_enums').setCustomValidity('Missing enumeration values!');
        document.getElementById('p_enums').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_enums')), 3000);
        valid = false;
      } else {
        document.getElementById('p_enums').setCustomValidity('');
      }
      
      enumValues = values.split(',').map(item=>item.trim())
    } else if (rule === 'words') {
      count = parseInt($('#p_count').first().val())
      if (isNaN(count) || count < 1) {
        document.getElementById('p_count').setCustomValidity('Invalid works count!');
        document.getElementById('p_count').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_count')), 3000);
        valid = false;
      } else {
        document.getElementById('p_count').setCustomValidity('');
      }
    } else if (rule === 'fromRegExp') {
      pattern = $('#p_regexp').val()
      if (!pattern.length) {
        document.getElementById('p_regexp').setCustomValidity('Missing regular expression!');
        document.getElementById('p_regexp').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_regexp')), 3000);
        valid = false;
      } else {
        document.getElementById('p_regexp').setCustomValidity('');
      }
    } else if (rule === 'uuid' || rule === 'json' || rule === 'phoneNumber') {
      // regular flow would set this up
    }

    if (valid) {
      topicVar.topicParameters[param].rule = {
        name: topicVar.topicParameters[param].rule.name,
        type: topicVar.topicParameters[param].rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
      }

      if (minimum !== undefined) 
        topicVar.topicParameters[param].rule.minLength = minimum;
      if (maximum !== undefined) 
        topicVar.topicParameters[param].rule.maxLength = maximum;
      if (enumValues !== undefined) 
        topicVar.topicParameters[param].rule.enum = enumValues;
        if (count !== undefined) 
        topicVar.topicParameters[param].rule.count = count;
      if (pattern !== undefined) 
        topicVar.topicParameters[param].rule.pattern = pattern;
      if (rule === 'alpha' || rule === 'alphanumeric')
        topicVar.topicParameters[param].rule.casing = $('#p_casing').selectpicker('val');
      if (rule === 'numeric')
        topicVar.topicParameters[param].rule.leadingZeros = $('#p_leading_zeros').is(':checked')

      console.log(topicVar.topicParameters[param].rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'NullRules') {
    topicVar.topicParameters[param].rule = {
      name: topicVar.topicParameters[param].rule.name,
      type: topicVar.topicParameters[param].rule.type,
      group: $('#parameterRuleSets').selectpicker('val'),
      rule: $('#parameterRules').selectpicker('val'),
    }

    console.log(topicVar.topicParameters[param].rule);
    localStorage.setItem('changed', true);
    localStorage.setItem('currentFeed', JSON.stringify(feed));

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'NumberRules') {
    let minimum = topicVar.topicParameters[param].rule.rule === 'int' ? parseInt($('#p_minimum').first().val()) : parseFloat($('#p_minimum').first().val())
    let maximum = topicVar.topicParameters[param].rule.rule === 'int' ? parseInt($('#p_maximum').first().val()) : parseFloat($('#p_maximum').first().val())
    if (isNaN(minimum)) {
      document.getElementById('p_minimum').setCustomValidity('Invalid minimum value!');
      document.getElementById('p_minimum').reportValidity();
      setTimeout(() => clearValidationError(document.getElementById('p_minimum')), 3000);
      valid = false;
    } else {
      document.getElementById('p_minimum').setCustomValidity('');
    }
    
    if (isNaN(maximum)) {
      document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
      document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
    } else {
      document.getElementById('p_maximum').setCustomValidity('');
    }

    if (valid && maximum < minimum) {
      document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
      document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
    }

    if (valid) {
      topicVar.topicParameters[param].rule = {
        name: topicVar.topicParameters[param].rule.name,
        type: topicVar.topicParameters[param].rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
        minimum: minimum,
        maximum: maximum,
      }

      if (rule === 'float')
        topicVar.topicParameters[param].rule.fractionDigits = parseInt($('#p_fraction').selectpicker('val')),

      console.log(topicVar.topicParameters[param].rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'FinanceRules') {
    let minimum = undefined; 
    let maximum = undefined;

    if (rule === 'amount') {
      minimum = parseInt($('#p_minimum').first().val())
      maximum = parseInt($('#p_maximum').first().val())

      if (isNaN(minimum) || minimum < 0) {
        document.getElementById('p_minimum').setCustomValidity('Invalid minimum value!');
        document.getElementById('p_minimum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_minimum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_minimum').setCustomValidity('');
      }
      
      if (isNaN(maximum) || maximum < 0) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_maximum').setCustomValidity('');
      }
  
      if (valid && maximum < minimum) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      }
    }

    if (valid) {
      topicVar.topicParameters[param].rule = {
        name: topicVar.topicParameters[param].rule.name,
        type: topicVar.topicParameters[param].rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
      }      

      if (rule === 'amount') {
        topicVar.topicParameters[param].rule.minimum = minimum;
        topicVar.topicParameters[param].rule.maximum = maximum;
      }

      console.log(topicVar.topicParameters[param].rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'AirlineRules') {
    let minimum = undefined;
    let maximum = undefined;

    if (rule === 'flightNumber') {
      minimum = parseInt($('#p_minimum').first().val())
      maximum = parseInt($('#p_maximum').first().val())
      
      if (isNaN(minimum) || minimum < 1) {
        document.getElementById('p_minimum').setCustomValidity('Invalid minimum value!');
        document.getElementById('p_minimum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_minimum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_minimum').setCustomValidity('');
      }
      
      if (isNaN(maximum) || maximum < 1) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_maximum').setCustomValidity('');
      }

      if (valid &&  maximum < minimum) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      }
    }

    if (valid) {
      topicVar.topicParameters[param].rule = {
        name: topicVar.topicParameters[param].rule.name,
        type: topicVar.topicParameters[param].rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
      }

      if (rule === 'flightNumber') {
        topicVar.topicParameters[param].rule.minimum = minimum;
        topicVar.topicParameters[param].rule.maximum = maximum;
        topicVar.topicParameters[param].rule.leadingZeros = $('#p_leading_zeros').is(':checked')      
      }

      console.log(topicVar.topicParameters[param].rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'LocationRules') {
    let minimum = undefined;
    let maximum = undefined;

    if (rule === 'latitude' || rule === 'longitude') {
      minimum = parseInt($('#p_minimum').first().val())
      maximum = parseInt($('#p_maximum').first().val())
      
      if (isNaN(minimum)) {
        document.getElementById('p_minimum').setCustomValidity('Invalid minimum value!');
        document.getElementById('p_minimum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_minimum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_minimum').setCustomValidity('');
      }
      
      if (isNaN(maximum)) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_maximum').setCustomValidity('');
      }
        
      // if (valid && maximum < minimum) {
      //   document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
      //   document.getElementById('p_maximum').reportValidity();
      //   setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
      //   valid = false;
      // }  
    }

    if (valid) {
      topicVar.topicParameters[param].rule = {
        name: topicVar.topicParameters[param].rule.name,
        type: topicVar.topicParameters[param].rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
      }

      if (rule === 'latitude' || rule === 'longitude') {
        topicVar.topicParameters[param].rule.minimum = minimum;
        topicVar.topicParameters[param].rule.maximum = maximum;
        topicVar.topicParameters[param].rule.precision = parseInt($('#p_precision').selectpicker('val'));
      }

      console.log(topicVar.topicParameters[param].rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'CommerceRules') {
    if (rule === 'price') {
      minimum = parseInt($('#p_minimum').first().val())
      maximum = parseInt($('#p_maximum').first().val())
      if (isNaN(minimum) || minimum < 1) {
        document.getElementById('p_minimum').setCustomValidity('Invalid minimum value!');
        document.getElementById('p_minimum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_minimum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_minimum').setCustomValidity('');
      }

      if (isNaN(maximum) || maximum < 1) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_maximum').setCustomValidity('');
      }

      if (valid && maximum < minimum) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      }
    }

    if (valid) {
      topicVar.topicParameters[param].rule = {
        name: topicVar.topicParameters[param].rule.name,
        type: topicVar.topicParameters[param].rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
      }

      if (rule === 'price') {
        topicVar.topicParameters[param].rule.minimum = minimum;
        topicVar.topicParameters[param].rule.maximum = maximum;
      }

      console.log(topicVar.topicParameters[param].rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'BooleanRules') {
    topicVar.topicParameters[param].rule = {
      name: topicVar.topicParameters[param].rule.name,
      type: topicVar.topicParameters[param].rule.type,
      group: $('#parameterRuleSets').selectpicker('val'),
      rule: $('#parameterRules').selectpicker('val'),
    }

    console.log(topicVar.topicParameters[param].rule);
    localStorage.setItem('changed', true);
    localStorage.setItem('currentFeed', JSON.stringify(feed));

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'PersonRules') {
    topicVar.topicParameters[param].rule = {
      name: topicVar.topicParameters[param].rule.name,
      type: topicVar.topicParameters[param].rule.type,
      group: $('#parameterRuleSets').selectpicker('val'),
      rule: $('#parameterRules').selectpicker('val'),
    }

    console.log(topicVar.topicParameters[param].rule);
    localStorage.setItem('changed', true);
    localStorage.setItem('currentFeed', JSON.stringify(feed));

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'DateRules') {
    let years = undefined;
    let days = undefined;

    if (rule === 'future' || rule === 'past') {
      years = parseInt($('#p_years').first().val())
      if (isNaN(years) || years < 1) {
        document.getElementById('p_years').setCustomValidity('Invalid years value!');
        document.getElementById('p_years').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_years')), 3000);
        valid = false;
      } else {
        document.getElementById('p_years').setCustomValidity('');
      }
    } else if (rule === 'recent' || rule === 'soon') {
      days = parseInt($('#p_days').first().val())
      if (isNaN(days) || days < 1) {
        document.getElementById('p_days').setCustomValidity('Invalid days value!');
        document.getElementById('p_days').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_days')), 3000);
        valid = false;
      } else {
        document.getElementById('p_days').setCustomValidity('');
      }
    }

    if (valid) {
      topicVar.topicParameters[param].rule = {
        name: topicVar.topicParameters[param].rule.name,
        type: topicVar.topicParameters[param].rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
      }

      if (years)
        topicVar.topicParameters[param].rule.years = years;
      if (days)
        topicVar.topicParameters[param].rule.days = days;

      if (rule === 'month' || rule === 'weekday')
        topicVar.topicParameters[param].rule.abbreviated = $('#p_abbreviated').is(':checked');

      console.log(topicVar.topicParameters[param].rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'LoremRules') {
    let minimum = undefined;
    let maximum = undefined;

    if (rule === 'lines' || rule === 'paragraph' || rule === 'sentence' || rule === 'word') {
      minimum = parseInt($('#p_minimum').first().val())
      maximum = parseInt($('#p_maximum').first().val())
      if (isNaN(minimum) || minimum < 1) {
        document.getElementById('p_minimum').setCustomValidity('Invalid minimum value!');
        document.getElementById('p_minimum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_minimum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_minimum').setCustomValidity('');
      }

      if (isNaN(maximum) || maximum < 1) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_maximum').setCustomValidity('');
      }

      if (valid && maximum < minimum) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      }
    }

    if (valid) {
      topicVar.topicParameters[param].rule = {
        name: topicVar.topicParameters[param].rule.name,
        type: topicVar.topicParameters[param].rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
      }

      if (rule === 'lines' || rule === 'paragraph' || rule === 'sentence' || rule === 'word') {
        topicVar.topicParameters[param].rule.minimum = minimum;
        topicVar.topicParameters[param].rule.maximum = maximum;
      }

      console.log(topicVar.topicParameters[param].rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  }
}

function validatePayloadFieldRule() {
  let ruleSet = $('#parameterRuleSets').val();
  let rule = $('#parameterRules').val();
  let valid = true;

  let topic = $("#parameterTopicName").text();
  let message = $("#parameterMessageName").text();
  let fieldParam = $("#parameterPayloadFieldName").text();
  
  var feed = JSON.parse(localStorage.getItem('currentFeed'));
  var feedRule = feed.rules.find(r => r.topic === topic && r.messageName === message);

  var field = feedRule.payload[fieldParam];
  if (fieldParam.indexOf('.') > 0)
    field = getFieldRule(feedRule.payload, fieldParam)

  if (ruleSet === 'StringRules') {
    let minimum = undefined;
    let maximum = undefined;
    let enumValues = undefined;
    let count = undefined;
    let pattern = undefined;

    if (rule === 'alpha' || rule === 'alphanumeric' || rule === 'nanoid' || rule === 'sample' || rule === 'symbol' || rule === 'numeric') {
      minimum = parseInt($('#p_minimum').first().val())
      maximum = parseInt($('#p_maximum').first().val())
      if (isNaN(minimum) || minimum < 1) {
        document.getElementById('p_minimum').setCustomValidity('Invalid minimum value!');
        document.getElementById('p_minimum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_minimum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_minimum').setCustomValidity('');
      }

      if (isNaN(maximum) || maximum < 1) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_maximum').setCustomValidity('');
      }
      
      if (valid && maximum < minimum) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        document.getElementById('p_maximum').reportValidity();
        valid = false;
      }
    } else if (rule === 'enum') {
      let values = $('#p_enums').first().val();
      if (!values) {
        document.getElementById('p_enums').setCustomValidity('Missing enumeration values!');
        document.getElementById('p_enums').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_enums')), 3000);
        valid = false;
      } else {
        document.getElementById('p_enums').setCustomValidity('');
      }
      
      enumValues = values.split(',').map(item=>item.trim())
    } else if (rule === 'words') {
      count = parseInt($('#p_count').first().val())
      if (isNaN(count) || count < 1) {
        document.getElementById('p_count').setCustomValidity('Invalid works count!');
        document.getElementById('p_count').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_count')), 3000);
        valid = false;
      } else {
        document.getElementById('p_count').setCustomValidity('');
      }
    } else if (rule === 'fromRegExp') {
      pattern = $('#p_regexp').val()
      if (!pattern.length) {
        document.getElementById('p_regexp').setCustomValidity('Missing regular expression!');
        document.getElementById('p_regexp').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_regexp')), 3000);
        valid = false;
      } else {
        document.getElementById('p_regexp').setCustomValidity('');
      }
    } else if (rule === 'uuid' || rule === 'json') {
      // regular flow would set this up
    }

    if (valid) {
      field.rule = {
        name: field.rule.name,
        type: field.rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
      }

      if (minimum !== undefined) 
        field.rule.minLength = minimum;
      if (maximum !== undefined) 
        field.rule.maxLength = maximum;
      if (enumValues !== undefined) 
        field.rule.enum = enumValues;
        if (count !== undefined) 
        field.rule.count = count;
      if (pattern !== undefined) 
        field.rule.pattern = pattern;
      if (field.rule.rule === 'alpha' || field.rule.rule === 'alphanumeric')
        field.rule.casing = $('#p_casing').selectpicker('val');
      if (field.rule.rule === 'numeric')
        field.rule.leadingZeros = $('#p_leading_zeros').is(':checked')

      console.log(field.rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'NullRules') {
    field.rule = {
      name: field.rule.name,
      type: field.rule.type,
      group: $('#parameterRuleSets').selectpicker('val'),
      rule: $('#parameterRules').selectpicker('val'),
    }

    console.log(field.rule);
    localStorage.setItem('changed', true);
    localStorage.setItem('currentFeed', JSON.stringify(feed));

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'NumberRules') {
    let minimum = field.rule.rule === 'int' ? parseInt($('#p_minimum').first().val()) : parseFloat($('#p_minimum').first().val())
    let maximum = field.rule.rule === 'int' ? parseInt($('#p_maximum').first().val()) : parseFloat($('#p_maximum').first().val())
    
    if (isNaN(minimum)) {
      document.getElementById('p_minimum').setCustomValidity('Invalid minimum value!');
      document.getElementById('p_minimum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_minimum')), 3000);
        valid = false;
    } else {
      document.getElementById('p_minimum').setCustomValidity('');
    }
    
    if (isNaN(maximum)) {
      document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
      document.getElementById('p_maximum').reportValidity();
      setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
      valid = false;
    } else {
      document.getElementById('p_maximum').setCustomValidity('');
    }

    if (valid && maximum < minimum) {
      document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
      document.getElementById('p_maximum').reportValidity();
      setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
      valid = false;
    }

    if (valid) {
        field.rule = {
        name: field.rule.name,
        type: field.rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
        minimum: minimum,
        maximum: maximum,
      }

      if (field.rule.rule === 'float')
        field.rule.fractionDigits = parseInt($('#p_fraction').selectpicker('val')),

      console.log(field.rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'FinanceRules') {
    let minimum = undefined;
    let maximum = undefined;

    if (rule === 'amount') {
      minimum = parseInt($('#p_minimum').first().val())
      maximum = parseInt($('#p_maximum').first().val())
      
      if (isNaN(minimum) || minimum < 0) {
        document.getElementById('p_minimum').setCustomValidity('Invalid minimum value!');
        document.getElementById('p_minimum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_minimum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_minimum').setCustomValidity('');
      }
      
      if (isNaN(maximum) || maximum < 0) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_maximum').setCustomValidity('');
      }

      if (valid && maximum < minimum) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      }  
    }
    field.rule = {
      name: field.rule.name,
      type: field.rule.type,
      group: $('#parameterRuleSets').selectpicker('val'),
      rule: $('#parameterRules').selectpicker('val'),
    }

    if (rule === 'accountNumber') {
      field.rule.minimum = minimum;
      field.rule.maximum = maximum;
    }

    console.log(field.rule);
    localStorage.setItem('changed', true);
    localStorage.setItem('currentFeed', JSON.stringify(feed));

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'AirlineRules') {
    let minimum = undefined;
    let maximum = undefined;

    if (rule === 'flightNumber') {
      minimum = parseInt($('#p_minimum').first().val())
      maximum = parseInt($('#p_maximum').first().val())
      
      if (isNaN(minimum) || minimum < 1) {
        document.getElementById('p_minimum').setCustomValidity('Invalid minimum value!');
        document.getElementById('p_minimum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_minimum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_minimum').setCustomValidity('');
      }
      
      if (isNaN(maximum) || maximum < 1) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_maximum').setCustomValidity('');
      }

      if (valid && maximum < minimum) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      }
    }

    if (valid) {
      field.rule = {
        name: field.rule.name,
        type: field.rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
      }

      if (rule === 'flightNumber') {
        field.rule.minimum = minimum;
        field.rule.maximum = maximum;
        field.rule.leadingZeros = $('#p_leading_zeros').is(':checked')      
      }

      console.log(field.rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'LocationRules') {
    let minimum = undefined;
    let maximum = undefined;

    if (rule === 'latitude' || rule === 'longitude') {
      minimum = parseInt($('#p_minimum').first().val())
      maximum = parseInt($('#p_maximum').first().val())
      
      if (isNaN(minimum)) {
        document.getElementById('p_minimum').setCustomValidity('Invalid minimum value!');
        document.getElementById('p_minimum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_minimum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_minimum').setCustomValidity('');
      }
      
      if (isNaN(maximum)) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_maximum').setCustomValidity('');
      }

      // if (valid && maximum < minimum) {
      //   document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
      //   document.getElementById('p_maximum').reportValidity();
      //   setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
      //   valid = false;
      // }  
    }

    if (valid) {
      field.rule = {
        name: field.rule.name,
        type: field.rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
      }

      if (rule === 'latitude' || rule === 'longitude') {
        field.rule.minimum = minimum;
        field.rule.maximum = maximum;
        field.rule.precision = $('#p_precision').selectpicker('val');
      }

      console.log(field.rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'CommerceRules') {
    if (rule === 'price') {
      minimum = parseInt($('#p_minimum').first().val())
      maximum = parseInt($('#p_maximum').first().val())
      if (isNaN(minimum) || minimum < 1) {
        document.getElementById('p_minimum').setCustomValidity('Invalid minimum value!');
        document.getElementById('p_minimum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_minimum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_minimum').setCustomValidity('');
      }

      if (isNaN(maximum) || maximum < 1) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_maximum').setCustomValidity('');
      }

      if (valid && maximum < minimum) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      }
    }

    if (valid) {
      field.rule = {
        name: field.rule.name,
        type: field.rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
      }

      if (rule === 'price') {
        field.rule.minimum = minimum;
        field.rule.maximum = maximum;
      }

      console.log(field.rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'BooleanRules') {
    field.rule = {
      name: field.rule.name,
      type: field.rule.type,
      group: $('#parameterRuleSets').selectpicker('val'),
      rule: $('#parameterRules').selectpicker('val'),
    }

    console.log(field.rule);
    localStorage.setItem('changed', true);
    localStorage.setItem('currentFeed', JSON.stringify(feed));

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'PersonRules') {
    field.rule = {
      name: field.rule.name,
      type: field.rule.type,
      group: $('#parameterRuleSets').selectpicker('val'),
      rule: $('#parameterRules').selectpicker('val'),
    }

    console.log(field.rule);
    localStorage.setItem('changed', true);
    localStorage.setItem('currentFeed', JSON.stringify(feed));

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'DateRules') {
    let years = undefined;
    let days = undefined;

    if (rule === 'future' || rule === 'past') {
      years = parseInt($('#p_years').first().val())
      if (isNaN(years) || years < 1) {
        document.getElementById('p_years').setCustomValidity('Invalid years value!');
        document.getElementById('p_years').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_years')), 3000);
        valid = false;
      } else {
        document.getElementById('p_years').setCustomValidity('');
      }
    } else if (rule === 'recent' || rule === 'soon') {
      days = parseInt($('#p_days').first().val())
      if (isNaN(days) || days < 1) {
        document.getElementById('p_days').setCustomValidity('Invalid days value!');
        document.getElementById('p_days').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_days')), 3000);
        valid = false;
      } else {
        document.getElementById('p_days').setCustomValidity('');
      }
    }

    if (valid) {
      field.rule = {
        name: field.rule.name,
        type: field.rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
      }

      if (years)
        field.rule.years = years;
      if (days)
        field.rule.days = days;

      if (rule === 'month' || rule === 'weekday')
        field.rule.abbreviated = $('#p_abbreviated').is(':checked');

      console.log(field.rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  } else if (ruleSet === 'LoremRules') {
    let minimum = undefined;
    let maximum = undefined;

    if (rule === 'lines' || rule === 'paragraph' || rule === 'sentence' || rule === 'word') {
      minimum = parseInt($('#p_minimum').first().val())
      maximum = parseInt($('#p_maximum').first().val())
      if (isNaN(minimum) || minimum < 1) {
        document.getElementById('p_minimum').setCustomValidity('Invalid minimum value!');
        document.getElementById('p_minimum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_minimum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_minimum').setCustomValidity('');
      }

      if (isNaN(maximum) || maximum < 1) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      } else {
        document.getElementById('p_maximum').setCustomValidity('');
      }

      if (valid && maximum < minimum) {
        document.getElementById('p_maximum').setCustomValidity('Invalid maximum value!');
        document.getElementById('p_maximum').reportValidity();
        setTimeout(() => clearValidationError(document.getElementById('p_maximum')), 3000);
        valid = false;
      }
    }

    if (valid) {
      field.rule = {
        name: field.rule.name,
        type: field.rule.type,
        group: $('#parameterRuleSets').selectpicker('val'),
        rule: $('#parameterRules').selectpicker('val'),
      }

      if (rule === 'lines' || rule === 'paragraph' || rule === 'sentence' || rule === 'word') {
        field.rule.minimum = minimum;
        field.rule.maximum = maximum;
      }

      console.log(field.rule);
      localStorage.setItem('changed', true);
      localStorage.setItem('currentFeed', JSON.stringify(feed));
    }

    var els = document.querySelectorAll('.form-control');
    els.forEach(el => typeof el.reportValidity === 'function' ? el.reportValidity() : '');
    return valid;
  }
}

function clearValidationError(el) {
  el.setCustomValidity(""); 
  el.reportValidity();
}