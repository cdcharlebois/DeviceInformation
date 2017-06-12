/*
 *  include `cordova-plugin-sim` as window.plugins.sim
 */

define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",


], function(declare, _WidgetBase, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent) {
    "use strict";

    return declare("DeviceInfo.widget.DeviceInfo", [_WidgetBase], {
        objectToCreate: null,
        deviceIdField: null,
        phoneNumberField: null,
        microflowToCall: null,

        // Internal variables.
        _handles: null,
        _contextObj: null,

        constructor: function() {
            this._handles = [];
        },

        postCreate: function() {
            var self = this;
            logger.debug(this.id + ".postCreate");
            console.log("Device ID: " + device.uuid);
            // make sure the plugin loaded
            var pluginAvailable = (
                typeof(window.plugins.sim) !== "undefined"
            );
            if (pluginAvailable) {
                window.plugins.sim.requestReadPermission(
                    function(success) {
                        console.log('permission granted')
                        window.plugins.sim.getSimInfo(
                            function(result) {
                                // console.log(result);
                                self._createObject(true, result)
                            },
                            function(error) {
                                console.error(error);
                            }
                        );
                    },
                    function(err) {
                        console.log('no permission')
                        window.plugins.sim.getSimInfo(
                            function(result) {
                                self._createObject(false, result)
                            },
                            function(error) {
                                console.error(error);
                            }
                        );
                    }
                );

            } else {
                console.error("Make sure that the sim plugin is loaded");
            }
        },

        update: function(obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            this._updateRendering(callback);
        },

        resize: function(box) {
            logger.debug(this.id + ".resize");
        },

        uninitialize: function() {
            logger.debug(this.id + ".uninitialize");
        },

        _createObject: function(permission, data) {
            console.log(data)
                // create object and call microflow
            mx.data.create({
                entity: this.objectToCreate,
                callback: lang.hitch(this, function(obj) {
                    obj.set(this.deviceIdField, device.uuid);
                    if (permission) {
                        obj.set(this.phoneNumberField, data.phoneNumber);
                    }
                    this._callMicroflow(this.microflowToCall, obj);
                }),
            })

        },

        _callMicroflow: function(mf, param) {
            mx.data.action({
                params: {
                    actionname: mf,
                    applyto: "selection",
                    guids: [param.getGuid()]
                },
                callback: function(res) {
                    console.log('success')
                },
                error: function(err) {
                    console.log('error')
                }
            })
        },

        _updateRendering: function(callback) {
            logger.debug(this.id + "._updateRendering");

            if (this._contextObj !== null) {
                dojoStyle.set(this.domNode, "display", "block");
            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }

            this._executeCallback(callback);
        },

        _executeCallback: function(cb) {
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["DeviceInfo/widget/DeviceInfo"]);