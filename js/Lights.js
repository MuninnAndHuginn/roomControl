import React from 'react';

// Connect to the lights namespace of the backend.
var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + '/lights');

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
        this.handleMainEvent = this.handleMainEvent.bind(this);
        this.handleGroupUpdate = this.handleGroupUpdate.bind(this);
        socket.on('group_update', this.handleGroupUpdate)

        props.groupCallbackFn(this.state.myId, this.handleMainEvent);
   }

    handleClick() {
        // Send the opposite of the current on state.
        var wantState = !this.state.isOn;
        var myId = this.state.myId;
        socket.emit('group_click', {id: myId, on: wantState});
    }

    handleMainEvent(group) {
        var {isOn, myId, name, color} = this.state;
        
        if (group.id == myId) {
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
    }

    handleGroupUpdate(msg) {
        var {isOn, myId, name, color} = this.state;
        if (msg.id == myId) {
            name = msg.name;
            color = msg.action.color;
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
        var {groups, lights, groupCallbackFn} = this.props;

        return (
            <div style={{width:'150px'}} className='light_group_list'>
                <h4>Light Groups</h4>
                {

                    groups.map(function(group, lights){
                        return (
                            <LightGroup groupCallbackFn={groupCallbackFn} key={group.id} group={group} lights={lights} />
                        );
                    })
                }
            </div>
        );
    }
} );


var Lights = React.createClass( {
    getInitialState() {
        return {groups: null, lights: null, groupCallbacks: {}};
    },

    componentDidMount() {
        socket.on('connect', this._connected);
        socket.on('event', this._handleEvent);
        socket.on('disconnect', this._disconnected);
    },

    _connected() {
        console.log("Connected to lights backend!");
    },

    _disconnected() {
        console.log("Disconnected from lights backend!");
    },

    _handleEvent(msg) {
        if (msg.id == 'HUE') {
            var {groups, lights, groupCallbacks} = this.state;

            groups = msg.data['groups'];
            lights = msg.data['lights'];

            for (let group of groups) {
                if (groupCallbacks[group.id]) {
                    groupCallbacks[group.id](group);
                }
            }

            this.setState({groups, lights, groupCallbacks});
       }
    },

    groupChildRegisterForUpdates(id, callback) {
        this.state.groupCallbacks[id] = callback;
    },

    render() {
        if (null != this.state.groups) {
            return (
                <div>
                    <LightGroupList
                        groupCallbackFn={this.groupChildRegisterForUpdates}
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
} );

export default Lights;
