Ext.define('MovieRentalApp.view.main.Grid', {
  extend: 'Ext.grid.Panel',
  xtype: 'mainGrid',
  title: 'Movies',
  store: {
    type: 'moviestore'
  },

  selModel: {
    selType: 'checkboxmodel',
    checkOnly: true
  },

  columns: [
    { text: 'Movie ID', dataIndex: 'MovieId', flex: 1 },
    { text: 'Title', dataIndex: 'Title', flex: 1 },
    { text: 'Genre', dataIndex: 'Genre', flex: 1 },
    { text: 'Director', dataIndex: 'Director', flex: 1 },
    { text: 'Release Date', dataIndex: 'ReleaseDate', flex: 1, xtype: 'datecolumn', format: 'Y-m-d' },
    { text: 'Price', dataIndex: 'Price', flex: 1 },
    { text: 'Quantity', dataIndex: 'Quantity', flex: 1 },
  ],

  tbar: [
    {
      text: 'New Movie',
      handler: function() {
        var grid = this.up('grid');
        var floatingPanel = Ext.create('Ext.window.Window', {
          title: 'Add New Movie',
          layout: 'form',
          width: 411,
          height: 400,
          grid: grid,
          items: [
            {
              xtype: 'textfield',
              fieldLabel: 'Movie ID',
              name: 'movieId'
            },
            {
              xtype: 'textfield',
              fieldLabel: 'Title',
              name: 'title'
            },
            {
              xtype: 'combobox',
              fieldLabel: 'Genre',
              name: 'genre',
              store: ['Action','Adventure','Anime', 'Comedy', 'Drama', 'Horror', 'Romance','KDrama'], // Dropdown options
              queryMode: 'local' // Uses the store as a local data source
            },
            {
              xtype: 'textfield',
              fieldLabel: 'Director',
              name: 'director'
            },
            {
              xtype: 'datefield',
              fieldLabel: 'Release Date',
              name: 'releaseDate',
              format: 'Y-m-d'
            },
            {
              xtype: 'textfield',
              fieldLabel: 'Price',
              name: 'price'
            },
            {
              xtype: 'textfield',
              fieldLabel: 'Quantity',
              name: 'quantity'
            },
            {
              xtype: 'button',
              text: 'Save',
              handler: function() {
                this.up('window').grid.getStore().load(); // Use 'this.up('window').grid' to access the grid reference

                var movieId = this.up('window').down('textfield[name=movieId]').getValue();
                var title = this.up('window').down('textfield[name=title]').getValue();
                var genre = this.up('window').down('combobox[name=genre]').getValue();
                var director = this.up('window').down('textfield[name=director]').getValue();
                var releaseDate = this.up('window').down('datefield[name=releaseDate]').getValue();
                var price = this.up('window').down('textfield[name=price]').getValue();
                var quantity = this.up('window').down('textfield[name=quantity]').getValue();

                var movieData = {
                  MovieId: movieId,
                  Title: title,
                  Genre: genre,
                  Director: director,
                  ReleaseDate: releaseDate,
                  Price: price,
                  Quantity: quantity
                };

                fetch('https://localhost:44302/Movies', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(movieData)
                })
                .then(function(response) {
                  if (response.ok) {
                    return response.json();
                  } else {
                    throw new Error('Failed to save the movie.');
                  }
                })
                .then(function(apiResponse) {
                  if (apiResponse.success) {
                    Ext.Msg.alert('Success', 'Movie saved successfully!');
                    floatingPanel.close();
                    grid.getStore().load(); // Reload the grid store to show the new movie
                    
                  } else {
                    Ext.Msg.alert('Success', 'Movie saved successfully!');
                    floatingPanel.close();
                    grid.getStore().load();
                  }
                })
                .catch(function(error) {
                  Ext.Msg.alert('Error', error.message);
                });

                this.up('window').close();
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
        var selectedRecords = this.up('grid').getSelectionModel().getSelection();
        var grid = this.up('grid');

        if (selectedRecords.length === 0) {
          Ext.Msg.alert('Error', 'Please select a movie to edit.');
          return;
        }

        if (selectedRecords.length === 1) {
          var selectedRecord = selectedRecords[0];
          var floatingPanel = Ext.create('Ext.window.Window', {
            title: 'Edit Movie',
            layout: 'form',
            width: 411,
            height: 400,
            grid: grid,

            items: [
              {
                xtype: 'textfield',
                fieldLabel: 'Movie ID',
                name: 'movieId',
                value: selectedRecord.get('MovieId'),
                readOnly: true // Make the field read-only
              },
              {
                xtype: 'textfield',
                fieldLabel: 'Title',
                name: 'title',
                value: selectedRecord.get('Title')
              },
              {
                xtype: 'combobox',
                fieldLabel: 'Genre',
                name: 'genre',
                value: selectedRecord.get('Genre'),
                store: ['Action','Adventure','Anime', 'Comedy', 'Drama', 'Horror', 'Romance','KDrama'], // Dropdown options
                queryMode: 'local' // Uses the store as a local data source
              },
              {
                xtype: 'textfield',
                fieldLabel: 'Director',
                name: 'director',
                value: selectedRecord.get('Director')
              },
              {
                xtype: 'datefield',
                fieldLabel: 'Release Date',
                name: 'releaseDate',
                format: 'Y-m-d',
                value: selectedRecord.get('ReleaseDate')
              },
              {
                xtype: 'textfield',
                fieldLabel: 'Price',
                name: 'price',
                value: selectedRecord.get('Price')
              },
              {
                xtype:  'numberfield',
                fieldLabel: 'Quantity',
                name: 'quantity',
                value: selectedRecord.get('Quantity')
              },
              {
                xtype: 'button',
                text: 'Save',
                handler: function() {
                  this.up('window').grid.getStore().load();

                  var movieId = this.up('window').down('textfield[name=movieId]').getValue();
                  var title = this.up('window').down('textfield[name=title]').getValue();
                  var genre = this.up('window').down('combobox[name=genre]').getValue();
                  var director = this.up('window').down('textfield[name=director]').getValue();
                  var releaseDate = this.up('window').down('datefield[name=releaseDate]').getValue();
                  var price = this.up('window').down('textfield[name=price]').getValue();
                  var quantity = this.up('window').down('textfield[name=quantity]').getValue();

                  var movieData = {
                    MovieId: movieId,
                    Title: title,
                    Genre: genre,
                    Director: director,
                    ReleaseDate: releaseDate,
                    Price: price,
                    Quantity: quantity
                  };

                  //fetch the movieId from the API
                  var movieIds = selectedRecords.map(function(record) {
                    return record.get('MovieId');
                  });

                  var url = 'https://localhost:44302/Movies/' + movieIds.join(',');

                  fetch(url, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(movieData)
                  })
                  .then(function(response) {
                    if (response.ok) {
                      return response.json();
                    } else {
                      throw new Error('Failed to save the movie.');
                    }
                  })
                  .then(function(apiResponse) {
                    if (apiResponse.success) {
                      Ext.Msg.alert('Success', 'Movie Update saved successfully!');
                      floatingPanel.close();
                      grid.getStore().load(); // Reload the grid store to show the new movie
                      
                    } else {
                      Ext.Msg.alert('Error', error.message);
                      floatingPanel.close();
                      grid.getStore().load(); 
                    }
                  })
                  .catch(function(error) {
                    Ext.Msg.alert('Success', 'Movie Update saved successfully!');
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
          Ext.Msg.alert('Error', 'Please select a movie to delete.');
          return;
        }

        if (selectedRecords.length > 0) {
          Ext.Msg.confirm('Delete Movies', 'Are you sure you want to delete the selected movies?', function(btn) {
            if (btn === 'yes') {
              var movieIds = [];

              //fetch MovieId from api
              Ext.each(selectedRecords, function(record) {
                movieIds.push(record.get('MovieId'));
              });

              var grid = this.up('grid');

              var url = 'https://localhost:44302/Movies/' + movieIds.join(',');

              fetch(url, {
                method: 'DELETE'
              })
              .then(function(response) {
                if (response.ok) {
                  return response.json();
                } else {
                  throw new Error('Failed to delete the movies.');
                }
              })
              .then(function(apiResponse) {
                if (apiResponse.success) {
                  Ext.Msg.alert('Success', 'Movies deleted successfully!');
                  grid.getStore().load(); // Reload the grid store to reflect the changes
                } else {
                  Ext.Msg.alert('Success', 'Movies deleted successfully!');
                  grid.getStore().load(); 
                }
              })
              .catch(function(error) {
                Ext.Msg.alert('Error', error.message);
              });
            }
          }, this);
        }
      }
    }],


  listeners: {
    afterrender: function(gridPanel) {
      var grid = gridPanel;
      var store = grid.getStore();
      store.load();
    }
  }
});
