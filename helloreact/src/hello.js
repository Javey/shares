import React, {Component} from 'react';
import ReactDom from 'react-dom';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {date: new Date()};
        this.timer = setInterval(() => {this.setState({date: new Date()})}, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        return <div onClick={function() {console.log(this)}}>
            Hello {this.props.name}
            <br />
            Now: {this.state.date.toLocaleTimeString()}
        </div>
    }
}

ReactDom.render(<App name="React"/>, document.getElementById('root'));
