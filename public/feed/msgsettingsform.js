function validateMessageSetting(props, current, key, error) {
  let value = current[key];
  if (props[key] === undefined) {
    error += `Unknown session setting: ${key}\n`;
    return false;
  }

  if (props[key].type === 'select' && !props[key].values.includes(value)) {
    error += `Invalid value for ${key}: ${value}\n`;
    return false;
  }

  if (key === 'userProperties') {
    if (!value) {
      error += `Invalid value for ${key}: ${value}\n`;
      return false;
    }

    let pairs = value.split(',');
    if (pairs.length === 0) {
      error += `Invalid value for ${key}: ${value}\n`;
      return false;
    }
    pairs.forEach((pair) => {
      let kv = pair.split(':');
      if (kv.length !== 2) {
        error += `Invalid value for ${key}: ${value}\n`;
        return false;
      }
    });
  } else {
    if (props[key].datatype === 'boolean') {
      let val = '';
      if (typeof value === 'string')
        val = value === 'true' ? 'true' : 'false';
      else if (typeof value === 'boolean')
        val = value ? 'true' : 'false';
      props[key].value = val;
      current[key] = val;
    } else if (props[key].datatype === 'number' && props[key]) {
      if (parseInt(value) === NaN) {
        error += `Invalid value for ${key}: ${value}\n`;
        return false;
      }
      props[key].value = parseInt(value);
      current[key] = parseInt(value);
    } else {
      props[key].value = value;
      current[key] = value;
    }
  }

  return true;
}

function messageSettingsSubmit() {
  'use strict';

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  // const forms = document.querySelectorAll('#parameterRulesForm');
  const forms = document.querySelectorAll('.needs-validation#msgSettingsForm');

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms).forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        event.stopPropagation();
      }

      const defaultMsgSettings = await getDefaultMessageProperties();

      var els = form.querySelectorAll('tbody tr[id^="tr_prop"]');
      var settings = {};
      var changed = 0;
      var deleted = [];
      els.forEach((el) => {
        var key = el.id.split('_').pop();
        if (el.dataset.deleted === 'yes') {
          changed++;
          deleted.push(key);
        } else if (el.dataset.new_value !== '') {
          changed++;
          settings[key] = el.dataset.new_value;
        }
      });

      if (changed === 0) {
        form.classList.add('was-validated');
        $('#msgSettingsFormError').hide();
        $('#msg_settings_form').modal('toggle');  
        return false;      
      }
      
      var feed = JSON.parse(localStorage.getItem('currentFeed'));
      var topic = $('#topic_name').text();
      var message = $('#message-feed-name').text();
      var rule = feed.rules.find(r => r.topic === topic && r.messageName === message);

      var error = '';
      Object.keys(settings).forEach((key) => {
        validateMessageSetting(defaultMsgSettings, settings, key, error);
      });

      if (error) {
        $('#msgSettingsFormError').text(error.split('\n').join('<br>'));
        return false;
      }

      form.classList.add('was-validated');

      if (!error) {
        $('#msgSettingsFormError').hide();
        $('#msg_settings_form').modal('toggle');

        rule.messageSettings = {
          ...rule?.messageSettings,
          ...settings
        };

        deleted.forEach((key) => {
          delete rule.messageSettings[key];
        });

        localStorage.setItem('currentFeed', JSON.stringify(feed));

        // const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
        const path = window.location.origin;
        await fetch(path + `/feedrules`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json;charset=UTF-8'
          },
          body: JSON.stringify(feed)
        });

        toastr.success('Message Settings updated successfully.')

        Object.values(defaultMsgSettings).filter(prop => prop.exposed).forEach((prop) => {
          if (rule.messageSettings[prop.key] !== undefined) {
            prop.value = rule.messageSettings[prop.key];
          }
        });

        var tbody = '';
        Object.values(defaultMsgSettings).filter(prop => prop.exposed).forEach((prop) => {
          tbody += `
            <tr class="sash">
              <td>${prop.property}<br/><i>${prop.description}</i><br/>Default: <b>${prop.default ? prop.default : 'not set'}</b></td>
              ${prop.value !== undefined ? 
                `<td>${prop.value}</td>` : 
                `<td class="prova" data-ribbon="default">${prop.default}</td>`}
            </tr>    
          `;
        })
      
        $('#message_props_table').html(tbody);
      }
      return false;
    });
  });
}

async function resetMessageSettings() {
  var feed = JSON.parse(localStorage.getItem('currentFeed'));
  var topic = $('#topic_name').text();
  var message = $('#message-feed-name').text();
  var rule = feed.rules.find(r => r.topic === topic && r.messageName === message);
  rule.messageSettings = {};
  localStorage.setItem('currentFeed', JSON.stringify(feed));

  // const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
  const path = window.location.origin;
  await fetch(path + `/feedrules`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: localStorage.getItem('currentFeed')
  });

  toastr.success('Message settings updated successfully.')
  
  var defaultProps = await getDefaultMessageProperties();

  var tbody = '';
  Object.values(defaultProps).filter(prop => prop.exposed).forEach((prop) => {
    tbody += `
      <tr class="sash">
        <td>${prop.property}<br/><i>${prop.description}</i><br/>Default: <b>${prop.default ? prop.default : 'not set'}</b></td>
        ${prop.value !== undefined ? 
          `<td>${prop.value}</td>` : 
          `<td class="prova" data-ribbon="default">${prop.default}</td>`}
      </tr>        
    `;
  })

  $('#message_props_table').html(tbody);    
}

