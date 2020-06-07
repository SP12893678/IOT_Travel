
class doCopy {
    constructor(textToCopy) {
        this.copied = false;
        var textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            var successful = document.execCommand('copy');
            this.copied = true;
        }
        catch (err) {
            this.copied = false;
        }
        textarea.remove();
    }
}
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

// L.marker([23.501858272317656, 120.8221435546875], { icon: getLIcon("rat") }).addTo(map).bindPopup("I am a green leaf.");

// map.setView(new L.LatLng(23.501858272317656, 120.8221435546875), 8);

function onLocationFound(e) {
    app.user.lat = e.latlng.lat;
    app.user.lng = e.latlng.lng;
    console.log(app.user.lat, app.user.lng)
}

function onLocationError(e) {

}

map.on('locationerror', onLocationError);
map.on('locationfound', onLocationFound);

var app = new Vue({
    el: '#app',
    vuetify: new Vuetify(),
    data() {
        return {
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
                result: false,
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
                await this.checkLogin()
                    .then((returnVal) => { console.log('<--finish checkLogin-->'); })
                    .catch(err => console.log("Axios err: ", err));
                console.log('click')
                this.login.loading = false;
                if (this.login.result) {
                    this.user.dialog = false;
                    this.room.dialog = true;
                }
                else {
                    this.msg.title = "Error"
                    this.msg.content = "Login Failed";
                    this.msg.dialog = true;
                }
            }
            else
                this.login.loading = false;
        },
        SignUp: async function () {
            this.signup.loading = true;
            if (this.$refs.signup_form.validate()) {
                await this.checkSignUp()
                    .then((returnVal) => { console.log('<--finish checkSignUp-->'); })
                    .catch(err => console.log("Axios err: ", err));
                // console.log('click')
                this.signup.loading = false;
                if (this.signup.result) {
                    this.msg.title = "Successed"
                    this.msg.content = "Sign Up Successed";
                    this.msg.dialog = true;
                    this.user.tab = 0;
                }
                else {
                    this.msg.title = "Error"
                    this.msg.content = "Sign Up Failed";
                    this.msg.dialog = true;
                }
            }
            else
                this.signup.loading = false;
        },
        CreateRoom: async function () {
            await this.getRoomKey()
                .then((returnVal) => { console.log('<--finish getRoomKey-->'); })
                .catch(err => console.log("Axios err: ", err));
            this.EnterRoom();
        },
        EnterRoom: async function () {
            if (this.$refs.room_form.validate()) {
                await this.checkEnterRoom()
                    .then((returnVal) => { console.log('<--finish checkEnterRoom-->'); })
                    .catch(err => console.log("Axios err: ", err));
                if (this.room.enter)
                    this.getRoomData();
                this.updatedData();
            }
        },
        updatedData: async function () {

            var timeoutID = setInterval((async function () {
                app.checkEnterRoom()
                    .then((returnVal) => { console.log('<--finish checkEnterRoom-->'); })
                    .catch(err => console.log("Axios err: ", err));
                await app.getRoomData()
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
        checkSignUp: function () {
            return axios.get('./php/travel.php', { params: { type: "sign_up", icon: this.user.icon, name: this.user.name, account: this.user.account, password: this.user.password } })
                .then((res) => {
                    console.log(res.data);
                    this.signup.result = res.data;
                })
                .catch((error) => { console.error(error) })
        },
        checkLogin: function () {
            return axios.get('./php/travel.php', { params: { type: "login", account: this.user.account, password: this.user.password } })
                .then((res) => {
                    console.log(res.data);
                    this.user.name = res.data.name;
                    this.user.icon = res.data.icon;
                    this.user.account = res.data.account;
                    this.login.result = res.data.result;
                })
                .catch((error) => { console.error(error) })
        },
        getRoomKey: function () {
            return axios.get('./php/travel.php', { params: { type: "creat_room", } })
                .then((res) => {
                    console.log(res.data);
                    this.room.key = res.data;
                })
                .catch((error) => { console.error(error) })
        },
        checkEnterRoom: function () {
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
                this.room.enter = res.data;
                this.room.dialog = (!this.room.enter);
            }).catch((error) => { console.error(error) })
        },
        getRoomData: function () {
            return axios.get('./php/travel.php', {
                params:
                {
                    type: "room_data",
                    roomkey: this.room.key,
                }
            }).then((res) => {
                // console.log(JSON.parse(res.data.data));
                // console.log(res.data);
                this.room.result = res.data.result;
                this.room.members = JSON.parse(res.data.data);
            }).catch((error) => { console.error(error) })
        },
        copyToClipboard: function (copyText) {
            new doCopy(copyText);
        },
        viewMember: function (account) {
            var view_member = this.room.members.find(member => member.account == account);
            this.info.dialog = false;
            map.setView(new L.LatLng(view_member.lat, view_member.lng), 14);
        },
        leavePage: function () {
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

        }
    },
    mounted: function () {
        this.user.dialog = true;
    },
    created: function () {
        $(window).bind('beforeunload', async function (e) {
            await app.leavePage();
        })
    },
    beforeDestroy: function () {
        this.leavePage();
    },
    // destroyed() {
    //     window.removeEventListener('beforeunload', this.leavePage)
    // },
})


var id, target, options;

function success(pos) {
    var crd = pos.coords;
    console.log(pos)
    // 取得經緯度
    console.log(pos.coords.latitude)
    console.log(pos.coords.longitude)
    app.user.lat = pos.coords.latitude;
    app.user.lng = pos.coords.longitude;

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
