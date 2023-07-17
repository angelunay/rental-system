Ext.define('MovieRentalApp.view.main.TransactionGrid', {
  extend: 'Ext.grid.Panel',
  xtype: 'transactionGrid',
  title: 'Transactions',

  store: {
    type: 'transactionstore',
    autoLoad: false
  },

  selModel: {
    selType: 'checkboxmodel',
    checkOnly: true
  },

  columns: [
    { text: 'Transaction ID', dataIndex: 'TransactionId', flex: 1 },
    { text: 'Customer Name', dataIndex: 'CustomerName', flex: 1 },
    { text: 'Rent Date', dataIndex: 'RentDate', flex: 1, xtype: 'datecolumn', format: 'Y-m-d' },
    
  ],
  
  tbar: [{
    text: 'New Transaction',
    handler: function () {
      var grid = this.up('grid');
      var floatingPanel = Ext.create('Ext.window.Window', {
        title: 'Add New Transaction',
        layout: 'form',
        width: 411,
        height: 403,
        autoScroll: true, // Add this line to enable scrollbar
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
                var movieDirectorField = tagfield.up('window').down('textfield[name=Director]');
                if (movieTitleField) {
                  var movieTitles = [];
                  var movieDirector = [];
                  selectedMovies.each(function (movie) {
                    movieTitles.push(movie.get('title'));
                    movieDirector.push(movie.get('director'));
                  });
            
                  movieTitleField.setValue(movieTitles.join(', '));
                  movieDirectorField.setValue(movieDirector.join(', '));
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
            xtype: 'datefield',
            fieldLabel: 'Rent Date',
            name: 'rentDate',
            format: 'Y-m-d',
          },        
          {
            xtype: 'textfield',
            fieldLabel: 'Title',
            name: 'Title',
            readOnly: true
            
          },
          {
            xtype: 'textfield',
            fieldLabel: 'Director',
            name: 'Director',
            readOnly: true
            
          },
          {
            xtype: 'textfield',
            fieldLabel: 'Total Price',
            name: 'totalPrice',
            readOnly: true
          },          
          {
            xtype: 'button',
            text: 'Save',
            handler: function () {
              var customerName = this.up('window').down('combobox[name=customerName]').getValue();
              var movieIds = this.up('window').down('tagfield[name=movieId]').getValue();
              var rentDate = this.up('window').down('datefield[name=rentDate]').getValue();            
              
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
          
          
              var transactionData = {
                CustomerName: customerName,
                Movie: selectedMovies.map(function (movie) { return movie.get('id'); }).join(','),
                TotalPrice: totalPrice,
                RentDate: rentDate
                
              };
          
              
          
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
                        Director: movie.get('director'),                        
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
  
  // View Details
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

    // Create a store for the transaction details
    var transactionDetailsStore = Ext.create('Ext.data.Store', {
      type: 'transactiondetailsstore'
    });

    // Create the grid using the store
    var transactionDetailsGrid = Ext.create('Ext.grid.Panel', {
      store: transactionDetailsStore,
      columns: [
        { text: 'Transaction Detail', dataIndex: 'TransactionDetailId', flex: 1 },
        { text: 'Transaction ID', dataIndex: 'TransactionId', flex: 1 },
        { text: 'Movie ID', dataIndex: 'MovieId', flex: 1 },
        { text: 'Title', dataIndex: 'Title', flex: 1 },
        { text: 'Director', dataIndex: 'Director', flex: 1 },
        { text: 'Return Date', dataIndex: 'ReturnDate', flex: 1, xtype: 'datecolumn', format: 'Y-m-d' },
        {
          text: 'Status',
          dataIndex: 'Status',
          flex: 1,
          renderer: function (value, metaData, record) {
            var returnDate = record.get('ReturnDate');
            if (returnDate === null) {
              return 'Pending';
            } else {
              return 'Returned';
            }
          }
        },
        {
          text: 'Action',
          dataIndex: 'Status',
          width: 70,
          renderer: function (value, metaData, record) {
            if (value === 'Return') {
              return '<button class="return-button">Return</button>';
            } else if (value === 'Cancel') {
              return '<button class="cancel-button">Cancel</button>';
            }
            return '';
          }
        }
      ],
      selModel: {
        selType: 'checkboxmodel',
        checkOnly: true,
        mode: 'SINGLE'
      },
      listeners: {
        afterrender: function (grid) {
          grid.on('cellclick', function (view, cell, cellIndex, record, row, rowIndex, e) {
            var button = e.getTarget('.return-button, .cancel-button', null, true);
            if (button) {
              if (button.hasCls('return-button')) {
                if (record.get('ReturnDate') === null) {
                  // Update the ReturnDate to the current date
                  var currentDate = new Date().toISOString();
                  record.set('ReturnDate', currentDate);

                  // Perform PUT request to update the ReturnDate
                  var transactionDetailId = record.get('TransactionDetailId');
                  var updateData = {
                    TransactionDetailId: transactionDetailId,
                    TransactionId: record.get('TransactionId'),
                    MovieId: record.get('MovieId'),
                    Title: record.get('Title'),
                    Director: record.get('Director'),
                    ReturnDate: currentDate,
                    Status: 'Returned'
                  };

                  fetch('https://localhost:44302/TransactionDetailsDTO/' + transactionDetailId, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                  })
                    .then(response => {
                      if (response.ok) {
                        Ext.Msg.alert('Success', 'Returndate updated successfully.');
                        record.commit();
                        // Reload transaction details after updating
                        reloadTransactionDetails();
                      } else {
                        throw new Error('Failed to update ReturnDate.');
                      }
                    })
                    .catch(error => {
                      Ext.Msg.alert('Error', error.message);
                    });
                }
              } else if (button.hasCls('cancel-button')) {
                if (record.get('ReturnDate') !== null) {
                  // Update the ReturnDate to null
                  record.set('ReturnDate', null);

                  // Perform PUT request to set ReturnDate as null
                  var transactionDetailId = record.get('TransactionDetailId');
                  var updateData = {
                    TransactionDetailId: transactionDetailId,
                    Name: record.get('Name'),
                    TransactionId: record.get('TransactionId'),
                    MovieId: record.get('MovieId'),
                    Title: record.get('Title'),
                    Director: record.get('Director'),
                    ReturnDate: null,
                    Status: 'Pending'
                  };

                  fetch('https://localhost:44302/TransactionDetailsDTO/' + transactionDetailId, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                  })
                    .then(response => {
                      if (response.ok) {
                        Ext.Msg.alert('Success', 'Returndate canceled successfully.');
                        record.commit();
                        // Reload transaction details after updating
                        reloadTransactionDetails();
                      } else {
                        throw new Error('Failed to cancel ReturnDate.');
                      }
                    })
                    .catch(error => {
                      Ext.Msg.alert('Error', error.message);
                    });
                }
              }
            }
          });
        }
      }
    });

    // Create a function to reload the transaction details and update the grid
    function reloadTransactionDetails() {
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
              MovieId: transactionDetail.MovieId,
              Title: transactionDetail.Title,
              Director: transactionDetail.Director,
              ReturnDate: transactionDetail.ReturnDate,
              Status: transactionDetail.ReturnDate === null ? 'Return' : 'Cancel',
              selected: false
            }));

            transactionDetailsStore.loadData(transactionDetailsData);
          } else {
            Ext.Msg.alert('Error', 'No transaction details found.');
          }
        })
        .catch(error => {
          Ext.Msg.alert('Error', error.message);
        });
    }

    // Create an "Add" button
    var addButton = Ext.create('Ext.button.Button', {
      text: 'Add',
      handler: function () {
        // Declare newFloatingPanel in the outer scope
        var newFloatingPanel;

        // Load the movie store
        movieStore.load({
          callback: function(records, operation, success) {
            if (success) {
              createFormPanel();
            } else {
              Ext.Msg.alert('Error', 'Failed to load movie data.');
            }
          }
        });

        // Function to create the form panel
        function createFormPanel() {
          // Create a form panel
          var formPanel = Ext.create('Ext.form.Panel', {
            bodyPadding: 20,
            defaultType: 'textfield',
            items: [
              {
                xtype: 'displayfield',
                fieldLabel: 'Transaction ID',
                name: 'TransactionId',
                value: transactionId // Use the selected transactionId from the previous code
              },
              {
                xtype: 'tagfield',
                fieldLabel: 'Movie IDs',
                name: 'MovieIds',
                store: movieStore, // Use the already loaded movie store
                displayField: 'MovieId', // Display Movie ID
                valueField: 'MovieId', // Use Movie ID as the value
                queryMode: 'local',
                editable: true, // Set editable to true
                listeners: {
                  change: function (tagField, newValue) {
                    var movieTitles = [];
                    var movieDirector = [];
                    newValue.forEach(function (movieId) {
                      var movieRecord = movieStore.findRecord('MovieId', movieId);
                      if (movieRecord) {
                        movieTitles.push(movieRecord.get('Title'));
                        movieDirector.push(movieRecord.get('Director'));
                      }
                    });
                    formPanel.getForm().findField('Title').setValue(movieTitles.join(', '));
                    formPanel.getForm().findField('Director').setValue(movieDirector.join(', '));
                  }
                  
                }
              },
              {
                xtype: 'textfield',
                fieldLabel: 'Title',
                name: 'Title',
                readOnly: true
              },
              {
                xtype: 'textfield',
                fieldLabel: 'Director',
                name: 'Director'
              },
              {
                xtype: 'datefield',
                fieldLabel: 'Return Date',
                name: 'ReturnDate',
                format: 'Y-m-d'
              },
              {
                xtype: 'button',
                text: 'Save',
                handler: function () {
                  var transactionId = this.up('window').down('displayfield[name=TransactionId]').getValue();
                  var movieIds = this.up('window').down('tagfield[name=MovieIds]').getValue();
                  var returnDate = this.up('window').down('textfield[name=ReturnDate]').getValue();
                  var status = '';

                  if (returnDate === null || returnDate === '') {
                    status = 'Pending';
                  } else {
                    status = 'Returned';
                  }

                  var movieData = movieIds.map(function (movieId) {
                    var movieRecord = movieStore.findRecord('MovieId', movieId);
                    if (movieRecord) {
                      return {
                        TransactionId: transactionId,
                        MovieId: movieId,
                        Title: movieRecord.get('Title'),
                        Director: movieRecord.get('Director'),
                        ReturnDate: returnDate,
                        Status: status
                      };
                    }
                    return null;
                  });


                  fetch('https://localhost:44302/TransactionDetailsDTO', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(movieData.filter(Boolean)) // Pass the filtered array
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
                        throw new Error('Failed to save transaction details. HTTP status code: ' + response.status);
                      } else {
                        Ext.Msg.alert('Success', 'Movie rented successfully', function () {
                          newFloatingPanel.close();
                          reloadTransactionDetails();
                        })
                      }
                    });
                }
              }
            ]
          });

          
          // Create the new floating panel with form panel and toolbar
          newFloatingPanel = Ext.create('Ext.window.Window', {
            title: 'Rent Another Movie',
            layout: 'form',
            width: 368,
            height: 474,
            autoScroll: true, // Add this line to enable scrollbar
            items: [formPanel]
          });

          // Show the new floating panel
          newFloatingPanel.show();
        }
      }
    });

    // Create a "Delete" button
    var deleteButton = Ext.create('Ext.button.Button', {
      text: 'Delete Rented Movie',
      handler: function () {
        var selectedRecords = transactionDetailsGrid.getSelectionModel().getSelection();
        if (selectedRecords.length === 0) {
          Ext.Msg.alert('Error', 'Please select at least one transaction detail to delete.');
          return;
        }

        Ext.Msg.confirm('Confirmation', 'Are you sure you want to delete the selected transaction details?', function (btn) {
          if (btn === 'yes') {
            var deletePromises = selectedRecords.map(function (record) {
              var transactionDetailId = record.get('TransactionDetailId');
              return fetch('https://localhost:44302/TransactionDetailsDTO/' + transactionDetailId, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json'
                }
              })
                .then(response => {
                  if (response.ok) {
                    return response.json();
                  } else {
                    throw new Error('Failed to delete TransactionDetailId: ' + transactionDetailId);
                  }
                });
            });

            Promise.all(deletePromises)
              .then(() => {
                Ext.Msg.alert('Success', 'Selected transaction details deleted successfully.');
                reloadTransactionDetails();
              })
              .catch(error => {
                Ext.Msg.alert('Error', error.message);
              });
          }
        });
      }
    });

    // toolbar with the Add & Delete button 
    var toolbar = Ext.create('Ext.toolbar.Toolbar', {
      items: [addButton, deleteButton]
    });

    // Create a panel with the transaction details grid and toolbar
    var panel = Ext.create('Ext.panel.Panel', {
      layout: 'fit',
      items: [
        transactionDetailsGrid
      ],
      dockedItems: [
        toolbar
      ]
    });

    // Show the floating panel with the transaction details grid and toolbar
    var floatingPanel = Ext.create('Ext.window.Window', {
      title: 'Transaction Details',
      layout: 'fit',
      width: 800,
      height: 450,
      autoScroll: true, // Add this line to enable scrollbar
      items: [panel]
    });

    // Reload the transaction details when the panel is shown
    floatingPanel.on('show', reloadTransactionDetails);

    // Show the floating panel
    floatingPanel.show();


  }
}
  // Delete
  ,{
    text: 'Delete',
    handler: function () {
      var selectedRecords = this.up('grid').getSelectionModel().getSelection();
      if (selectedRecords.length === 0) {
        Ext.Msg.alert('Error', 'Please select a transaction to delete.');
        return;
      }

      if (selectedRecords.length > 0) {
        Ext.Msg.confirm('Delete Transaction', 'Are you sure you want to delete the selected transaction?', function (btn) {
          if (btn === 'yes') {
            var transactionIds = selectedRecords.map(record => record.get('TransactionId'));

            var grid = this.up('grid');

            var url = 'https://localhost:44302/Transactions/' + transactionIds.join(',');

            fetch(url, {
                method: 'DELETE'
              })
              .then(function (response) {
                if (response.ok) {
                  return response.json();
                } else {
                  throw new Error('Failed to delete the transaction.');
                }
              })
              .then(function (apiResponse) {
                if (apiResponse.success) {
                  Ext.Msg.alert('Error', 'Failed to delete the transaction.');
                  
                  
                } else {
                  Ext.Msg.alert('Success', 'Transaction deleted successfully!');
                  grid.getStore().load(); // Reload the grid store to reflect the changes
                }
              })
              .catch(function (error) {
                Ext.Msg.alert('Success', 'Transaction deleted successfully!');
                grid.getStore().load();
              });
          }
        }, this);
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
