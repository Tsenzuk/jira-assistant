import React, { PureComponent } from 'react';
import { AutoComplete } from 'primereact/autocomplete';

class AC extends PureComponent {
    constructor(props) {
        super(props);
        let { value } = props;
        value = value || "";
        this.state = { value };
    }

    UNSAFE_componentWillReceiveProps(props) {
        if (this.state.value !== props.value) {
            this.setState({ value: props.value });
        }
    }
    /*
    ref not working and temp commented code
    componentDidMount() {
        if (this.props.autoFocus) {
            setTimeout(() => this.ac.inputEl.focus(), 100);
        }
    }*/

    onChange = ({ value }) => {
        this.setState({ value });
        const { onChange } = this.props;
        if (onChange) {
            onChange(value, this.props.field);
        }
    };

    filterResult = ({ query }) => {
        const { dataset } = this.props;

        if (typeof dataset === "function") {
            const result = dataset(query);
            if (Array.isArray(result)) {
                this.setState({ list: result });
                return;
            }
            else if (typeof result.then === "function") {
                result.then(list => this.setState({ list }));
            }
        }
        // else if (Array.isArray(dataset)) {
        //    // ToDo: need to implement when needed
        //}
    };

    onKeyUp = (e) => {
        const { currentTarget, keyCode } = e;
        const { onCustomValue, onKeyUp } = this.props;
        if (keyCode === 13) {
            const value = currentTarget.value.trim();
            onCustomValue(value);
        }

        if (onKeyUp) {
            onKeyUp(e);
        }
    };

    setRef = e => this.ac = e;

    render() {
        const {
            onChange, filterResult,
            props: { multiple, dropdown, displayField, children, placeholder, title,
                className, style, size, maxLength, scrollHeight, disabled, onCustomValue,
                autoFocus, onKeyUp, onFocus, onBlur, onSelect, onShow, onHide },
            state: { value, list }
        } = this;

        return (
            <AutoComplete ref={this.setRef} appendTo={document.body} multiple={multiple}
                itemTemplate={children} dropdown={dropdown} field={displayField} placeholder={placeholder}
                tooltip={title} className={className} style={style} size={size} maxlength={maxLength}
                scrollHeight={scrollHeight} disabled={disabled} value={value} onChange={onChange}
                suggestions={list} completeMethod={filterResult} autoFocus={autoFocus}
                onKeyUp={onCustomValue ? this.onKeyUp : onKeyUp} onFocus={onFocus} onBlur={onBlur}
                onSelect={onSelect} onShow={onShow} onHide={onHide} />
        );
    }
}

export default AC;