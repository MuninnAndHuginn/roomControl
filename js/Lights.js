import React from 'react';

// Connect to the lights namespace of the backend.
var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + '/lights');

class LightsBackend {
   
    constructor(socket) {
        this.groupCallbacks = {};
        this.fullUpdateCallback = null;

        socket.on('group_update', this.handleGroupUpdate)
        socket.on('event', this.handleEvent)
        socket.on('connect', this.connected);
        socket.on('disconnect', this.disconnected);
    }
   
    connected() {
        console.log("Connected to lights backend!");
    }

    disconnected() {
        console.log("Disconnected from lights backend!");
    }


    registerGroupCallback(id, fn) {
        this.groupCallbacks[id] = fn;
    }

    registerFullUpdateCallback(fn) {
        this.fullUpdateCallback = fn;
    }

    processGroupsUpdate(groups) {
        for (let group of groups) {
            if (this.groupCallbacks[group.id]) {
                this.groupCallbacks[group.id](group);
            }
        }
    }

    processFullUpdate(groups, lights) {
        if (this.fullUpdateCallback) {
            this.fullUpdateCallback(groups, lights);
        }

        this.processGroupsUpdate(groups);
    }

    handleGroupUpdate(msg) {
        var id = msg['id'];
        var group = msg;
        if (this.groupCallbacks[id]) {
            this.groupCallbacks[id](group);
        }
    }

    handleEvent(msg) {
        if (msg.id == 'HUE') {
            this.processFullUpdate(msg.data['groups'], msg.data['lights']);
        }
    }
}

// Used by the React components to listen for event updates.
var lbe = new LightsBackend(socket);

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

        lbe.registerGroupCallback(this.state.myId, this.handleGroupUpdate);
   }

    handleClick() {
        // Send the opposite of the current on state.
        var wantState = !this.state.isOn;
        var myId = this.state.myId;
        socket.emit('group_click', {id: myId, on: wantState});
    }

    handleGroupUpdate(group) {
        var {isOn, myId, name, color} = this.state;

        name = group.name;
        color = group.action.color;
        var anyon = (msg.state.any_on == true);
        var allon = (msg.state.all_on == true);

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
        lbe.registerFullUpdateCallback(this.handleFullUpdate);

        this.state = {groups: null, lights: null};
    }

    handleFullUpdate(groups, lights) {
        var {groups, lights} = this.state;

        groups = groups;
        lights = lights;

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
