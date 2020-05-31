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
                lat: 120,
                lng: 23,
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
            }
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
        doCopy: function (msg) {
            this.$copyText(msg).then(function (e) {
                alert('Copied')
                console.log(e)
            }, function (e) {
                alert('Can not copy')
                console.log(e)
            })
        }
    },
    mounted: function () {
        this.user.dialog = true;
    },
})

// 建立 Leaflet 地圖
var map = L.map('mapid');
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    // attribution: '&copy; <a href="https://github.com/SP12893678/SP12893678.github.io">SP12893678.github</a>',
    maxNativeZoom: 19,
    maxZoom: 25,
    enableHighAccuracy: true
}).addTo(map);
map.locate({ setView: true, watch: true });
// 設定經緯度座標
map.setView(new L.LatLng(23.501858272317656, 120.8221435546875), 8);