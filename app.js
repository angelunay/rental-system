/*
 * This file launches the application by asking Ext JS to create
 * and launch() the Application class.
 */
Ext.application({
    extend: 'MovieRentalApp.Application',

    name: 'MovieRentalApp',

    requires: [
        // This will automatically load all classes in the MovieRentalApp namespace
        // so that application classes do not need to require each other.
        'MovieRentalApp.*'
    ],

    // The name of the initial view to create.
    mainView: 'MovieRentalApp.view.main.Main'
});
