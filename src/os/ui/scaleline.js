goog.module('os.ui.ScaleLine');
goog.module.declareLegacyNamespace();

goog.require('os.ui.Module');
goog.require('os.ui.menu.MenuButtonCtrl');


/**
 * Controller for the scale line directive.
 */
class Controller extends os.ui.menu.MenuButtonCtrl {
  /**
   * Constructor.
   * @param {!angular.Scope} $scope The Angular scope.
   * @param {!angular.JQLite} $element The root DOM element.
   * @ngInject
   */
  constructor($scope, $element) {
    super($scope, $element);

    this.menu = os.ui.menu.UNIT;
    this.btnPosition = 'right top';
    this.menuPosition = 'right bottom-4';
  }
}

/**
 * The scale line directive.
 * @return {angular.Directive}
 */
const directive = function() {
  return {
    restrict: 'E',
    replace: true,
    scope: true,
    template: '<li class="pointer" id="scale-line" ng-click="ctrl.openMenu()" ng-right-click="ctrl.openMenu()">' +
        '<div class="unit-group"></div></li>',
    controller: Controller,
    controllerAs: 'ctrl'
  };
};

/**
 * Add the directive to the module.
 */
os.ui.Module.directive('scaleLine', [directive]);

exports = {Controller, directive};
