var JSFiddleApp = React.createClass({
  getInitialState: function() {
    return {
      data: [],
      currentFiddle: {
        name: "",
        description: "",
        url: "about:blank",
        index: 0
      }
    };
  },
  render: function() {
    return (<div className="fiddle-container container">
              <FiddleList data={this.state.data} selectedIndex={this.state.currentFiddle.index} onItemSelected={this.onItemSelected}/>
              <FiddleView name={this.state.currentFiddle.name} description={this.state.currentFiddle.description} url={this.state.currentFiddle.url}/>
            </div>)
  },
  apiURL: "http://jsfiddle.net/api/user/%{user}/demo/list.json",
  getJSON: function(callback, error) {
	var url = this.apiURL;
    var callbackName = "jsonp_callback_" + Math.round(100000 * Math.random());
    window[callbackName] = function(data) {
      delete window[callbackName];
      document.body.removeChild(script);
      callback(data);
    };

    var script = document.createElement("script");
    script.src = url + (url.indexOf("?") >= 0 ? "&" : "?") + "callback=" + callbackName;
    document.body.appendChild(script);

    script.onerror = function() {
      error();
    }
  },
  onItemSelected: function(args) {
    if(args.index == this.state.currentFiddle.index) return;
    this.setState({currentFiddle: args});
  },
  componentDidMount: function() {
	this.apiURL = this.apiURL.replace("%{user}", this.props.user);
	if (this.props.start) {
		this.apiURL += "?start=" + this.props.start;
	}
	if (this.props.limit) {
		this.apiURL += "&limit=" + this.props.limit;
	}
    this.getJSON(function(response) {
      this.setState({
        data: response.list,
        currentFiddle: {
          name: response.list[0].title,
          description: response.list[0].description,
          url: response.list[0].url,
          index: 0
        }
      });
    }.bind(this), function() {});
  }
});
var ListItem = React.createClass({
  getInitialState: function() {
    return {
      selected: false
    }
  },
  onClick: function() {
    var node = this.getDOMNode();
    this.props.onItemSelected({
      name: this.props.name,
      description: this.props.fiddle.description,
      url: this.props.url,
      index: [].slice.call(node.parentNode.children).indexOf(node)
    });
	if (document.body.clientWidth < 600) {
	  toggleViews();
	}
  },
  render: function() {
    return (<li onClick={this.onClick} data-url={this.props.name} aria-selected={this.props.index == this.props.selectedIndex}>
              <span className="name">{this.props.name}</span>
              <span className="url">{"http:" + this.props.url}</span>
            </li>);
  },
  componentDidMount: function() {
    var node = this.getDOMNode();
    this.setState({selected: this.props.selectedIndex === [].slice.call(node.parentNode.children).indexOf(node)})
  }
});
var FiddleList = React.createClass({
  render: function() {
    var listNodes = this.props.data.map(function(value, index) {
      return (<ListItem index={index} selectedIndex={this.props.selectedIndex} onItemSelected={this.props.onItemSelected} fiddle={value} url={value.url} name={value.title}/>)
    }.bind(this));
    return (<ul className="list sidebar">{listNodes}</ul>)
  },

});

var FiddleView = React.createClass({
  render: function() {
    this.state = {
      name: "",
      description: ""
    }
    return (<div className="fiddle-view content">
      <h1>{this.props.name}</h1>
      <p>{this.props.description}</p>
      <iframe src={"http:" + this.props.url + "embedded/result/"}></iframe>
  
    </div>)
  }
});

React.render(<JSFiddleApp user="ntim" start="0" limit="100"/>, $("#content"));
function $(selector) {
  return document.querySelector(selector);
}