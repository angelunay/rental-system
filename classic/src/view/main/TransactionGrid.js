Ext.define('MovieRentalApp.view.main.TransactionGrid', {
  extend: 'Ext.grid.Panel',
  xtype: 'transactionGrid',
  title: 'Transactions',

  store: {
    type: 'transactionstore',
    autoLoad: true
  },

  selModel: {
    selType: 'checkboxmodel',
    checkOnly: true
  },

  columns: [
    { text: 'Transaction ID', dataIndex: 'TransactionId', flex: 1 },
    { text: 'Customer Name', dataIndex: 'CustomerName', flex: 1 },
    { text: 'Rent Date', dataIndex: 'RentDate', flex: 1, xtype: 'datecolumn', format: 'Y-m-d' },
    { text: 'Return Date', dataIndex: 'ReturnDate', flex: 1, xtype: 'datecolumn', format: 'Y-m-d' },
    {
      text: 'Status',
      dataIndex: 'ReturnDate',
      flex: 1,
      renderer: function (value, metaData, record) {
        if (value) {
          return 'Returned';
        } else {
          return 'Pending';
        }
      }
    },
    {
      text: 'Return Movie',
      xtype: 'actioncolumn',
      width: 80,
      items: [{
        getClass: function (value, metaData, record) {
          var status = record.get('Status');
          if (status === 'Returned' || status === 'Pending') {
            return (status === 'Returned') ? 'x-fa fa-times-circle' : 'x-fa fa-check-circle';
          } else {
            return '';
          }
        },
        getTip: function (value, metaData, record) {
          var status = record.get('Status');
          return (status === 'Returned' || status === 'Pending') ? 'Reset Return' : '';
        },
        handler: function (grid, rowIndex, colIndex, item, e, record) {
          var transactionId = record.get('TransactionId');
          var status = record.get('Status');
    
          if (status === 'Returned') {
            var returnData = {
              TransactionId: transactionId,
              CustomerName: record.get('CustomerName'),
              Movie: record.get('Movie'),
              TotalPrice: record.get('TotalPrice'),
              RentDate: record.get('RentDate'),
              ReturnDate: null,
              Status: 'Pending',
              Quantity: record.get('Quantity')
            };
    
            fetch('https://localhost:44302/Transactions/' + transactionId, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(returnData)
            })
              .then(response => {
                if (response.ok) {
                  Ext.Msg.alert('Success', 'Transaction return reset successfully.');
                  grid.getStore().load();
                } else {
                  throw new Error('Failed to reset transaction return.');
                }
              })
              .catch(error => {
                Ext.Msg.alert('Error', error.message);
              });
          } else if (status === 'Pending') {
            var returnData = {
              TransactionId: transactionId,
              CustomerName: record.get('CustomerName'),
              Movie: record.get('Movie'),
              TotalPrice: record.get('TotalPrice'),
              RentDate: record.get('RentDate'),
              ReturnDate: new Date(),
              Status: 'Returned',
              Quantity: record.get('Quantity')
            };
    
            fetch('https://localhost:44302/Transactions/' + transactionId, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(returnData)
            })
              .then(response => {
                if (response.ok) {
                  Ext.Msg.alert('Success', 'Transaction marked as returned successfully.');
                  grid.getStore().load();
                } else {
                  throw new Error('Failed to mark transaction as returned.');
                }
              })
              .catch(error => {
                Ext.Msg.alert('Error', error.message);
              });
          }
        }
      }]
    }
    
  ],
  tbar: [{
    text: 'New Transaction',
    handler: function () {
      var grid = this.up('grid');
      var floatingPanel = Ext.create('Ext.window.Window', {
        title: 'Add New Transaction',
        layout: 'form',
        width: 411,
        height: 450,
        grid: grid,
        items: [
          {
            xtype: 'combobox',
            fieldLabel: 'Customer Name',
            name: 'customerName',
            itemId: 'customerNameCombo',
            store: Ext.create('Ext.data.Store', {
              fields: ['name'],
              data: []
            }),
            displayField: 'name',
            valueField: 'name',
            queryMode: 'local',
            forceSelection: true,
            listeners: {
              beforequery: function (queryPlan) {
                queryPlan.query = new RegExp(queryPlan.query, 'i');
                queryPlan.forceAll = true;
              }
            }
          },
          {
            xtype: 'tagfield',
            fieldLabel: 'Movie',
            name: 'movieId',
            itemId: 'movieNameCombo',
            store: Ext.create('MovieRentalApp.store.MovieStore'),
            displayField: 'id',
            valueField: 'id',
            queryMode: 'local',
            forceSelection: true,
            multiSelect: true,
            listeners: {
              change: function (tagfield, newValue, oldValue) {
                var totalPrice = 0;
                var moviesStore = tagfield.getStore();
                var selectedMovies = moviesStore.queryBy(function (record) {
                  return newValue.indexOf(record.get('id')) !== -1;
                });
                selectedMovies.each(function (movie) {
                  var price = parseFloat(movie.get('price'));
                  if (!isNaN(price)) {
                    totalPrice += price;
                  }
                });
            
                var totalPriceField = tagfield.up('window').down('textfield[name=totalPrice]');
                if (totalPriceField) {
                  totalPriceField.setValue(totalPrice.toFixed(2));
                }
            
                var movieTitleField = tagfield.up('window').down('textfield[name=Title]');
                if (movieTitleField) {
                  var movieTitles = [];
                  selectedMovies.each(function (movie) {
                    movieTitles.push(movie.get('title'));
                  });
            
                  movieTitleField.setValue(movieTitles.join(', '));
                }

                var movieQuantityField = tagfield.up('window').down('numberfield[name=quantity]');

                if (movieQuantityField) {
                  var totalQuantity = selectedMovies.reduce(function (accumulator, movie) {
                    return accumulator + movie.get('quantity');
                  }, 0);

                  movieQuantityField.setValue(totalQuantity);
                }

              }
                       
            }
          },
          {
            xtype: 'textfield',
            fieldLabel: 'Transaction ID',
            name: 'transactionId', // Add a name to the textfield
            readOnly: true,
            hidden: true // Hide the field initially
          },
          {
            xtype: 'textfield',
            fieldLabel: 'Title',
            name: 'Title',
            
          },
          {
            xtype: 'textfield',
            fieldLabel: 'Total Price',
            name: 'totalPrice',
            readOnly: true
          },
          {
            xtype: 'numberfield',
            fieldLabel: 'Quantity',
            name: 'quantity',
            minValue: 1,
            value: 1 // Set a default value for the quantity field
          },
          
          {
            xtype: 'datefield',
            fieldLabel: 'Rent Date',
            name: 'rentDate',
            format: 'Y-m-d',
          },
          {
            xtype: 'datefield',
            fieldLabel: 'Return Date',
            name: 'returnDate',
            format: 'Y-m-d',
            allowBlank: true
          },
          {
            xtype: 'button',
            text: 'Save',
            handler: function () {
              var customerName = this.up('window').down('combobox[name=customerName]').getValue();
              var movieIds = this.up('window').down('tagfield[name=movieId]').getValue();
              var rentDate = this.up('window').down('datefield[name=rentDate]').getValue();
              var returnDate = this.up('window').down('datefield[name=returnDate]').getValue();
              var quantity = this.up('window').down('numberfield[name=quantity]').getValue();
              var movieStore = this.up('window').down('tagfield[name=movieId]').getStore();
          
              var selectedMovies = movieStore.getRange().filter(function (movie) {
                return movieIds.indexOf(movie.get('id')) !== -1;
              });
          
              var totalPrice = 0;
              selectedMovies.forEach(function (movie) {
                var price = parseFloat(movie.get('price'));
                if (!isNaN(price)) {
                  totalPrice += price;
                }
              });
          
              var totalPriceField = this.up('window').down('textfield[name=totalPrice]');
              totalPriceField.setValue(totalPrice.toFixed(2));
          
              var status = returnDate ? 'Returned' : 'Pending';
          
              var transactionData = {
                CustomerName: customerName,
                Movie: selectedMovies.map(function (movie) { return movie.get('id'); }).join(','),
                TotalPrice: totalPrice,
                Quantity: quantity,
                RentDate: rentDate,
                ReturnDate: returnDate !== null ? returnDate : null,
                Status: status
              };
          
              if (returnDate) {
                transactionData.ReturnDate = returnDate;
              }
          
              fetch('https://localhost:44302/Transactions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(transactionData)
              })
                .then(response => response.json())
                .then(apiResponse => {
                  if (apiResponse.success) {
                    Ext.Msg.alert('Success', 'Transaction saved successfully!');
                    floatingPanel.close();
                  
                    // Reload the grid store to show the new transaction
                    grid.getStore().load();                  
                    
                  } else {
                    Ext.Msg.alert('Success', 'Transaction updated successfully!');
                    
                    floatingPanel.destroy();
                    // Reload the grid store to show the new transaction
                    grid.getStore().load();
                    var transactionId = apiResponse.TransactionId;
                  
                    // Create an array to hold the transaction details
                    var transactionDetailsData = [];

                    selectedMovies.forEach(function (movie) {
                      var transactionDetail = {
                        Name: customerName,
                        TransactionId: transactionId,
                        MovieId: movie.get('id'),
                        Title: movie.get('title'),
                        Director: movie.get('director')
                      };

                      transactionDetailsData.push(transactionDetail);
                    });

                    fetch('https://localhost:44302/TransactionDetailsDTO', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(transactionDetailsData) // Pass the array directly
                    })
                      .then(response => {
                        if (response.ok) {
                          return response.json();
                        } else {
                          throw new Error('Failed to save transaction details. HTTP status code: ' + response.status);
                        }
                      })
                      .then(apiResponse => {
                        if (apiResponse.success) {
                          console.log('Transaction details saved successfully:', apiResponse);
                        } else {
                          console.log('Failed to save transaction details:', apiResponse.message);
                        }
                    })
                    .catch(error => {
                      console.log('Failed to save transaction details:', error);
                    });
                    grid.getStore().load(); // load after successfull response
                  }
                  
                })
                .catch(error => {
                  Ext.Msg.alert('Error', 'Failed to save the transaction: ' + error.message);
                });
            }
          }
          
          
        ]
      });
      // Retrieve the UserGrid and the customerNameCombo
      var userGrid = Ext.ComponentQuery.query('userGrid')[0];
      var customerNameCombo = floatingPanel.down('combobox[itemId=customerNameCombo]');

      if (userGrid && customerNameCombo) {
        var userStore = userGrid.getStore();
        var userData = [];

        userStore.each(function (record) {
          userData.push({
            name: record.get('Name')
          });
        });

        customerNameCombo.getStore().setData(userData);
      }

      var movieGrid = Ext.ComponentQuery.query('grid')[0];
      var movieNameCombo = floatingPanel.down('tagfield[name=movieId]');

      if (movieGrid && movieNameCombo) {
        var movieStore = movieGrid.getStore();
        var movieData = [];

        // fetch the datas needed from the movieStore (Id, price, Title)
        movieStore.each(function (record) {
          movieData.push({
            id: record.get('MovieId'),
            price: record.get('Price'),
            title: record.get('Title'),
            quantity: record.get('Quantity'),
            director: record.get('Director')
          });
        });

        var comboStore = movieNameCombo.getStore();
        comboStore.removeAll();
        comboStore.add(movieData);
      }

      floatingPanel.show();
    }
  },
  
  //View Details
  {
    text: 'View Details',
    handler: function () {
      var selectedRecords = this.up('grid').getSelectionModel().getSelection();
      if (selectedRecords.length !== 1) {
        Ext.Msg.alert('Error', 'Please select a single transaction to view details.');
        return;
      }
  
      var record = selectedRecords[0];
      var transactionId = record.get('TransactionId');
  
      // Retrieve the transaction details for the selected TransactionId
      fetch('https://localhost:44302/TransactionDetailsDTO?transactionId=' + transactionId)
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Failed to retrieve transaction details.');
          }
        })
        .then(apiResponse => {
          if (apiResponse.length > 0) {
            var transactionDetailsData = apiResponse.filter(transactionDetail => transactionDetail.TransactionId === transactionId).map(transactionDetail => ({
              TransactionDetailId: transactionDetail.TransactionDetailId,
              TransactionId: transactionDetail.TransactionId,
              Name: transactionDetail.Name,
              MovieId: transactionDetail.MovieId,
              Title: transactionDetail.Title,
              Director: transactionDetail.Director
            }));
  
            var floatingPanel = Ext.create('Ext.window.Window', {
              title: 'Transaction Details',
              layout: 'fit',
              width: 800,
              height: 400,
              items: [
                {
                  xtype: 'grid',
                  store: {
                    type: 'transactiondetailsstore',
                    data: transactionDetailsData
                  },
                  columns: [
                    { text: 'Transaction Detail', dataIndex: 'TransactionDetailId', flex: 1 },
                    { text: 'Transaction ID', dataIndex: 'TransactionId', flex: 1 },
                    { text: 'Name', dataIndex: 'Name', flex: 1 },
                    { text: 'Movie ID', dataIndex: 'MovieId', flex: 1 },
                    { text: 'Title', dataIndex: 'Title', flex: 1 },
                    { text: 'Director', dataIndex: 'Director', flex: 1 }
                  ]
                }
              ]
            });
  
            floatingPanel.show();
          } else {
            Ext.Msg.alert('Error', 'No transaction details found.');
          }
        })
        .catch(error => {
          Ext.Msg.alert('Error', error.message);
        });
    }
  },
  {    
    text: 'Delete',
        handler: function() {
          var selectedRecords = this.up('grid').getSelectionModel().getSelection();
          if (selectedRecords.length === 0) {
            Ext.Msg.alert('Error', 'Please select a transaction to delete.');
            return;
          }
          
          if (selectedRecords.length > 0) {
            Ext.Msg.confirm('Delete Transaction', 'Are you sure you want to delete the selected transaction?', function(btn) {
              if (btn === 'yes') {
                var transactionId = [];
                Ext.each(selectedRecords, function(record) {
                  transactionId.push(record.get('TransactionId'));
                });
  
                var grid = this.up('grid'); // Define the 'grid' variable 
  
                var url = 'https://localhost:44302/Transactions/' + transactionId.join(','); // Construct the URL with movie IDs
  
                fetch(url, {
                  method: 'DELETE'
                })
                .then(function(response) {
                  if (response.ok) {
                    return response.json();
                  } else {
                    throw new Error('Failed to delete the transaction.');
                  }
                })
                .then(function(apiResponse) {
                  if (apiResponse.success) {
                    Ext.Msg.alert('Success', 'transaction deleted successfully!');
                    grid.getStore().load(); // Reload the grid store to reflect the changes
                  } else {
                    Ext.Msg.alert('Success', 'transaction deleted successfully!');
                    grid.getStore().load(); // Reload the grid store to reflect the changes
                  }
                })
                .catch(function(error) {
                  
                  Ext.Msg.alert('Error', error.message);
                  grid.getStore().load();
                });
              }
            }, this); // Pass 'this' as the third argument to maintain the scope inside the confirmation callback
          }
        }
      }
],

listeners: {
  afterrender: function (grid) {
    var store = grid.getStore();
    store.load(); // Explicitly load the store
  }
  }
});