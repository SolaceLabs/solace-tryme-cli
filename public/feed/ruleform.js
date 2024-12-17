function setRuleSet(selectEl, feedlbackEl, selectedGroup, type) {
  selectEl.empty()
  var groups = Object.keys(defaultRules);
  var selectedOption = null;
  groups.forEach((group) => {
    option = document.createElement('option');
    option.dataset.group = group;
    option.dataset.content = `<b>${group}</b> <i>[${Object.keys(defaultRules[group].rules).length}]</i>`;
    if (selectedGroup === group) selectedOption = group;
    option.innerHTML = group;
    selectEl.append(option);
  });
  selectEl.selectpicker('val', selectedOption);
  selectEl.selectpicker('refresh');

  feedlbackEl.html(defaultRules[selectedGroup].description);
}

function setRulesetFeedback(index, selectEl) {
  var groups = Object.keys(defaultRules);
  selectEl.html(defaultRules[groups[index]].description);
}

function setRules(selectEl, feedbackEl, group, selected) {
  selectEl.empty()
  var rules = Object.keys(defaultRules[group].rules);
  var selectedOption = null;
  rules.forEach((rule) => {
    option = document.createElement('option');
    option.dataset.group = group;
    option.dataset.content = `<b>${rule}</b>`;
    if (selected === rule) selectedOption = rule;
    option.innerHTML = rule;
    selectEl.append(option);
  });
  selectEl.selectpicker('val', selectedOption);
  selectEl.selectpicker('refresh');
  feedbackEl.html(defaultRules[group].rules[selected].description);
}

function setRuleFeedback(index, group, selectEl) {
  var rules = Object.keys(defaultRules[group].rules);
  if (!index)
    selectEl.html(defaultRules[group].rules[rules[0]].description);
  else
    selectEl.html(defaultRules[group].rules[rules[index]].description);
}

// FORM PARAMETERS

function fixParameters(group, rule, value, changed = false) {
  console.log('group, rule', group, rule, changed);
  if (group === 'StringRules') {
    fixStringRulesParameters(rule, value, changed);
  } else if (group === 'NullRules') {
    fixNullRulesParameters(rule, value, changed);
  } else if (group === 'NumberRules') {
    fixNumberRulesParameters(rule, value, changed);
  } else if (group === 'BooleanRules') {
    fixBooleanRulesParameters(rule, value, changed);
  } else if (group == 'DateRules') {
    fixDateRulesParameters(rule, value, changed);
  } else if (group == 'LoremRules') {
    fixLoremRulesParameters(rule, value, changed);
  } else if (group == 'PersonRules') {
    fixPersonRulesParameters(rule, value, changed);
  } else if (group == 'LocationRules') {
    fixLocationRulesParameters(rule, value, changed);
  } else if (group == 'FinanceRules') {
    fixFinanceRulesParameters(rule, value, changed);
  } else if (group == 'AirlineRules') {
    fixAirlineRulesParameters(rule, value, changed);
  } else if (group == 'CommerceRules') {
    fixCommerceRulesParameters(rule, value, changed);
  } else if (group == 'InternetRules') {
    fixInternetRulesParameters(rule, value, changed);
  }
}

function ruleAssignSubmit() {
  'use strict';

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  // const forms = document.querySelectorAll('#parameterRulesForm');
  const forms = document.querySelectorAll('.needs-validation#parameterRulesForm');


  // Loop over them and prevent submission
  Array.prototype.slice.call(forms).forEach((form) => {
    form.addEventListener('submit', async (event) => {
      console.log('In submit', form.id, form.classList);
      event.preventDefault();
      if (!form.checkValidity()) {
        event.stopPropagation();
      }

      let type = '';
      let valid = false;
      let ruleFor = $('#parameterRuleType').text();
      if (ruleFor === 'API Variable') {
        valid = validateAPIVariableRule();
        if (valid) {
          $('#field_rules_form').modal('toggle');
          var page = window.location.href.split('/').pop();
          var feed = JSON.parse(localStorage.getItem('currentFeed'));
          configureAPIVariables(feed.rules.rules, true);
  
          // const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
          const path = window.location.origin;
          await fetch(path + `/feedrules`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            },
            body: localStorage.getItem('currentFeed')
          });
  
          toastr.success('Rule updated successfully.')
          form.classList.toggle('was-validated');  
          return false;
        }
  
      } else {
        type = $('#parameterTopicVariableName').text();
        valid = type ? validateTopicVariableRule() : validatePayloadFieldRule();
        if (valid) {
          $('#field_rules_form').modal('toggle');
          var page = window.location.href.split('/').pop();
          var messageName = page.split('#').pop();
          var feed = JSON.parse(localStorage.getItem('currentFeed'));
          var ruleIndex = localStorage.getItem('currentRuleIndex');
          if (ruleIndex === null) ruleIndex = 0;
          if (type) configureMessageSendTopics(messageName, feed.rules, ruleIndex, true);
  
          // const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
          const path = window.location.origin;
          await fetch(path + `/feedrules`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            },
            body: localStorage.getItem('currentFeed')
          });
  
          toastr.success('Rule updated successfully.')
          form.classList.toggle('was-validated');
  
          if (!type) {
            var feed = JSON.parse(localStorage.getItem('currentFeed'));
            var messageName = page.split('#').pop();
            messageName = decodeURIComponent(messageName);

            var topicRules = feed.rules.filter((r) => r.messageName === messageName);
            var ruleIndex = localStorage.getItem('currentRuleIndex');
            if (ruleIndex === null) ruleIndex = 0;
            var rule = topicRules[ruleIndex];
            if (!rule) return;
          
            var parent = document.getElementById('payload-variable-pane');
            parent.innerHTML = '';
            parent.style.width = 'auto';
      
            var node = $('#payload-tree-pane').treeview('getSelected')
            if (!node || !node.length) return;
  
            var el = document.createElement('div');
            var field = rule.payload[node[0].path];
            if (node[0].path.indexOf('.') > 0)
              field = getFieldRule(rule.payload, node[0].path)
      
            el.innerHTML = buildParamRuleUI('send', field.rule, rule.topic, 'payload', node[0]);
            parent.appendChild(el);            
          }
        
          return false;
        }
  
      }
    });
  });
}
