Ext.define('MovieRentalApp.store.TransactionStore', {
  extend: 'Ext.data.Store',
  alias: 'store.transactionstore',
  model: 'MovieRentalApp.model.Transaction',

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
var transactionStore = Ext.create('MovieRentalApp.store.TransactionStore');