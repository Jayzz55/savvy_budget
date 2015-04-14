// An example Backbone application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses a simple
// [LocalStorage adapter](backbone.localstorage.html)
// to persist Backbone models within your browser.

// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){


  // Category Model
  // ----------

  // Our basic **Category** model has `title`, `order`, and `done` attributes.
  var Category = Backbone.Model.extend({

    // Default attributes for the category item.
    defaults: function() {
      return {
        title: "empty category...",
        order: Categories.nextOrder(),
        done: false
      };
    },

    urlRoot: '/api/categories',

    // Toggle the `done` state of this category item.
    toggle: function() {
      this.save({done: !this.get("done")});
    }

  });

  // Category Collection
  // ---------------

  // The collection of categories is backed by *localStorage* instead of a remote
  // server.
  var CategoryList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: Category,

    url: '/api/categories',

    // Save all of the category items under the `"categories-backbone"` namespace.
    // localStorage: new Backbone.LocalStorage("todos-backbone"),

    // Filter down the list of all category items that are finished.
    done: function() {
      return this.where({done: true});
    },

    // Filter down the list to only category items that are still not finished.
    remaining: function() {
      return this.where({done: false});
    },

    // We keep the Categories in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    // Categories are sorted by their original insertion order.
    comparator: 'order'

  });

  // Create our global collection of **Categories**.
  var Categories = new CategoryList;

  // Category Item View
  // --------------

  // The DOM element for a category item...
  var CategoryView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#item-template').html()),

    // The DOM events specific to an item.
    events: {
      "click .toggle"   : "toggleDone",
      "dblclick .view"  : "edit",
      "click a.destroy" : "clear",
      "keypress .edit"  : "updateOnEnter",
      "blur .edit"      : "close"
    },

    // The CategoryView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Category** and a **CategoryView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    // Re-render the titles of the category item.
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass('done', this.model.get('done'));
      this.input = this.$('.edit');
      return this;
    },

    // Toggle the `"done"` state of the model.
    toggleDone: function() {
      this.model.toggle();
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      this.$el.addClass("editing");
      this.input.focus();
    },

    // Close the `"editing"` mode, saving changes to the category.
    close: function() {
      var value = this.input.val();
      if (!value) {
        this.clear();
      } else {
        console.log (value);
        this.model.save({title: value});
        this.$el.removeClass("editing");
      }
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.destroy();
    }

  });

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#categoryapp"),

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template($('#stats-template').html()),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #new-category":  "createOnEnter",
      "click #clear-completed": "clearCompleted",
      "click #toggle-all": "toggleAllComplete"
    },

    // At initialization we bind to the relevant events on the `Categories`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting categories that might be saved in *localStorage*.
    initialize: function() {

      this.input = this.$("#new-category");
      this.allCheckbox = this.$("#toggle-all")[0];

      this.listenTo(Categories, 'add', this.addOne);
      this.listenTo(Categories, 'reset', this.addAll);
      this.listenTo(Categories, 'all', this.render);

      this.footer = this.$('footer');
      this.main = $('#main');

      Categories.fetch();
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
      var done = Categories.done().length;
      var remaining = Categories.remaining().length;

      if (Categories.length) {
        this.main.show();
        this.footer.show();
        this.footer.html(this.statsTemplate({done: done, remaining: remaining}));
      } else {
        this.main.hide();
        this.footer.hide();
      }

      this.allCheckbox.checked = !remaining;
    },

    // Add a single category item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(category) {
      var view = new CategoryView({model: category});
      this.$("#category-list").append(view.render().el);
    },

    // Add all items in the **Categories** collection at once.
    addAll: function() {
      Categories.each(this.addOne, this);
    },

    // If you hit return in the main input field, create new **Category** model,
    // persisting it to *localStorage*.
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;

      Categories.create({title: this.input.val()});
      this.input.val('');
    },

    // Clear all done category items, destroying their models.
    clearCompleted: function() {
      _.invoke(Categories.done(), 'destroy');
      return false;
    },

    toggleAllComplete: function () {
      var done = this.allCheckbox.checked;
      Categories.each(function (category) { category.save({'done': true}); });
    }

  });

  // Finally, we kick things off by creating the **App**.
  var App = new AppView;

});
