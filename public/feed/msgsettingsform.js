function validateMessageSetting(props, current, key, error) {
  let value = current[key];
  let defaultProp = props.find(p => p.key === key);
  if (defaultProp === undefined) {
    error += `Unknown message setting: ${key}\n`;
    return false;
  }

  if (defaultProp.type === 'select' && !defaultProp.values.includes(value)) {
    error += `Invalid value for ${key}: ${value}\n`;
    return false;
  }

  if (key === 'userProperties' && value) {
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
  }

  if (defaultProp.datatype === 'boolean' && current[key]) {
    current[key] = value === 'true';
  } else if (defaultProp.datatype === 'number' && current[key]) {
    try {
      current[key] = parseInt(value);
    } catch (e) {
      error += `Invalid value for ${key}: ${value}\n`;
      return false;
    }
  } else {
    current[key] = value;
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

      var els = form.querySelectorAll('tbody tr[id^="tr_prop"]');
      var settings = {};
      var deleted = [];
      els.forEach((el) => {
        var key = el.id.split('_').pop();
        if (el.dataset.deleted === 'yes') {
          delete settings[key];
          deleted.push(key);
        } else if (el.dataset.new_value !== "") {
          settings[key] = el.dataset.new_value;
        }
      });

      if (Object.keys(settings).length === 0) {
        form.classList.add('was-validated');
        $('#msgSettingsFormError').hide();
        $('#msg_settings_form').modal('toggle');        
      }
      
      var defaultProps = await getDefaultMessageProperties();
      var error = '';
      Object.keys(settings).forEach((key) => {
        validateMessageSetting(defaultProps, settings, key, error);
      });

      if (error) {
        $('#msgSettingsFormError').text(error.split('\n').join('<br>'));
        return false;
      }

      form.classList.add('was-validated');

      if (!error) {
        $('#msgSettingsFormError').hide();
        $('#msg_settings_form').modal('toggle');

        var feed = JSON.parse(localStorage.getItem('currentFeed'));
        var topic = $('#topic_name').text();
        var message = $('#message-feed-name').text();
        var rule = feed.rules.find(r => r.topic === topic && r.messageName === message);
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
          body: localStorage.getItem('currentFeed')
        });

        toastr.success('Message Settings updated successfully.')
        var tbody = '';
        defaultProps.forEach((prop) => {
          let value = rule.messageSettings[prop.key];
          tbody += `
            <tr class="sash">
              <td>${prop.name}<br/><i>${prop.description}</i><br/>Default: <b>${prop.default ? prop.default : 'not set'}</b></td>
              ${value !== undefined ? 
                `<td>${value}</td>` : 
                `<td class="prova" data-ribbon="default"></td>`}
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
  defaultProps.forEach((prop) => {
    let value = rule.messageSettings[prop.key];
    tbody += `
      <tr class="sash">
        <td>${prop.name}<br/><i>${prop.description}</i><br/>Default: <b>${prop.default ? prop.default : 'not set'}</b></td>
        ${value !== undefined ? 
          `<td>${value}</td>` : 
          `<td class="prova" data-ribbon="default"></td>`}
      </tr>    
    `;
  })

  $('#message_props_table').html(tbody);    
}

