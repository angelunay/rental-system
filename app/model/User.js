Ext.define('MovieRentalApp.model.User', {
    extend: 'Ext.data.Model',
    
    fields: [
      { name: 'Name', type: 'string' },
      { name: 'Gender', type: 'string' },
      { name: 'Birthdate', type: 'string' },
      { name: 'Address', type: 'string' },
      { name: 'Email', type: 'string' },
      { name: 'Phone', type: 'string'}
    ]
  });
  