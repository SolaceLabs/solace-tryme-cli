async function XXXsetupMappingToolbar() {
  $('#mapping_rules_bar').empty();
  var toolbar = $('#mapping_rules_bar');
  var mapHtml = `
    <div class="rules-toolbar">
      <span style="text-align: left; font-size: 0.75rem; font-weight: 600;">
        Define mapping rules to map fields:<br/>
        <ul style="margin-bottom: unset;">
          <li>Topic Variable ⇒ Payload Field</li>
          <li>Payload Field ⇒ Payload Field</li>
        </ul>
      </span>
      <span class="btn btn-primary" style="float:right;" data-toggle="modal" data-target="#field_map_form"
          data-backdrop="static" data-keyboard="false" onclick="manageFieldMap()">
        <i class="fa fa-plus" aria-hidden="true"></i>
      </span>
    </div>
    `;
  $('#sourceField').val('');
  $('#targetField').val('');
  
  toolbar.append(mapHtml); 
}


async function manageFieldMap() {
  var feed = JSON.parse(localStorage.getItem('currentFeed'));
  var topic = $('#topic_name').text();
  var message = $('#message-feed-name').text();
  var rule = feed.rules.find(r => r.topic === topic && r.messageName === message);

  console.log('RULE', rule);
  if (!rule) return;
  
  $('#mapRulesFormError').text('');
  $('#fieldMapTitle').text(message);
  $('#fieldMapSource').text('New Mapping Rule');
  if ((!rule.topicParameters || !Object.keys(rule.topicParameters).length) ||
      (!rule.payload || !Object.keys(rule.payload).length)) {
    el = document.getElementById('parameterRulesFormBody');
    if (el) el.innerHTML = `
        <p>No topic variable or payload found for mapping!
    `;
    return;
  }

  $('#map-source-pane').treeview({
    expandIcon: 'glyphicon glyphicon-plus',
    collapseIcon: 'glyphicon glyphicon-minus',
    nodeIcon: 'glyphicon',
    data: getMapTree(rule.topicParameters, rule.payload),
    onNodeSelected: function(event, node) {
      console.log(node.text + ' @ ' + node.path + ' was selected');
      var el = document.getElementById('sourceField');
      if (node.type === 'array' || node.type === 'object') 
        el.value = '';
      else
        el.value = node.path ? `${node.class} : ${node.path}, ${node.type}${node.subType ? ' of ' + node.subType : ''}` : '';

      $('#srcType').text(node.type);
      $('#srcSubType').text(node.subType);
      $('#srcFullPath').text(node.fullPath);
      let srcType = $('#srcType').text();
      let srcSubType = $('#srcSubType').text();
      let tgtType = $('#tgtType').text();
      let tgtSubType = $('#tgtSubType').text();
      if (tgtType && $('#targetField').val() && (
        (srcType === 'array' && tgtType !== 'array') ||
        (tgtType === 'array' && srcType !== 'array')
      )) {
        $('#mismatchConfirm').html(
          `<div class="btn-sm bg-red fg-white"><i class="fa fa-exclamation-circle" aria-hidden="true"></i>
          Cannot map to or from array type fields!</div>`
        )
      } else if (tgtType && $('#targetField').val() && (
        (srcType === 'object' && tgtType !== 'object') ||
        (tgtType === 'object' && srcType !== 'object')
      )) {
        $('#mismatchConfirm').html(
          `<div class="btn-sm bg-red fg-white"><i class="fa fa-exclamation-circle" aria-hidden="true"></i>
          Cannot map to or from object to non-object fields!</div>`
        )
      } else if (tgtType && tgtType === 'array' && srcType === tgtType && srcSubType !== tgtSubType &&  $('#targetField').val()) {
        $('#mismatchConfirm').html(
          `<div class="btn-sm bg-red fg-white"><i class="fa fa-exclamation-circle" aria-hidden="true"></i>
          Note that the mapped array fields are of different data types!</div>`
        )
      } else if (tgtType && srcType !== tgtType && $('#targetField').val()) {
        $('#mismatchConfirm').html(
          `<div class="btn-sm bg-red fg-white"><i class="fa fa-exclamation-circle" aria-hidden="true"></i>
          Note that the mapped fields are of different data types!</div>`
        )
      } else {
        $('#mismatchConfirm').html('');
      }

      mapSplitter.resize();
    },
    onNodeUnselected: function (event, node) {
      console.log(node.text + ' was unselected');
      $('#srcType').text('');
      $('#mismatchConfirm').html('');
    }
  });

  $('#map-target-pane').treeview({
    expandIcon: 'glyphicon glyphicon-plus',
    collapseIcon: 'glyphicon glyphicon-minus',
    nodeIcon: 'glyphicon',
    data: getMapTree(rule.topicParameters, rule.payload),
    onNodeSelected: function(event, node) {
      console.log(node.text + ' @ ' + node.path + ' was selected');
      var el = document.getElementById('targetField');
      if (node.type === 'array' || node.type === 'object') 
        el.value = '';
      else
        el.value = node.path ? `${node.class} : ${node.path}, ${node.type}${node.subType ? ' of ' + node.subType : ''}` : '';

      $('#tgtType').text(node.type);
      $('#tgtSubType').text(node.subType);
      $('#tgtFullPath').text(node.fullPath);
      let srcType = $('#srcType').text();
      let srcSubType = $('#srcSubType').text();
      let tgtType = $('#tgtType').text();
      let tgtSubType = $('#tgtSubType').text();
      if (tgtType && $('#sourceField').val() && (
        (srcType === 'array' && tgtType !== 'array') ||
        (tgtType === 'array' && srcType !== 'array')
      )) {
        $('#mismatchConfirm').html(
          `<div class="btn-sm bg-red fg-white"><i class="fa fa-exclamation-circle" aria-hidden="true"></i>
          Cannot map to or from array type fields!</div>`
        )
      } else if (tgtType && $('#sourceField').val() && (
        (srcType === 'object' && tgtType !== 'object') ||
        (tgtType === 'object' && srcType !== 'object')
      )) {
        $('#mismatchConfirm').html(
          `<div class="btn-sm bg-red fg-white"><i class="fa fa-exclamation-circle" aria-hidden="true"></i>
          Cannot map to or from object to non-object fields!</div>`
        )
      } else if (tgtType && srcType !== tgtType && $('#sourceField').val()) {
        $('#mismatchConfirm').html(
          `<div class="btn-sm bg-red fg-white"><i class="fa fa-exclamation-circle" aria-hidden="true"></i>
          Note that the mapped fields are of different data types!</div>`
        )
      } else if (tgtType && tgtType === 'array' && srcType === tgtType && srcSubType !== tgtSubType &&  $('#sourceField').val()) {
        $('#mismatchConfirm').html(
          `<div class="btn-sm bg-red fg-white"><i class="fa fa-exclamation-circle" aria-hidden="true"></i>
          Note that the mapped array fields are of different data types!</div>`
        )
      } else {
        $('#mismatchConfirm').html('');
      }
    },
    onNodeUnselected: function (event, node) {
      console.log(node.text + ' was unselected');
      $('#mismatchConfirm').html('');
      $('#tgtType').text('');
    }
  });
}

function getMapTree(topicVars, payload) {
  var tree = [];
  var vars = { text: 'Topic Parameters', type: 'object', path: '', nodes: [] }
  tree.push(vars);
  Object.keys(topicVars).forEach(v => {
    var node = { text: v, class: 'Topic Parameter', type: topicVars[v].schema.type, path: v};
    vars.nodes.push(node)
  })
  var pl = { text: 'Payload', class: 'Payload Parameter', type: 'object', path: '', nodes: [] }
  buildMapTree(payload, pl);
  tree.push(pl);

  return tree;
}

function buildMapTree(json, parent) {
  var fields = Object.keys(json);
  fields.forEach(field => {
    if (field === 'type' || field === 'properties') return;
    var node = { text: json[field].type === 'array' ? `${field}[]` : field, class: 'Payload Parameter', 
                  type: json[field].type, path: parent.path ?`${parent.path}.properties.${field}` : field}
    node.fullPath = parent.fullPath ? `${parent.fullPath}.${node.text}` : node.text;
    if (json[field].type === 'object' && json[field].properties) {
      node.nodes = [];
      buildMapTree(json[field].properties, node);
    } else if (json[field].type === 'array') {
      node.subType = json[field].subType;
      node.nodes = [];
      if (json[field].subType === 'object')
      buildMapTree(json[field].properties, node);
    }
    parent.nodes.push(node)
  })

  return parent;
}

function getField (obj, path) {
  if (path.indexOf('.') < 0)
    return obj[path];

  let field = path.substring(0, path.indexOf('.'));
  var remaining = path.substring(path.indexOf('.')+1);
  return getField(obj[field], remaining);
}

function mapAssignSubmit() {
  'use strict';

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  // const forms = document.querySelectorAll('#parameterRulesForm');
  const forms = document.querySelectorAll('.needs-validation#mapRulesForm');

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms).forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        event.stopPropagation();
      }

      let source = $('#sourceField').val();
      let sourcePath = $('#srcFullPath').text();
      let target = $('#targetField').val();
      let targetPath = $('#tgtFullPath').text();
      let valid = !(!source || !target || source === target);

      if (!source || !target) {
        $('#mapRulesFormError').text('Choose source and target fields...')
        valid = false;
      } else if (source === target) {
        $('#mapRulesFormError').text('Source and target cannot be same...')
        valid = false;
      }

      if (sourcePath.indexOf('[].') > 0) {
        $('#mapRulesFormError').text('Cannot map an array source to target field...')
        valid = false;
      }

      form.classList.add('was-validated');

      if (valid) {
        let sourceFields = source.split(' : ').map(t => t.trim());
        let sourceMapType = sourceFields[0];
        let sourceFieldDetail = sourceFields[1].split(',').map(t => t.trim());
        let sourceFieldName = sourceFieldDetail[0];
        let sourceTypeDetails = sourceFieldDetail[1].split(' of ').map(t => t.trim());
        let sourceFieldType = sourceTypeDetails[0];
        let sourceFieldSubType = sourceTypeDetails[1];
        let targetFields = target.split(' : ').map(t => t.trim());
        let targetMapType = targetFields[0];
        let targetFieldDetail = targetFields[1].split(',').map(t => t.trim());
        let targetFieldName = targetFieldDetail[0];
        let targetTypeDetails = targetFieldDetail[1].split(' of ').map(t => t.trim());
        let targetFieldType = targetTypeDetails[0];
        let targetFieldSubType = targetTypeDetails[1];

        if ((sourceFieldType === 'object' && targetFieldType !== 'object') ||
            (targetFieldType === 'object' && sourceFieldType !== 'object')) {
          $('#mapRulesFormError').text('Cannot map object to non-object field...')
          valid = false;     
        }

        if ((sourceFieldType === 'array' && targetFieldType !== 'array') || 
            (sourceFieldType !== 'array' && targetFieldType === 'array')) {
          $('#mapRulesFormError').text('Cannot map array to non-array field...')
          valid = false;     
        }

        if (valid && ((sourceFieldType === 'array' && sourceFieldSubType !== targetFieldSubType) || 
                      (targetFieldType === 'array' && sourceFieldSubType !== targetFieldSubType))) {
          $('#mapRulesFormError').text('Cannot map array fields of different types...')
          valid = false;     
        }

        if (valid && ((sourceFieldType === 'array' && sourceFieldSubType !== targetFieldSubType) || 
                      (targetFieldType === 'array' && sourceFieldSubType !== targetFieldSubType))) {
          $('#mapRulesFormError').text('Cannot map array fields of different types...')
          valid = false;     
        }

        if (valid) {
          // $('#mapRulesFormError').hide();
          $('#field_map_form').modal('toggle');

          var feed = JSON.parse(localStorage.getItem('currentFeed'));
          var topic = $('#topic_name').text();
          var message = $('#message-feed-name').text();
          var rule = feed.rules.find(r => r.topic === topic && r.messageName === message);
          var mappings = rule.mappings ? rule.mappings : [];
          mappings.push({
            type: targetFields[0],
            source: {
              type: sourceMapType,
              name: sourceFieldName,
              fieldName: sourceFieldName.lastIndexOf('.') > 0 ? sourceFieldName.substring(sourceFieldName.lastIndexOf('.')+1) : sourceFieldName,
              fieldType: sourceFieldType,
              fielSubType: sourceFieldSubType
            },
            target: {
              type: targetMapType,
              name: targetFieldName,
              fieldName: targetFieldName.lastIndexOf('.') > 0 ? targetFieldName.substring(targetFieldName.lastIndexOf('.')+1) : targetFieldName,
              fieldType: targetFieldType,
              fielSubType: targetFieldSubType
            }
          });

          rule.mappings = mappings;
          localStorage.setItem('currentFeed', JSON.stringify(feed));

          const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
          await fetch(path + `/feedrules`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            },
            body: localStorage.getItem('currentFeed')
          });

          toastr.success('Mapping updated successfully.')
          refreshMappingRules(rule);
        }
      }
      return false;
    });
  });
}

async function publishSettingsChange(evt) {
  var data = evt.dataset;
  console.log('DATA', data);

  var feed = JSON.parse(localStorage.getItem('currentFeed'));
  var topic = $('#topic_name').text();
  var message = $('#message-feed-name').text();
  var rule = feed.rules.find(r => r.topic === topic && r.messageName === message);

  console.log('RULE', rule);
  if (!rule) return;

  var publishSettings = rule.publishSettings ? rule.publishSettings : {};
  var el = document.getElementById(`${data.param}-publish`);
  var val = el.value;
  console.log('VAL', val);

  if (data.param === 'count') {
    if (el && (parseInt(val) < parseInt(el.getAttribute('min')) || 
                parseInt(val) > parseInt(el.getAttribute('max')))) {
      val = parseInt(el.getAttribute('default'));
    }
    document.getElementById(`${data.param}-publish`).value = val;
    publishSettings[data.param] = val;
  }
  else if (data.param === 'interval') {
    if (el && (parseInt(val) < parseInt(el.getAttribute('min')) || 
                parseInt(val) > parseInt(el.getAttribute('max')))) {
      val = parseInt(el.getAttribute('default'));
    }
    document.getElementById(`${data.param}-publish`).value = val;
    publishSettings[data.param] = val;
  } else if (data.param === 'delay') {
    if (el && (parseInt(val) < parseInt(el.getAttribute('min')) || 
                parseInt(val) > parseInt(el.getAttribute('max')))) {
      val = parseInt(el.getAttribute('default'));
    }
    document.getElementById(`${data.param}-publish`).value = val;
    publishSettings[data.param] = val;
  }

  rule.publishSettings = publishSettings;
  console.log('Updated Settings', rule.publishSettings)
  localStorage.setItem('currentFeed', JSON.stringify(feed));

  const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
  await fetch(path + `/feedrules`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: localStorage.getItem('currentFeed')
  });
}