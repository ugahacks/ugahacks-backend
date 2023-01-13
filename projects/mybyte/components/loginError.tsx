import React from "react";

interface ErrorDetails {
    show: boolean,
    text:string
}

class loginError extends React.Component<ErrorDetails> {
    constructor(props: ErrorDetails) {
        super(props);
    }

    render() {
        return (
            <div className={`rounded-xl bg-red-200 mx-4 text-center py-2 mb-5 ${(this.props.show) ? "visible" : "collapse"}`}>
                <span>{this.props.text}</span>
            </div>
        );
    };
}

export default loginError;