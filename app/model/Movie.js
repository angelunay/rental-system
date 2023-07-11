Ext.define('MovieRentalApp.model.Movie', {
    extend: 'Ext.data.Model',
  
    fields: [
      { name: 'MovieId', type: 'string' },
      { name: 'Title', type: 'string' },
      { name: 'Genre', type: 'string' },
      { name: 'Director', type: 'string' },
      { name: 'ReleaseDate', type: 'date' },
      { name: 'Price', type: 'float' },
      {name: 'Quantity', type: 'int'}
    ]
  });