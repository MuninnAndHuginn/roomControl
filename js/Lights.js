import React from 'react';

// Connect to the lights namespace of the backend.
var light_socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + '/lights');

$.LightsBackend = {
    groupCallbacks : {},
    fullUpdateCallback: null
}
    
$.LightsBackend.connected = function() {
    console.log("Connected to lights backend!");
};

$.LightsBackend.disconnected = function() {
    console.log("Disconnected from lights backend!");
};

$.LightsBackend.registerGroupCallback = function(id, fn) {
    $.LightsBackend.groupCallbacks[id] = fn;
};

$.LightsBackend.registerFullUpdateCallback = function(fn) {
    $.LightsBackend.fullUpdateCallback = fn;
};

$.LightsBackend.processGroupsUpdate = function(groups) {
    for (let group of groups) {
        if ($.LightsBackend.groupCallbacks[group.id]) {
            $.LightsBackend.groupCallbacks[group.id](group);
        }
    }
};

$.LightsBackend.processFullUpdate = function(groups, lights) {
    if ($.LightsBackend.fullUpdateCallback) {
        $.LightsBackend.fullUpdateCallback(groups, lights);
    }
    $.LightsBackend.processGroupsUpdate(groups);
};

$.LightsBackend.handleGroupUpdate = function(msg) {
    var id = msg['id'];
    var group = msg;
    if ($.LightsBackend.groupCallbacks[id]) {
        $.LightsBackend.groupCallbacks[id](group);
    }
};

$.LightsBackend.handleEvent = function(msg) {
    if (msg.id == 'HUE') {
        $.LightsBackend.processFullUpdate(msg.data['groups'], msg.data['lights']);
    }
};

light_socket.on('group_update', $.LightsBackend.handleGroupUpdate)
light_socket.on('event', $.LightsBackend.handleEvent)
light_socket.on('connect', $.LightsBackend.connected);
light_socket.on('disconnect', $.LightsBackend.disconnected);

class LightGroup extends React.Component {
    constructor(props) {
        super(props);
        var isOn=false, myId=null, color="D3D3D3", name="UNK";

        name = props.group['name'];
        color = props.group['action'].color;
        var anyon = (props.group['state'].any_on == true);
        var allon = (props.group['state'].all_on == true);
        // Assume on, check just below.
        isOn = true;

        myId = props.group['id'];

        // If we are partially on, add some **.
        if (!allon && anyon) {
            name = name + '**';
        }

        // If we are not on, set to grey.
        if (!anyon) {
            isOn = false;
        }

        this.state = {isOn: isOn, myId: myId, name: name, color: color};

        this.handleClick = this.handleClick.bind(this);
        this.handleGroupUpdate = this.handleGroupUpdate.bind(this);

        $.LightsBackend.registerGroupCallback(this.state.myId, this.handleGroupUpdate);
   }

    handleClick() {
        // Send the opposite of the current on state.
        var wantState = !this.state.isOn;
        var myId = this.state.myId;
        light_socket.emit('group_click', {id: myId, on: wantState});
    }

    handleGroupUpdate(group) {
        var {isOn, myId, name, color} = this.state;

        name = group.name;
        color = group.action.color;
        var anyon = (group.state.any_on == true);
        var allon = (group.state.all_on == true);

        // Assume on, check just below.
        isOn = true;

        // If we are partially on, add some **.
        if (!allon && anyon) {
            name = name + '**';
        }

        // If we are not on, set to grey.
        if (!anyon) {
            isOn = false;
        }

        this.setState({isOn, myId, name, color});
    }

    render() {
        var {isOn, myId, name, color} = this.state;

        var setColor = "#" + color;
        var decorate = 'none';

        if (!isOn) {
            setColor = "#D3D3D3";
            decorate = 'line-through';
        }
        
        return (
            <div style={{backgroundColor: setColor}} onClick={this.handleClick} className='light_group'>
                <span style={{textDecoration: decorate}}>{ name }</span>
            </div>
        );
    }
}

var LightGroupList = React.createClass( {
    render() {
        var {groups, lights} = this.props;

        return (
            <div style={{width:'150px'}} className='light_group_list'>
                <h4>Light Groups</h4>
                {

                    groups.map(function(group, lights){
                        return (
                            <LightGroup key={group.id} group={group} lights={lights} />
                        );
                    })
                }
            </div>
        );
    }
} );


class Lights extends React.Component {
    constructor(props) {
        super(props);

        this.handleFullUpdate = this.handleFullUpdate.bind(this);
        $.LightsBackend.registerFullUpdateCallback(this.handleFullUpdate);

        this.state = {groups: null, lights: null};
    }

    handleFullUpdate(_groups, _lights) {
        var {groups, lights} = this.state;

        groups = _groups;
        lights = _lights;

        this.setState({groups, lights});
    }

    render() {
        if (null != this.state.groups) {
            return (
                <div>
                    <LightGroupList
                        groups={this.state.groups}
                        lights={this.state.lights}
                    />
                </div>
            );
        }
        else {
            return <h4>Waiting for lighting update...</h4>
        }
    }
}

export default Lights;
