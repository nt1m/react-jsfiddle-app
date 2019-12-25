class JSFiddleApp extends React.Component {
  constructor() {
    super();
    this.apiURL = "https://jsfiddle.net/api/user/%{user}/demo/list.json";
    this.state = {
      data: [],
      currentFiddle: {
        name: "",
        description: "",
        url: undefined,
        index: 0
      }
    };
    this.onItemSelected = this.onItemSelected.bind(this);
  }
  getJSON(url, callback, error) {
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
    };
  }
  render() {
    return React.createElement("div", {
      className: "fiddle-container container"
    },
      FiddleList({
        data: this.state.data,
        selectedIndex: this.state.currentFiddle.index,
        onItemSelected: this.onItemSelected
      }),
      FiddleView({
        name: this.state.currentFiddle.name,
        description: this.state.currentFiddle.description,
        url: this.state.currentFiddle.url
      })
    );
  }
  onItemSelected(args) {
    if (args.index == this.state.currentFiddle.index) return;
    this.setState({currentFiddle: args});
  }
  componentDidMount() {
    this.apiURL = this.apiURL.replace("%{user}", this.props.user);
    this.apiURL += "?dummy=true";
    if (this.props.start) {
      this.apiURL += "&start=" + this.props.start;
    }
    if (this.props.limit) {
      this.apiURL += "&limit=" + this.props.limit;
    }
    this.getJSON(this.apiURL, (response) => {
      this.setState({
        data: response.list,
        currentFiddle: {
          name: response.list[0].title,
          description: response.list[0].description,
          url: response.list[0].url,
          index: 0
        }
      });
    }, () => {});
  }
}

class ListItem extends React.Component {
  constructor() {
    super();
    this.state = {
      selected: false
    };
    this.onClick = this.onClick.bind(this);
  }
  onClick() {
    var node = ReactDOM.findDOMNode(this);
    this.props.onItemSelected({
      name: this.props.name,
      description: this.props.fiddle.description,
      url: this.props.url,
      index: [].slice.call(node.parentNode.children).indexOf(node)
    });
    if (document.body.clientWidth < 600) {
      toggleViews();
    }
  }
  render() {
    return React.createElement("li", {
      onClick: this.onClick,
      "data-url": this.props.name,
      "aria-selected": this.props.index == this.props.selectedIndex
    },
      React.createElement("span", {
        className: "name"
      }, this.props.name),
      React.createElement("span", {
        className: "url"
      }, "http:" + this.props.url),
    );
  }
  componentDidMount() {
    var node = ReactDOM.findDOMNode(this);
    this.setState({selected: this.props.selectedIndex === [].slice.call(node.parentNode.children).indexOf(node)})
  }
};

function FiddleList({ data, selectedIndex, onItemSelected }) {
  var listNodes = data.map((value, index) => {
    return React.createElement(ListItem, {
      index,
      selectedIndex,
      onItemSelected,
      fiddle: value,
      url: value.url,
      name: value.title,
    });
  });
  return React.createElement("ul", {
    className: "list sidebar"
  }, listNodes);
}

function FiddleView({ name, description, url }) {
  return React.createElement("div", {
    className: "fiddle-view content"
  },
    React.createElement("h1", {}, name),
    React.createElement("p", {}, description),
    React.createElement("iframe", url ? {
      src: "https:" + url + "embedded/result/"
    } : { src: "about:blank" })
  );
}

ReactDOM.render(React.createElement(JSFiddleApp, {
  user: "ntim",
  start: 0,
  limit: 100,
}), document.getElementById("content"));
