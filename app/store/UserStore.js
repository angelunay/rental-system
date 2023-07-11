Ext.define('MovieRentalApp.store.UserStore', {
  extend: 'Ext.data.Store',
  alias: 'store.userstore',
  model: 'MovieRentalApp.model.User',
  
  proxy: {
    type: 'rest',
    reader: {
    type: 'json',
    rootProperty: 'data',
    totalProperty: 'totalCount'
    },
    api: {
    create: 'https://localhost:44302/Users',
    read: 'https://localhost:44302/Users',
    update: 'https://localhost:44302/Users',
    destroy: 'https://localhost:44302/Users'
    }
  }
});

var userStore = Ext.create('MovieRentalApp.store.UserStore');
