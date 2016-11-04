import React, {Component} from 'react';
import ReactDom from 'react-dom';

class TodoItem extends Component {
    render() {
        return <li>
            <span>{this.props.name}</span>
            <span onClick={this.props.onDelete}>删除</span>
        </li>
    }
}

class TodoList extends Component {
    render() {
        return <ul>
            {this.props.list.map((item, index) => {
                return <TodoItem name={item.name} 
                    onDelete={this.props.onDelete.bind(this, index)} 
                    key={item.id}
                />
            })}
        </ul>
    }
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: []
        };
    }

    add(e) {
        e.preventDefault();
        this.setState({
            list: this.state.list.concat([{
                id: new Date().getTime(),
                name: this.input.value
            }])
        });
    }

    delete(index) {
        this.state.list.splice(index, 1)
        this.forceUpdate();
    }

    render() {
        return <div>
            <form onSubmit={this.add.bind(this)}>
                <input type="text" ref={(input) => this.input = input}/>
            </form>
            <TodoList list={this.state.list} onDelete={this.delete.bind(this)}/>
        </div>
    }
}

ReactDom.render(<App />, document.getElementById('root'));
