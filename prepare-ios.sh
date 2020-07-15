
if [ -d "node_modules" ];
then
    echo "Removing node_modules"
    rm -rf node_modules
else
    echo "Skipping node_modules, directory not found"
fi

if  [ -d "plugins" ]
then
    echo "Removing plugins"
    rm -rf plugins
else
    echo "Skipping plugins, directory not found"
    
fi

if [ -d "platforms/ios" ]
then
    echo "Removing platforms/ios"
    rm -rf platforms/ios
else
    echo "Skipping platforms/ios, directory not found"
fi

echo "Installing node modules"
npm install

echo "Add iOS platform"
ionic cordova platform add ios

echo "Preparing iOS platform"
ionic cordova prepare ios

echo "Opening xcode"
open platforms/ios/Flowrobe.xcworkspace