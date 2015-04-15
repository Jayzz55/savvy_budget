// Budget Model
// ----------

var Budget = Backbone.Model.extend({
  // Default attributes for the category item.
  defaults: function() {
    return {
      id: $('.budget-view').attr('data-id'),
      title: "My budget",
      budget: 0.00
    };
  },

  url: '/api/budgets/'+$('.budget-view').attr('data-id')

});


// Category Model
// ----------

// Our basic **Category** model has `title`, `order` attributes.
var Category = Backbone.Model.extend({
  // Default attributes for the category item.
  defaults: function() {
    return {
      title: "empty category...",
      order: Categories.nextOrder(),
      sub_total: 0.00,
      budget_id: 1
    };
  },
  urlRoot: '/api/categories'
});

// Category Collection
// ---------------

var CategoryList = Backbone.Collection.extend({
  // Reference to this collection's model.
  model: Category,
  url: '/api/categories',

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
  template: _.template($('#category-item-template').html()),

  // The DOM events specific to an item.
  events: {
    "dblclick .view"  : "edit",
    "doubleTap .view"  : "edit",
    "click a.destroy" : "clear",
    "keypress .edit"  : "updateOnEnter",
    "blur .edit"      : "close",
    "click .category-toggle" : "toggle"
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
    this.input = this.$('.edit');
    return this;
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
  },

  // Toggle the category item
  toggle: function(){
    if (this.$el.find("span").hasClass("collapse")){
      this.expand();
    }else{
      this.collapse();
    }
  },

  // Expand the category item to show list of expenses and expense input box
  expand: function(){
    this.$el.find("span").removeClass("collapse");
    this.$el.find("span").addClass("expand");
    this.$el.find(".category-toggle").html("-");
    this.$el.find("#new-expense").addClass("open");
    // this.$el.append("<li>1231312</li>");
  },

  // Collapse the list of expenses and expense input box
  collapse: function(){
    this.$el.find("span").removeClass("expand");
    this.$el.find("span").addClass("collapse");
    this.$el.find(".category-toggle").html("+");
    this.$el.find("#new-expense").removeClass("open");
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
    "dblclick .budget-view"  : "edit",
    "doubleTap .budget-view"  : "edit",
    "keypress .budget-edit"  : "updateOnEnter",
    "blur .budget-edit"      : "close"
  },

  // At initialization we bind to the relevant events on the `Categories`
  // collection, when items are added or changed. Kick things off by
  // loading any preexisting categories that might be saved in *localStorage*.
  initialize: function() {

    this.budgetView = this.$el.find('.budget-view');
    this.budgetLabel = this.$el.find('.budget-label');
    this.budgetInput = this.$el.find('.budget-edit');
    this.input = this.$("#new-category");

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
    var totalCategories = Categories.length;

    if (Categories.length) {
      this.main.show();
      this.footer.show();
      this.footer.html(this.statsTemplate({totalCategories: totalCategories}));
    } else {
      this.main.hide();
      this.footer.hide();
    }

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

  // Switch this view into `"editing"` mode, displaying the input field.
  edit: function() {
    this.budgetView.addClass("editing");
    this.budgetInput.focus();
  },

  // Close the `"editing"` mode, saving changes to the category.
  close: function() {
    var value = this.budgetInput.val();
    console.log (this.model);
    // Instantiate budget model
    budget = new Budget();
    budget.save({budget: value});
    this.budgetView.removeClass("editing");
    this.budgetLabel.html(budget.get("budget"));

  },

  // If you hit `enter`, we're through editing the item.
  updateOnEnter: function(e) {
    if (e.keyCode == 13) this.close();
  },

});

// Finally, we kick things off by creating the **App**.
var App = new AppView;


