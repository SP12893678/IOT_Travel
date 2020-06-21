// 建立 Leaflet 地圖
var map = L.map('mapid');
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    // attribution: '&copy; <a href="https://github.com/SP12893678/SP12893678.github.io">SP12893678.github</a>',
    maxNativeZoom: 19,
    maxZoom: 25,
    enableHighAccuracy: true
}).addTo(map);
map.locate({ setView: true, watch: false });
// 設定經緯度座標
// map.setView(new L.LatLng(23.501858272317656, 120.8221435546875), 8);

function getLIcon(icon) {
    return L.icon({
        iconUrl: './res/img/' + icon + '_marker.png',

        iconSize: [32.8, 47.5], // size of the icon
        iconAnchor: [16.4, 47.5], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -47.5] // point from which the popup should open relative to the iconAnchor
    });
}

var id, target, options;

function success(pos) {
    var crd = pos.coords;
    app.user.lat = pos.coords.latitude;
    app.user.lng = pos.coords.longitude;
    console.log(app.user.lat + "." + app.user.lng)
    if (target.latitude === crd.latitude && target.longitude === crd.longitude) {
        console.log('Congratulations, you reached the target');
        navigator.geolocation.clearWatch(id);
    }
}

function error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
}

target = {
    latitude: 0,
    longitude: 0
};

options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

id = navigator.geolocation.watchPosition(success, error, options);


var app = new Vue({
    el: '#app',
    vuetify: new Vuetify(),
    data() {
        return {
            tooltip: {
                show: false,
                content: null,
            },
            updateId: null,
            copyId: null,
            bottomNav: 'nearby',
            icons: ["rat", "bull", "tiger", "rabbit", "dragon", "snake", "horse", "goat", "monkey", "chicken", "dog", "pig"],
            login: {
                loading: false,
                pwshow: false,
                result: false,
                valid: true,
            },
            signup: {
                loading: false,
                pwshow: false,
                result: false,
                valid: true,
            },
            user: {
                name: null,
                account: null,
                password: null,
                icon: "rat",
                lat: 23,
                lng: 120,
                tab: null,
                dialog: false,
            },
            room: {
                dialog: false,
                key: null,
                enter: false,
                members: [],
                valid: true,
            },
            msg: {
                dialog: false,
                title: "error",
                content: "error message",
            },
            info: {
                dialog: false,
            },
            rules: {
                required: value => !!value || 'Required.',
            },
            markers: [{
                account: null,
                marker: null,
            }],
        }
    },
    methods: {
        Login: async function () {
            this.login.loading = true;
            if (this.$refs.login_form.validate()) {
                await this.post_SignIn()
                    .then((returnVal) => { console.log('<--finish Login-->'); })
                    .catch(err => console.log("Axios err: ", err));
                this.login.loading = false;
                if (this.login.result) {
                    this.tooltip.content = "Login Successed!";
                    this.tooltip.show = true;
                    this.copyId = window.setTimeout((() => app.tooltip.show = false), 1500);
                    this.user.dialog = false;
                    this.room.dialog = true;
                    this.EnterRoom();
                }
                else {
                    this.msg.title = "Error"
                    this.msg.dialog = true;
                }
            }
            else
                this.login.loading = false;
        },
        SignUp: async function () {
            this.signup.loading = true;
            if (this.$refs.signup_form.validate()) {
                await this.post_SignUp()
                    .then((returnVal) => { console.log('<--finish SignUp-->'); })
                    .catch(err => console.log("Axios err: ", err));
                this.signup.loading = false;
                if (this.signup.result) {
                    this.msg.title = "Successed"
                    this.msg.content = "Sign Up Successed";
                    this.msg.dialog = true;
                    this.user.tab = 0;
                }
                else {
                    this.msg.title = "Error"
                    this.msg.dialog = true;
                }
            }
            else
                this.signup.loading = false;
        },
        Logout: async function () {
            this.user.password = null;
            this.room.dialog = false;
            this.user.dialog = true;
        },
        CreateRoom: async function () {
            await this.post_CreatRoom()
                .then((returnVal) => { console.log('<--finish getRoomKey-->'); })
                .catch(err => console.log("Axios err: ", err));
            this.EnterRoom();
        },
        EnterRoom: async function () {
            if (this.room.key != null && this.room.key != "") {
                await this.post_EnterRoom()
                    .then((returnVal) => { console.log('<--finish EnterRoom-->'); })
                    .catch(err => console.log("Axios err: ", err));
                if (this.room.enter)
                    this.post_GetRoomData();
                this.updatedData();
            }
        },
        ExitRoom: async function () {
            if (this.room.key != null) {
                clearInterval(this.updateId);
                await this.post_LeaveRoom();
                this.room.key = null;
                this.room.enter = false;
                this.room.dialog = true;
            }
        },
        async updatedData() {
            this.updateId = setInterval((async function () {
                app.post_EnterRoom()
                    .then((returnVal) => { console.log('<--finish EnterRoom-->'); })
                    .catch(err => console.log("Axios err: ", err));
                await app.post_GetRoomData()
                    .then((returnVal) => { console.log('<--finish getRoomData-->'); })
                    .catch(err => console.log("Axios err: ", err));
                app.room.members.forEach(member => {
                    if (app.markers.find(marker => marker.account === member.account) != null) {
                        app.markers.find(marker => marker.account === member.account).marker.setLatLng(new L.LatLng(member.lat, member.lng));
                    }
                    else {
                        var marker = L.marker([member.lat, member.lng], { icon: getLIcon(member.icon) }).addTo(map).bindPopup(member.name);
                        app.markers.push({ account: member.account, marker: marker });
                    }
                });

            }), 5000);
        },
        viewMember: function (account) {
            var view_member = this.room.members.find(member => member.account == account);
            this.info.dialog = false;
            map.setView(new L.LatLng(view_member.lat, view_member.lng), 16);
        },
        copyRoomKey() {
            let textToCopy = this.$refs.roomkey.$el.querySelector('input')
            textToCopy.select()
            document.execCommand("copy");
            if (window.getSelection) { window.getSelection().removeAllRanges(); }
            else if (document.selection) { document.selection.empty(); }

            this.tooltip.show = false;
            clearTimeout(this.copyId);
            this.tooltip.content = "Copy!";
            this.tooltip.show = true;
            this.copyId = window.setTimeout((() => app.tooltip.show = false), 1500);
        },
        /*
        * Post to server function
        */
        post_SignIn: function () {
            return axios.get('./php/travel.php', { params: { type: "sign_in", account: this.user.account, password: this.user.password } })
                .then((res) => {
                    console.log(res.data);
                    this.login.result = (res.data.result == 'true');
                    if (this.login.result) {
                        this.user.name = res.data.data.name;
                        this.user.icon = res.data.data.icon;
                        this.user.account = res.data.data.account;
                        this.room.key = res.data.data.room;
                    }
                    else {
                        this.msg.content = res.data.error;
                    }
                })
                .catch((error) => { console.error(error) })
        },
        post_SignUp: function () {
            return axios.get('./php/travel.php', { params: { type: "sign_up", icon: this.user.icon, name: this.user.name, account: this.user.account, password: this.user.password } })
                .then((res) => {
                    console.log(res.data);
                    this.signup.result = (res.data.result == 'true');
                    if (!this.signup.result)
                        this.msg.content = res.data.error;
                })
                .catch((error) => { console.error(error) })
        },
        post_CreatRoom: function () {
            return axios.get('./php/travel.php', { params: { type: "creat_room", } })
                .then((res) => {
                    console.log(res.data);
                    if ((res.data.result == 'true'))
                        this.room.key = res.data.key;
                    else {
                        this.msg.title = "Error"
                        this.msg.content = res.data.error;
                        this.msg.dialog = true;
                    }
                })
                .catch((error) => { console.error(error) })
        },
        post_EnterRoom: function () {
            return axios.get('./php/travel.php', {
                params:
                {
                    type: "enter_room",
                    roomkey: this.room.key,
                    account: this.user.account,
                    name: this.user.name,
                    icon: this.user.icon,
                    lat: this.user.lat,
                    lng: this.user.lng,
                }
            }).then((res) => {
                console.log(res.data);
                this.room.enter = res.data.result;
                this.room.dialog = (!this.room.enter);
            }).catch((error) => { console.error(error) })
        },
        post_GetRoomData: function () {
            return axios.get('./php/travel.php', {
                params:
                {
                    type: "read_room",
                    roomkey: this.room.key,
                }
            }).then((res) => {
                // console.log(JSON.parse(res.data.data));
                // console.log(res.data);
                if (res.data.result)
                    this.room.members = JSON.parse(res.data.data);
            }).catch((error) => { console.error(error) })
        },
        post_LeaveRoom: function () {
            if (this.room.key != null)
                return axios.get('./php/travel.php', {
                    params:
                    {
                        type: "exit_room",
                        roomkey: this.room.key,
                        account: this.user.account
                    }
                }).then((res) => {
                    // console.log(res.data);
                }).catch((error) => { console.error(error) })
        },
    },
    mounted: function () {
        this.user.dialog = true;
    },
    created: function () {
        $(window).bind('beforeunload', async function (e) {
            await app.leaveRoom();
        })
    },
    beforeDestroy: function () {
        this.leaveRoom();
    },
})
