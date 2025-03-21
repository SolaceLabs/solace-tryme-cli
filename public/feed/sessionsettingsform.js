function validateSessionSetting(props, current, key, error) {
  let value = current[key];
  let defaultProp = props.find(p => p.key === key);
  if (defaultProp === undefined) {
    error += `Unknown session setting: ${key}\n`;
    return false;
  }

  if (defaultProp.type === 'select' && !defaultProp.values.includes(value)) {
    error += `Invalid value for ${key}: ${value}\n`;
    return false;
  }

  if (defaultProp.datatype === 'boolean' && current[key]) {
    current[key] = value === 'true';
  } else if (defaultProp.datatype === 'number' && current[key]) {
    if (parseInt(value) === NaN) {
      error += `Invalid value for ${key}: ${value}\n`;
      return false;
    }
    current[key] = parseInt(value);
  } else {
    current[key] = value;
  }

  return true;
}

function sessionSettingsSubmit() {
  'use strict';

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  // const forms = document.querySelectorAll('#parameterRulesForm');
  const forms = document.querySelectorAll('.needs-validation#sessionSettingsForm');

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

      var defaultProps = await getDefaultSessionProperties();
      var error = '';
      Object.keys(settings).forEach((key) => {
        validateSessionSetting(defaultProps, settings, key, error);
      });

      if (error) {
        $('#sessionSettingsFormError').text(error.split('\n').join('<br>'));
        return false;
      }

      form.classList.add('was-validated');

      if (!error) {
        $('#sessionSettingsFormError').hide();
        $('#session_settings_form').modal('toggle');

        var feed = JSON.parse(localStorage.getItem('currentFeed'));
        var topic = $('#topic_name').text();
        var message = $('#message-feed-name').text();
        var rule = feed.rules.find(r => r.topic === topic && r.messageName === message);
        rule.sessionSettings = {
          ...rule?.sessionSettings,
          ...settings
        };

        deleted.forEach((key) => {
          delete rule.sessionSettings[key];
        });

        feed.rules.forEach((r) => {
          r.sessionSettings = {
            ...rule.sessionSettings,
          };
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

        toastr.success('Session Settings updated successfully.')

        var tbody = '';
        defaultProps.forEach((prop) => {
          let value = rule.sessionSettings[prop.key];
          tbody += `
            <tr class="sash">
              <td>${prop.name}<br/><i>${prop.description}</i><br/>Default: <b>${prop.default ? prop.default : 'not set'}</b></td>
              ${value !== undefined ? 
                `<td>${value}</td>` : 
                `<td class="prova" data-ribbon="default"></td>`}
            </tr>    
          `;
        })
      
        $('#session_props_table').html(tbody);    
      }
      return false;
    });
  });
}

async function resetSessionSettings() {
  var feed = JSON.parse(localStorage.getItem('currentFeed'));
  var topic = $('#topic_name').text();
  var message = $('#message-feed-name').text();
  var rule = feed.rules.find(r => r.topic === topic && r.messageName === message);
  rule.sessionSettings = {};
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

  toastr.success('Session settings updated successfully.');
  var defaultProps = await getDefaultSessionProperties();

  var tbody = '';
  defaultProps.forEach((prop) => {
    let value = rule.sessionSettings[prop.key];
    tbody += `
      <tr class="sash">
        <td>${prop.name}<br/><i>${prop.description}</i><br/>Default: <b>${prop.default ? prop.default : 'not set'}</b></td>
        ${value !== undefined ? 
          `<td>${value}</td>` : 
          `<td class="prova" data-ribbon="default"></td>`}
      </tr>    
    `;
  })

  $('#session_props_table').html(tbody);
}

