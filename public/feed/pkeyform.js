async function managePartitionKey() {
  var feed = JSON.parse(localStorage.getItem('currentFeed'));
  var topic = $('#topic_name').text();
  var message = $('#message-feed-name').text();
  var rule = feed.rules.find(r => r.topic === topic && r.messageName === message);

  console.log('RULE', rule);
  if (!rule) return;

  let sampleKey = rule.messageSettings?.partitionKeys?.split(' | ').map(m => `<${m}>`).join('-');
  if (sampleKey && sampleKey.length > 0) {
    $('#msgSettingsSampleKey').text(sampleKey);
  } else {
    $('#msgSettingsSampleKey').text('');
  }
  
  $('#pkeyFields').val(rule.messageSettings?.partitionKeys);
  $('#pkeyFormError').text('');
  $('#pkey-source-pane').treeview({
    expandIcon: 'glyphicon glyphicon-plus',
    collapseIcon: 'glyphicon glyphicon-minus',
    multiSelect: true,
    data: getPayloadTree(rule.payload, rule.messageSettings?.partitionKeys),
    onNodeSelected: function(event, node) {
      console.log(node.text + ' @ ' + node.path + ' was selected');
      var el = document.getElementById('sourceField');
      if (node.type === 'array' || node.type === 'object') 
        return;
      else
        el.value = node.path ? `${node.class} : ${node.fullPath.replaceAll('[]', '[0]')}, ${node.type}${node.subType ? ' of ' + node.subType : ''}` : '';

      el = document.getElementById('pkey-source-info');
          el.innerHTML = '';
          el.style.width = 'auto';
          el.innerHTML = `<div class="lockscreen-wrapper">
            <div class="lockscreen-logo">
              <b>${node.text}</b>
              <div>Type: ${node.type}</div>
            </div>
            
            <!-- /.lockscreen-item -->
            <div class="help-block text-center">
              <div>Path: ${node.fullPath}</div>
            </div>
          </div>
          `        
      $('#srcType').text(node.type);
      $('#srcSubType').text(node.subType);
      $('#srcFullPath').text(node.fullPath);
      let keys = $('#pkeyFields').val();
      if (keys.split(' | ').findIndex(k => k === node.fullPath) === -1)
        $('#pkeyFields').val(keys + (keys ? ' | ' : '') + node.fullPath);
      let sampleKey = $('#pkeyFields').val().split(' | ').map(m => `<${m}>`).join('-');
      if (sampleKey && sampleKey.length > 0) {
        $('#msgSettingsSampleKey').text(sampleKey);
      } else {
        $('#msgSettingsSampleKey').text('');
      }
      pkeySplitter.resize();
    },
    onNodeUnselected: function (event, node) {
      console.log(node.text + ' was unselected');
      el = document.getElementById('pkey-source-info');
      el.innerHTML = '';
      el.style.width = 'auto';

      $('#srcType').text('');
      $('#mismatchConfirm').html('');
      let keys = $('#pkeyFields').val();
      if (keys.split(' | ').findIndex(k => k === node.fullPath) !== -1)
        keys = keys ? keys.split(' | ').filter(k => k !== node.fullPath).join(' | ') : '';
      $('#pkeyFields').val(keys);
      let sampleKey = $('#pkeyFields').val().split(' | ').map(m => `<${m}>`).join('-');
      if (sampleKey && sampleKey.length > 0) {
        $('#msgSettingsSampleKey').text(sampleKey);
      } else {
        $('#msgSettingsSampleKey').text('');
      }
      pkeySplitter.resize();      
    }
  });
}

function markUnselectable(node) {
  if (node.type === 'array' || node.type === 'object') {
    node.selectable = false;
  }
  node.nodes && node.nodes.length && node.nodes.forEach(n => markUnselectable(n));
}

function markSelected(node, keys) {
  if (!node || !node.nodes || !node.nodes.length) return;

  function getNode(nodes, fieldName) {
    if (fieldName.indexOf('.') === -1) {
      return nodes.find(n => n.text === fieldName);
    } else {
      var parts = fieldName.split('.');
      var n = nodes.find(n => n.text === parts[0]);
      if (n) return getNode(n.nodes, parts.slice(1).join('.'));
    }
    return null;
  }
  
  if (keys) {
    keys.split(' | ').forEach(k => {
      var selNode = getNode(node.nodes, k);
      if (selNode) {
        selNode.state = {
          ...selNode.state,
          selected: true
        }
      }
    });
  }
}

function getPayloadTree(payload, partitionKeys) {
  var tree = [];
  var pl = { text: 'Payload', class: 'Payload Parameter', type: 'object', path: '', nodes: [] }
  buildMapTree(payload, pl);
  markUnselectable(pl);
  markSelected(pl, partitionKeys);
  tree.push(pl);
  return tree;
}

function pkeySelectionSubmit() {
  'use strict';

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  // const forms = document.querySelectorAll('#parameterRulesForm');
  const forms = document.querySelectorAll('.needs-validation#pkeySelectionForm');

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms).forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        event.stopPropagation();
      }

      let keys = $('#pkeyFields').val();
      let valid = !!keys;

      if (!valid) {
        $('#pkeyFormError').text('Choose source fields...')
      }

      form.classList.add('was-validated');

      if (valid) {
        $('#pkeyFormError').hide();
        $('#pkey_selection_form').modal('toggle');

        var feed = JSON.parse(localStorage.getItem('currentFeed'));
        var topic = $('#topic_name').text();
        var message = $('#message-feed-name').text();
        var rule = feed.rules.find(r => r.topic === topic && r.messageName === message);
        rule.messageSettings = {
          ...rule.messageSettings,
          partitionKeys: keys
        };
        $('#pkey-value').text(keys);
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

        toastr.success('Partition Key(s) updated successfully.')
      }
      return false;
    });
  });
}

async function resetPartitionKey() {
  var feed = JSON.parse(localStorage.getItem('currentFeed'));
  var topic = $('#topic_name').text();
  var message = $('#message-feed-name').text();
  var rule = feed.rules.find(r => r.topic === topic && r.messageName === message);
  delete rule.messageSettings?.partitionKeys;
  $('#pkey-value').text('');
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

  toastr.success('Mapping updated successfully.')
}

