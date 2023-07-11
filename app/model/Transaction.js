Ext.define('MovieRentalApp.model.Transaction', {
    extend: 'Ext.data.Model',
    
    fields: [
      { name: 'TransactionId', type: 'int' },
      { name: 'CustomerName', type: 'string' },
      { name: 'Movie', type: 'string' },
      { name: 'TotalPrice', type: 'float' },
      { name: 'RentDate', type: 'date' },
      { name: 'ReturnDate', type: 'date' }, 
      { name: 'Status', type: 'string' },
      { name: 'Quantity', type:'int'}  ,
      { name: 'Title', type: 'string' },
      
    ]
  });