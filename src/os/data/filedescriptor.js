goog.provide('os.data.FileDescriptor');

goog.require('os.command.LayerAdd');
goog.require('os.command.LayerRemove');
goog.require('os.config.Settings');
goog.require('os.data.IMappingDescriptor');
goog.require('os.data.IReimport');
goog.require('os.data.IUrlDescriptor');
goog.require('os.data.LayerSyncDescriptor');
goog.require('os.ex.IExportMethod');
goog.require('os.file');
goog.require('os.file.File');
goog.require('os.file.FileStorage');
goog.require('os.im.ImportProcess');
goog.require('os.implements');
goog.require('os.parse.FileParserConfig');
goog.require('os.source');
goog.require('os.source.PropertyChange');
goog.require('os.source.Request');
goog.require('os.source.Vector');
goog.require('os.ui.file.ui.defaultFileNodeUIDirective');
goog.require('os.ui.im.ImportEvent');
goog.require('os.ui.im.ImportEventType');



/**
 * An abstract {@link os.data.IDataDescriptor} implementation that is intended to be used by the various filetype
 * providers (KML, CSV, etc.).
 *
 * @extends {os.data.LayerSyncDescriptor}
 * @implements {os.data.IUrlDescriptor}
 * @implements {os.data.IReimport}
 * @implements {os.data.IMappingDescriptor}
 *
 * @constructor
 */
os.data.FileDescriptor = function() {
  os.data.FileDescriptor.base(this, 'constructor');

  /**
   * @type {?string}
   * @private
   */
  this.originalUrl_ = null;

  /**
   * @type {?string}
   * @private
   */
  this.url_ = null;

  /**
   * @type {os.parse.FileParserConfig}
   * @protected
   */
  this.parserConfig = new os.parse.FileParserConfig();

  /**
   * @type {?osx.icon.Icon}
   * @private
   */
  this.icon_ = null;

  /**
   * @type {?string}
   * @private
   */
  this.shapeName_ = null;

  /**
   * @type {?Date}
   * @private
   */
  this.date_ = null;

  this.log = os.data.FileDescriptor.LOGGER_;
  this.descriptorType = 'file';
};
goog.inherits(os.data.FileDescriptor, os.data.LayerSyncDescriptor);
os.implements(os.data.FileDescriptor, 'os.data.IReimport');
os.implements(os.data.FileDescriptor, os.data.IUrlDescriptor.ID);
os.implements(os.data.FileDescriptor, os.data.IMappingDescriptor.ID);


/**
 * @type {goog.log.Logger}
 * @private
 * @const
 */
os.data.FileDescriptor.LOGGER_ = goog.log.getLogger('os.data.FileDescriptor');


/**
 * @inheritDoc
 */
os.data.FileDescriptor.prototype.getSearchType = function() {
  return 'Layer';
};


/**
 * @inheritDoc
 */
os.data.FileDescriptor.prototype.getIcons = function() {
  return os.ui.Icons.FEATURES;
};


/**
 * @return {?osx.icon.Icon}
 */
os.data.FileDescriptor.prototype.getIcon = function() {
  return this.icon_;
};


/**
 * @return {?string}
 */
os.data.FileDescriptor.prototype.getShapeName = function() {
  return this.shapeName_;
};


/**
 * Get the Date for this descriptor.
 *
 * @return {?Date}
 */
os.data.FileDescriptor.prototype.getDate = function() {
  return this.date_;
};


/**
 * Set the Date for this descriptor.
 *
 * @param {?Date} value
 */
os.data.FileDescriptor.prototype.setDate = function(value) {
  this.date_ = value;
};


/**
 * @inheritDoc
 */
os.data.FileDescriptor.prototype.getNodeUI = function() {
  return '<defaultfilenodeui></defaultfilenodeui>';
};


/**
 * @inheritDoc
 */
os.data.FileDescriptor.prototype.getLayerOptions = function() {
  var options = {};
  options['id'] = this.getId();

  options['animate'] = true; // TODO: add checkbox to toggle this in import UI
  options['color'] = this.getColor();
  options['icon'] = this.getIcon();
  options['shapeName'] = this.getShapeName();
  options['load'] = true;
  options['originalUrl'] = this.getOriginalUrl();
  options['parserConfig'] = this.parserConfig;
  options['provider'] = this.getProvider();
  options['tags'] = this.getTags();
  options['title'] = this.getTitle();
  options['url'] = this.getUrl();
  options['mappings'] = this.getMappings();
  options['detectColumnTypes'] = true;

  return options;
};


/**
 * @inheritDoc
 */
os.data.FileDescriptor.prototype.getMappings = function() {
  return this.parserConfig['mappings'];
};


/**
 * @inheritDoc
 */
os.data.FileDescriptor.prototype.setMappings = function(value) {
  this.parserConfig['mappings'] = value;
};


/**
 * @inheritDoc
 */
os.data.FileDescriptor.prototype.updateMappings = function(layer) {
  const source = /** @type {os.source.Request} */ (layer.getSource());
  const importer = source.getImporter();

  this.saveDescriptor();
  importer.setMappings(this.getMappings());
  source.refresh();
};


/**
 * @inheritDoc
 */
os.data.FileDescriptor.prototype.supportsMapping = function() {
  return false;
};


/**
 * Get the original URL for this file.
 *
 * @return {?string}
 */
os.data.FileDescriptor.prototype.getOriginalUrl = function() {
  return this.originalUrl_;
};


/**
 * Set the original URL for this file.
 *
 * @param {?string} value
 */
os.data.FileDescriptor.prototype.setOriginalUrl = function(value) {
  this.originalUrl_ = value;
};


/**
 * @inheritDoc
 */
os.data.FileDescriptor.prototype.getUrl = function() {
  return this.url_;
};


/**
 * @inheritDoc
 */
os.data.FileDescriptor.prototype.setUrl = function(value) {
  this.url_ = value;
};


/**
 * @inheritDoc
 */
os.data.FileDescriptor.prototype.matchesURL = function(url) {
  return url == this.getUrl();
};


/**
 * @return {os.parse.FileParserConfig}
 */
os.data.FileDescriptor.prototype.getParserConfig = function() {
  return this.parserConfig;
};


/**
 * @param {os.parse.FileParserConfig} config
 */
os.data.FileDescriptor.prototype.setParserConfig = function(config) {
  this.parserConfig = config;
  this.layerConfig = {};
};


/**
 * @inheritDoc
 */
os.data.FileDescriptor.prototype.setColor = function(value) {
  this.parserConfig['color'] = value;
  os.data.FileDescriptor.base(this, 'setColor', value);
};


/**
 * @param {!osx.icon.Icon} value
 */
os.data.FileDescriptor.prototype.setIcon = function(value) {
  this.parserConfig['icon'] = value;
  this.icon_ = value;
};


/**
 * @param {?string} value
 */
os.data.FileDescriptor.prototype.setShapeName = function(value) {
  this.parserConfig['shapeName'] = value;
  this.shapeName_ = value;
};


/**
 * @inheritDoc
 */
os.data.FileDescriptor.prototype.setDescription = function(value) {
  this.parserConfig['description'] = value;
  os.data.FileDescriptor.base(this, 'setDescription', value);
};


/**
 * @inheritDoc
 */
os.data.FileDescriptor.prototype.setTags = function(value) {
  this.parserConfig['tags'] = value ? value.join(', ') : '';
  os.data.FileDescriptor.base(this, 'setTags', value);
};


/**
 * @inheritDoc
 */
os.data.FileDescriptor.prototype.setTitle = function(value) {
  this.parserConfig['title'] = value;
  os.data.FileDescriptor.base(this, 'setTitle', value);
};


/**
 * @inheritDoc
 */
os.data.FileDescriptor.prototype.clearData = function() {
  // permanently remove associated file contents from the application/storage
  var url = this.getUrl();
  if (url && os.file.isLocal(url)) {
    var fs = os.file.FileStorage.getInstance();
    fs.deleteFile(url);
  }
};


/**
 * @inheritDoc
 */
os.data.FileDescriptor.prototype.canReimport = function() {
  return true;
};


/**
 * @inheritDoc
 */
os.data.FileDescriptor.prototype.reimport = function() {
  var evt = new os.ui.im.ImportEvent(os.ui.im.ImportEventType.URL, this.getOriginalUrl() || this.getUrl());

  var process = new os.im.ImportProcess();
  process.setEvent(evt);
  process.setConfig(this.getParserConfig());
  process.setSkipDuplicates(true);
  process.begin();
};


/**
 * Get the exporter method associated with this file type.
 * @return {?os.ex.IExportMethod}
 */
os.data.FileDescriptor.prototype.getExporter = function() {
  return null;
};


/**
 * @inheritDoc
 */
os.data.FileDescriptor.prototype.onLayerChange = function(e) {
  os.data.FileDescriptor.base(this, 'onLayerChange', e);

  if (e instanceof os.events.PropertyChangeEvent) {
    const layer = /** @type {os.layer.Vector} */ (e.target);
    const p = e.getProperty() || '';
    const newVal = e.getNewValue();

    if (p == os.source.PropertyChange.HAS_MODIFICATIONS && newVal) {
      if (layer instanceof os.layer.Vector) {
        const source = /** @type {os.source.Vector} */ (layer.getSource());
        const settings = os.config.Settings.getInstance();
        const key = os.file.FileSetting.AUTO_SAVE;

        if (settings.get(key, os.file.FileSettingDefault[key]) && source instanceof os.source.Vector) {
          const options = /** @type {os.ex.ExportOptions} */ ({
            sources: [source],
            items: source.getFeatures(),
            fields: null
          });

          this.updateFile(options);
        }
      }
    }
  }
};


/**
 * Updates to the underlying layer data. Updates the file in storage.
 * @param {os.ex.ExportOptions} options
 */
os.data.FileDescriptor.prototype.updateFile = function(options) {
  const source = /** @type {os.source.Vector} */ (options.sources[0]);
  const exporter = this.getExporter();

  if (exporter) {
    const name = this.getTitle() || 'New File';
    options.exporter = exporter;
    options.fields = os.source.getExportFields(source, false, exporter.supportsTime());
    options.title = name;
    options.keepTitle = true;

    // export via export manager, this will not prompt the user
    // possible TODO: have this function return a promise that resolves/rejects if the export succeeds/fails
    os.ui.file.ExportManager.getInstance().exportItems(options);

    this.onFileChange(options);
  }
};


/**
 * Handles changes to the underlying layer data. Updates the file in storage.
 * @param {os.ex.ExportOptions} options
 */
os.data.FileDescriptor.prototype.onFileChange = function(options) {
  // update this descriptor's URL to point to the file, set the source back to having no modifications
  const name = this.getTitle() || 'New File';
  const url = os.file.getLocalUrl(name);
  this.setUrl(url);

  const source = /** @type {os.source.Vector} */ (options.sources[0]);
  source.setHasModifications(false);
};


/**
 * @inheritDoc
 */
os.data.FileDescriptor.prototype.persist = function(opt_obj) {
  if (!opt_obj) {
    opt_obj = {};
  }

  opt_obj['originalUrl'] = this.originalUrl_;
  opt_obj['url'] = this.url_;
  opt_obj['icon'] = this.getIcon();
  opt_obj['shapeName'] = this.getShapeName();
  opt_obj['date'] = this.getDate();

  var mappings = this.getMappings();
  if (mappings) {
    var mm = os.im.mapping.MappingManager.getInstance();
    opt_obj['mappings'] = mm.persistMappings(mappings);
  }

  return os.data.FileDescriptor.base(this, 'persist', opt_obj);
};


/**
 * @inheritDoc
 */
os.data.FileDescriptor.prototype.restore = function(conf) {
  this.setOriginalUrl(conf['originalUrl'] || null);
  this.setUrl(conf['url'] || null);
  this.setIcon(conf['icon']);
  this.setShapeName(conf['shapeName']);
  this.setDate(conf['date'] || null);

  if (conf['mappings']) {
    var mm = os.im.mapping.MappingManager.getInstance();
    this.setMappings(mm.restoreMappings(conf['mappings']));
  }

  os.data.FileDescriptor.base(this, 'restore', conf);
  this.updateActiveFromTemp();
};


/**
 * Updates an existing descriptor from a parser configuration.
 *
 * @param {!os.parse.FileParserConfig} config
 * @param {boolean=} opt_isNotParserConfig Set to true to not use the the config as the parser config
 */
os.data.FileDescriptor.prototype.updateFromConfig = function(config, opt_isNotParserConfig) {
  this.setDescription(config['description']);
  this.setColor(config['color']);
  this.setIcon(config['icon']);
  this.setShapeName(config['shapeName']);
  this.setTitle(config['title']);
  this.setTags(config['tags'] ? config['tags'].split(/\s*,\s*/) : null);
  this.setDate(config['date']);
  if (!opt_isNotParserConfig) {
    this.setParserConfig(config);
  }
};


/**
 * Creates a new descriptor from a parser configuration.
 *
 * @param {!os.data.FileDescriptor} descriptor
 * @param {!os.data.FileProvider} provider
 * @param {!os.parse.FileParserConfig} config
 * @param {?string=} opt_useDefaultColor
 */
os.data.FileDescriptor.createFromConfig = function(descriptor, provider, config, opt_useDefaultColor) {
  var file = config['file'];
  descriptor.setId(/** @type {string} */ (config['id']) || provider.getUniqueId());
  descriptor.setProvider(provider.getLabel());
  if (file) {
    descriptor.setUrl(file.getUrl());
  }
  if (opt_useDefaultColor) {
    descriptor.setColor(os.style.DEFAULT_LAYER_COLOR);
  }
  descriptor.updateFromConfig(config);
};
