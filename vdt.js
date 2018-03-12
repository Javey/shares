function Parser() {
    this.source = '';
    this.index = 0;
    this.length = 0;
}

Parser.prototype = {
    constructor: Parser,

    parse: function(source) {
        this.source = source;
        this.index = 0;
        this.length = this.source.length;

        var elements = [];

        while (this.index < this.length) {
            elements.push(this._parseElement());
        }

        return elements;
    },

    _parseElement() {
        this._expect('<');

        var ret = {
            type: 'Element'
        };
        // 记录开始位置
        var start = this.index;

        while (this.index < this.length) {
            // 遇到空格，/，>，则表示tagName解析完成
            if (this._char() === ' ' || this._char() === '/' || this._char() === '>') {
                break; 
            }
            this.index++;
        }

        // 截取开始位置到空格之间的字符串即为tagName
        ret.value = this.source.slice(start, this.index);

        ret.attributes = this._parseAttribute();

        if (this._char() === '/') {
            // <input />
            this.index++;
            this._expect('>');
        } else {
            this._expect('>');
            ret.children = this._parseChildren(ret);
        }

        return ret;
    },

    _parseAttribute() {
        var attrs = [];

        while (this.index < this.length) {
            var c = this._char();
            // 忽略空白字符
            if (c === ' ' || c === '\n') {
                this.index++;
                continue;
            }
            // 标签结束，则解析属性完成
            if (c === '/' || c === '>') break;

            var attr = {type: 'Attribute'};
            attr.name = this._parseAttributeName();
            // 这里只判断存在“=”的属性
            this._expect('=');
            attr.value = this._parseAttributeValue();

            attrs.push(attr);
        }
        
        return attrs;
    },

    _parseAttributeName() {
        var start = this.index;
        while (this.index < this.length) {
            if (this._char() === '=') {
                break;
            }
            this.index++;
        }

        return this.source.slice(start, this.index);
    },

    _parseAttributeValue() {
        if (this._char() === '{') {
            // 动态属性
            return this._parseExpression();
        } else {
            return this._parseText();
        }
    },

    _parseExpression() {
        this._expect('{');
        var start = this.index;

        while (this.index < this.length) {
            // 实际应用中，需要匹配js表达式中的括号，这里为了简单，省略了
            if (this._char() === '}') {
                break;
            }
            this.index++;
        }

        var ret = {type: 'Expression', value: this.source.slice(start, this.index)};
        this.index++;

        return ret;
    },

    _parseText() {
        this._expect('"');
        var start = this.index;

        while (this.index < this.length) {
            // 实际应用中，需要考虑单引号字符串，以及字符串中存在转义引号的情况
            if (this._char() === '"') {
                break;
            }
            this.index++;
        }

        var ret = {type: 'Text', value: this.source.slice(start, this.index)};
        this.index++;

        return ret;
    },

    _parseChildren(element) {
        var children = [],
            endTag = '</' + element.value + '>';

        while (this.index < this.length) {
            if (this._isExpect(endTag)) {
                break;
            }

            children.push(this._parseChild(endTag));
        }

        this._expect(endTag);

        return children;
    },

    _parseChild(endTag) {
        if (this._isExpect('{')) {
            // 动态内容 <div>{name}</div>
            return this._parseExpression();
        } else if (this._isExpect('<')) {
            // 新的元素 <div><span></span><div>
            return this._parseElement();
        } else {
            // 否则为文本字符串 
            // 1. <div>text</div>
            // 2. <div>text {name}</div>
            // 3. <div>text<span></span></div>
            var start = this.index;
            while (this.index < this.length) {
                if (this._isExpect(endTag) || this._isExpect('<') || this._isExpect('{')) {
                    break;
                }
                this.index++;
            }
            return {type: 'Text', value: this.source.slice(start, this.index)};
        }
    },

    _expect(str) {
        if (!this._isExpect(str)) {
            throw new Error('Expect ' + str);
        }
        this.index += str.length;
    },

    _isExpect(str) {
        return this.source.slice(this.index, this.index + str.length) === str
    },

    _char() {
        return this.source[this.index];
    }
};

function Stringifier() {

}

Stringifier.prototype = {
    constructor: Stringifier,

    stringify(ast) {
        var ret = '';

        ast.forEach(function(element) {
            ret += this._visit(element);
        }.bind(this));

        return ret;
    },

    _visit(element) {
        switch (element.type) {
            case 'Element':
                return this._visitElement(element);
            case 'Text':
                return this._visitText(element);
            case 'Expression':
                return this._visitExpression(element);
        }
    },

    _visitElement(element) {
        var attributes = this._visitAttribute(element);
        var children = this._visitChildren(element.children);
        return 'createVNode("' + element.value + '", ' + attributes + ', ' + children + ')';
    },

    _visitAttribute(element) {
        var ret = [];
        element.attributes.forEach(function(attr) {
            var value = this._visit(attr.value);
            ret.push('"' + attr.name + '": ' + value);
        }.bind(this));

        return '{' + ret.join(', ') + '}';
    },

    _visitChildren(elements) {
        var ret = [];

        elements.forEach(function(child) {
            ret.push(this._visit(child));
        }.bind(this));

        return '[' + ret.join(', ') + ']';
    },


    _visitText(element) {
        return '"' + element.value + '"';
    },

    _visitExpression(element) {
        return element.value; 
    }
};

var p = new Parser();
var s = new Stringifier();
function compile(source) {
    var ast = p.parse(source);
    var hscript = s.stringify(ast);

    hscript = [
        'data || (data = {});',
        'var createVNode = misstime.h',
        'return ' + hscript,
    ].join('\n');

    return new Function('data', hscript);
}

function Vdt(source) {
    if (!(this instanceof Vdt)) return new Vdt(source);

    this.template = compile(source);
    this.data = null;
    this.vNode = null;
    this.node = null;
}

Vdt.prototype = {
    constructor: Vdt,

    render(data) {
        this.data = data;
        this.vNode = this.template(this.data);
        this.node = misstime.render(this.vNode);

        return this.node;
    },

    update(data) {
        if (data !== undefined) {
            this.data = data;
        }
        var oldVNode = this.vNode;
        this.vNode = this.template(this.data);
        this.node = misstime.patch(oldVNode, this.vNode);

        return this.node;
    }
};



