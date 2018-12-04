var app = app || {};

(function () {
    'use strict';

    var ExternalInterface = app.Model.extend({
        additionalOptions: ['config', 'context', 'bus'],
        handlers: {},
        run: function () {
            if (this.config && this.context) {
                this.register(this.config, this.context);
            }
        },
        register: function (config, context) {
            if (_.isPlainObject(config)) {
                for (var section in config) {
                    if (config.hasOwnProperty(section)) {
                        console.log(config[section]);
                        this.initHandlers(section, config[section], context)
                    }
                }
            }
            this.runHandlers()
        },
        initHandlers: function (section, config, context) {
            if (_.isPlainObject(config)) {
                var types = config.types,
                    handlers = config.handlers,
                    channelCreator = this._getBusFunctionForSection(section),
                    channel;
                if (_.isFunction(channelCreator)) {
                    if (_.isString(types)) {
                        types = [types]
                    }
                    var channel = channelCreator(types, context),
                        handlers = config.handlers;
                    if (handlers && _.isArray(handlers)) {
                        handlers.forEach(function (handler) {
                            var type = handler.type,
                                handlerCreator = handler.creator,
                                handler = _.isFunction(handlerCreator) && handlerCreator(section, type);
                            if (_.isFunction(handler)) {
                                if (!this.handlers[section]) {
                                    this.handlers[section] = [];
                                }
                                this.handlers[section].push({
                                    running: false,
                                    handler: handler,
                                    channel: this._prepareChannel(section, type, channel),
                                    type: type
                                });
                            }
                        }.bind(this));
                    }
                }
            }
        },
        _putRunner: function (handlers) {
            handlers.forEach(function (handler) {
                if (!handler.running) {
                    handler.running = true;
                    handler.handler(handler.channel);
                }
            });
        },
        _takeRunner: function (handlers) {
            var notRunning = handlers.filter(function (value) {
                return !value.running;
            });
            if (notRunning.length) {
                return setInterval(function () {
                    notRunning.forEach(function (handler) {
                        handler.running = true;
                        handler.handler(handler.channel)
                    });
                }, 0);
            }
        },
        runHandlers: function () {
            var runners = {
                command: this._putRunner,
                execute: this._takeRunner,
                request: this._putRunner,
                respond: this._takeRunner,
            }
            for (var section in this.handlers) {
                runners[section](this.handlers[section])
            }
        },
        _getBusFunctionForSection(section) {
            return _.isFunction(this.bus[section]) && this.bus[section];
        },
        _prepareChannel(section, type, channel) {
            return ['execute', 'respond'].includes(section) ? channel(type) : channel;
        }
    });
    var instance;
    app.declareInterface = function (config, context, bus) {
        if (!instance) {
            instance = new ExternalInterface({}, {config: config, context: context, bus: bus});
        }
        return instance;
    }
})();