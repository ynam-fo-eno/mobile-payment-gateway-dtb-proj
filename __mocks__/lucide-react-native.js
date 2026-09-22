// __mocks__/lucide-react-native.js
const React = require('react');
const { View } = require('react-native');

// This automatically handles ANY icon imported from lucide-react-native!
module.exports = new Proxy({}, {
    get: (_, name) => {
        return (props) => React.createElement(View, { ...props, testID: `lucide-icon-${String(name)}` });
    }
});