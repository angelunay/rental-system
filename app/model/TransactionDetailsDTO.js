Ext.define('MovieRentalApp.model.TransactionDetailsDTO', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'TransactionDetailId', type: 'int' },
        { name: 'Name', type: 'string' },
        { name: 'TransactionId', type: 'int' },
        { name: 'MovieId', type: 'string' },
        { name: 'Title', type: 'string' },
        { name: 'Director', type: 'string' }
    ]
  });
  