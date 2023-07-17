Ext.apply(Ext.form.field.VTypes, {
  email: function (value) {
    // Regular expression for email validation
    var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value);
  },
  emailText: 'Invalid email format.',

  phone: function (value) {
    // Regular expression for phone validation
    var phoneRegex = /^[0-9]{9}$/;
    return phoneRegex.test(value);
  },
  phoneText: 'Invalid phone format (e.g., 09XXXXXXXXX).'
});

Ext.define('MovieRentalApp.view.main.UserGrid', {
  extend: 'Ext.grid.Panel',
  xtype: 'userGrid',
  title: 'Users',
  store: {
    type: 'userstore'
  },

  //allow users to select multiple columns or data
  selModel: {
    selType: 'checkboxmodel',
    checkOnly: true
  },

  columns: [
    { text: 'Name', dataIndex: 'Name', flex: 1 },
    { text: 'Gender', dataIndex: 'Gender', flex: 1 },
    { text: 'Birthdate', dataIndex: 'Birthdate', flex: 1 },
    { text: 'Address', dataIndex: 'Address', flex: 1 },
    { text: 'Email', dataIndex: 'Email', flex: 1 },
    { text: 'Phone', dataIndex: 'Phone', flex: 1 }
  ],


  tbar: {
    items: [
      {
        text: 'New User',
        handler: function () {
          var grid = this.up('grid');
          var floatingPanel = Ext.create('Ext.window.Window', {
            title: 'Add New User',
            layout: 'form',
            width: 411,
            height: 367,
            grid: grid,
            items: [
              {
                xtype: 'textfield',
                fieldLabel: 'Name',
                name: 'name'
              },
              {
                xtype: 'combobox',
                fieldLabel: 'Gender',
                name: 'gender',
                store: ['Male', 'Female','Others'], // Dropdown options
                queryMode: 'local' // Uses the store as a local data source
              },
              {
                xtype: 'datefield',
                fieldLabel: 'Birthdate',
                name: 'birthdate',
                format: 'Y-m-d'
              },
              {
                xtype: 'textfield',
                fieldLabel: 'Address',
                name: 'address'
              },
              {
                xtype: 'textfield',
                fieldLabel: 'Email',
                name: 'email',
                vtype: 'email', // Add the vtype property
                allowBlank: false, // Set to false to make the field required
                emptyText: 'Enter a valid email (e.g., example@gmail.com)', // placeholder
              },
              {
                xtype: 'textfield',
                fieldLabel: 'Phone',
                name: 'phone',               
                allowBlank: false, // Set to false to make the field required
                emptyText: '09XXXXXXXXX', // placeholder
              },
              {
                xtype: 'button',
                text: 'Save',
                handler: function () {
                  this.up('window').grid.getStore().load(); // Use 'this.up('window').grid' to access the grid reference
              
                  // Validate the form fields
                  var name = this.up('window').down('textfield[name=name]').getValue();
                  var gender = this.up('window').down('combobox[name=gender]').getValue();
                  var birthdate = this.up('window').down('datefield[name=birthdate]').getValue();
                  var address = this.up('window').down('textfield[name=address]').getValue();
                  var emailField = this.up('window').down('textfield[name=email]');
                  var phoneField = this.up('window').down('textfield[name=phone]');
              
                  // Check if the form fields are valid (email and phone)
                  if (name && gender && birthdate && address && emailField.isValid() && phoneField.isValid()) {
                    var email = emailField.getValue();
                    var phone = phoneField.getValue();
              
                    var userData = {
                      Name: name,
                      Gender: gender,
                      Birthdate: birthdate,
                      Address: address,
                      Email: email,
                      Phone: phone
                    };
              
                    fetch('https://localhost:44302/Users', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(userData)
                    })
                    .then(function (response) {
                      if (response.ok) {
                        return response.json();
                      } else {
                        throw new Error('Failed to save the user.');
                      }
                    })
                    .then(function (apiResponse) {
                      if (apiResponse.success) {
                        Ext.Msg.alert('Success', 'New user saved successfully!');
                        floatingPanel.close();
                        grid.getStore().load();
                      } else {
                        Ext.Msg.alert('Success', 'New user saved successfully!');
                        floatingPanel.close();
                        grid.getStore().load();
                      }
                    })
                    .catch(function (error) {
                      Ext.Msg.alert('Error', error.message);
                    });
                  } else {
                    Ext.Msg.alert('Error', 'Please fill in all required fields and ensure the' + 
                                            ' email and phone are in the correct format.');
                  }
                }
              }
            ]
          });

          floatingPanel.show();
        }
      },
      {
        text: 'Edit',
        handler: function() {
          var grid = this.up('grid');
          var selectedRecords = this.up('grid').getSelectionModel().getSelection();
          
          if (selectedRecords.length === 0) {
            Ext.Msg.alert('Error', 'Please select a user to edit.');
            return;
          }

          if (selectedRecords.length === 1) {
            var selectedRecord = selectedRecords[0];
            var floatingPanel = Ext.create('Ext.window.Window', {
              title: 'Edit User',
              layout: 'form',
              width: 411,
              height: 367,
              grid,
              items: [
                {
                  xtype: 'textfield',
                  fieldLabel: 'Name',
                  name: 'name',
                  value: selectedRecord.get('Name'),
                  readOnly: true // Make the field read-only
                },
                {
                  xtype: 'combobox',
                  fieldLabel: 'Gender',
                  name: 'gender',
                  value: selectedRecord.get('Gender'),
                  store: ['Male', 'Female', 'Others'], // Dropdown options
                  queryMode: 'local' // Uses the store as a local data source
                },
                {
                  xtype: 'datefield',
                  fieldLabel: 'Birthdate',
                  name: 'birthdate',
                  value: selectedRecord.get('Birthdate')
                },
                {
                  xtype: 'textfield',
                  fieldLabel: 'Address',
                  name: 'address',
                  value: selectedRecord.get('Address')
                },
                {
                  xtype: 'textfield',
                  fieldLabel: 'Email',
                  name: 'email',
                  value: selectedRecord.get('Email')
                },
                {
                  xtype: 'textfield',
                  fieldLabel: 'Phone',
                  name: 'phone',
                  value: selectedRecord.get('Phone')
                },
                {
                  xtype: 'button',
                  text: 'Save',
                  handler: function() {
                    this.up('window').grid.getStore().load();

                    var name = this.up('window').down('textfield[name=name]').getValue();
                    var gender = this.up('window').down('combobox[name=gender]').getValue();
                    var birthdate = this.up('window').down('datefield[name=birthdate]').getValue();
                    var address = this.up('window').down('textfield[name=address]').getValue();
                    var email = this.up('window').down('textfield[name=email]').getValue();
                    var phone = this.up('window').down('textfield[name=phone]').getValue();
      
                    var userData = {
                      Name: name,
                      Gender: gender,
                      Birthdate: birthdate,
                      Address: address,
                      Email: email,
                      Phone: phone
                    };

                    //select userId from the db
                    var userIds = selectedRecords.map(function(record) {
                      return record.get('Name'); 
                    });
      
                    var url = 'https://localhost:44302/Users/' + userIds.join(',');// Constructed URL with user name
      
                    fetch(url, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(userData)
                    })
                    .then(function(response) {
                      if (response.ok) {
                        return response.json();
                      } else {
                        throw new Error('Failed to save the user.');
                      }
                    })
                    .then(function(apiResponse) {
                      if (apiResponse.success) {
                        Ext.Msg.alert('Success', 'User saved successfully!');
                        floatingPanel.close();
                        grid.getStore().load(); // Reload the grid store to show the new movie
                        // Perform additional actions if needed
                      } else {
                        Ext.Msg.alert('Error', 'Failed to save the user.');
                        floatingPanel.close();
                        grid.getStore().load(); // Reload the grid store to show the new movie
                      }
                    })
                    .catch(function(error) {
                      Ext.Msg.alert('Success', 'User saved successfully!');
                      floatingPanel.close();
                      grid.getStore().load(); 
                    });
      
                    this.up('window').close();
                  }
                }
              ]
            });
      
            floatingPanel.show();
          }
        }
      },
      {
        text: 'Delete',
        handler: function() {
          var selectedRecords = this.up('grid').getSelectionModel().getSelection();
          
          if (selectedRecords.length === 0) {
            Ext.Msg.alert('Error', 'Please select a user to delete.');
            return;
          }

          if (selectedRecords.length > 0) {
            Ext.Msg.confirm('Delete Users', 'Are you sure you want to delete the selected user?', function(btn) {
              if (btn === 'yes') {
                var name = [];
                Ext.each(selectedRecords, function(record) {
                  name.push(record.get('Name'));
                });
  
                var grid = this.up('grid'); // Define the 'grid' variable 
  
                var url = 'https://localhost:44302/Users/' + name.join(','); // Construct the URL with movie IDs
  
                fetch(url, {
                  method: 'DELETE'
                })
                .then(function(response) {
                  if (response.ok) {
                    return response.json();
                  } else {
                    throw new Error('Failed to delete the users.');
                  }
                })
                .then(function(apiResponse) {
                  if (apiResponse.success) {
                    Ext.Msg.alert('Success', 'Users deleted successfully!');
                    grid.getStore().load(); // Reload the grid store to reflect the changes
                  } else {
                    Ext.Msg.alert('Success', 'Users deleted successfully!');
                    grid.getStore().load(); // Reload the grid store to reflect the changes
                  }
                })
                .catch(function(error) {
                  Ext.Msg.alert('Error', error.message);
                });
              }
            }, this); // Pass 'this' as the third argument to maintain the scope inside the confirmation callback
          }
        }
      }
    ]
  },

  listeners: {
    afterrender: function (grid) {
      var store = grid.getStore();
      store.load();
    }
  }
});
