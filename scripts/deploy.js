var pluginsWithoutVariables = [
  'cordova-plugin-whitelist',
  'cordova-plugin-device',
  'cordova-plugin-splashscreen',
  'cordova-plugin-ionic-webview',
  'cordova-plugin-camera'
];
var appVersion = '1.0';

var fs = require('fs');
var rimraf = require('rimraf');
var childProcess = require('child_process');
console.log(
  'Removing node_modules, platforms and plugins folders for clean build.'
);
rimraf.sync('./platforms');
rimraf.sync('./plugins');
//rimraf.sync("./node_modules");

// Prepare config file
var platform = process.argv[2];
var buildType = process.argv[3];
var buildNumber = childProcess
  .execSync('git rev-list HEAD --count')
  .toString()
  .replace(/\n|\r/g, '');
console.log(
  'Preparing ' +
    buildType +
    ' version of the ' +
    platform +
    ' app with build number ' +
    buildNumber +
    '.'
);
var bundleIdentifier;
switch (buildType) {
  case 'dev':
    bundleIdentifier = 'robagusta.flowrobe';
    break;
  case 'production':
    bundleIdentifier = 'robagusta.flowrobe';
    break;
  default:
    bundleIdentifier = 'robagusta.flowrobe';
    break;
}
var configXML = fs.readFileSync('config.xml', 'utf8');
var newConfigXML = updateConfigXML(
  configXML,
  bundleIdentifier,
  appVersion + '.' + buildNumber
);
fs.writeFileSync('config.xml', newConfigXML);
// INSTALLING NODE MODULE
console.log('Installing node modules');
childProcess.execSync('yarn');
// INSTALL PLUGINS
console.log('Installing all plugins');
var pluginList = '';
pluginsWithoutVariables.forEach(entry => {
  pluginList += ' ' + entry;
});
childProcess.execSync('ionic cordova plugin add ' + pluginList);
childProcess.execSync(
  'ionic cordova plugin add cordova-mobilepay-appswitch --variable=URL_SCHEME=flowrobemobilepay --variable=WIDGET_ID=' +
    bundleIdentifier
);

if (platform === 'android') {
  childProcess.execSync('ionic cordova build --release android', {
    stdio: 'inherit'
  });
  var apkPath =
    'platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk';

  childProcess.execSync('./gradlew bundle', {
    cwd: 'platforms/android/',
    stdio: 'inherit'
  });
  var abbPath = 'platforms/android/app/build/outputs/bundle/release/app.aab';
  childProcess.execSync(
    'jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore scripts/flowrobe.keystore ' +
      abbPath +
      ' flowrobe -storepass Robagusta2019',
    {
      stdio: 'inherit'
    }
  );
  childProcess.execSync(
    'jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore scripts/flowrobe.keystore ' +
      apkPath +
      ' flowrobe -storepass Robagusta2019',
    {
      stdio: 'inherit'
    }
  );
  var alignedApkPath =
    'platforms/android/app/build/outputs/apk/release/app-release.apk';
  childProcess.execSync('zipalign -v 4 ' + apkPath + ' ' + alignedApkPath, {
    stdio: 'inherit'
  });
  childProcess.execSync(
    'curl -v -F apk=@./' +
      alignedApkPath +
      ' https://trifork.tpa.io/3789c37e-90ff-44e3-98ff-bad9ae6adf24/upload',
    {
      stdio: 'inherit'
    }
  );
}
if (platform === 'ios') {
  let teamIdentifier = buildType === 'production' ? '833W62KUZS' : '9KPQV995W2';
  console.log(
    '\n\n|-----------  Building iOS -----------|\n\n',
    'Bundle identifier:',
    bundleIdentifier,
    '\nTeam Identifier:',
    teamIdentifier,
    '\nApp version:',
    appVersion,
    '\nBuild number:',
    buildNumber
  );
  childProcess.execSync(
    `ionic cordova build ios --release -- --developmentTeam=${teamIdentifier} --codeSignIdentity="iPhone Distribution" --packageType="enterprise"`,
    {
      stdio: 'inherit'
    }
  );
  childProcess.execSync('open platforms/ios/Flowrobe.xcworkspace', {
    stdio: 'inherit'
  });
  console.log('Setup keychain and provisining profiles on the system.');
  console.log('Click Flowrobe in left panel.');
  console.log('Uncheck automatically manage signing.');
  console.log(
    'Choose Flowrobe Development as provisioning profile for release signing.'
  );
  console.log('Select generic iOS device as output destination.');
  console.log('Click Product -> Archive.');
  console.log('Click distribute app and select enterprise and click next.');
  console.log(
    'Click next and select Flowrobe Development for the app and press next.'
  );
  console.log('Export app and upload IPA to TPA. GG WP HF YOLO!');
  // childProcess.execSync(
  //   "cd platforms/ios/build/emulator/;mkdir Payload;mv Flowrobe.app Payload/;zip -r Flowrobe.ipa Payload",
  //   {
  //     stdio: "inherit"
  //   }
  // );
  // childProcess.execSync(
  //   "curl -v -F ipa=@./" +
  //     "platforms/ios/build/emulator/Flowrobe.ipa" +
  //     " https://trifork.tpa.io/6cc44922-9665-43d0-93fa-dc379044191b/upload",
  //   {
  //     stdio: "inherit"
  //   }
  // );
}
// Restore config.XML for clean git
fs.writeFileSync('config.xml', configXML);

function updateConfigXML(configXML, bundleIdentifier, version) {
  var re = /<widget(.*?)">/i;
  return (newConfigXML = configXML.replace(
    re,
    '<widget id="' +
      bundleIdentifier +
      '" version="' +
      version +
      '" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">'
  ));
}
