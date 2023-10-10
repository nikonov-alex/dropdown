import { make_component, Component } from "@nikonov-alex/components";


type Option = { label: string, value?: string, class?: string, autoselect?: true };

const make_option = ( label: string, value?: string, className?: string ): Option =>
    ( { label, value, class: className } )




enum ST {
    OPTIONS_EMPTY,
    INACTIVE,
    FOCUSED,
    OPENED
}

type OptionalData = {
    id?: string,
    class?: string,
    name?: string
}




type EmptyStateData = OptionalData;

type OptionsEmptyState = { type: ST.OPTIONS_EMPTY } & EmptyStateData;

const make_options_empty_state = ( data: OptionalData ): OptionsEmptyState =>
    ( { ... data, type: ST.OPTIONS_EMPTY } );




type OptionsData = {
    leftOptions: Option[];
    value: Option;
    rightOptions: Option[];
};

type ClosedStateData = OptionsData & EmptyStateData;

type ClosedState = { type: ST.INACTIVE | ST.FOCUSED } & ClosedStateData;

const make_closed_state = ( type: ST.INACTIVE | ST.FOCUSED, data: ClosedStateData ): ClosedState =>
    ( { ... data, type,
        // @ts-ignore
        currentIndex: undefined } );




type OpenedStateData = {
    currentIndex: number
} & ClosedStateData;

type OpenedState = { type: ST.OPENED } & OpenedStateData;

const make_opened_state = ( data: ClosedStateData ): OpenedState =>
    ( { ... data, currentIndex: data.leftOptions.length, type: ST.OPENED } );

const select_current = ( state: OpenedState ): OpenedState =>
    select_by_index( state, state.currentIndex );

const maybe_current_prev = ( state: OpenedState ): OpenedState =>
    0 === state.currentIndex
        ? state
    : update_state( state, {
        currentIndex: state.currentIndex - 1
    } );

const maybe_curent_next = ( state: OpenedState ): OpenedState =>
    options_count( state ) - 1 === state.currentIndex
        ? state
    : update_state( state, {
        currentIndex: state.currentIndex + 1
    } );

const change_current = ( state: OpenedState, index: number ): OpenedState =>
    update_state( state, { currentIndex: index } );




type NotEmptyState = ClosedState | OpenedState;

const value_index = ( state: NotEmptyState ): number =>
    state.leftOptions.length;

const options_count = ( state: NotEmptyState ): number =>
    state.leftOptions.length + 1 + state.rightOptions.length;

const select_by_index = <S extends NotEmptyState>( state: S, index: number ): S =>
    index < 0 || index >= options_count( state )
        ? state
        : ( options =>
                // @ts-ignore
                update_state( state, {
                    leftOptions: options.slice( 0, index ),
                    value: options[index],
                    rightOptions: options.slice( index + 1 )
                } )
        )( state.leftOptions.concat( state.value, state.rightOptions ) );

const maybe_select_prev = ( state: NotEmptyState ): NotEmptyState =>
    0 === state.leftOptions.length
        ? state
        : update_state( state, {
            leftOptions: state.leftOptions.slice( 0, -1 ),
            value: state.leftOptions[state.leftOptions.length - 1],
            rightOptions: [ state.value ].concat( state.rightOptions )
        } );

const maybe_select_next = ( state: NotEmptyState ): NotEmptyState =>
    0 === state.rightOptions.length
        ? state
        : update_state( state, {
            leftOptions: state.leftOptions.concat( state.value ),
            value: state.rightOptions[0],
            rightOptions: state.rightOptions.slice( 1 )
        } );




type State = OptionsEmptyState | NotEmptyState;

const update_state = <S extends State>( state: S, data: Partial<{ [K in keyof S]: S[K] }> ): S =>
    ( { ... state, ... data } );




const Option = ( props: Option & { index: number, selected?: boolean } ): HTMLElement =>
    <li className={ "na-dropdown-option" +
        (props.selected ? " selected" : "") +
        (props.class ? ` ${props.class}` : "")
    } data-index={ props.index }>{ props.label }</li> as HTMLElement;

const OptionsList = ( props: { options: Option[], selectedIndex: number } ) =>
    <>{ props.options.map( ( option, index ) =>
        <Option { ... option } index={ index } selected={ index === props.selectedIndex } /> )
    }</>;

const Value = ( props: Option ): HTMLElement =>
    <div className="na-dropdown-value">{ props.label }</div> as HTMLElement;

const render = ( state: State ): HTMLElement  =>
    ST.OPTIONS_EMPTY === state.type
        ? <div id={ state.id } data-name={ state.name } /> as HTMLElement
    : <div id={ state.id }
         data-name={ state.name }
         className={ "na-dropdown" +
             ( state.class ? ` ${state.class}` : "" ) +
             ( state.type === ST.OPENED ? " opened" : "" )
         } tabIndex={ 0 }>
        <Value { ... state.value } />
        { state.type === ST.OPENED
            ? <ul className="na-dropdown-options">
                <OptionsList options={ state.leftOptions.concat( state.value, state.rightOptions ) }
                             selectedIndex={ state.currentIndex } />
            </ul>
            : <span />
        }
    </div> as HTMLElement;

const is_target_option = ( target: EventTarget ): boolean =>
    target instanceof HTMLElement && target.matches( ".na-dropdown-option, .na-dropdown-option *" );

const option_index = ( option: HTMLElement ): number =>
    // @ts-ignore
    parseInt( option.closest( ".na-dropdown-option" ).dataset.index );




const maybeLeave = ( state: State, event: Event ): State =>
    state.type === ST.OPTIONS_EMPTY || state.type === ST.INACTIVE
        ? state
    : make_closed_state( ST.INACTIVE, state );


const click = ( state: State, event: Event ): State =>
    state.type === ST.OPTIONS_EMPTY
        ? state
    : state.type === ST.OPENED
        ? make_closed_state( ST.FOCUSED,
            select_current( state ) )
    : make_opened_state( state );

const keyup = ( state: State, event: Event ): State =>
    state.type === ST.INACTIVE
        ? make_closed_state( ST.FOCUSED, state )
    : state;

const keydown = ( state: State, event: Event ): State =>
    state.type === ST.FOCUSED
        ? (event as KeyboardEvent).ctrlKey
            ? state
        : (event as KeyboardEvent).altKey
            ? [ "ArrowDown", "ArrowUp" ].includes( (event as KeyboardEvent).code )
                ? make_opened_state( state )
                : state
        : [ "Enter", "Space" ].includes( (event as KeyboardEvent).code )
            ? make_opened_state( state )
        : "ArrowDown" === (event as KeyboardEvent).code
            ? maybe_select_next( state )
        : "ArrowLeft" === (event as KeyboardEvent).code
            ? maybe_select_prev( state )
        : "ArrowUp" === (event as KeyboardEvent).code
            ? maybe_select_prev( state )
        : "ArrowRight" === (event as KeyboardEvent).code
            ? maybe_select_next( state )
        : state
    : state.type === ST.OPENED
        ? (event as KeyboardEvent).altKey
            ? [ "ArrowDown", "ArrowUp" ].includes( (event as KeyboardEvent).code )
                ? make_closed_state( ST.FOCUSED, state )
                : state
        : "Escape" === (event as KeyboardEvent).code
            ? make_closed_state( ST.FOCUSED, state )
        : "Enter" === (event as KeyboardEvent).code
            ? make_closed_state( ST.FOCUSED, select_current( state ) )
        : "ArrowDown" === (event as KeyboardEvent).code
            ? select_current( maybe_curent_next( state ) )
        : "ArrowUp" === (event as KeyboardEvent).code
            ? select_current( maybe_current_prev( state ) )
        : state
    : state


const maybeChangeCurrent = ( state: State, event: Event ): State =>
    ST.OPENED !== state.type
        ? state
    : !is_target_option( event.target as EventTarget )
        ? state
    : change_current( state, option_index( event.target as HTMLElement ) );


const make_changed_event = ( global: boolean, id: string | undefined, value: Option | null, name?: string ): CustomEvent<{ id?: string, value: Option | null }> =>
    new CustomEvent( (global && id ? `#${id}_` : "") + "dropdown-value-changed", {
        detail: { id, value, name },
        bubbles: true
    } );

const make_event_function = ( global: boolean ) =>
    ( oldState: State, newState: State ) =>
        ST.OPTIONS_EMPTY === oldState.type
            ? ST.OPTIONS_EMPTY === newState.type
                ? null
                : make_changed_event( global, newState.id, newState.value, newState.name )
            : ST.OPTIONS_EMPTY === newState.type
                ? make_changed_event( global, newState.id, null, newState.name )
                : value_index( oldState ) !== value_index( newState )
                    ? make_changed_event( global, newState.id, newState.value, newState.name )
                    : null;




type RequiredParams = { options: Option[] };
type OptionalParams = { id: string, class: string, name: string };
type Options = Partial<RequiredParams & OptionalParams>;

type Dropdown = Component<State, Options>;


const replaceOptionalParams = ( state: State, opts: Partial<OptionalParams> ): Partial<OptionalParams> =>
    ( {
        id: opts.id ?? state.id,
        class: opts.class ?? state.class,
        name: opts.name ?? state.name
    } );

const updateOptions = ( state: State, opts: Options ): State =>
    ST.OPTIONS_EMPTY === state.type
        ? opts.options && opts.options.length !== 0
            ? make_closed_state( ST.INACTIVE, {
                //@ts-ignore
                ... to_options_data( opts.options ),
                ... replaceOptionalParams( state, opts )
            } )
            : update_state( state,
                replaceOptionalParams( state, opts ) )
    // ALL OTHER STATES
        : opts.options
            ? 0 === opts.options.length
                ? make_options_empty_state(
                    replaceOptionalParams( state, opts ) )
                : update_state( state, {
                    ... state,
                    //@ts-ignore
                    ... to_options_data( opts.options ),
                    ... replaceOptionalParams( state, opts )
                } )
            : update_state( state, {
                ... state,
                ... replaceOptionalParams( state, opts )
            } );



const create_options_data = ( options: Option[], selectedIndex: number ): OptionsData =>
    ({
        leftOptions: options.slice( 0, selectedIndex ),
        value: options[selectedIndex],
        rightOptions: options.slice( selectedIndex + 1 ),
    })

const options_find_selected = ( options: Option[] ): number =>
    options.findIndex( option => true === option.autoselect );

const to_options_data = ( options: Option[] ): OptionsData =>
    ( selectedIndex =>
            create_options_data( options, -1 === selectedIndex ? 0 : selectedIndex )
    )( options_find_selected( options ) );

const make_initial_state = ( opts: RequiredParams & Partial<OptionalParams> ): State =>
    0 === opts.options.length
        ? make_options_empty_state( { id: opts.id, class: opts.class, name: opts.name } )
        : make_closed_state( ST.INACTIVE, {
                ... to_options_data( opts.options ),
                id: opts.id,
                class: opts.class,
                name: opts.name
            }
        )

const make_dropdown = ( opts: RequiredParams & Partial<OptionalParams> ): Dropdown =>
    make_component<State, Options>(
        make_initial_state( opts ),
        render, {
            localEvents: {
                blur: maybeLeave,
                click,
                keyup,
                keydown,
                mouseover: maybeChangeCurrent
            },
            updateOptions,
            triggerGlobalEvent: make_event_function( true ),
            triggerLocalEvent: make_event_function( false )
    } );



export { make_dropdown, Dropdown, Option, make_option };