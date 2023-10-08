"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.make_option = exports.Option = exports.make_dropdown = void 0;
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("jsx-dom/jsx-runtime");
var components_1 = require("@nikonov-alex/components");
var make_option = function (label, value, className) {
    return ({ label: label, value: value, class: className });
};
exports.make_option = make_option;
var SN;
(function (SN) {
    SN[SN["OPTIONS_EMPTY"] = 0] = "OPTIONS_EMPTY";
    SN[SN["INACTIVE"] = 1] = "INACTIVE";
    SN[SN["FOCUSED"] = 2] = "FOCUSED";
    SN[SN["OPENED"] = 3] = "OPENED";
})(SN || (SN = {}));
var make_options_empty_state = function (data) {
    return (tslib_1.__assign(tslib_1.__assign({}, data), { name: SN.OPTIONS_EMPTY }));
};
var make_closed_state = function (name, data) {
    return (tslib_1.__assign(tslib_1.__assign({}, data), { name: name, 
        // @ts-ignore
        currentIndex: undefined }));
};
var make_opened_state = function (data) {
    return (tslib_1.__assign(tslib_1.__assign({}, data), { currentIndex: data.leftOptions.length, name: SN.OPENED }));
};
var select_current = function (state) {
    return select_by_index(state, state.currentIndex);
};
var maybe_current_prev = function (state) {
    return 0 === state.currentIndex
        ? state
        : update_state(state, {
            currentIndex: state.currentIndex - 1
        });
};
var maybe_curent_next = function (state) {
    return options_count(state) - 1 === state.currentIndex
        ? state
        : update_state(state, {
            currentIndex: state.currentIndex + 1
        });
};
var change_current = function (state, index) {
    return update_state(state, { currentIndex: index });
};
var value_index = function (state) {
    return state.leftOptions.length;
};
var options_count = function (state) {
    return state.leftOptions.length + 1 + state.rightOptions.length;
};
var select_by_index = function (state, index) {
    return index < 0 || index >= options_count(state)
        ? state
        : (function (options) {
            // @ts-ignore
            return update_state(state, {
                leftOptions: options.slice(0, index),
                value: options[index],
                rightOptions: options.slice(index + 1)
            });
        })(state.leftOptions.concat(state.value, state.rightOptions));
};
var maybe_select_prev = function (state) {
    return 0 === state.leftOptions.length
        ? state
        : update_state(state, {
            leftOptions: state.leftOptions.slice(0, -1),
            value: state.leftOptions[state.leftOptions.length - 1],
            rightOptions: [state.value].concat(state.rightOptions)
        });
};
var maybe_select_next = function (state) {
    return 0 === state.rightOptions.length
        ? state
        : update_state(state, {
            leftOptions: state.leftOptions.concat(state.value),
            value: state.rightOptions[0],
            rightOptions: state.rightOptions.slice(1)
        });
};
var update_state = function (state, data) {
    return (tslib_1.__assign(tslib_1.__assign({}, state), data));
};
var Option = function (props) {
    return (0, jsx_runtime_1.jsx)("li", { className: "na-dropdown-option" +
            (props.selected ? " selected" : "") +
            (props.class ? " ".concat(props.class) : ""), "data-index": props.index, children: props.label });
};
exports.Option = Option;
var OptionsList = function (props) {
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: props.options.map(function (option, index) {
            return (0, jsx_runtime_1.jsx)(Option, tslib_1.__assign({}, option, { index: index, selected: index === props.selectedIndex }));
        }) });
};
var Value = function (props) {
    return (0, jsx_runtime_1.jsx)("div", { className: "na-dropdown-value", children: props.label });
};
var render = function (state) {
    return SN.OPTIONS_EMPTY === state.name
        ? (0, jsx_runtime_1.jsx)("div", { id: state.id })
        : (0, jsx_runtime_1.jsxs)("div", { id: state.id, className: "na-dropdown" +
                (state.class ? " ".concat(state.class) : "") +
                (state.name === SN.OPENED ? " opened" : ""), tabIndex: 0, children: [(0, jsx_runtime_1.jsx)(Value, tslib_1.__assign({}, state.value)), state.name === SN.OPENED
                    ? (0, jsx_runtime_1.jsx)("ul", { className: "na-dropdown-options", children: (0, jsx_runtime_1.jsx)(OptionsList, { options: state.leftOptions.concat(state.value, state.rightOptions), selectedIndex: state.currentIndex }) })
                    : (0, jsx_runtime_1.jsx)("span", {})] });
};
var is_target_option = function (target) {
    return target instanceof HTMLElement && target.matches(".na-dropdown-option, .na-dropdown-option *");
};
var option_index = function (option) {
    // @ts-ignore
    return parseInt(option.closest(".na-dropdown-option").dataset.index);
};
var maybeLeave = function (state, event) {
    return state.name === SN.OPTIONS_EMPTY || state.name === SN.INACTIVE
        ? state
        : make_closed_state(SN.INACTIVE, state);
};
var click = function (state, event) {
    return state.name === SN.OPTIONS_EMPTY
        ? state
        : state.name === SN.OPENED
            ? make_closed_state(SN.FOCUSED, select_current(state))
            : make_opened_state(state);
};
var keyup = function (state, event) {
    return state.name === SN.INACTIVE
        ? make_closed_state(SN.FOCUSED, state)
        : state;
};
var keydown = function (state, event) {
    return state.name === SN.FOCUSED
        ? event.ctrlKey
            ? state
            : event.altKey
                ? ["ArrowDown", "ArrowUp"].includes(event.code)
                    ? make_opened_state(state)
                    : state
                : ["Enter", "Space"].includes(event.code)
                    ? make_opened_state(state)
                    : "ArrowDown" === event.code
                        ? maybe_select_next(state)
                        : "ArrowLeft" === event.code
                            ? maybe_select_prev(state)
                            : "ArrowUp" === event.code
                                ? maybe_select_prev(state)
                                : "ArrowRight" === event.code
                                    ? maybe_select_next(state)
                                    : state
        : state.name === SN.OPENED
            ? event.altKey
                ? ["ArrowDown", "ArrowUp"].includes(event.code)
                    ? make_closed_state(SN.FOCUSED, state)
                    : state
                : "Escape" === event.code
                    ? make_closed_state(SN.FOCUSED, state)
                    : "Enter" === event.code
                        ? make_closed_state(SN.FOCUSED, select_current(state))
                        : "ArrowDown" === event.code
                            ? select_current(maybe_curent_next(state))
                            : "ArrowUp" === event.code
                                ? select_current(maybe_current_prev(state))
                                : state
            : state;
};
var maybeChangeCurrent = function (state, event) {
    return SN.OPENED !== state.name
        ? state
        : !is_target_option(event.target)
            ? state
            : change_current(state, option_index(event.target));
};
var make_changed_event = function (global, id, value) {
    return new CustomEvent((global && id ? "#".concat(id, "_") : "") + "dropdown-value-changed", {
        detail: { id: id, value: value },
        bubbles: true
    });
};
var make_event_function = function (global) {
    return function (oldState, newState) {
        return SN.OPTIONS_EMPTY === oldState.name
            ? SN.OPTIONS_EMPTY === newState.name
                ? null
                : make_changed_event(global, newState.id, newState.value)
            : SN.OPTIONS_EMPTY === newState.name
                ? make_changed_event(global, newState.id, null)
                : value_index(oldState) !== value_index(newState)
                    ? make_changed_event(global, newState.id, newState.value)
                    : null;
    };
};
var replaceOptionalParams = function (state, opts) {
    var _a, _b;
    return ({
        id: (_a = opts.id) !== null && _a !== void 0 ? _a : state.id,
        class: (_b = opts.class) !== null && _b !== void 0 ? _b : state.class
    });
};
var updateOptions = function (state, opts) {
    return SN.OPTIONS_EMPTY === state.name
        ? opts.options && opts.options.length !== 0
            ? make_closed_state(SN.INACTIVE, tslib_1.__assign(tslib_1.__assign({}, to_options_data(opts.options)), replaceOptionalParams(state, opts)))
            : update_state(state, replaceOptionalParams(state, opts))
        // ALL OTHER STATES
        : opts.options
            ? 0 === opts.options.length
                ? make_options_empty_state(replaceOptionalParams(state, opts))
                : update_state(state, tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, state), to_options_data(opts.options)), replaceOptionalParams(state, opts)))
            : update_state(state, tslib_1.__assign(tslib_1.__assign({}, state), replaceOptionalParams(state, opts)));
};
var create_options_data = function (options, selectedIndex) {
    return ({
        leftOptions: options.slice(0, selectedIndex),
        value: options[selectedIndex],
        rightOptions: options.slice(selectedIndex + 1),
    });
};
var options_find_selected = function (options) {
    return options.findIndex(function (option) { return true === option.autoselect; });
};
var to_options_data = function (options) {
    return (function (selectedIndex) {
        return create_options_data(options, -1 === selectedIndex ? 0 : selectedIndex);
    })(options_find_selected(options));
};
var make_initial_state = function (opts) {
    return 0 === opts.options.length
        ? make_options_empty_state({ id: opts.id, class: opts.class })
        : make_closed_state(SN.INACTIVE, tslib_1.__assign(tslib_1.__assign({}, to_options_data(opts.options)), { id: opts.id, class: opts.class }));
};
var make_dropdown = function (opts) {
    return (0, components_1.make_component)(make_initial_state(opts), render, {
        localEvents: {
            blur: maybeLeave,
            click: click,
            keyup: keyup,
            keydown: keydown,
            mouseover: maybeChangeCurrent
        },
        updateOptions: updateOptions,
        triggerGlobalEvent: make_event_function(true),
        triggerLocalEvent: make_event_function(false)
    });
};
exports.make_dropdown = make_dropdown;
//# sourceMappingURL=index.js.map