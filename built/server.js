"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MRE = __importStar(require("@microsoft/mixed-reality-extension-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = require("path");
const app_1 = __importDefault(require("./app"));
const express_1 = __importDefault(require("express"));
const path_2 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const upload = multer_1.default({ dest: __dirname + '/../public/uploads/images' });
const app = express_1.default();
const port = 80;
app.use(express_1.default.urlencoded());
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.sendFile(path_2.default.join(__dirname + '/../public/index2.html'));
});
app.post('/post', (req, res) => {
    res.send('saved');
});
app.use(express_1.default.static('public'));
app.post('/upload', upload.single('photo'), (req, res) => {
    if (req.file) {
        const picName = req.body['picName'];
        const regex = /^\w{1,}$/u;
        if (!regex.test(picName)) {
            fs_1.default.unlink(req.file.path, () => { });
            throw 'please name the picture just with letters and underscores';
        }
        const oldPath = req.file.path;
        const newPath = __dirname + "/../public/uploads/images/" + picName + ".png";
        fs_1.default.writeFile(__dirname + "/../public/uploads/images/" + picName + ".json", JSON.stringify({
            width: parseInt(req.body['width']),
            height: parseInt(req.body['height'])
        }), () => { });
        fs_1.default.rename(oldPath, newPath, () => { });
        res.send('Upload succesful' + '.\n Picture is saved under name: ' + picName);
        //res.json(req.file);
    }
    else {
        throw 'error';
    }
});
app.listen(port, () => {
    //console.log(`Example app listening at http://localhost:${port}`)
});
//-------------------------------setting picture uploader
//-------------------------------end of picture upload
// add some generic error handlers here, to log any exceptions we're not expecting
//process.on('uncaughtException', err => console.log('uncaughtException', err));
//process.on('unhandledRejection', reason => console.log('unhandledRejection', reason));
// Read .env if file exists
dotenv_1.default.config();
// This function starts the MRE server. It will be called immediately unless
// we detect that the code is running in a debuggable environment. If so, a
// small delay is introduced allowing time for the debugger to attach before
// the server starts accepting connections.
function runApp() {
    // Start listening for connections, and serve static files.
    const server = new MRE.WebHost({
        baseDir: path_1.resolve(__dirname, '../public')
    });
    // Handle new application sessions
    server.adapter.onConnection(context => new app_1.default(context));
}
// Check whether code is running in a debuggable watched filesystem
// environment and if so, delay starting the app by one second to give
// the debugger time to detect that the server has restarted and reconnect.
// The delay value below is in milliseconds so 1000 is a one second delay.
// You may need to increase the delay or be able to decrease it depending
// on the speed of your machine.
const delay = 1000;
const argv = process.execArgv.join();
const isDebug = argv.includes('inspect') || argv.includes('debug');
if (isDebug) {
    setTimeout(runApp, delay);
}
else {
    runApp();
}
//# sourceMappingURL=server.js.map