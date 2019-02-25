(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.KintoneConfigHelper = {})));
}(this, (function (exports) { 'use strict';

  var ALL_FIELD_TYPES = [
      "SINGLE_LINE_TEXT",
      "MULTI_LINE_TEXT",
      "RICH_TEXT",
      "NUMBER",
      "CALC",
      "RADIO_BUTTON",
      "CHECK_BOX",
      "MULTI_SELECT",
      "DROP_DOWN",
      "DATE",
      "TIME",
      "DATETIME",
      "FILE",
      "LINK",
      "USER_SELECT",
      "ORGANIZATION_SELECT",
      "GROUP_SELECT",
      "REFERENCE_TABLE",
      "SPACER",
      "GROUP",
      "SUBTABLE",
      "RECORD_NUMBER",
      "CREATOR",
      "CREATED_TIME",
      "MODIFIER",
      "UPDATED_TIME"
  ];
  function createKintoneClient(kintone) {
      function fetchFormInfoByFields() {
          var url = kintone.api.url("/k/v1/preview/app/form/fields", true);
          var body = {
              app: kintone.app.getId()
          };
          return kintone.api(url, "GET", body).then(function (resp) {
              return resp.properties;
          });
      }
      function fetchFormInfoByLayout() {
          var url = kintone.api.url("/k/v1/preview/app/form/layout", true);
          var body = {
              app: kintone.app.getId()
          };
          return kintone.api(url, "GET", body).then(function (resp) {
              return resp.layout;
          });
      }
      return {
          fetchFormInfoByFields: fetchFormInfoByFields,
          fetchFormInfoByLayout: fetchFormInfoByLayout
      };
  }

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */

  var __assign = function() {
      __assign = Object.assign || function __assign(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments[i];
              for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
          }
          return t;
      };
      return __assign.apply(this, arguments);
  };

  function __rest(s, e) {
      var t = {};
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
          t[p] = s[p];
      if (s != null && typeof Object.getOwnPropertySymbols === "function")
          for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
              t[p[i]] = s[p[i]];
      return t;
  }

  var NOT_EXIST_MESSAGE = "Either the specified field type does not exist, or this method cannot respond the specified field type.";
  var NOT_MATCH_MESSAGE = "Specify either characters or an array of characters for the getAllFields parameter.";

  function createGetFields(kintoneClient, Promise_) {
      var Promise = Promise_;
      var fetchFormInfoByFields = kintoneClient.fetchFormInfoByFields, fetchFormInfoByLayout = kintoneClient.fetchFormInfoByLayout;
      function removeUnnecessaryProperties(field) {
          var _ = field.size, rest = __rest(field, ["size"]);
          return rest;
      }
      function getFieldInfo(layoutFields) {
          return layoutFields
              .filter(function (layout) { return layout.type !== "LABEL" && layout.type !== "HR"; })
              .map(function (field) { return removeUnnecessaryProperties(field); });
      }
      function modifiedLayoutResp(layoutList) {
          return layoutList.reduce(function (acc, layout) {
              switch (layout.type) {
                  case "ROW":
                      return acc.concat(getFieldInfo(layout.fields));
                  case "GROUP":
                      return acc.concat([
                          { type: layout.type, code: layout.code }
                      ], layout.layout
                          .map(function (childLayout) { return getFieldInfo(childLayout.fields); })
                          .reduce(function (acc, cur) { return acc.concat(cur); }, []));
                  case "SUBTABLE":
                      return acc.concat([
                          { type: layout.type, code: layout.code }
                      ], getFieldInfo(layout.fields));
              }
          }, []);
      }
      function getLabeledFields(fieldsResp) {
          return Object.keys(fieldsResp).reduce(function (acc, key) {
              var _a;
              var field = fieldsResp[key];
              if (field.type === "SUBTABLE") {
                  return __assign({}, acc, getLabeledFields(field.fields));
              }
              return field.label ? __assign({}, acc, (_a = {}, _a[field.code] = field.label, _a)) : acc;
          }, {});
      }
      function addLabel(layoutFieldList, fieldsResp) {
          var labeledFields = getLabeledFields(fieldsResp);
          return layoutFieldList.map(function (layoutField) {
              return labeledFields[layoutField.code]
                  ? __assign({}, layoutField, { label: labeledFields[layoutField.code] }) : layoutField;
          });
      }
      function getLookupFieldKeys(fieldsResp) {
          return Object.keys(fieldsResp).filter(function (key) { return typeof fieldsResp[key].lookup !== "undefined"; });
      }
      function filterLookupField(layoutFieldList, fieldsResp) {
          var lookupFieldKeys = getLookupFieldKeys(fieldsResp);
          if (lookupFieldKeys.length === 0)
              ;
          return layoutFieldList.filter(function (layoutField) {
              return !lookupFieldKeys.some(function (key) { return fieldsResp[key].code === layoutField.code; });
          });
      }
      function flattenFieldsForSubtable(fieldsResp) {
          return Object.keys(fieldsResp).reduce(function (fields, key) {
              var _a, _b;
              if (fieldsResp[key].type === "SUBTABLE") {
                  return __assign({}, fields, (_a = {}, _a[key] = fieldsResp[key], _a), fieldsResp[key].fields);
              }
              return __assign({}, fields, (_b = {}, _b[key] = fieldsResp[key], _b));
          }, {});
      }
      function fetchAllFields(selectFieldTypes) {
          return Promise.all([fetchFormInfoByFields(), fetchFormInfoByLayout()]).then(function (_a) {
              var fieldsResp = _a[0], layoutResp = _a[1];
              var fieldList = addLabel(filterLookupField(modifiedLayoutResp(layoutResp), flattenFieldsForSubtable(fieldsResp)), fieldsResp);
              return selectFieldTypes
                  ? fieldList.filter(function (field) { return selectFieldTypes.indexOf(field.type) !== -1; })
                  : fieldList;
          });
      }
      function validateFieldType(fieldType) {
          return ALL_FIELD_TYPES.some(function (type) { return type === fieldType; });
      }
      function validateGetAllFieldsArgument(fieldType) {
          if (typeof fieldType === "string") {
              return validateFieldType(fieldType) ? null : NOT_EXIST_MESSAGE;
          }
          if (Array.isArray(fieldType)) {
              return fieldType.every(validateFieldType) ? null : NOT_EXIST_MESSAGE;
          }
          return NOT_MATCH_MESSAGE;
      }
      function getFields(selectFieldType) {
          if (typeof selectFieldType === "undefined") {
              return fetchAllFields();
          }
          var error = validateGetAllFieldsArgument(selectFieldType);
          if (error) {
              return Promise.reject(new Error(error));
          }
          return fetchAllFields(Array.isArray(selectFieldType) ? selectFieldType : [selectFieldType]);
      }
      return getFields;
  }

  var kintone = window.kintone;
  var kintoneClient = createKintoneClient(kintone);
  var getFields = createGetFields(kintoneClient, kintone.Promise);

  exports.getFields = getFields;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
