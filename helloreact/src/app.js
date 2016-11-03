import {Component} from 'react';
import ReactDom from 'react-dom';

class App extends Component {
    render() {
        return <div>Hello React</div>
    }
}

ReactDom.render(<App />, document.getElementById('root'));
