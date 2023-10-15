"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.make_option = exports.Option = exports.Dropdown = exports.make_dropdown = void 0;
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("jsx-dom/jsx-runtime");
var components_1 = require("@nikonov-alex/components");
var make_option = function (label, value, options) {
    if (options === void 0) { options = {}; }
    return (tslib_1.__assign({ label: label, value: value }, options));
};
exports.make_option = make_option;
var ST;
(function (ST) {
    ST[ST["OPTIONS_EMPTY"] = 0] = "OPTIONS_EMPTY";
    ST[ST["INACTIVE"] = 1] = "INACTIVE";
    ST[ST["FOCUSED"] = 2] = "FOCUSED";
    ST[ST["OPENED"] = 3] = "OPENED";
})(ST || (ST = {}));
var make_options_empty_state = function (data) {
    return (tslib_1.__assign(tslib_1.__assign({}, data), { type: ST.OPTIONS_EMPTY }));
};
var make_closed_state = function (type, data) {
    return (tslib_1.__assign(tslib_1.__assign({}, data), { type: type, 
        // @ts-ignore
        currentIndex: undefined }));
};
var make_opened_state = function (data) {
    return (tslib_1.__assign(tslib_1.__assign({}, data), { currentIndex: data.leftOptions.length, type: ST.OPENED }));
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
            return set_valid(update_state(state, {
                leftOptions: options.slice(0, index),
                value: options[index],
                rightOptions: options.slice(index + 1)
            }));
        })(state.leftOptions.concat(state.value, state.rightOptions));
};
var maybe_select_prev = function (state) {
    return 0 === state.leftOptions.length
        ? state
        : set_valid(update_state(state, {
            leftOptions: state.leftOptions.slice(0, -1),
            value: state.leftOptions[state.leftOptions.length - 1],
            rightOptions: [state.value].concat(state.rightOptions)
        }));
};
var maybe_select_next = function (state) {
    return 0 === state.rightOptions.length
        ? state
        : set_valid(update_state(state, {
            leftOptions: state.leftOptions.concat(state.value),
            value: state.rightOptions[0],
            rightOptions: state.rightOptions.slice(1)
        }));
};
var update_state = function (state, data) {
    return (tslib_1.__assign(tslib_1.__assign({}, state), data));
};
var valid = function (required, value) {
    return required
        ? !value.disabled
        : true;
};
var set_valid = function (data) {
    return (tslib_1.__assign(tslib_1.__assign({}, data), { valid: valid(data.required, data.value) }));
};
var Option = function (props) {
    return (0, jsx_runtime_1.jsx)("li", { className: "na-dropdown-option" +
            (props.selected ? " selected" : "") +
            (props.class ? " ".concat(props.class) : ""), "data-index": props.index, children: (0, jsx_runtime_1.jsx)("span", { className: "na-dropdown-option-label", children: props.label }) });
};
exports.Option = Option;
var OptionsList = function (props) {
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: props.options.map(function (option, index) {
            return (0, jsx_runtime_1.jsx)(Option, tslib_1.__assign({}, option, { index: index, selected: index === props.selectedIndex }));
        }) });
};
var Value = function (state) {
    return (0, jsx_runtime_1.jsxs)("div", { className: "na-dropdown-value", style: {
            position: "relative"
        }, children: [state.value.label, (0, jsx_runtime_1.jsx)("select", { tabIndex: -1, required: state.required, style: {
                    position: "absolute",
                    pointerEvents: "none",
                    opacity: "0",
                    top: "0",
                    left: "0",
                    height: "100%",
                    width: "100%"
                }, children: state.valid
                    ? (0, jsx_runtime_1.jsx)("option", { value: "1", selected: true, children: "1" })
                    : (0, jsx_runtime_1.jsx)("option", { selected: true, disabled: true }) })] });
};
var render = function (state) {
    var _a;
    return ST.OPTIONS_EMPTY === state.type
        ? (0, jsx_runtime_1.jsx)("div", { id: state.id, "data-name": state.name })
        : (0, jsx_runtime_1.jsxs)("div", { id: state.id, "data-name": state.name, className: "na-dropdown" +
                (state.class ? " ".concat(state.class) : "") +
                (state.type === ST.OPENED ? " opened" : "") +
                (!state.valid ? " invalid" : ""), "data-value": (_a = state.value.value) !== null && _a !== void 0 ? _a : state.value.label, tabIndex: 0, children: [(0, jsx_runtime_1.jsx)(Value, tslib_1.__assign({}, state)), state.type === ST.OPENED
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
    return state.type === ST.OPTIONS_EMPTY || state.type === ST.INACTIVE
        ? state
        : make_closed_state(ST.INACTIVE, state);
};
var click = function (state, event) {
    return state.type === ST.OPTIONS_EMPTY
        ? state
        : state.type === ST.OPENED
            ? make_closed_state(ST.FOCUSED, select_current(state))
            : make_opened_state(state);
};
var keyup = function (state, event) {
    return state.type === ST.INACTIVE
        ? make_closed_state(ST.FOCUSED, state)
        : state;
};
var keydown = function (state, event) {
    return state.type === ST.FOCUSED
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
        : state.type === ST.OPENED
            ? event.altKey
                ? ["ArrowDown", "ArrowUp"].includes(event.code)
                    ? make_closed_state(ST.FOCUSED, state)
                    : state
                : "Escape" === event.code
                    ? make_closed_state(ST.FOCUSED, state)
                    : "Enter" === event.code
                        ? make_closed_state(ST.FOCUSED, select_current(state))
                        : "ArrowDown" === event.code
                            ? select_current(maybe_curent_next(state))
                            : "ArrowUp" === event.code
                                ? select_current(maybe_current_prev(state))
                                : state
            : state;
};
var maybeChangeCurrent = function (state, event) {
    return ST.OPENED !== state.type
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
        return ST.OPTIONS_EMPTY === oldState.type
            ? ST.OPTIONS_EMPTY === newState.type
                ? null
                : make_changed_event(global, newState.id, newState.value)
            : ST.OPTIONS_EMPTY === newState.type
                ? make_changed_event(global, newState.id, null)
                : value_index(oldState) !== value_index(newState)
                    ? make_changed_event(global, newState.id, newState.value)
                    : null;
    };
};
var replaceOptionalParams = function (state, opts) {
    var _a, _b, _c, _d;
    return ({
        id: (_a = opts.id) !== null && _a !== void 0 ? _a : state.id,
        class: (_b = opts.class) !== null && _b !== void 0 ? _b : state.class,
        name: (_c = opts.name) !== null && _c !== void 0 ? _c : state.name,
        required: (_d = opts.required) !== null && _d !== void 0 ? _d : state.required
    });
};
var updateOptions = function (state, opts) {
    return ST.OPTIONS_EMPTY === state.type
        ? opts.options && opts.options.length !== 0
            ? make_closed_state(ST.INACTIVE, set_valid(tslib_1.__assign(tslib_1.__assign({}, to_options_data(opts.options)), replaceOptionalParams(state, opts))))
            : update_state(state, replaceOptionalParams(state, opts))
        // ALL OTHER STATES
        : opts.options
            ? 0 === opts.options.length
                ? make_options_empty_state(replaceOptionalParams(state, opts))
                : update_state(state, set_valid(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, state), to_options_data(opts.options)), replaceOptionalParams(state, opts))))
            : update_state(state, set_valid(tslib_1.__assign(tslib_1.__assign({}, state), replaceOptionalParams(state, opts))));
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
        ? make_options_empty_state({
            id: opts.id,
            class: opts.class,
            name: opts.name,
            required: opts.required
        })
        : make_closed_state(ST.INACTIVE, set_valid(tslib_1.__assign(tslib_1.__assign({}, to_options_data(opts.options)), { id: opts.id, class: opts.class, name: opts.name, required: opts.required })));
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
var Dropdown = function (props) {
    return (0, components_1.draw_component)(make_dropdown(props));
};
exports.Dropdown = Dropdown;
//# sourceMappingURL=index.js.map