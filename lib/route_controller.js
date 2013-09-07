/**
 * Main class for handling data and rendering logic for a route.
 *
* @constructor RouteController
 * @exports RouteController
 * @param {RouteContext} context
 * @param {Object} [options]
 * @param {String|Function} [options.template]
 * @param {String|Function} [options.loadingTemplate]
 * @param {String|Function} [options.notFoundTemplate]
 * @param {Object|Function} [options.data]
 */

RouteController = function (context, options) {
  var routerOptions
    , routeOptions
    , self = this;

  RouterUtils.assert(context, 'RouteController requires a RouteContext');

  options = this.options = options || {};

  //XXX this is insane
  //clean all of this up.
  routerOptions = (context.router && context.router.options) || {};
  routeOptions = (context.route && context.route.options) || {};

  this.params = context.params || [];
  this.route = context.route;
  this.router = context.router;
  this.context = context;

  var getOption = function(name) {
    return options[name]
      || routeOptions[name]
      || routerOptions[name] 
      || self[name];
  };

  this['onBeforeRun'] = getOption('onBeforeRun');
  this['onAfterRun'] = getOption('onAfterRun');
  this['onBeforeRerun'] = getOption('onBeforeRerun');
  this['onAfterRerun'] = getOption('onAfterRerun');

  this.stopped = false;
  this.isFirstRun = true;

  this.before = []
    .concat(RouterUtils.toArray(routerOptions.before))
    .concat(RouterUtils.toArray(routeOptions.before))
    .concat(RouterUtils.toArray(options.before))
    .concat(RouterUtils.toArray(this.before));

  this.after = []
    .concat(RouterUtils.toArray(routerOptions.after))
    .concat(RouterUtils.toArray(routeOptions.after))
    .concat(RouterUtils.toArray(options.after))
    .concat(RouterUtils.toArray(this.after));

  this.initialize(context, options);
};

RouteController.prototype = {
  typeName: 'RouteController',

  constructor: RouteController,

  initialize: function (context, options) {
    throw new Error('not implemented');
  },

  before: [],

  /**
   * After hooks to run after the controller action is called. The Router will
   * typically call the runHooks method to call this function. This property is
   * defined for inheritance. Each instance gets its own copy of after hooks at
   * constructor time. This means that after hooks added to the prototype after
   * constructor time will not be used in the instance.
   */

  after: [],

  /**
   * Run the hooks for the given name (e.g. before/after)
   *
   * @param {String} name The name of the hooks to run (e.g. before/after)
   * @api public
   */

  runHooks: function (name) {
    var self = this
      , hooks = self[name];

    if (!hooks) return;

    for (var i = 0; i < hooks.length; i++) {
      if (this.stopped) break;
      hooks[i].call(this);
    }
  },


  /**
   * The default action for the controller. Called by the Router. Calls the main
   * render method and then the render method for each template specified in
   * renderTemplates.
   *
   * @api public
   */

  run: function () {
    throw new Error('not implemented');
  },

  /**
   * Stop running this controller and redirect to a new path. Same parameters as
   * those of Router.go.
   *
   * @api public
   */

  redirect: function (/* args */) {
    this.stop();
    return this.router.go.apply(this.router, arguments);
  },
  
  /**
   * Set the stopped property on the controller to true. This would typically be
   * used in a before filter or hook. If the controller is marked as stopped, it
   * tells the router not to call the controller's action or afterRun callbacks
   * and hooks. This property is not used internally by the controller.
   *
   * @api public
   */
  stop: function() {
    this.stopped = true;
  },

  /**
   * Hook called on the before the first run - either the run method being
   * called or another action being called. This method is called from the
   * router. It should only be called once. Not on reactive reruns.
   *
   * @api public
   */

  //XXX very confusing to people. clean this up too.
  onBeforeRun: function () {
  },

  /**
   * Hook called after the first run - either the run method being
   * called or another action being called. This method is called from the
   * router. It should only be called once. Not on reactive reruns.
   *
   * @api public
   */

  onAfterRun: function () {
  },

  /**
   * Hook called before a reactive rerun. Called by the router.
   *
   * @api public
   */

  onBeforeRerun: function () {
  },

  /**
   * Hook called after a reactive rerun. Called by the router.
   *
   * @api public
   */

  onAfterRerun: function () {
  }
};

_.extend(RouteController, {
  /**
   * Inherit from RouteController
   *
   * @param {Object} definition Prototype properties for inherited class.
   */

  extend: function (definition) {
    return RouterUtils.extend(this, definition);
  }
});