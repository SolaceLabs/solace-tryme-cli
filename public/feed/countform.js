function validateInstanceCountRule() {
  let valid = true;

  let topic = $("#arr_parameterTopicName").text();
  let message = $("#arr_parameterMessageName").text();
  let fieldParam = $("#arr_parameterPayloadFieldName").text();
  
  var feed = JSON.parse(localStorage.getItem('currentFeed'));
  var feedRule = feed.rules.find(r => r.topic === topic && r.messageName === message);

  var field = feedRule.payload[fieldParam];
  if (fieldParam.indexOf('.') > 0)
    field = getFieldRule(feedRule.payload, fieldParam)

  field.rule = {
    ...field.rule,
    count: parseInt($('#arr_dataFieldCount').val())
  }

  console.log(field.rule);
  localStorage.setItem('changed', true);
  localStorage.setItem('currentFeed', JSON.stringify(feed));

  var parent = document.getElementById('payload-variable-pane');
  parent.innerHTML = '';
  parent.style.width = 'auto';

  var node = $('#payload-tree-pane').treeview('getSelected')
  if (!node || !node.length) return;

  var el = document.createElement('div');
  var field = feedRule.payload[node[0].path];
  if (node[0].path.indexOf('.') > 0)
    field = getFieldRule(feedRule.payload, node[0].path)

  el.innerHTML = buildParamRuleUI('send', field.rule, feedRule.topic, 'payload', node[0]);
  parent.appendChild(el);    

  return valid;
}

function arrayInstanceCountAssignSubmit() {
  'use strict';

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  // const forms = document.querySelectorAll('#parameterRulesForm');
  const forms = document.querySelectorAll('.needs-validation#arrayParameterCountForm');


  // Loop over them and prevent submission
  Array.prototype.slice.call(forms).forEach((form) => {
    form.addEventListener('submit', async (event) => {
      console.log('In submit', form.id, form.classList);
      event.preventDefault();
      if (!form.checkValidity()) {
        event.stopPropagation();
      }

      $('#field_instance_count_form').modal('toggle');
      validateInstanceCountRule();

      // const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
      const path = window.location.origin;
      await fetch(path + `/feedrules`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: localStorage.getItem('currentFeed')
      });

      toastr.success('Instance count rule updated successfully.')
      form.classList.toggle('was-validated');  
      return false;  
    });
  });
}