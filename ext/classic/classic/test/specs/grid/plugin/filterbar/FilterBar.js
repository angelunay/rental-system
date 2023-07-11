topSuite("Ext.grid.plugin.filterbar.FilterBar", [
    'Ext.data.ArrayStore', 'Ext.grid.Panel',
    'Ext.grid.column.Date', 'Ext.grid.column.Number'
], function() {
    function isBlank(s) {
        return !s || s === '\xA0' || s === '&nbsp;';
    }

    function expectBlank(s) {
        if (!isBlank(s)) {
            expect(s).toBe('');
        }
    }

    var store, grid,
        gridEvents = {},
        colMap, plugin,
        Sale = Ext.define(null, {
            extend: 'Ext.data.Model',

            fields: [
                { name: 'id', type: 'int' },
                { name: 'company', type: 'string' },
                { name: 'person', type: 'string', summary: 'count' },
                { name: 'date', type: 'date', defaultValue: new Date(2012, 0, 1) },
                { name: 'value', type: 'float', defaultValue: null, summary: 'sum' },
                {
                    name: 'year',
                    convert: function(v, record) {
                        var d = record.get('date');

                        return d ? d.getFullYear() : null;
                    }
                }, {
                    name: 'month',
                    convert: function(v, record) {
                        var d = record.get('date');

                        return d ? d.getMonth() : null;
                    }
                }]
        });

    function getEventHandler(type) {
        return function() {
            gridEvents = {};
            gridEvents[type] = true;
        };
    }

    function makeGrid(gridConfig, storeConfig, storeData) {
        store = new Ext.data.Store(Ext.merge({
            model: Sale,
            proxy: {
                type: 'memory',
                limitParam: null,
                data: storeData || [
                    { company: 'Microsoft', person: 'John', date: new Date(), value: 1 },
                    { company: 'Adobe', person: 'John', date: new Date(), value: 2 },
                    { company: 'Microsoft', person: 'Helen', date: new Date(), value: 3 }
                ],
                reader: {
                    type: 'json'
                }
            },
            autoLoad: true
        }, storeConfig));

        // Reset flag that is set when the pivot grid has processed the data and rendered
        gridEvents = {};

        grid = new Ext.grid.Panel(Ext.merge({
            title: 'Test tree grouping',
            collapsible: true,
            multiSelect: true,
            height: 400,
            width: 750,

            viewConfig: {
                listeners: {
                    refresh: getEventHandler('done')
                }
            },

            store: store,

            plugins: {
                gridfilterbar: true
            },

            columns: [
                { text: 'Company', dataIndex: 'company', itemId: 'c1', filterType: { type: 'string' } },
                { text: 'Person', dataIndex: 'person', itemId: 'c2', filterType: { type: 'string' } },
                { text: 'Date', dataIndex: 'date', xtype: 'datecolumn', itemId: 'c3', filterType: { type: 'date' } },
                { text: 'Value', dataIndex: 'value', xtype: 'numbercolumn', itemId: 'c4', filterType: { type: 'number' } },
                { text: 'Year', dataIndex: 'year', itemId: 'c5' }
            ],

            renderTo: document.body
        }, gridConfig));

        setColMap();
        plugin = grid.getPlugin('gridfilterbar');
    }

    function setColMap() {
        colMap = {};

        grid.query('column').forEach(function(col) {
            colMap[col.getItemId()] = col;
        });
    }

    function destroyGrid() {
        Ext.destroy(grid, store);
        store = grid = colMap = plugin = null;
        gridEvents = {};
    }

    afterEach(destroyGrid);

    describe('filterbar', function() {
        describe('filters', function() {
            it('should add a filter on a column', function() {
                makeGrid({
                    columns: [
                        {
                            text: 'Company',
                            dataIndex: 'company',
                            itemId: 'c1',
                            filterType: { type: 'string', value: 'Adobe' }
                        },
                        { text: 'Person', dataIndex: 'person', itemId: 'c2' },
                        { text: 'Date', dataIndex: 'date', xtype: 'datecolumn', itemId: 'c3' },
                        { text: 'Value', dataIndex: 'value', xtype: 'numbercolumn', itemId: 'c4' },
                        { text: 'Year', dataIndex: 'year', itemId: 'c5' }
                    ]
                });

                waitsFor(function() {
                    return gridEvents && gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    expect(store.getFilters().length).toBe(1);
                    expect(store.getCount()).toBe(1);
                });

            });

            it('should recognize if the store is filtered', function() {
                makeGrid(null, {
                    filters: {
                        property: 'company',
                        value: 'Adobe',
                        operator: '='
                    }
                });

                waitsFor(function() {
                    return gridEvents && gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    expect(plugin.getBar().down('textfield').getValue()).toBe('Adobe');
                    expect(store.getFilters().length).toBe(1);
                    expect(store.getCount()).toBe(1);
                });

            });

            it('should react when a filter is typed in', function() {
                makeGrid();

                waitsFor(function() {
                    return gridEvents && gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    gridEvents = null;
                    plugin.getBar().down('textfield').setValue('Adobe');
                });

                waitsFor(function() {
                    return gridEvents && gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    expect(store.getFilters().length).toBe(1);
                    expect(store.getCount()).toBe(1);
                });
            });

            describe('remote filters', function() {
                var remoteStoreConfig = {
                        remoteFilter: true,
                        proxy: {
                            type: 'ajax',
                            url: 'fake',
                            reader: {
                                type: 'json',
                                rootProperty: 'data'
                            }
                        }
                    },
                    filterParams;

                beforeEach(function() {
                    spyOn(Ext.Ajax, 'request').andCallFake(function(cb, scope) {
                        filterParams = cb;
                    });
                });

                it('should load the store without filter params', function() {
                    makeGrid({}, remoteStoreConfig);

                    waitsFor(function() {
                        return gridEvents && gridEvents.done;
                    }, 'grid to be ready');

                    waitsFor(function() {
                        return filterParams.params !== undefined;
                    });

                    runs(function() {
                        expect(filterParams.params.page).toBe(1);
                    });
                });

                it('should load the store with default filter params', function() {
                    makeGrid({ columns: [
                        { text: 'Company', dataIndex: 'company', itemId: 'c1', filterType: { type: 'string', value: 'abc', operator: '==' } }]
                    }, remoteStoreConfig);

                    waitsFor(function() {
                        return gridEvents && gridEvents.done;
                    }, 'grid to be ready');

                    waitsFor(function() {
                        return filterParams.params.filter !== undefined;
                    });

                    runs(function() {
                        expect(filterParams.params.page).toBe(1);
                        expect(JSON.parse(filterParams.params.filter)[0].operator).toBe('==');
                    });
                });

                it('should load the store when filter value is changed', function() {
                    makeGrid({}, remoteStoreConfig);

                    waitsFor(function() {
                        return gridEvents && gridEvents.done;
                    }, 'grid to be ready');

                    plugin.getBar().down('textfield').setValue('xyz');

                    waitsFor(function() {
                        return filterParams.params.filter !== undefined;
                    });

                    runs(function() {
                        expect(filterParams.params.page).toBe(1);
                        expect(JSON.parse(filterParams.params.filter)[0].value).toBe('xyz');
                    });
                });

                it('should load the store when filter operator is changed', function() {
                    makeGrid({}, remoteStoreConfig);

                    waitsFor(function() {
                        return gridEvents && gridEvents.done;
                    }, 'grid to be ready');

                    plugin.getBar().down('textfield').setOperator('==');
                    plugin.getBar().down('textfield').setValue('xyz');

                    waitsFor(function() {
                        return filterParams.params.filter !== undefined;
                    });

                    runs(function() {
                        expect(filterParams.params.page).toBe(1);
                        expect(JSON.parse(filterParams.params.filter)[0].operator).toBe('==');
                    });
                });
            });
        });

        describe('show/hide', function() {
            it('should show the filterbar', function() {
                makeGrid();

                waitsFor(function() {
                    return gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    grid.hideFilterBar();
                    expect(plugin.getBar().isVisible()).toBe(false);
                    grid.showFilterBar();
                    expect(plugin.getBar().isVisible()).toBe(true);
                });
            });

            it('should hide the filterbar', function() {
                makeGrid();

                waitsFor(function() {
                    return gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    expect(plugin.getBar().isVisible()).toBe(true);
                    grid.hideFilterBar();
                    expect(plugin.getBar().isVisible()).toBe(false);
                });
            });
        });

        describe("column cls decoration", function() {
            var filterCls = Ext.grid.plugin.BaseFilterBar.prototype.filterCls,
                col;

            describe("works for both non-nested and nested columns", function() {
                it("should add the cls for columns when a filter is preset", function() {
                    makeGrid(null, {
                        filters: {
                            property: 'company',
                            value: 'Adobe',
                            operator: '='
                        }
                    });

                    col = grid.columnManager.getHeaderByDataIndex('company');

                    waitsFor(function() {
                        return gridEvents && gridEvents.done;
                    }, 'grid to be ready');

                    runs(function() {
                        expect(col.el).toHaveCls(filterCls);
                    });
                });

                it("should add the cls for columns when setting a value", function() {
                    makeGrid();

                    col = grid.columnManager.getHeaderByDataIndex('company');

                    waitsFor(function() {
                        return gridEvents && gridEvents.done;
                    }, 'grid to be ready');

                    runs(function() {
                        gridEvents = null;
                        plugin.getBar().down('textfield').setValue('Adobe');
                    });

                    waitsFor(function() {
                        return gridEvents && gridEvents.done;
                    }, 'grid to be ready');

                    runs(function() {
                        expect(col.el).toHaveCls(filterCls);
                    });
                });

                it("should remove the cls for columns when clearing a value", function() {
                    makeGrid();

                    col = grid.columnManager.getHeaderByDataIndex('company');

                    waitsFor(function() {
                        return gridEvents && gridEvents.done;
                    }, 'grid to be ready');

                    runs(function() {
                        gridEvents = null;
                        plugin.getBar().down('textfield').setValue('Adobe');
                    });

                    waitsFor(function() {
                        return gridEvents && gridEvents.done;
                    }, 'grid to be ready');

                    runs(function() {
                        expect(col.el).toHaveCls(filterCls);
                    });

                    runs(function() {
                        gridEvents = null;
                        plugin.getBar().down('textfield').setValue('');
                    });

                    waitsFor(function() {
                        return gridEvents && gridEvents.done;
                    }, 'grid to be ready');

                    runs(function() {
                        expect(col.el).not.toHaveCls(filterCls);
                    });
                });

            });
        });

        describe('Filterbar field width on browser zoom', function() {
            it('should have same width as column on browser zoom', function() {
                makeGrid({
                    collapseFirst: false,
                    frame: true,
                    columnLines: true
                });

                waitsFor(function() {
                    return gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    var columnWidth, filterFieldWidth, zoomLevel;

                    for (zoomLevel = 100; zoomLevel <= 200; zoomLevel += 25) {
                        document.body.style.zoom = zoomLevel + "%";

                        columnWidth = grid.columnManager.getFirst().getEl().dom.offsetWidth;
                        filterFieldWidth = plugin.getBar().down('textfield').getEl().dom.offsetWidth;

                        expect(columnWidth).toBe(filterFieldWidth);
                    }

                    document.body.style.zoom = "100%";
                });
            });
        });

        describe('Filterbar realignment on column move', function() {
            it('should realign filters when a column is moved', function() {
                makeGrid({
                    collapseFirst: false,
                    frame: true,
                    columnLines: true,
                    columns: [
                        { text: 'Company', dataIndex: 'company', itemId: 'c1', filterType: { type: 'string' } },
                        { text: 'Person', dataIndex: 'person', itemId: 'c2', filterType: { type: 'string' } },
                        { text: 'Date', dataIndex: 'date', xtype: 'datecolumn', itemId: 'c3', filterType: { type: 'date' } },
                        { text: 'Value', dataIndex: 'value', xtype: 'numbercolumn', itemId: 'c4', filterType: { type: 'number' } },
                        {
                            text: 'Period',
                            columns: [
                                { text: 'Year', dataIndex: 'year', itemId: 'c5', filterType: { type: 'string' } },
                                { text: 'Date', dataIndex: 'date', xtype: 'datecolumn', itemId: 'c3', filterType: { type: 'date' } }
                            ]
                        }
                    ]
                });

                waitsFor(function() {
                    return gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    grid.columnManager.getHeaderByDataIndex('company').getFilterType().setValue('Microsoft');
                    grid.columnManager.getHeaderByDataIndex('person').getFilterType().setValue('John');
                    grid.columnManager.getHeaderByDataIndex('value').getFilterType().setValue(2);
                    grid.columnManager.getHeaderByDataIndex('year').getFilterType().setValue('2022');

                    grid.headerCt.insert(0, grid.headerCt.items.getAt(3));

                    expect(grid.columnManager.columns[0].dataIndex).toBe('value');
                    expect(grid.columnManager.columns[0].getFilterType().value).toBe(2);
                    expect(grid.columnManager.columns[1].dataIndex).toBe('company');
                    expect(grid.columnManager.columns[1].getFilterType().value).toBe('Microsoft');

                });
            });

            it('should realign filters when grouped column is moved', function() {
                makeGrid({
                    collapseFirst: false,
                    frame: true,
                    columnLines: true,
                    columns: [
                        { text: 'Company', dataIndex: 'company', itemId: 'c1', filterType: { type: 'string' } },
                        { text: 'Person', dataIndex: 'person', itemId: 'c2', filterType: { type: 'string' } },
                        { text: 'Date', dataIndex: 'date', xtype: 'datecolumn', itemId: 'c3', filterType: { type: 'date' } },
                        { text: 'Value', dataIndex: 'value', xtype: 'numbercolumn', itemId: 'c4', filterType: { type: 'number' } },
                        {
                            text: 'Period',
                            columns: [
                                { text: 'Year', dataIndex: 'year', itemId: 'c5', filterType: { type: 'string' } },
                                { text: 'Date', dataIndex: 'date', xtype: 'datecolumn', itemId: 'c3', filterType: { type: 'date' } }
                            ]
                        }
                    ]
                });

                waitsFor(function() {
                    return gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    grid.columnManager.getHeaderByDataIndex('company').getFilterType().setValue('Microsoft');
                    grid.columnManager.getHeaderByDataIndex('person').getFilterType().setValue('John');
                    grid.columnManager.getHeaderByDataIndex('value').getFilterType().setValue(2);
                    grid.columnManager.getHeaderByDataIndex('year').getFilterType().setValue('2022');

                    grid.headerCt.insert(0, grid.headerCt.items.getAt(4));

                    expect(grid.columnManager.columns[0].dataIndex).toBe('year');
                    expect(grid.columnManager.columns[0].getFilterType().value).toBe('2022');
                    expect(grid.columnManager.columns[1].dataIndex).toBe('date');
                    expect(grid.columnManager.columns[1].getFilterType().value).toBe(undefined);
                });
            });
        });

        describe('show/hide filter on toggling visibility of column', function() {
            it('should show/hide filter when a column is shown/hidden', function() {
                makeGrid({
                    collapseFirst: false,
                    frame: true,
                    columnLines: true,
                    columns: [
                        { text: 'Company', dataIndex: 'company', itemId: 'c1', filterType: { type: 'string' } },
                        { text: 'Person', dataIndex: 'person', itemId: 'c2', filterType: { type: 'string' } },
                        { text: 'Date', dataIndex: 'date', xtype: 'datecolumn', itemId: 'c3', filterType: { type: 'date' } },
                        { text: 'Value', dataIndex: 'value', xtype: 'numbercolumn', itemId: 'c4', filterType: { type: 'number' } },
                        {
                            text: 'Period',
                            columns: [
                                { text: 'Year', dataIndex: 'year', itemId: 'c5', filterType: { type: 'string' } },
                                { text: 'Date', dataIndex: 'date', xtype: 'datecolumn', itemId: 'c3', filterType: { type: 'date' } }
                            ]
                        }
                    ]
                });

                waitsFor(function() {
                    return gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    expect(plugin.getBar().items.getAt(0).hidden).toBe(false);

                    grid.columnManager.getHeaderByDataIndex('company').hide();
                    expect(plugin.getBar().items.getAt(0).hidden).toBe(true);

                    grid.columnManager.getHeaderByDataIndex('company').show();
                    expect(plugin.getBar().items.getAt(0).hidden).toBe(false);
                });
            });

            it('should show/hide filter when a grouped column is shown/hidden', function() {
                makeGrid({
                    collapseFirst: false,
                    frame: true,
                    columnLines: true,
                    columns: [
                        { text: 'Company', dataIndex: 'company', itemId: 'c1', filterType: { type: 'string' } },
                        { text: 'Person', dataIndex: 'person', itemId: 'c2', filterType: { type: 'string' } },
                        { text: 'Date', dataIndex: 'date', xtype: 'datecolumn', itemId: 'c3', filterType: { type: 'date' } },
                        { text: 'Value', dataIndex: 'value', xtype: 'numbercolumn', itemId: 'c4', filterType: { type: 'number' } },
                        {
                            text: 'Period',
                            columns: [
                                { text: 'Year', dataIndex: 'year', itemId: 'c5', filterType: { type: 'string' } },
                                { text: 'Date', dataIndex: 'date', xtype: 'datecolumn', itemId: 'c3', filterType: { type: 'date' } }
                            ]
                        }
                    ]
                });

                waitsFor(function() {
                    return gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    expect(plugin.getBar().items.getAt(4).hidden).toBe(false);
                    expect(plugin.getBar().items.getAt(5).hidden).toBe(false);

                    grid.columnManager.getHeaderByDataIndex('year').up('gridcolumn').hide();
                    expect(plugin.getBar().items.getAt(4).hidden).toBe(true);
                    expect(plugin.getBar().items.getAt(5).hidden).toBe(true);

                    grid.columnManager.getHeaderByDataIndex('year').up('gridcolumn').show();
                    expect(plugin.getBar().items.getAt(4).hidden).toBe(false);
                    expect(plugin.getBar().items.getAt(5).hidden).toBe(false);
                });
            });
        });
    });

});
