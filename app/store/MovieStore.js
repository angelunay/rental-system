Ext.define('MovieRentalApp.store.MovieStore', {
  extend: 'Ext.data.Store',
  alias: 'store.moviestore',
  model: 'MovieRentalApp.model.Movie',

  proxy: {
    type: 'rest',
    reader: {
    type: 'json',
    rootProperty: 'data',
    totalProperty: 'totalCount'
    },
    api: {
    create: 'https://localhost:44302/Movies',
    read: 'https://localhost:44302/Movies',
    update: 'https://localhost:44302/Movies',
    destroy: 'https://localhost:44302/Movies'
    }
  }
});

var movieStore = Ext.create('MovieRentalApp.store.MovieStore');
