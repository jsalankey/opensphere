goog.module('os.interaction.Modify');
goog.module.declareLegacyNamespace();

const I3DSupport = goog.require('os.I3DSupport');
const KeyCodes = goog.require('goog.events.KeyCodes');
const KeyHandler = goog.require('goog.events.KeyHandler');
const OLModify = goog.require('ol.interaction.Modify');
const PayloadEvent = goog.require('os.events.PayloadEvent');
const osImplements = goog.require('os.implements');
const {MODAL_SELECTOR} = goog.require('os.ui');
const {ModifyEventType} = goog.require('os.interaction');
const {notifyStyleChange} = goog.require('os.style');

const KeyEvent = goog.requireType('goog.events.KeyEvent');


/**
 * Allows the user to modify geometries on the map directly.
 *
 * @implements {I3DSupport}
 */
class Modify extends OLModify {
  /**
   * Constructor.
   * @param {olx.interaction.ModifyOptions=} opt_options Options.
   */
  constructor(opt_options) {
    opt_options = opt_options || {};
    super(opt_options);

    /**
     * @type {KeyHandler}
     * @protected
     */
    this.keyHandler = new KeyHandler(document, true);

    this.keyHandler.listen(KeyHandler.EventType.KEY, this.handleKeyEvent, true, this);
  }

  /**
   * @inheritDoc
   */
  disposeInternal() {
    goog.dispose(this.keyHandler);
  }

  /**
   * @inheritDoc
   */
  is3DSupported() {
    return true;
  }

  /**
   * Handles keydown events for stopping the interaction.
   * @param {KeyEvent} event The key event.
   * @protected
   *
   * @suppress {accessControls}
   */
  handleKeyEvent(event) {
    if (!document.querySelector(MODAL_SELECTOR)) {
      switch (event.keyCode) {
        case KeyCodes.ESC:
          this.dispatchEvent(new PayloadEvent(ModifyEventType.CANCEL, this.features_));
          this.setActive(false);
          break;
        case KeyCodes.ENTER:
          this.dispatchEvent(new PayloadEvent(ModifyEventType.COMPLETE, this.features_));
          this.setActive(false);
          break;
        default:
          break;
      }

      notifyStyleChange(this.overlay_, [this.features_.getArray()[0]]);
    }
  }

  /**
   * @inheritDoc
   *
   * @suppress {accessControls}
   */
  createOrUpdateVertexFeature_(coordinates) {
    const feature = super.createOrUpdateVertexFeature_(coordinates);
    notifyStyleChange(this.overlay_, [feature]);
    return feature;
  }
}

osImplements(Modify, I3DSupport.ID);

exports = Modify;