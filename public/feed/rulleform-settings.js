function fixStringRulesParameters(rule, value, changed) {
  var panel = $('#rule_parameters');
  panel.empty();

  let minLength = value.minLength !== undefined ? value.minLength : 10;
  let maxLength = value.maxLength !== undefined ? value.maxLength : 100;

  if (rule === 'alpha' || rule === 'alphanumeric' || rule === 'nanoid') {
    if (changed) {
      value.minLength = rule !== 'nanoid' ? minLength : 5;
      value.maxLength = rule !== 'nanoid' ? maxLength : 5;
      value.casing = "mixed";
    }

    var p_casing = `
      <div class="row">
        <div class="col-sm-12 form-group">
          <label for="p_casing">Casing of the string</label>
          <select class="selectpicker form-control-border" data-width="100%" id="p_casing">
            <option` + (value.casing == 'mixed' ? ' selected' : '') + `>mixed</option>
            <option` + (value.casing == 'upper' ? ' selected' : '') + `>upper</option>
            <option` + (value.casing == 'lower' ? ' selected' : '') + `>lower</option>
          </select>
        </div>
      </div>`;

    var p_min_max = `
      <div class="row">
        <div class="col-sm-6">
          <div class="form-group">
            <label>Minimum Length</label>
            <input type="number" id="p_minimum" class="form-control" min="1" placeholder="Enter minimum length..." required
              value=${value.minLength !== undefined ? value.minLength : 10}>
            <div class="invalid-feedback">Invalid minimum length</div>
          </div>
        </div>
        <div class="col-sm-6">
          <div class="form-group">
            <label>Maximum Length</label>
            <input type="number" id="p_maximum" class="form-control" min="1" placeholder="Enter maximum length..." required
              value=${value.maxLength !== undefined ? value.maxLength : 10}>
            <div class="invalid-feedback">Invalid maximum length</div>
          </div>
        </div>
      </div>`

    if (rule !== 'nanoid') {
      panel.append(p_casing); 
      $("#p_casing").selectpicker('val', (value.casing !== undefined ? value.casing : 'mixed'));
    }

    panel.append(p_min_max); 
  } else if (rule === 'words') {
    var p_count = `
      <div class="form-group">
        <label>Word Count</label>
        <input type="number" id="p_count" class="form-control" placeholder="Enter number of words..." required
          value=${value.count !== undefined ? value.count : 5}>
        <div class="invalid-feedback">Invalid word count</div>
      </div>`;
    panel.append(p_count); 
  } else if (rule === 'fromRegExp') {
    var p_regexp = `
      <div class="form-group">
        <label>Pattern</label>
        <input type="text" id="p_regexp" class="form-control" placeholder="Enter the regular expression..." required
          value=${value.pattern !== undefined ? value.pattern : "[A-Za-z]{5,10}"}>
        <div class="invalid-feedback">Invalid pattern</div>
      </div>`;
    panel.append(p_regexp); 
  } else if (rule === 'static') {
    if (changed) {
      value.static = 'Hello!';
    }

    var p_static = `
      <div class="form-group">
        <label>Static Value</label>
        <input id="p_static" class="form-control" placeholder="Enter static value..." required
          value="${value.static !== undefined ? value.static : 'Hello!'}">
        <div class="invalid-feedback">Missing value</div>
      </div>`;
    panel.append(p_static); 
  } else if (rule === 'fromRegExp') {
    var p_regexp = `
      <div class="form-group">
        <label>Pattern</label>
        <input type="text" id="p_regexp" class="form-control" placeholder="Enter the regular expression..." required
          value=${value.pattern !== undefined ? value.pattern : "[A-Za-z]{5,10}"}>
        <div class="invalid-feedback">Invalid pattern</div>
      </div>`;
    panel.append(p_regexp); 
  } else if (rule === 'enum') {
    var enumValues = '';
    if (value.enum !== undefined) {
      (typeof value.enum === 'object') ? 
        enumValues = value.enum.toString() : 
        enumValues = value.enum.split(',').map(v => v.trim());
    }
    var p_enums = `
      <div class="form-group">
        <label for="p_enums">Enumeration</label>
        <textarea id="p_enums" class="form-control" rows="3" placeholder="Enter enum values...">${enumValues}</textarea>
        <div class="feedback" style="font-size: 12px;">A comma-separated list of values.</div>
        <div id="p_enums_feedback" class="invalid-feedback">Invalid or missing enumeration values</div>
      </div>`;

    panel.append(p_enums); 
  } else if (rule === 'numeric') {
    if (changed) {
      value.minLength = 5;
      value.maxLength = 5;
      value.leadingZeros = false;
    }

    var p_min_max = `
      <div class="row">
        <div class="col-sm-6">
          <div class="form-group">
            <label>Minimum Length</label>
            <input type="number" id="p_minimum" class="form-control" placeholder="Enter minimum length..." required
              value=${value.minLength !== undefined ? value.minLength : 10}>
            <div id="p_min_feedback" class="invalid-feedback">Invalid minumim length</div>
          </div>
        </div>
        <div class="col-sm-6">
          <div class="form-group">
            <label>Maximum Length</label>
            <input type="number" id="p_maximum" class="form-control" placeholder="Enter maximum length..." required
              value=${value.maxLength !== undefined ? value.maxLength : 10}>
            <div id="p_max_feedback" class="invalid-feedback">Invalid maximum length</div>
          </div>
        </div>
      </div>`

    var p_leadingZeroes = `
      <div class="form-check">
      <input class="form-check-input" type="checkbox" id="p_leading_zeros" ` + (value.leadingZeros ? 'checked' : '') + `>
      <label class="form-check-label">Pad with leading zeros (as needed)</label>
    </div>`

    panel.append(p_min_max);
    panel.append(p_leadingZeroes); 
  } else if (rule === 'symbol') {
    if (changed) {
      value.minLength = 5;
      value.maxLength = 5;
    }
    
    var p_min_max = `
      <div class="row">
        <div class="col-sm-6">
          <div class="form-group">
            <label>Minimum Length</label>
            <input type="number" id="p_minimum" class="form-control" placeholder="Enter minimum length..." required
              value=${value.minLength !== undefined ? value.minLength : 10}>
            <div id="p_min_feedback" class="invalid-feedback">Invalid minumim length</div>
          </div>
        </div>
        <div class="col-sm-6">
          <div class="form-group">
            <label>Maximum Length</label>
            <input type="number" id="p_maximum" class="form-control" placeholder="Enter maximum length..." required
              value=${value.maxLength !== undefined ? value.maxLength : 10}>
            <div id="p_max_feedback" class="invalid-feedback">Invalid maximum length</div>
          </div>
        </div>
      </div>`

    panel.append(p_min_max);
  }
}

function fixNumberRulesParameters(rule, value, changed) {
  var panel = $('#rule_parameters');
  panel.empty();

  if (changed) {
    value.minimum = 0;
    value.maximum = 1000;
    rule === 'float' ? value.fractionDigits = 2 : '';
  }

  if (rule === 'countUp' || rule === 'countDown') {
    if (changed) {
      value.start = rule === 'countUp' ? 1 : 9999999;
      value.change = 1;
    }

    var p_start_change = `
      <div class="row">
        <div class="col-sm-6">
          <div class="form-group">
            <label>Initial Value</label>
            <input type="number" id="p_start" class="form-control" placeholder="Enter start value..." required
              value=${value.start !== undefined ? value.start : (rule === 'countUp' ? 1 : 9999999)}>
            <div class="invalid-feedback">Invalid start value</div>
          </div>
        </div>
        <div class="col-sm-6">
          <div class="form-group">
            <label>Change</label>
            <input type="number" id="p_change" class="form-control" placeholder="Enter change..." required
              value=${value.change !== undefined ? value.change : rule === 'countUp' ? 1 : -1}>
            <div class="invalid-feedback">Invalid change value</div>
          </div>
        </div>
      </div>`

    panel.append(p_start_change); 
  } else if (rule === 'float' || rule === 'int') {
    var p_min_max = `
      <div class="row">
        <div class="col-sm-6">
          <div class="form-group">
            <label>Minimum Value</label>
            <input type="${rule === 'int' ? "number" : "decimal"}" id="p_minimum" class="form-control" placeholder="Enter minimum value..." required
              value=${value.minimum !== undefined ? value.minimum : 0}>
            <div class="invalid-feedback">Invalid minimum value</div>
          </div>
        </div>
        <div class="col-sm-6">
          <div class="form-group">
            <label>Maximum Value</label>
            <input type="${rule === 'int' ? "number" : "decimal"}" id="p_maximum" class="form-control" placeholder="Enter maximum value..." required
              value=${value.maximum !== undefined ? value.maximum : 1000}>
            <div class="invalid-feedback">Invalid maximum value</div>
          </div>
        </div>
      </div>`

    panel.append(p_min_max); 

    if (rule === 'float') {
      var p_fraction = `
        <div class="row">
          <div class="col-sm-12 form-group">
            <label for="p_fraction">Number of fraction digits</label>
            <select class="selectpicker form-control-border" data-width="100%" id="p_fraction">
              <option` + (value.fraction == '2' ? ' selected' : '') + `>2</option>
              <option` + (value.fraction == '4' ? ' selected' : '') + `>4</option>
              <option` + (value.fraction == '6' ? ' selected' : '') + `>6</option>
              <option` + (value.fraction == '8' ? ' selected' : '') + `>8</option>
            </select>
          </div>
        </div>`;
      panel.append(p_fraction); 
      $("#p_fraction").selectpicker('val', (value.fractionDigits !== undefined ? value.fractionDigits : '2'));
    }
  }
}

function fixAirlineRulesParameters(rule, value, changed) {
  var panel = $('#rule_parameters');
  panel.empty();

  if (rule === 'flightNumber') {
    if (changed) {
      value.minimum = 1;
      value.maximum = 3;
      value.leadingZeros = false;
    }
  
    var p_min_max = `
      <div class="row">
        <div class="col-sm-6">
          <div class="form-group">
            <label>Minimum Length</label>
            <input type="number" id="p_minimum" class="form-control" placeholder="Enter minimum length..." required
              value=${value.minimum !== undefined ? value.minimum : 2}>
            <div class="invalid-feedback">Invalid minimum length</div>
          </div>
        </div>
        <div class="col-sm-6">
          <div class="form-group">
            <label>Maximum Length</label>
            <input type="number" id="p_maximum" class="form-control" placeholder="Enter maximum length..." required
              value=${value.maximum !== undefined ? value.maximum : 3}>
            <div class="invalid-feedback">Invalid maximum length</div>
          </div>
        </div>
      </div>`

    var p_leadingZeroes = `
      <div class="form-check">
      <input class="form-check-input" type="checkbox" id="p_leading_zeros" ` + (value.leadingZeros ? 'checked' : '') + `>
      <label class="form-check-label">Pad with leading zeros (as needed)</label>
    </div>`

    panel.append(p_min_max);
    panel.append(p_leadingZeroes); 
  }
}

function fixCommerceRulesParameters(rule, value, changed) {
  var panel = $('#rule_parameters');
  panel.empty();

  if (rule === 'price') {
    if (changed) {
      value.minimum = 1;
      value.maximum = 999;
    }

    var p_min_max = `
      <div class="row">
        <div class="col-sm-6">
          <div class="form-group">
            <label>Minimum Value</label>
            <input type="number" id="p_minimum" class="form-control" placeholder="Enter minimum value..." required
              value=${value.minimum !== undefined ? value.minimum : 0}>
            <div class="invalid-feedback">Invalid minimum value</div>
          </div>
        </div>
        <div class="col-sm-6">
          <div class="form-group">
            <label>Maximum Value</label>
            <input type="number" id="p_maximum" class="form-control" placeholder="Enter maximum value..." required
              value=${value.maximum !== undefined ? value.maximum : 1000}>
            <div class="invalid-feedback">Invalid maximum value</div>
          </div>
        </div>
      </div>`

    panel.append(p_min_max);
  }
}

function fixLocationRulesParameters(rule, value, changed) {
  var panel = $('#rule_parameters');
  panel.empty();

  if (rule === 'latitude' || rule === 'longitude') {
    if (changed) {
      value.minimum = -90;
      value.maximum = 90;
      value.precision = 4;
    }
  
    var p_min_max = `
      <div class="row">
        <div class="col-sm-6">
          <div class="form-group">
            <label>Minimum Value</label>
            <input type="number" id="p_minimum" class="form-control" placeholder="Enter minimum value..." required
              value=${value.minimum !== undefined ? value.minimum : -90}>
            <div class="invalid-feedback">Invalid minimum value</div>
          </div>
        </div>
        <div class="col-sm-6">
          <div class="form-group">
            <label>Maximum Value</label>
            <input type="number" id="p_maximum" class="form-control" placeholder="Enter maximum value..." required
              value=${value.maximum !== undefined ? value.maximum : 90}>
            <div class="invalid-feedback">Invalid maximum value</div>
          </div>
        </div>
      </div>`

    panel.append(p_min_max); 

    var p_precision = `
      <div class="row">
        <div class="col-sm-12 form-group">
          <label for="p_precision">Number of decimal points of precision</label>
          <select class="selectpicker form-control-border" data-width="100%" id="p_precision">
            <option` + (value.percision == 2 ? ' selected' : '') + `>2</option>
            <option` + (value.percision == 4 ? ' selected' : '') + `>4</option>
            <option` + (value.percision == 6 ? ' selected' : '') + `>6</option>
          </select>
        </div>
      </div>`;
    panel.append(p_precision); 
    $("#p_precision").selectpicker('val', (value.p_precision !== undefined ? value.p_precision : '2'));
  }
}

function fixFinanceRulesParameters(rule, value, changed) {
  var panel = $('#rule_parameters');
  panel.empty();

  if (rule === 'amount') {
    if (changed) {
      value.minimum = 0;
      value.maximum = 1000;
    }
    
    var p_min_max = `
      <div class="row">
        <div class="col-sm-6">
          <div class="form-group">
            <label>Minimum Value</label>
            <input type="number" id="p_minimum" class="form-control" placeholder="Enter minimum value..." required
              value=${value.minimum !== undefined ? value.minimum : 0}>
            <div class="invalid-feedback">Invalid minimum value</div>
          </div>
        </div>
        <div class="col-sm-6">
          <div class="form-group">
            <label>Maximum Value</label>
            <input type="number" id="p_maximum" class="form-control" placeholder="Enter maximum value..." required
              value=${value.maximum !== undefined ? value.maximum : 1000}>
            <div class="invalid-feedback">Invalid maximum value</div>
          </div>
        </div>
      </div>`

    panel.append(p_min_max); 
  }
}

function fixBooleanRulesParameters(rule, value, changed) {
  var panel = $('#rule_parameters');
  panel.empty();
}

function fixPersonRulesParameters(rule, value, changed) {
  var panel = $('#rule_parameters');
  panel.empty();
}

function fixNullRulesParameters(rule, value, changed) {
  var panel = $('#rule_parameters');
  panel.empty();
}

function fixDateRulesParameters(rule, value, changed) {
  var panel = $('#rule_parameters');
  panel.empty();

  if (rule === 'currentDate') {
    value.format = "MM-DD-YYYY";

    var p_format = `
      <div class="row">
        <div class="col-sm-12 form-group">
          <label for="p_format">Date Format</label>
          <select class="selectpicker form-control-border" data-width="100%" id="p_format">
            <option` + (value.format == 'MM-DD-YYYY' ? ' selected' : '') + `>MM-DD-YYYY</option>
            <option` + (value.format == 'DD-MM-YYYY' ? ' selected' : '') + `>DD-MM-YYYY</option>
          </select>
        </div>
      </div>`;

    panel.append(p_format); 
    $("#p_format").selectpicker('val', (value.format !== undefined ? value.format : 'MM-DD-YYYY'));
  } else if (rule === 'currentTime') {
    value.format = "HH:mm:ss";

    var p_format = `
      <div class="row">
        <div class="col-sm-12 form-group">
          <label for="p_format">Time Format</label>
          <select class="selectpicker form-control-border" data-width="100%" id="p_format">
            <option` + (value.format == 'HH:mm:ss' ? ' selected' : '') + `>HH:mm:ss</option>
            <option` + (value.format == 'hh:mm:ss a' ? ' selected' : '') + `>hh:mm:ss a</option>
          </select>
        </div>
      </div>`;

    panel.append(p_format); 
    $("#p_format").selectpicker('val', (value.format !== undefined ? value.format : 'HH:mm:ss'));
  } else if (rule === 'currentDateWithTime') {
    value.format = "MM-DD-YYYY HH:mm:ss";

    var p_format = `
      <div class="row">
        <div class="col-sm-12 form-group">
          <label for="p_format">Date-Time Format</label>
          <select class="selectpicker form-control-border" data-width="100%" id="p_format">
            <option` + (value.format == 'MM-DD-YYYY HH:mm:ss' ? ' selected' : '') + `>MM-DD-YYYY HH:mm:ss</option>
            <option` + (value.format == 'MM-DD-YYYY hh:mm:ss a' ? ' selected' : '') + `>MM-DD-YYYY hh:mm:ss a</option>
            <option` + (value.format == 'DD-MM-YYYY HH:mm:ss' ? ' selected' : '') + `>DD-MM-YYYY HH:mm:ss</option>
            <option` + (value.format == 'DD-MM-YYYY hh:mm:ss a' ? ' selected' : '') + `>DD-MM-YYYY hh:mm:ss a</option>
          </select>
        </div>
      </div>`;

    panel.append(p_format); 
    $("#p_format").selectpicker('val', (value.format !== undefined ? value.format : 'MM-DD-YYYY HH:mm:ss'));
  } else if (rule === 'future' || rule === 'past') {
    var p_years = `
      <div class="form-group">
        <label>Number of Years</label>
        <input type="number" id="p_years" class="form-control" placeholder="Enter number of years..." required
          value=${value.years !== undefined ? value.years : 10}>
        <div class="invalid-feedback">Invalid value</div>
      </div>`

    panel.append(p_years); 
  } else if (rule === 'recent' || rule === 'soon') {
    var p_days = `
      <div class="form-group">
        <label>Number of Days</label>
        <input type="number" id="p_days" class="form-control" placeholder="Enter number of years..." required
          value=${value.days !== undefined ? value.days : 10}>
        <div class="invalid-feedback">Invalid value</div>
      </div>`

    panel.append(p_days); 
  } else if (rule === 'month' || rule === 'weekday') {
    var p_abbreviated = `
      <div class="form-check">
      <input class="form-check-input" type="checkbox" id="p_abbreviated" ` + (value.abbreviated ? 'checked' : '') + `>
      <label class="form-check-label">Abbreviate the return value</label>
    </div>`

    panel.append(p_abbreviated); 
  }
}

function fixLoremRulesParameters(rule, value, changed) {
  var panel = $('#rule_parameters');
  panel.empty();
  
  if (changed) {
    if (rule === 'lines' || rule === 'paragraph') {
      value.minimum = 2;
      value.maximum = 5;
    } else if (rule === 'sentence' || rule === 'word') {
      value.minimum = 5;
      value.maximum = 10;
    }
  }

  if (rule === 'lines' || rule === 'paragraph' || rule === 'sentence' || rule === 'word') {
    var minLabel = '';
    var maxLabel = '';
    if (rule === 'lines') minLabel = 'Minimum number of lines', maxLabel = 'Maximum number of lines';
    if (rule === 'paragraph') minLabel = 'Minimum number of sentences', maxLabel = 'Maximum number of sentences';
    if (rule === 'sentence') minLabel = 'Minimum number of words', maxLabel = 'Maximum number of words';
    if (rule === 'word') minLabel = 'Minimum word length', maxLabel = 'Maximum word length';

    var p_min_max = `
      <div class="row">
        <div class="col-sm-6">
          <div class="form-group">
            <label>${minLabel}</label>
            <input type="number" id="p_minimum" class="form-control" placeholder="Enter minimum value..." required
              value=${value.minimum !== undefined ? value.minimum : 2}>
              <div class="invalid-feedback">Invalid minimum value</div>
              </div>
        </div>
        <div class="col-sm-6">
          <div class="form-group">
            <label>${maxLabel}</label>
            <input type="number" id="p_maximum" class="form-control" placeholder="Enter maximum value..." required
              value=${value.maximum !== undefined ? value.maximum : 5}>
            <div class="invalid-feedback">Invalid maximum value</div>
          </div>
        </div>
      </div>`

    panel.append(p_min_max); 
  } else if (rule === 'words') {
    var p_count = `
      <div class="form-group">
        <label>Word Count</label>
        <input type="number" id="p_count" class="form-control" placeholder="Enter number of words..." required
          value=${value.count !== undefined ? value.count : 5}>
        <div class="invalid-feedback">Invalid word count</div>
      </div>`;
    panel.append(p_count); 
  }
}

function fixInternetRulesParameters(rule, value, changed) {
  var panel = $('#rule_parameters');
  panel.empty();

  if (rule === 'domainName' || rule === 'domainWord' || rule === 'email' || rule === 'url' || rule === 'username') {
    if (changed) {
      value.casing = 'lower';
    }

    var p_casing = `
      <div class="row">
        <div class="col-sm-12 form-group">
          <label for="p_casing">Casing of the string</label>
          <select class="selectpicker form-control-border" data-width="100%" id="p_casing">
            <option` + (value.casing == 'mixed' ? ' selected' : '') + `>mixed</option>
            <option` + (value.casing == 'upper' ? ' selected' : '') + `>upper</option>
            <option` + (value.casing == 'lower' ? ' selected' : '') + `>lower</option>
          </select>
        </div>
      </div>`;

    panel.append(p_casing);
    $("#p_casing").selectpicker('val', (value.casing !== undefined ? value.casing : 'lower'));
  }
}
