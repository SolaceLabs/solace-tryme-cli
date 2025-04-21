function validateSessionSetting(props, current, key, error) {
  let value = current[key];
  if (props[key] === undefined) {
    error += `Unknown session setting: ${key}\n`;
    return false;
  }

  if (props[key].type === 'select' && !props[key].values.includes(value)) {
    error += `Invalid value for ${key}: ${value}\n`;
    return false;
  }

  if (props[key].datatype === 'boolean') {
    let val = '';
    if (typeof value === 'string')
      val = value === 'true' ? 'true' : 'false';
    else if (typeof value === 'boolean')
      val = value ? 'true' : 'false';
    props[key].value = val;
  } else if (props[key].datatype === 'number' && props[key]) {
    if (parseInt(value) === NaN) {
      error += `Invalid value for ${key}: ${value}\n`;
      return false;
    }
    props[key].value = parseInt(value);
  } else {
    props[key].value = value;
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

      var feed = JSON.parse(localStorage.getItem('currentFeed'));      
      const currentSettings = feed.session ? feed.session : loadSessionSettings();
    
      var error = '';
      Object.keys(settings).forEach((key) => {
        validateSessionSetting(currentSettings, settings, key, error);
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
        feed.session = {
          ...feed.session,
          ...currentSettings
        };

        deleted.forEach((key) => {
          delete feed.session[key]?.value;;
        });

        localStorage.setItem('currentFeed', JSON.stringify(feed));

        // const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
        const path = window.location.origin;
        await fetch(path + `/feedsession`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json;charset=UTF-8'
          },
          body: JSON.stringify(feed)
        });

        toastr.success('Session Settings updated successfully.')

        var tbody = '';
        Object.values(feed.session).filter(prop => prop.exposed).forEach((prop) => {
          tbody += `
            <tr class="sash">
              <td>${prop.property}<br/><i>${prop.description}</i><br/>Default: <b>${prop.default ? prop.default : 'not set'}</b></td>
              ${prop.value !== undefined ? 
                `<td>${prop.value}</td>` : 
                `<td class="prova" data-ribbon="default">${prop.default}</td>`}
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
  Object.keys(feed.session).forEach((key) => {
    if (feed.session[key].value !== undefined) {
      delete feed.session[key].value;
    }
  });
  localStorage.setItem('currentFeed', JSON.stringify(feed));

  // const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
  const path = window.location.origin;
  await fetch(path + `/feedsession`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify(feed)
  });

  toastr.success('Session settings updated successfully.');

  var tbody = '';
  Object.values(feed.session).filter(prop => prop.exposed).forEach((prop) => {
    tbody += `
      <tr class="sash">
        <td>${prop.property}<br/><i>${prop.description}</i><br/>Default: <b>${prop.default ? prop.default : 'not set'}</b></td>
        ${prop.value !== undefined ? 
          `<td>${prop.value}</td>` : 
          `<td class="prova" data-ribbon="default">${prop.default}</td>`}
      </tr>        
    `;
  })

  $('#session_props_table').html(tbody);
}

