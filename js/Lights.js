import React from 'react';

var LightGroup = React.createClass( {
    render() {
        console.log("Rendering Group: " + this.props.group['name']);
        var name = this.props.group['name'];
        return (
            <div className='light_group'>
                <span>{ name }</span>
            </div>
        );
    }
} );

var LightGroupList = React.createClass( {
    render() {
        var {groups, lights} = this.props;

        return (
            <div className='light_group_list'>
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


// Connect to the lights namespace of the backend.
var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + '/lights');

var Lights = React.createClass( {
    getInitialState() {
        return {groups: null, lights: null};
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
        console.log("Received lights msg...");
        if (msg.id == 'HUE') {
            console.log("Received HUE update!");
            var {groups, lights} = this.state;

            groups = msg.data['groups'];
            lights = msg.data['lights'];

            console.log(groups);
            console.log(lights);

            this.setState({groups, lights});
        }
    },

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
} );

export default Lights;
