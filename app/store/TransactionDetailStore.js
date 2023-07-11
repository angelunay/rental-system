Ext.define('MovieRentalApp.store.TransactionDetailStore', {
    extend: 'Ext.data.Store',
    alias: 'store.transactiondetailsstore', // Correct alias definition
  
    model: 'MovieRentalApp.model.TransactionDetailsDTO',
  
    proxy: {
      type: 'rest',
      reader: {
      type: 'json',
      rootProperty: 'data',
      totalProperty: 'totalCount'
      },
      api: {
      create: 'https://localhost:44302/Transactions',
      read: 'https://localhost:44302/Transactions',
      update: 'https://localhost:44302/Transactions',
      destroy: 'https://localhost:44302/Transactions'
      }
    }
  });
  var transactionStore = Ext.create('MovieRentalApp.store.TransactionDetailStore');
  
 